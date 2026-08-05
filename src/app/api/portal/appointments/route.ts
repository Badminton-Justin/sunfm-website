import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { pushAppointmentToGoogle } from "@/lib/google/sync";
import { weeklyOccurrences } from "@/lib/portal/recurrence";
import type { Appointment } from "@/lib/supabase/types";

// The response waits on a Google API call (capped at 10s on its own), so the
// platform default leaves no headroom — a 504 here would leave the client
// unsure whether the appointment was created, and retrying duplicates it.
export const maxDuration = 30;

// A repeat pushes one event per occurrence. Batched so a long series doesn't
// run the clock out serially or fire 26 requests at Google at once; whatever
// doesn't make it stays flagged google_push_pending for the retry sweep.
const GOOGLE_BATCH = 5;

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { trainer_id, client_name, start_time, end_time, notes, repeat } = body;

  if (!trainer_id || !client_name || !start_time || !end_time) {
    return NextResponse.json(
      { error: "trainer_id, client_name, start_time, and end_time are required" },
      { status: 400 }
    );
  }

  if (new Date(end_time) <= new Date(start_time)) {
    return NextResponse.json(
      { error: "end_time must be after start_time" },
      { status: 400 }
    );
  }

  // Expanded server-side rather than one request per week from the browser:
  // an open-ended booking is ~26 occurrences, and each one waits on Google.
  const occurrences = weeklyOccurrences(
    new Date(start_time),
    new Date(end_time),
    repeat
  );
  const isSeries = occurrences.length > 1;
  const seriesId = isSeries ? crypto.randomUUID() : null;

  const rows = occurrences.map((o) => ({
    trainer_id,
    client_name,
    notes: notes ?? null,
    start_time: o.start_time,
    end_time: o.end_time,
    series_id: seriesId,
    series_open_ended: isSeries && !!repeat?.indefinite,
  }));

  // RLS enforces that a non-owner trainer can only create appointments for themselves.
  const { data, error } = await supabase
    .from("appointments")
    .insert(rows)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const created = (data ?? []) as Appointment[];

  // Service client, not the caller's session: RLS on
  // google_calendar_connections is deliberately self-only with no owner
  // bypass, so an owner booking on another trainer's behalf would otherwise
  // find no connection and silently skip the push entirely. Authorization for
  // the write itself was already enforced by RLS above.
  const service = createServiceClient();
  for (let i = 0; i < created.length; i += GOOGLE_BATCH) {
    const results = await Promise.allSettled(
      created
        .slice(i, i + GOOGLE_BATCH)
        .map((appt) => pushAppointmentToGoogle(service, appt))
    );
    for (const r of results) {
      if (r.status === "rejected") {
        // Local writes already succeeded — the rows stay flagged
        // google_push_pending and the retry sweep picks them back up.
        console.error("Push to Google Calendar failed", r.reason);
      }
    }
  }

  return NextResponse.json({ appointment: created[0], appointments: created });
}
