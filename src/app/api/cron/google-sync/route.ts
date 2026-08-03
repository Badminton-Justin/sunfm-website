import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { runFullSync } from "@/lib/google/sync";

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

  return NextResponse.json({ synced: results.length, results });
}
