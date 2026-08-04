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

const DAY_MS = 24 * 60 * 60 * 1000;

const INITIAL_SYNC_PAST_WINDOW_DAYS = 30;
// A recurring weekly event with no end date expands into one instance per
// week forever — asking Google to expand that unbounded (5+ years deep, as
// happened here) appears to blow past however many series' worth of
// instances it's willing to return in one query, silently truncating the
// rest. A gym calendar has no real use for synced visibility that far out
// anyway, so bound it instead of chasing Google's exact internal limit.
const INITIAL_SYNC_FUTURE_WINDOW_DAYS = 180;

// The window above is anchored at the moment of a full sync, and an
// incremental sync token is scoped to the request that created it — so the
// horizon does not move on its own. Left alone it creeps toward the present
// until an open-ended recurring client simply stops appearing in the portal,
// with no error anywhere. Re-anchor once the remaining horizon drops below
// this, i.e. roughly monthly given the 180-day window. The full re-fetch
// doubles as the backstop for any webhook ping we missed.
const SYNC_WINDOW_REANCHOR_MARGIN_DAYS = 150;

// A crashed push leaves an appointment holding a `pending:` claim token. Any
// claim older than this is assumed abandoned and may be taken over — long
// enough that it cannot collide with a push that is genuinely still running
// (every Google call is capped at 10s).
const PENDING_CLAIM_TTL_MS = 5 * 60 * 1000;
const PENDING_CLAIM_PREFIX = "pending:";

// How far back to keep retrying failed pushes. Bounded so a permanently
// broken historical row cannot be re-attempted forever.
const PUSH_RETRY_PAST_WINDOW_DAYS = 30;

// Serializes sync runs per trainer. The webhook can fire several times in
// quick succession and overlap the cron or a manual "Sync now"; without this
// they all pull using the same sync token and race each other's writes.
const SYNC_LOCK_TTL_MS = 2 * 60 * 1000;

// Consecutive fully-failed pulls before we stop trusting the stored sync
// token. See advanceSyncToken for why this exists.
const MAX_CONSECUTIVE_FAILED_PULLS = 3;

const CHANNEL_RENEWAL_MARGIN_MS = DAY_MS; // renew within 24h of expiry

// Postgres/PostgREST both get unhappy about very large IN lists and very
// large multi-row upserts; batching also keeps a full sync from making one
// round-trip per event, which is what made a large initial sync exceed the
// serverless time limit before it could finish (and, since the token never
// advanced, restart from scratch on every subsequent attempt).
const DB_BATCH_SIZE = 100;

function nowIso() {
  return new Date().toISOString();
}

function daysAgoIso(days: number) {
  return new Date(Date.now() - days * DAY_MS).toISOString();
}

