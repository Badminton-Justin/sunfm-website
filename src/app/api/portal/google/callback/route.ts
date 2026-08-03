import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { exchangeCodeForTokens } from "@/lib/google/oauth";
import { getOrCreateSunfmCalendar } from "@/lib/google/calendar";
import { getConnection, performInitialSync } from "@/lib/google/sync";

const STATE_COOKIE = "google_oauth_state";

// performInitialSync pushes existing appointments, pulls the whole calendar,
// and registers the webhook — sequentially, one event at a time. On a
// calendar with real history this can run past the default 10s timeout,
// which would kill the function before registerWatchChannel ever runs
// (leaving no working webhook at all, silently).
export const maxDuration = 60;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const settingsUrl = new URL("/portal/settings", request.url);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);

  if (errorParam) {
    settingsUrl.searchParams.set("google_error", "denied");
    return NextResponse.redirect(settingsUrl);
  }
  if (!code || !state || !expectedState || state !== expectedState) {
    settingsUrl.searchParams.set("google_error", "invalid_state");
    return NextResponse.redirect(settingsUrl);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/portal/login", request.url));
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    if (!tokens.refresh_token) {
      // Shouldn't happen with prompt=consent, but guard anyway — without a
      // refresh token we can't keep the connection alive past the first hour.
      settingsUrl.searchParams.set("google_error", "no_refresh_token");
      return NextResponse.redirect(settingsUrl);
    }

    const calendarId = await getOrCreateSunfmCalendar(tokens.access_token);
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    await supabase.from("google_calendar_connections").upsert({
      trainer_id: user.id,
      google_calendar_id: calendarId,
      access_token: tokens.access_token,
      access_token_expires_at: expiresAt,
      refresh_token: tokens.refresh_token,
      sync_token: null,
      watch_channel_id: null,
      watch_resource_id: null,
      watch_channel_expires_at: null,
      watch_verification_token: null,
    });

    const connection = await getConnection(supabase, user.id);
    if (connection) {
      await performInitialSync(supabase, connection);
    }

    settingsUrl.searchParams.set("google_connected", "1");
    return NextResponse.redirect(settingsUrl);
  } catch (err) {
    console.error("Google Calendar connect failed", err);
    settingsUrl.searchParams.set("google_error", "connect_failed");
    return NextResponse.redirect(settingsUrl);
  }
}
