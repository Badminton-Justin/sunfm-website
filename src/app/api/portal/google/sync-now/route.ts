import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getConnection,
  pullChangesFromGoogle,
  pushUnsyncedAppointments,
  renewWatchChannelIfNeeded,
} from "@/lib/google/sync";

// Processes events one at a time (a Google API call + a DB write each), so
// a calendar with a few dozen events can take longer than the default 10s
// serverless timeout — extend it rather than risk the function getting
// killed mid-sync.
export const maxDuration = 60;

// Manual "sync now" — pulls the current trainer's Google Calendar changes
// immediately rather than waiting on the webhook/daily cron. No-op (not an
// error) if this trainer hasn't connected a Google Calendar.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const connection = await getConnection(supabase, user.id);
  if (!connection) {
    return NextResponse.json({ synced: false, reason: "not_connected" });
  }

  try {
    await pullChangesFromGoogle(supabase, connection);
    await pushUnsyncedAppointments(supabase, user.id);
    // Self-heal: if the webhook subscription was never registered (e.g. the
    // original connect got cut off before reaching this step) or has gone
    // stale, this quietly (re)establishes it.
    await renewWatchChannelIfNeeded(supabase, connection);
    return NextResponse.json({ synced: true });
  } catch (err) {
    console.error("Manual sync-now failed", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