function daysFromNowIso(days: number) {
  return new Date(Date.now() + days * DAY_MS).toISOString();
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function isPendingClaim(eventId: string | null): boolean {
  return !!eventId?.startsWith(PENDING_CLAIM_PREFIX);
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

// ── pending deletions ──────────────────────────────────────────────────────
// A delete that fails on Google's side used to be logged and forgotten,
// leaving a live event with no local counterpart — which the next full
// resync happily re-imported as a brand new appointment. For a cancellation
// that means the canceled session silently comes back as booked.
//
// Queue the intent *before* attempting the delete so a crash mid-request
// still leaves a durable record, and dequeue only on confirmed success.

async function enqueueDeletion(
  supabase: SupabaseClient,
  trainerId: string,
  googleEventId: string
) {
  await supabase
    .from("google_pending_deletions")
    .upsert(
      { trainer_id: trainerId, google_event_id: googleEventId },
      { onConflict: "trainer_id,google_event_id", ignoreDuplicates: true }
    );
}

async function dequeueDeletion(
  supabase: SupabaseClient,
  trainerId: string,
  googleEventId: string
) {
  await supabase
    .from("google_pending_deletions")
    .delete()
    .eq("trainer_id", trainerId)
    .eq("google_event_id", googleEventId);
}

async function getPendingDeletionIds(
  supabase: SupabaseClient,
  trainerId: string
): Promise<Set<string>> {
  const { data } = await supabase
    .from("google_pending_deletions")
    .select("google_event_id")
    .eq("trainer_id", trainerId);
  return new Set((data ?? []).map((row) => row.google_event_id as string));
}

// Durable delete. Never throws: a failure leaves the queued row in place for
// the next sweep rather than failing the caller's whole operation.
async function deleteGoogleEventDurably(
  supabase: SupabaseClient,
  connection: GoogleCalendarConnection,
  accessToken: string,
  googleEventId: string
): Promise<boolean> {
  await enqueueDeletion(supabase, connection.trainer_id, googleEventId);
  try {
    await deleteEvent(accessToken, connection.google_calendar_id, googleEventId);
    await dequeueDeletion(supabase, connection.trainer_id, googleEventId);
    return true;
  } catch (err) {
    console.error("Google event delete failed; queued for retry", googleEventId, err);
    await supabase
      .from("google_pending_deletions")
      .update({ last_error: extractErrorMessage(err) })
      .eq("trainer_id", connection.trainer_id)
      .eq("google_event_id", googleEventId);
    return false;
  }
}

// Retries everything still queued. Called from the manual sync and the daily
// cron.
export async function flushPendingDeletions(
  supabase: SupabaseClient,
  connection: GoogleCalendarConnection
): Promise<{ attempted: number; deleted: number }> {
  const { data: queued } = await supabase
    .from("google_pending_deletions")
    .select("*")
    .eq("trainer_id", connection.trainer_id);

  if (!queued?.length) return { attempted: 0, deleted: 0 };

  const accessToken = await getValidAccessToken(supabase, connection);
  let deleted = 0;

  for (const row of queued) {
    try {
      await deleteEvent(
        accessToken,
        connection.google_calendar_id,
        row.google_event_id
      );
      await dequeueDeletion(supabase, connection.trainer_id, row.google_event_id);
      deleted++;
    } catch (err) {
      await supabase
        .from("google_pending_deletions")
        .update({
          attempts: (row.attempts ?? 0) + 1,
          last_error: extractErrorMessage(err),
        })
        .eq("id", row.id);
    }
  }

  return { attempted: queued.length, deleted };
}

// ── push: local → Google ───────────────────────────────────────────────────

// Atomically claim an appointment before creating its Google event.
//
// The push runs from four independent triggers (appointment API, OAuth
// callback, manual "Sync now", daily cron) that can genuinely overlap for the
// same trainer. Without this, two concurrent callers both see no usable
// event id and both call insertEvent, creating two distinct real Google
// events for one appointment — exactly what produced the double-booked pairs
// found in production. The conditional UPDATE relies on Postgres row
// locking: only one caller can swap the observed value for the claim token,
// so the loser backs off instead of double-creating.
async function claimForInsert(
  supabase: SupabaseClient,
  appointmentId: string,
  expectedEventId: string | null
): Promise<string | null> {
  const claimToken = `${PENDING_CLAIM_PREFIX}${randomUUID()}`;
  let query = supabase
    .from("appointments")
    .update({ google_event_id: claimToken })
    .eq("id", appointmentId);

  query = expectedEventId
    ? query.eq("google_event_id", expectedEventId)
    : query.is("google_event_id", null);

  const { data } = await query.select("id").maybeSingle();
  return data ? claimToken : null;
}

// Push a local create/update/cancel to the trainer's connected Google
// Calendar. No-op if they haven't connected one.
export interface PushOptions {
  // Recreate the Google event even for a session that has already ended.
  // Only ever set by an explicit user action — see the guard below.
  backfillPast?: boolean;
}

export async function pushAppointmentToGoogle(
  supabase: SupabaseClient,
  appointment: Appointment,
  options: PushOptions = {}
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

  const existingId = appointment.google_event_id;
  const pending = isPendingClaim(existingId);

  // A `pending:` value means some earlier push claimed this row and then died
  // before recording the real event id (serverless timeout, redeploy, crash).
  // Nothing else will ever clean that up, so the row would be stranded: the
  // retry sweep can't insert (the id is non-null) and an update would target
  // an id Google has never heard of. Take it over — but only once the claim
  // is old enough that it cannot belong to a push still in flight.
  const claimIsStale =
    pending &&
    Date.now() - Date.parse(appointment.updated_at) > PENDING_CLAIM_TTL_MS;
  const usableEventId = existingId && !pending ? existingId : null;

  if (appointment.status === "canceled") {
    // A live claim means an insert is still in flight: the event id we'd need
    // in order to delete it doesn't exist yet. Leave the row flagged and let
    // the retry sweep handle it once the claim resolves into a real id —
    // clearing the flag here would strand a real Google event on a canceled
    // appointment with nothing left to clean it up.
    if (pending && !claimIsStale) return;

    if (usableEventId) {
      await deleteGoogleEventDurably(
        supabase,
        connection,
        accessToken,
        usableEventId
      );
    }

    await supabase
      .from("appointments")
      .update({
        google_synced_at: nowIso(),
        google_push_pending: false,
        // An abandoned claim never became a real event, so drop the token
        // rather than leaving junk occupying the unique-constraint slot.
        ...(pending ? { google_event_id: null } : {}),
      })
      .eq("id", appointment.id);
    return;
  }

  if (usableEventId) {
    const updated = await updateEvent(
      accessToken,
      connection.google_calendar_id,
      usableEventId,
      fields
    );
    if (updated) {
      await supabase
        .from("appointments")
        .update({ google_synced_at: nowIso(), google_push_pending: false })
        .eq("id", appointment.id);
      return;
    }
    // Google no longer has the event — the normal case being an appointment
    // that was canceled (deleting the event) and later re-booked. Fall
    // through and create a replacement rather than leaving the row pointing
    // at a dead id forever.
  }

  if (pending && !claimIsStale) return;

  // Nothing to create for a session that has already happened — mirroring
  // history onto the calendar has no value. The retry sweep reaches 30 days
  // back so that edits and cancellations of recent sessions still propagate;
  // this stops that reach from also back-filling events for them.
  //
  // backfillPast lifts it for a deliberate request. Someone restoring a
  // canceled session asked for that event back, and answering "it's in the
  // past" would leave the portal and the calendar disagreeing.
  if (!options.backfillPast && Date.parse(appointment.end_time) < Date.now()) {
    await supabase
      .from("appointments")
      .update({ google_synced_at: nowIso(), google_push_pending: false })
      .eq("id", appointment.id);
    return;
  }

  const claimToken = await claimForInsert(
    supabase,
    appointment.id,
    existingId // null for a fresh row, the dead/stale id when recreating
  );
  if (!claimToken) return;

  try {
    const event = await insertEvent(
      accessToken,
      connection.google_calendar_id,
      fields
    );
    await supabase
      .from("appointments")
      .update({
        google_event_id: event.id,
        google_synced_at: nowIso(),
        google_push_pending: false,
      })
      .eq("id", appointment.id);
  } catch (err) {
    // Release the claim so a later retry can pick this appointment back up
    // instead of leaving it stuck on the placeholder. The stale-claim
    // takeover above is the backstop for when we never get this far.
    await supabase
      .from("appointments")
      .update({ google_event_id: existingId })
      .eq("id", appointment.id)
      .eq("google_event_id", claimToken);
    throw err;
  }
}

// Hard delete (not cancel) of a local appointment — remove the mirrored
// Google event too, if one exists.
export async function deleteAppointmentFromGoogle(
  supabase: SupabaseClient,
  appointment: Appointment
) {
  const eventId = appointment.google_event_id;
  if (!eventId || isPendingClaim(eventId)) return;

  const connection = await getConnection(supabase, appointment.trainer_id);
  if (!connection) return;

  const accessToken = await getValidAccessToken(supabase, connection);
  await deleteGoogleEventDurably(supabase, connection, accessToken, eventId);
}

// Pushes every appointment still flagged as needing one: brand new rows,
// local edits whose push failed, cancellations whose Google delete never
// went through, and rows stranded on an abandoned `pending:` claim.
export async function pushPendingAppointments(
  supabase: SupabaseClient,
  trainerId: string
): Promise<{ attempted: number; failed: number }> {
  const { data: appointments } = await supabase
    .from("appointments")
    .select("*")
    .eq("trainer_id", trainerId)
    .eq("google_push_pending", true)
    .gte("end_time", daysAgoIso(PUSH_RETRY_PAST_WINDOW_DAYS));

  let failed = 0;
  for (const appt of appointments ?? []) {
    try {
      await pushAppointmentToGoogle(supabase, appt as Appointment);
    } catch (err) {
      // One bad appointment must not stop the rest of the sweep; it stays
      // flagged and gets retried on the next run.
      failed++;
      console.error("Failed to push appointment to Google", appt.id, err);
    }
  }

  return { attempted: appointments?.length ?? 0, failed };
}

// ── pull: Google → local ───────────────────────────────────────────────────

interface ApplyResult {
  applied: number;
  skipped: number;
  errors: string[];
}

interface AppointmentUpsert {
  trainer_id: string;
  client_name: string;
  notes: string | null;
  start_time: string;
  end_time: string;
  status: "booked";
  google_event_id: string;
  google_synced_at: string;
  google_push_pending: false;
}

// Google's copy is not automatically authoritative. Every write from the
// sync layer stamps google_synced_at, so an event whose `updated` predates
// that stamp is just the echo of our own push coming back — applying it
// would clobber whatever the trainer changed locally in the meantime.
function isEcho(event: GoogleEvent, lastSyncedAt: string | null): boolean {
  if (!lastSyncedAt || !event.updated) return false;
  return Date.parse(event.updated) <= Date.parse(lastSyncedAt);
}

async function applyGoogleEvents(
  supabase: SupabaseClient,
  trainerId: string,
  events: GoogleEvent[],
  pendingDeletionIds: Set<string>
): Promise<ApplyResult> {
  const result: ApplyResult = { applied: 0, skipped: 0, errors: [] };
  if (events.length === 0) return result;

  const cancelledIds: string[] = [];
  const candidates: GoogleEvent[] = [];

  for (const event of events) {
    // We are actively trying to remove this event from Google. Re-importing
    // it now would resurrect the very appointment the delete is retiring.
    if (pendingDeletionIds.has(event.id)) {
      result.skipped++;
      continue;
    }

    if (event.status === "cancelled") {
      cancelledIds.push(event.id);
      continue;
    }

    // An unexpanded recurring master describes a rule, not a session: its
    // start is the series' DTSTART, so writing it books a phantom
    // appointment on that date and silently stands in for every real
    // instance of the series. We always ask for singleEvents=true, so this
    // should be unreachable — but it reached production once by way of a
    // pagination bug that dropped the flag, and the corruption was invisible
    // until someone compared the two calendars by eye. Refuse loudly instead.
    if (event.recurrence?.length) {
      console.error(
        "Refusing unexpanded recurring master from Google — singleEvents expansion was lost",
        event.id
      );
      result.errors.push(`${event.id}: unexpanded recurring master, skipped`);
      result.skipped++;
      continue;
    }

    // All-day events (date-only, no dateTime) don't map cleanly onto a
    // session's start/end — skip them rather than guessing a time range.
    if (!event.start?.dateTime || !event.end?.dateTime) {
      result.skipped++;
      continue;
    }

    // Google permits zero-duration events; appointments has a strict
    // `end_time > start_time` check. Writing one raises a constraint error on
    // every future sync, and a batch that is nothing but that event would
    // never advance the sync token.
    if (Date.parse(event.end.dateTime) <= Date.parse(event.start.dateTime)) {
      result.skipped++;
      continue;
    }

    candidates.push(event);
  }

  // Cancellations, batched.
  for (const ids of chunk(cancelledIds, DB_BATCH_SIZE)) {
    try {
      await supabase
        .from("appointments")
        .update({
          status: "canceled",
          google_synced_at: nowIso(),
          google_push_pending: false,
        })
        .in("google_event_id", ids)
        .eq("trainer_id", trainerId)
        .neq("status", "canceled");
      // Google has removed them, so any delete we still had queued is moot.
      await supabase
        .from("google_pending_deletions")
        .delete()
        .eq("trainer_id", trainerId)
        .in("google_event_id", ids);
      result.applied += ids.length;
    } catch (err) {
      result.errors.push(`cancel batch: ${extractErrorMessage(err)}`);
    }
  }

  if (candidates.length === 0) return result;

  // One read for the whole batch to find which of these we've already
  // reconciled, instead of a round-trip per event.
  const lastSyncedByEventId = new Map<string, string | null>();
  for (const ids of chunk(candidates.map((e) => e.id), DB_BATCH_SIZE)) {
    const { data } = await supabase
      .from("appointments")
      .select("google_event_id, google_synced_at")
      .in("google_event_id", ids);
    for (const row of data ?? []) {
      lastSyncedByEventId.set(row.google_event_id, row.google_synced_at);
    }
  }

  // Keyed by event id, which also deduplicates: Postgres rejects an ON
  // CONFLICT batch that targets the same conflict key twice ("cannot affect
  // row a second time"), and that would fail the whole chunk. Last one wins.
  const rowsByEventId = new Map<string, AppointmentUpsert>();
  for (const event of candidates) {
    if (
      lastSyncedByEventId.has(event.id) &&
      isEcho(event, lastSyncedByEventId.get(event.id) ?? null)
    ) {
      result.skipped++;
      continue;
    }
    if (rowsByEventId.has(event.id)) result.skipped++;
    rowsByEventId.set(event.id, {
      trainer_id: trainerId,
      client_name: event.summary || "(untitled)",
      notes: event.description ?? null,
      start_time: event.start!.dateTime!,
      end_time: event.end!.dateTime!,
      status: "booked",
      google_event_id: event.id,
      google_synced_at: nowIso(),
      google_push_pending: false,
    });
  }

  // Atomic upsert on the google_event_id unique constraint — a plain
  // check-then-insert-or-update here is exactly the kind of thing that races
  // and duplicates rows when two sync runs overlap.
  for (const batch of chunk([...rowsByEventId.values()], DB_BATCH_SIZE)) {
    const { error } = await supabase
      .from("appointments")
      .upsert(batch, { onConflict: "google_event_id" });

    if (!error) {
      result.applied += batch.length;
      continue;
    }

    // Fall back to one-at-a-time so a single malformed event can't take the
    // whole batch down with it — and so the error message names the event
    // that actually caused it.
    for (const row of batch) {
      const { error: rowError } = await supabase
        .from("appointments")
        .upsert(row, { onConflict: "google_event_id" });
      if (rowError) {
        console.error("Failed to apply Google event", row.google_event_id, rowError);
        result.errors.push(
          `${row.google_event_id}: ${extractErrorMessage(rowError)}`
        );
      } else {
        result.applied++;
      }
    }
  }

  return result;
}

// Only advance the checkpoint if the batch was empty or we actually made
// progress on it. A 100%-failed batch signals something systemic rather than
// one bad event, and saving the token there tells Google "we're caught up" on
// data we never persisted — silently losing the whole batch with no way to
// recover it (which is exactly what happened here once).
//
// But refusing forever has its own failure mode: one permanently unwritable
// event, alone in a batch, would stall the feed indefinitely. So after a few
// consecutive total failures we drop the token instead of advancing it. That
// forces a full resync, which re-fetches the whole window — the bad event
// then arrives alongside good ones, progress is made, and the token moves
// past it without ever having discarded unpersisted changes.
async function advanceSyncToken(
  supabase: SupabaseClient,
  connection: GoogleCalendarConnection,
  update: Record<string, unknown>,
  nextSyncToken: string | undefined,
  progressed: boolean
) {
  if (progressed) {
    if (nextSyncToken) update.sync_token = nextSyncToken;
    update.consecutive_failed_pulls = 0;
  } else {
    const failures = (connection.consecutive_failed_pulls ?? 0) + 1;
    if (failures >= MAX_CONSECUTIVE_FAILED_PULLS) {
      console.error(
        `Google pull failed entirely ${failures}x for trainer ${connection.trainer_id} — forcing a full resync`
      );
      update.sync_token = null;
      update.consecutive_failed_pulls = 0;
    } else {
      update.consecutive_failed_pulls = failures;
    }
  }

  await supabase
    .from("google_calendar_connections")
    .update(update)
    .eq("trainer_id", connection.trainer_id);
}

// Epoch sentinel meaning "unlocked" — see the column comment in migration
// 0007 for why this isn't just NULL.
const SYNC_LOCK_UNLOCKED = "1970-01-01T00:00:00.000Z";

// Takes the per-trainer sync lock. Returns false if another run holds it.
// Conditional UPDATE, so the row lock makes this atomic: of two concurrent
// callers only one can move sync_lock_at forward from a stale value.
async function acquireSyncLock(
  supabase: SupabaseClient,
  trainerId: string
): Promise<boolean> {
  const staleBefore = new Date(Date.now() - SYNC_LOCK_TTL_MS).toISOString();
  const { data } = await supabase
    .from("google_calendar_connections")
    .update({ sync_lock_at: nowIso() })
    .eq("trainer_id", trainerId)
    .lt("sync_lock_at", staleBefore)
    .select("trainer_id")
    .maybeSingle();
  return !!data;
}

async function releaseSyncLock(supabase: SupabaseClient, trainerId: string) {
  await supabase
    .from("google_calendar_connections")
    .update({ sync_lock_at: SYNC_LOCK_UNLOCKED })
    .eq("trainer_id", trainerId);
}

export interface PullSummary {
  calendarId: string;
  mode: "incremental" | "initial" | "locked";
  fetched: number;
  applied: number;
  skipped: number;
  failed: number;
  errors: string[];
}

// Pulls changes from Google (incremental via stored sync_token, or a fresh
// full sync if there's no token yet / it expired / the sync window needs
// re-anchoring) and applies them to our appointments table.
export async function pullChangesFromGoogle(
  supabase: SupabaseClient,
  connection: GoogleCalendarConnection
): Promise<PullSummary> {
  const empty = {
    calendarId: connection.google_calendar_id,
    fetched: 0,
    applied: 0,
    skipped: 0,
    failed: 0,
    errors: [] as string[],
  };

  if (!(await acquireSyncLock(supabase, connection.trainer_id))) {
    return { ...empty, mode: "locked" };
  }

  try {
    const accessToken = await getValidAccessToken(supabase, connection);

    const windowEndsAt = connection.sync_window_end
      ? Date.parse(connection.sync_window_end)
      : 0;
    const needsReanchor =
      windowEndsAt - Date.now() < SYNC_WINDOW_REANCHOR_MARGIN_DAYS * DAY_MS;

    let page =
      connection.sync_token && !needsReanchor
        ? await listEventsIncremental(
            accessToken,
            connection.google_calendar_id,
            connection.sync_token
          )
        : null;
    let mode: PullSummary["mode"] = "incremental";

    const connectionUpdate: Record<string, unknown> = {};

    if (!page || page.syncTokenInvalid) {
      mode = "initial";
      const timeMax = daysFromNowIso(INITIAL_SYNC_FUTURE_WINDOW_DAYS);
      page = await listEventsInitial(
        accessToken,
        connection.google_calendar_id,
        daysAgoIso(INITIAL_SYNC_PAST_WINDOW_DAYS),
        timeMax
      );
      connectionUpdate.sync_window_end = timeMax;
    }

    const pendingDeletionIds = await getPendingDeletionIds(
      supabase,
      connection.trainer_id
    );

    const { applied, skipped, errors } = await applyGoogleEvents(
      supabase,
      connection.trainer_id,
      page.items,
      pendingDeletionIds
    );

    await advanceSyncToken(
      supabase,
      connection,
      connectionUpdate,
      page.nextSyncToken,
      page.items.length === 0 || applied + skipped > 0
    );

    return {
      calendarId: connection.google_calendar_id,
      mode,
      fetched: page.items.length,
      applied,
      skipped,
      failed: page.items.length - applied - skipped,
      errors,
    };
  } finally {
    await releaseSyncLock(supabase, connection.trainer_id);
  }
}

// ── watch channels ─────────────────────────────────────────────────────────

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
      watch_channel_expires_at: result.expiresAtIso,
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
// upcoming appointments up, pull down anything already on that calendar, and
// start a push-notification subscription.
export async function performInitialSync(
  supabase: SupabaseClient,
  connection: GoogleCalendarConnection
) {
  await pushPendingAppointments(supabase, connection.trainer_id);
  await pullChangesFromGoogle(supabase, connection);
  await registerWatchChannel(supabase, connection);
}

// Everything the cron and the manual "Sync now" both do, in the order that
// keeps state converging: pull first so local reflects Google, then push
// anything still outstanding, then retire failed deletes and keep the
// webhook subscription alive.
export async function runFullSync(
  supabase: SupabaseClient,
  connection: GoogleCalendarConnection
) {
  const pull = await pullChangesFromGoogle(supabase, connection);
  const push = await pushPendingAppointments(supabase, connection.trainer_id);
  const deletions = await flushPendingDeletions(supabase, connection);
  await renewWatchChannelIfNeeded(supabase, connection);
  return { pull, push, deletions };
}
