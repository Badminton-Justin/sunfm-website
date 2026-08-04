import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { pushAppointmentToGoogle } from "@/lib/google/sync";
import type { Appointment } from "@/lib/supabase/types";

// The response waits on a Google API call (capped at 10s on its own), so the
// platform default leaves no headroom — a 504 here would leave the client
// unsure whether the appointment was created, and retrying duplicates it.
export const maxDuration = 30;

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { trainer_id, client_name, start_time, end_time, notes, series_id } =
    body;

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

  // RLS enforces that a non-owner trainer can only create appointments for themselves.
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      trainer_id,
      client_name,
      start_time,
      end_time,
      notes: notes ?? null,
      series_id: series_id ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  try {
    // Service client, not the caller's session: RLS on
    // google_calendar_connections is deliberately self-only with no owner
    // bypass, so an owner booking on another trainer's behalf would
    // otherwise find no connection and silently skip the push entirely.
    // Authorization for the write itself was already enforced by RLS above.
    await pushAppointmentToGoogle(createServiceClient(), data as Appointment);
  } catch (err) {
    // Local write already succeeded — the row stays flagged
    // google_push_pending and the retry sweep picks it back up.
    console.error("Push to Google Calendar failed", err);
  }

  return NextResponse.json({ appointment: data });
}
