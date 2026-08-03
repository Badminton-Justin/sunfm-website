import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Appointment, GoogleCalendarConnection } from "@/lib/supabase/types";
import { getValidAccessToken } from "./tokens";
import {
  deleteEvent,
  insertEvent,
  listEventsIncremental,
  listEventsInitial,
  stopChannel,
  updateEvent,
  watchEvents,
  type GoogleEvent,
} from "./calendar";

const INITIAL_SYNC_WINDOW_DAYS = 30;
const CHANNEL_RENEWAL_MARGIN_MS = 24 * 60 * 60 * 1000; // renew within 24h of expiry

function daysAgoIso(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export async function getConnection(
  supabase: SupabaseClient,
  trainerId: string
): Promise<GoogleCalendarConnection | null> {
  const { data } = await supabase
    .from("google_calendar_connections")
    .select("*")
    .eq("trainer_id", trainerId)
    .maybeSingle();
  return data ?? null;
}

// Push a local create/update/cancel to the trainer's connected Google
// Calendar. No-op if they haven't connected one.
export async function pushAppointmentToGoogle(
  supabase: SupabaseClient,
  appointment: Appointment
) {
  const connection = await getConnection(supabase, appointment.trainer_id);
  if (!connection) return;

  const accessToken = await getValidAccessToken(supabase, connection);
  const fields = {
    summary: appointment.client_name,
    description: appointment.notes,
    startIso: appointment.start_time,
    endIso: appointment.end_time,
  };

  if (appointment.status === "canceled") {
    if (appointment.google_event_id) {
      await deleteEvent(
        accessToken,
        connection.google_calendar_id,
        appointment.google_event_id
      );
    }
    return;
  }

  if (appointment.google_event_id) {
    await updateEvent(
      accessToken,
      connection.google_calendar_id,
      appointment.google_event_id,
      fields
    );
    await supabase
      .from("appointments")
      .update({ google_synced_at: new Date().toISOString() })
      .eq("id", appointment.id);
  } else {
    const event = await insertEvent(
      accessToken,
      connection.google_calendar_id,
      fields
    );
    await supabase
      .from("appointments")
      .update({
        google_event_id: event.id,
        google_synced_at: new Date().toISOString(),
      })
      .eq("id", appointment.id);
  }
}

// Hard delete (not cancel) of a local appointment — remove the mirrored
// Google event too, if one exists.
export async function deleteAppointmentFromGoogle(
  supabase: SupabaseClient,
  appointment: Appointment
) {
  if (!appointment.google_event_id) return;
  const connection = await getConnection(supabase, appointment.trainer_id);
  if (!connection) return;

  const accessToken = await getValidAccessToken(supabase, connection);
  await deleteEvent(
    accessToken,
    connection.google_calendar_id,
    appointment.google_event_id
  );
}

async function applyGoogleEventToLocal(
  supabase: SupabaseClient,
  trainerId: string,
  event: GoogleEvent
) {
  if (event.status === "cancelled") {
    await supabase
      .from("appointments")
      .update({ status: "canceled", google_synced_at: new Date().toISOString() })
      .eq("google_event_id", event.id)
      .neq("status", "canceled");
    return;
  }

  // All-day events (date-only, no dateTime) don't map cleanly onto a
  // session's start/end — skip them rather than guessing a time range.
  if (!event.start?.dateTime || !event.end?.dateTime) return;

  const fields = {
    trainer_id: trainerId,
    client_name: event.summary || "(untitled)",
    notes: event.description ?? null,
    start_time: event.start.dateTime,
    end_time: event.end.dateTime,
    status: "booked" as const,
    google_event_id: event.id,
    google_synced_at: new Date().toISOString(),
  };

  // Atomic upsert on the google_event_id unique constraint — a plain
  // check-then-insert-or-update here is exactly the kind of thing that
  // races and duplicates rows when two sync runs overlap (which is exactly
  // what happened: a request stuck behind the earlier pagination bug kept
  // running server-side after the client gave up and got a 504, racing the
  // next "Sync now" click).
  const { error } = await supabase
    .from("appointments")
    .upsert(fields, { onConflict: "google_event_id" });
  if (error) throw error;
}

// Supabase/Postgrest errors are plain objects, not Error instances — a bare
// String(err) on those just yields "[object Object]" with no useful detail.
function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export interface PullSummary {
  calendarId: string;
  mode: "incremental" | "initial";
  fetched: number;
  applied: number;
  failed: number;
  errors: string[];
}

// Pulls changes from Google (incremental via stored sync_token, or a fresh
// full sync if there's no token yet / the stored one has expired) and
// applies them to our appointments table.
export async function pullChangesFromGoogle(
  supabase: SupabaseClient,
  connection: GoogleCalendarConnection
): Promise<PullSummary> {
  const accessToken = await getValidAccessToken(supabase, connection);

  let page = connection.sync_token
    ? await listEventsIncremental(
        accessToken,
        connection.google_calendar_id,
        connection.sync_token
      )
    : null;
  let mode: PullSummary["mode"] = "incremental";

  if (!page || page.syncTokenInvalid) {
    mode = "initial";
    page = await listEventsInitial(
      accessToken,
      connection.google_calendar_id,
      daysAgoIso(INITIAL_SYNC_WINDOW_DAYS)
    );
  }

  let applied = 0;
  const errors: string[] = [];

  for (const event of page.items) {
    try {
      await applyGoogleEventToLocal(supabase, connection.trainer_id, event);
      applied++;
    } catch (err) {
      // One malformed/unexpected event must not block the rest of the batch
      // or leave sync_token stuck re-fetching (and re-failing on) the same
      // event forever — log it and keep going.
      const message = extractErrorMessage(err);
      console.error("Failed to apply Google event to local appointment", event.id, err);
      errors.push(`${event.id}: ${message}`);
    }
  }

  // Only advance the checkpoint if the batch was empty (nothing to lose) or
  // at least one event actually got written. A 100%-failed batch is a sign
  // of something systemic (not one bad event) — saving the token in that
  // case would tell Google "we're caught up" on data we never actually
  // persisted, silently losing the whole batch with no way to recover it on
  // the next sync (this is exactly what happened here: a full batch failed
  // to write, but the token still advanced, so subsequent syncs correctly
  // reported "nothing new" while the local table stayed empty).
  const shouldAdvanceToken = page.items.length === 0 || applied > 0;
  if (page.nextSyncToken && shouldAdvanceToken) {
    await supabase
      .from("google_calendar_connections")
      .update({ sync_token: page.nextSyncToken })
      .eq("trainer_id", connection.trainer_id);
  }

  return {
    calendarId: connection.google_calendar_id,
    mode,
    fetched: page.items.length,
    applied,
    failed: page.items.length - applied,
    errors,
  };
}

// Pushes any local appointments that predate the connection (no
// google_event_id yet) up to Google. Only future, booked sessions — no
// point mirroring history.
export async function pushUnsyncedAppointments(
  supabase: SupabaseClient,
  trainerId: string
) {
  const { data: appointments } = await supabase
    .from("appointments")
    .select("*")
    .eq("trainer_id", trainerId)
    .eq("status", "booked")
    .is("google_event_id", null)
    .gte("end_time", new Date().toISOString());

  for (const appt of appointments ?? []) {
    await pushAppointmentToGoogle(supabase, appt as Appointment);
  }
}

export async function registerWatchChannel(
  supabase: SupabaseClient,
  connection: GoogleCalendarConnection
) {
  const accessToken = await getValidAccessToken(supabase, connection);

  if (connection.watch_channel_id && connection.watch_resource_id) {
    await stopChannel(
      accessToken,
      connection.watch_channel_id,
      connection.watch_resource_id
    );
  }

  const channelId = randomUUID();
  const verificationToken = randomUUID();
  const result = await watchEvents(
    accessToken,
    connection.google_calendar_id,
    channelId,
    verificationToken
  );

  await supabase
    .from("google_calendar_connections")
    .update({
      watch_channel_id: channelId,
      watch_resource_id: result.resourceId,
      watch_channel_expires_at: new Date(Number(result.expiration)).toISOString(),
      watch_verification_token: verificationToken,
    })
    .eq("trainer_id", connection.trainer_id);
}

export async function renewWatchChannelIfNeeded(
  supabase: SupabaseClient,
  connection: GoogleCalendarConnection
) {
  const expiresAt = connection.watch_channel_expires_at
    ? new Date(connection.watch_channel_expires_at).getTime()
    : 0;
  if (expiresAt - Date.now() > CHANNEL_RENEWAL_MARGIN_MS) return;
  await registerWatchChannel(supabase, connection);
}

// Full setup performed right after a trainer connects: create/find the
// dedicated calendar (done by the caller before this), push their existing
// upcoming appointments up, pull down anything already on that calendar,
// and start a push-notification subscription.
export async function performInitialSync(
  supabase: SupabaseClient,
  connection: GoogleCalendarConnection
) {
  await pushUnsyncedAppointments(supabase, connection.trainer_id);
  await pullChangesFromGoogle(supabase, connection);
  await registerWatchChannel(supabase, connection);
}
