import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { runFullSync } from "@/lib/google/sync";
import { extendOpenEndedSeries } from "@/lib/portal/extend-series";

// Iterates every connected trainer's calendar sequentially — give it real
// headroom rather than the default 10s timeout.
export const maxDuration = 60;

// Daily safety net. Push notifications cover the normal case, but channels
// expire (~7 days), a webhook ping can be missed, and any local change whose
// push failed needs re-attempting. This re-syncs every connected trainer in
// both directions, retries failed deletes, and renews channels nearing
// expiry.
//
// Vercel sets `Authorization: Bearer $CRON_SECRET` automatically for cron
// invocations when CRON_SECRET is configured; reject anything else.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Before the sync, not after: the occurrences this adds are created flagged
  // google_push_pending, and pushPendingAppointments inside runFullSync is
  // what mirrors them onto Google in this same run.
  let extended = { series: 0, created: 0 };
  try {
    extended = await extendOpenEndedSeries(supabase);
  } catch (err) {
    console.error("Extending open-ended series failed", err);
  }

  const { data: connections } = await supabase
    .from("google_calendar_connections")
    .select("*");

  const results = [];
  for (const connection of connections ?? []) {
    try {
      const summary = await runFullSync(supabase, connection);
      results.push({ trainer_id: connection.trainer_id, ok: true, ...summary });
    } catch (err) {
      console.error("Cron sync failed for trainer", connection.trainer_id, err);
      results.push({ trainer_id: connection.trainer_id, ok: false });
    }
  }

  return NextResponse.json({ synced: results.length, results, extended });
}
