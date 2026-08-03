import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { exchangeCodeForTokens } from "@/lib/google/oauth";
import { getOrCreateSunfmCalendar, stopChannel } from "@/lib/google/calendar";
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

    // Reconnecting nulls the watch columns below. Stop the old subscription
    // first, otherwise it keeps pinging our webhook until it expires with no
    // row left to match it against.
    const service = createServiceClient();
    const previous = await getConnection(service, user.id);
    if (previous?.watch_channel_id && previous.watch_resource_id) {
      await stopChannel(
        tokens.access_token,
        previous.watch_channel_id,
        previous.watch_resource_id
      );
    }

    const { error: upsertError } = await supabase
      .from("google_calendar_connections")
      .upsert({
        trainer_id: user.id,
        google_calendar_id: calendarId,
        access_token: tokens.access_token,
        access_token_expires_at: expiresAt,
        refresh_token: tokens.refresh_token,
        sync_token: null,
        sync_window_end: null,
        sync_lock_at: "1970-01-01T00:00:00.000Z",
        consecutive_failed_pulls: 0,
        watch_channel_id: null,
        watch_resource_id: null,
        watch_channel_expires_at: null,
        watch_verification_token: null,
      });

    if (upsertError) {
      // 23505 on the calendar-id unique constraint: another trainer already
      // has this Google account connected. Both would resolve to the same
      // "SunFM Schedule" calendar and their syncs would fight over every
      // appointment row, so this has to be refused rather than papered over.
      const reason =
        upsertError.code === "23505" ? "calendar_in_use" : "connect_failed";
      console.error("Google Calendar connect failed", upsertError);
      settingsUrl.searchParams.set("google_error", reason);
      return NextResponse.redirect(settingsUrl);
    }

    settingsUrl.searchParams.set("google_connected", "1");

    const connection = await getConnection(service, user.id);
    if (connection) {
      try {
        await performInitialSync(service, connection);
      } catch (err) {
        // The connection itself is saved and usable — only the first
        // reconciliation fell over. Say that, rather than reporting a
        // blanket "connect failed" for an account that is in fact connected.
        // "Sync now" and the daily cron both recover from here.
        console.error("Google Calendar initial sync failed", err);
        settingsUrl.searchParams.set("google_warning", "initial_sync");
      }
    }

    return NextResponse.redirect(settingsUrl);
  } catch (err) {
    console.error("Google Calendar connect failed", err);
    settingsUrl.searchParams.set("google_error", "connect_failed");
    return NextResponse.redirect(settingsUrl);
  }
}
