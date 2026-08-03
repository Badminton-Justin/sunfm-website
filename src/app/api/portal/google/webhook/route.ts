import { after, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { pullChangesFromGoogle } from "@/lib/google/sync";

export const maxDuration = 60;

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

  // Ack immediately and sync afterwards. Google expects a response within
  // ~30s and backs a channel off (eventually killing it) when it doesn't get
  // one — but a full pull on a busy calendar can legitimately take longer
  // than that. Detaching the work keeps the subscription healthy.
  //
  // Concurrency is safe: pullChangesFromGoogle takes a per-trainer lock, so
  // a burst of pings collapses into one run rather than several racing on
  // the same sync token, and whatever a skipped ping would have covered is
  // picked up by the run that holds the lock (or the next ping, or the cron).
  after(async () => {
    try {
      await pullChangesFromGoogle(supabase, connection);
    } catch (err) {
      console.error("Google webhook sync failed", err);
      // Nothing to report back to Google — it will ping again on the next
      // change, and the daily cron re-syncs everyone as a safety net.
    }
  });

  return NextResponse.json({ ok: true });
}
