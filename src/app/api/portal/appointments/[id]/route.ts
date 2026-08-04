import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  deleteAppointmentFromGoogle,
  pushAppointmentToGoogle,
  type PushOptions,
} from "@/lib/google/sync";
import type { Appointment } from "@/lib/supabase/types";

// Both handlers wait on a Google API call (capped at 10s on its own), so the
// platform default leaves no headroom.
export const maxDuration = 30;

// A series edit fans out to one Google call per occurrence. Run them a few at
// a time: sequential would blow the 30s budget on a long series, and all at
// once would hammer the API. Anything left unsent stays flagged
// google_push_pending, so the retry sweep finishes the job either way.
const GOOGLE_BATCH = 5;

async function pushAll(appointments: Appointment[], options?: PushOptions) {
  const service = createServiceClient();
  for (let i = 0; i < appointments.length; i += GOOGLE_BATCH) {
    const batch = appointments.slice(i, i + GOOGLE_BATCH);
    const results = await Promise.allSettled(
      batch.map((appt) => pushAppointmentToGoogle(service, appt, options))
    );
    for (const r of results) {
      if (r.status === "rejected") {
        console.error("Push to Google Calendar failed", r.reason);
      }
    }
  }
}

async function deleteAll(appointments: Appointment[]) {
  const service = createServiceClient();
  for (let i = 0; i < appointments.length; i += GOOGLE_BATCH) {
    const batch = appointments.slice(i, i + GOOGLE_BATCH);
    const results = await Promise.allSettled(
      batch.map((appt) => deleteAppointmentFromGoogle(service, appt))
    );
    for (const r of results) {
      if (r.status === "rejected") {
        console.error("Delete from Google Calendar failed", r.reason);
      }
    }
  }
}

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
  const { client_name, start_time, end_time, notes, status, scope } = body;

  if (start_time && end_time && new Date(end_time) <= new Date(start_time)) {
    return NextResponse.json(
      { error: "end_time must be after start_time" },
      { status: 400 }
    );
  }

  if (status && !["booked", "canceled"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Read before writing: a series edit needs the old times to work out how far
  // everything moved, and the row is gone from `update`'s point of view after.
  const { data: before } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", id)
    .single();

  if (!before) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
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

  const touched: Appointment[] = [data as Appointment];

  if (scope === "following" && before.series_id) {
    // Later occurrences shift by the same amounts rather than landing on the
    // edited appointment's clock time — that is what keeps a weekly series
    // weekly when you drag one session to a different day or hour.
    const startShiftMs = start_time
      ? new Date(start_time).getTime() - new Date(before.start_time).getTime()
      : 0;
    const durationDeltaMs =
      start_time && end_time
        ? new Date(end_time).getTime() -
          new Date(start_time).getTime() -
          (new Date(before.end_time).getTime() -
            new Date(before.start_time).getTime())
        : 0;

    const { data: later } = await supabase
      .from("appointments")
      .select("*")
      .eq("series_id", before.series_id)
      .gt("start_time", before.start_time)
      .order("start_time");

    for (const sibling of (later ?? []) as Appointment[]) {
      const siblingUpdate: Record<string, unknown> = {};
      if (client_name !== undefined) siblingUpdate.client_name = client_name;
      if (notes !== undefined) siblingUpdate.notes = notes;
      if (status !== undefined) siblingUpdate.status = status;

      if (startShiftMs || durationDeltaMs) {
        const start = new Date(
          new Date(sibling.start_time).getTime() + startShiftMs
        );
        const duration =
          new Date(sibling.end_time).getTime() -
          new Date(sibling.start_time).getTime() +
          durationDeltaMs;
        siblingUpdate.start_time = start.toISOString();
        siblingUpdate.end_time = new Date(
          start.getTime() + duration
        ).toISOString();
      }

      if (Object.keys(siblingUpdate).length === 0) continue;

      const { data: updated } = await supabase
        .from("appointments")
        .update(siblingUpdate)
        .eq("id", sibling.id)
        .select()
        .single();

      if (updated) touched.push(updated as Appointment);
    }
  }

  // Un-cancelling is the one case that may legitimately create an event for a
  // session already in the past: the user asked for it back explicitly.
  const isRestore = status === "booked" && before.status === "canceled";

  // Service client — see the note in ../route.ts. Rows stay flagged
  // google_push_pending if this fails, so the retry sweep will catch them.
  await pushAll(touched, { backfillPast: isRestore });

  return NextResponse.json({ appointment: data, appointments: touched });
}

export async function DELETE(
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

  const { data: existing } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  const scope = new URL(request.url).searchParams.get("scope");
  const targets: Appointment[] = [existing as Appointment];

  if (scope === "following" && existing.series_id) {
    const { data: later } = await supabase
      .from("appointments")
      .select("*")
      .eq("series_id", existing.series_id)
      .gt("start_time", existing.start_time);
    targets.push(...((later ?? []) as Appointment[]));
  }

  const ids = targets.map((t) => t.id);

  // RLS enforces that a non-owner trainer can only delete their own appointments.
  const { error } = await supabase.from("appointments").delete().in("id", ids);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Service client, and durable: the local rows are already gone, so a failed
  // delete has nothing left to carry a retry flag. The queue in
  // google_pending_deletions is what stops an orphaned Google event from being
  // re-imported as a new appointment on the next full sync.
  await deleteAll(targets);

  return NextResponse.json({ success: true, deletedIds: ids });
}
