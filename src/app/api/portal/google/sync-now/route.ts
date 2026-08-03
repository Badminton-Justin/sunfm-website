import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getConnection, runFullSync } from "@/lib/google/sync";

// A full sync makes a handful of Google API calls and batched DB writes, so
// give it real headroom rather than the default 10s serverless timeout.
export const maxDuration = 60;

// Manual "sync now" — reconciles the current trainer's calendar immediately
// rather than waiting on the webhook/daily cron. No-op (not an error) if this
// trainer hasn't connected a Google Calendar.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Authenticate against the caller's session, then do the sync work with the
  // service client: RLS on google_calendar_connections is self-only and the
  // pending-deletions bookkeeping is server-only. Scoped to user.id
  // throughout, so this grants no access beyond the caller's own calendar.
  const service = createServiceClient();
  const connection = await getConnection(service, user.id);
  if (!connection) {
    return NextResponse.json({ synced: false, reason: "not_connected" });
  }

  try {
    // runFullSync also (re)registers the webhook subscription if it was never
    // established — e.g. the original connect got cut off before that step —
    // or has gone stale, so this doubles as a self-heal.
    const summary = await runFullSync(service, connection);
    return NextResponse.json({ synced: true, ...summary });
  } catch (err) {
    console.error("Manual sync-now failed", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
