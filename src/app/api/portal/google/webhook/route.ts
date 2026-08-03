import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { pullChangesFromGoogle } from "@/lib/google/sync";

// Google's push notifications carry no body — everything we need is in
// headers. "sync" is the handshake fired right after events.watch is
// registered and has no real change to process; anything else means "go
// fetch what changed" (Google deliberately doesn't tell us what changed).
export async function POST(request: Request) {
  const channelId = request.headers.get("x-goog-channel-id");
  const resourceState = request.headers.get("x-goog-resource-state");
  const channelToken = request.headers.get("x-goog-channel-token");

  if (!channelId) {
    return NextResponse.json({ error: "Missing channel id" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: connection } = await supabase
    .from("google_calendar_connections")
    .select("*")
    .eq("watch_channel_id", channelId)
    .maybeSingle();

  if (!connection) {
    // Unknown/stale channel — ack anyway so Google stops retrying it.
    return NextResponse.json({ ok: true });
  }

  if (connection.watch_verification_token !== channelToken) {
    return NextResponse.json({ error: "Bad channel token" }, { status: 403 });
  }

  if (resourceState === "sync") {
    return NextResponse.json({ ok: true });
  }

  try {
    await pullChangesFromGoogle(supabase, connection);
  } catch (err) {
    console.error("Google webhook sync failed", err);
    // Still 200 — Google will retry future changes via the next ping, and
    // the daily cron job re-syncs everyone as a safety net regardless.
  }

  return NextResponse.json({ ok: true });
}
