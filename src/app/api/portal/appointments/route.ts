import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { pushAppointmentToGoogle } from "@/lib/google/sync";
import type { Appointment } from "@/lib/supabase/types";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { trainer_id, client_name, start_time, end_time, notes } = body;

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
    .insert({ trainer_id, client_name, start_time, end_time, notes: notes ?? null })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  try {
    await pushAppointmentToGoogle(supabase, data as Appointment);
  } catch (err) {
    // Local write already succeeded — Google sync is best-effort and the
    // daily cron job retries anything still unsynced.
    console.error("Push to Google Calendar failed", err);
  }

  return NextResponse.json({ appointment: data });
}
