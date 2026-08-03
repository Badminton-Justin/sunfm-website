import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteAppointmentFromGoogle, pushAppointmentToGoogle } from "@/lib/google/sync";
import type { Appointment } from "@/lib/supabase/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { client_name, start_time, end_time, notes, status } = body;

  if (start_time && end_time && new Date(end_time) <= new Date(start_time)) {
    return NextResponse.json(
      { error: "end_time must be after start_time" },
      { status: 400 }
    );
  }

  if (status && !["booked", "canceled"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (client_name !== undefined) update.client_name = client_name;
  if (start_time !== undefined) update.start_time = start_time;
  if (end_time !== undefined) update.end_time = end_time;
  if (notes !== undefined) update.notes = notes;
  if (status !== undefined) update.status = status;

  // RLS enforces that a non-owner trainer can only update their own appointments.
  const { data, error } = await supabase
    .from("appointments")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  try {
    await pushAppointmentToGoogle(supabase, data as Appointment);
  } catch (err) {
    console.error("Push to Google Calendar failed", err);
  }

  return NextResponse.json({ appointment: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", id)
    .single();

  // RLS enforces that a non-owner trainer can only delete their own appointments.
  const { error } = await supabase.from("appointments").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (existing) {
    try {
      await deleteAppointmentFromGoogle(supabase, existing as Appointment);
    } catch (err) {
      console.error("Delete from Google Calendar failed", err);
    }
  }

  return NextResponse.json({ success: true });
}
