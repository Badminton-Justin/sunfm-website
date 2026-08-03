import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  pullChangesFromGoogle,
  pushUnsyncedAppointments,
  renewWatchChannelIfNeeded,
} from "@/lib/google/sync";

// Iterates every connected trainer's calendar sequentially — give it real
// headroom rather than the default 10s timeout.
export const maxDuration = 60;

// Daily safety net: Vercel's automatic push-notification renewal happens on
// connect, but channels expire (~7 days) and a webhook ping can be missed —
// this re-syncs every connected trainer and renews channels nearing expiry.
// Vercel sets `Authorization: Bearer $CRON_SECRET` automatically for cron
// invocations when CRON_SECRET is configured; reject anything else.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: connections } = await supabase
    .from("google_calendar_connections")
    .select("*");

  const results = [];
  for (const connection of connections ?? []) {
    try {
      await pullChangesFromGoogle(supabase, connection);
      // Safety net for any local create/update that failed to push earlier
      // (e.g. a transient error) — retries anything still unsynced.
      await pushUnsyncedAppointments(supabase, connection.trainer_id);
      await renewWatchChannelIfNeeded(supabase, connection);
      results.push({ trainer_id: connection.trainer_id, ok: true });
    } catch (err) {
      console.error("Cron sync failed for trainer", connection.trainer_id, err);
      results.push({ trainer_id: connection.trainer_id, ok: false });
    }
  }

  return NextResponse.json({ synced: results.length, results });
}
