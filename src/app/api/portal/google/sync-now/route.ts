import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getConnection, pullChangesFromGoogle, pushUnsyncedAppointments } from "@/lib/google/sync";

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
    return NextResponse.json({ synced: true });
  } catch (err) {
    console.error("Manual sync-now failed", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
