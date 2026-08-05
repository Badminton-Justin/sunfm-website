import type { SupabaseClient } from "@supabase/supabase-js";
import type { Appointment } from "@/lib/supabase/types";
import { horizonFrom, shiftWeeks } from "./recurrence";

// Tops every open-ended weekly booking back up to the horizon. Called from the
// daily cron before the Google sync runs, so the rows it creates are pushed to
// Google by the same invocation's pushPendingAppointments.
//
// The latest occurrence carries everything a new one needs — trainer, client,
// notes, weekday, time, duration — so a series needs no rule stored anywhere.
export async function extendOpenEndedSeries(
  supabase: SupabaseClient
): Promise<{ series: number; created: number }> {
  const { data } = await supabase
    .from("appointments")
    .select("*")
    .eq("series_open_ended", true)
    .order("start_time", { ascending: false });

  const rows = (data ?? []) as Appointment[];
  if (!rows.length) return { series: 0, created: 0 };

  // Descending, so the first row seen for a series is its latest occurrence.
  const latestPerSeries = new Map<string, Appointment>();
  for (const row of rows) {
    if (!row.series_id) continue;
    if (!latestPerSeries.has(row.series_id)) {
      latestPerSeries.set(row.series_id, row);
    }
  }

  const now = new Date();
  const horizon = horizonFrom(now);
  const pending: Record<string, unknown>[] = [];

  for (const latest of latestPerSeries.values()) {
    const baseStart = new Date(latest.start_time);
    const baseEnd = new Date(latest.end_time);

    for (let week = 1; ; week++) {
      const start = shiftWeeks(baseStart, week);
      if (start.getTime() > horizon.getTime()) break;
      // A series whose latest occurrence is well in the past — the trainer
      // stopped opening the portal, or the cron missed runs — resumes from
      // today rather than back-filling the sessions that never happened.
      if (start.getTime() <= now.getTime()) continue;

      pending.push({
        trainer_id: latest.trainer_id,
        client_name: latest.client_name,
        notes: latest.notes,
        start_time: start.toISOString(),
        end_time: shiftWeeks(baseEnd, week).toISOString(),
        series_id: latest.series_id,
        series_open_ended: true,
      });
    }
  }

  if (!pending.length) return { series: latestPerSeries.size, created: 0 };

  const { data: inserted, error } = await supabase
    .from("appointments")
    .insert(pending)
    .select("id");

  if (error) {
    console.error("Extending open-ended series failed", error);
    return { series: latestPerSeries.size, created: 0 };
  }

  return { series: latestPerSeries.size, created: inserted?.length ?? 0 };
}
