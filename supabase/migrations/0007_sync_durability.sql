-- Durability fixes for the Google Calendar two-way sync. Run in the Supabase
-- SQL editor after 0006.
--
-- Written to be safely re-runnable: the SQL editor does not wrap a script in
-- a transaction, so a statement failing partway through leaves the earlier
-- ones applied. Every statement here is therefore conditional, and running
-- the file twice is a no-op rather than an error.
--
-- Addresses four classes of latent failure:
--   1. The pull window was anchored once (at connect time) and never moved,
--      so Google -> portal sync developed a hard horizon that crept toward
--      the present. Now tracked explicitly so the sync layer can re-anchor.
--   2. Local changes that failed to reach Google were never retried (and a
--      later full resync silently reverted them). Now flagged per row.
--   3. Deletes/cancels that failed on Google's side left orphaned events that
--      a later resync re-imported as new appointments. Now queued for retry.
--   4. Overlapping sync runs shared one sync token. Now serialized per
--      trainer with a short-lived lock.

-- ── connection: window anchoring, locking, failure tracking ─────────────────
alter table public.google_calendar_connections
  -- timeMax used by the last full sync. Google scopes an incremental sync
  -- token to the original request, so this is the real horizon of what the
  -- incremental feed can ever deliver — the sync layer re-anchors before it
  -- gets close.
  add column if not exists sync_window_end timestamptz,
  -- Short-lived advisory lock. The webhook can fire several times in quick
  -- succession and overlap the cron/manual sync; without this they all pull
  -- with the same sync token and race each other's writes.
  --
  -- NOT NULL with an epoch sentinel for "unlocked", rather than nullable:
  -- the acquire is a conditional UPDATE, and this keeps its predicate a
  -- single `lt` comparison instead of an `or(is.null, lt.<timestamp>)`.
  -- PostgREST needs reserved characters quoted inside or(), and getting that
  -- subtly wrong fails the request rather than the predicate — which would
  -- read as "lock unavailable" and silently wedge sync for good.
  add column if not exists sync_lock_at timestamptz not null default '1970-01-01T00:00:00Z',
  -- Escape hatch for a poison-pill event. We deliberately do not advance the
  -- sync token on a fully-failed batch (see 675cf48), but a single
  -- permanently-unwritable event would then stall the feed indefinitely.
  -- After a few consecutive total failures we drop the token instead, which
  -- forces a full resync — that re-fetches everything in the window, so the
  -- bad event lands in a batch alongside good ones and the token can move
  -- past it without losing data.
  add column if not exists consecutive_failed_pulls integer not null default 0;

-- Two trainers connecting the same Google account would resolve to the same
-- "SunFM Schedule" calendar, and since google_event_id is globally unique
-- their syncs would fight over trainer_id on every appointment row.
--
-- ADD CONSTRAINT has no IF NOT EXISTS, hence the guard. If this errors with
-- a duplicate-key violation, two trainers are already sharing one Google
-- account and that has to be resolved by disconnecting one of them first.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'google_calendar_connections_calendar_id_key'
      and conrelid = 'public.google_calendar_connections'::regclass
  ) then
    alter table public.google_calendar_connections
      add constraint google_calendar_connections_calendar_id_key
      unique (google_calendar_id);
  end if;
end $$;

-- ── appointments: pending-push flag ────────────────────────────────────────
alter table public.appointments
  add column if not exists google_push_pending boolean not null default true;

-- Existing rows that already round-tripped to Google are up to date.
update public.appointments
  set google_push_pending = false
  where google_event_id is not null
    and google_synced_at is not null
    and google_push_pending;

-- Flags a row as needing a push whenever a user-visible field changes.
--
-- The discriminator between "a person edited this" and "the sync layer wrote
-- this" is google_synced_at: every write from the sync layer touches it, and
-- no write from the portal API ever does. That keeps a pulled change from
-- immediately flagging itself to be pushed straight back.
create or replace function public.mark_google_push_pending()
returns trigger
language plpgsql
as $$
begin
  if new.google_synced_at is distinct from old.google_synced_at then
    return new;
  end if;

  if new.client_name is distinct from old.client_name
     or new.start_time is distinct from old.start_time
     or new.end_time  is distinct from old.end_time
     or new.notes     is distinct from old.notes
     or new.status    is distinct from old.status then
    new.google_push_pending := true;
  end if;

  return new;
end;
$$;

drop trigger if exists appointments_mark_google_push_pending on public.appointments;
create trigger appointments_mark_google_push_pending
  before update on public.appointments
  for each row
  execute function public.mark_google_push_pending();

-- Lets the retry sweep find rows needing a push without a sequential scan.
create index if not exists appointments_google_push_pending_idx
  on public.appointments (trainer_id)
  where google_push_pending;

-- ── pending deletions ──────────────────────────────────────────────────────
-- A hard-deleted appointment leaves no row to carry a retry flag, and a
-- cancel whose Google delete failed would otherwise be resurrected as
-- "booked" by the next full resync. Rows are enqueued *before* the delete is
-- attempted and removed only on confirmed success, so a crash mid-delete
-- still leaves a durable record to retry.
create table if not exists public.google_pending_deletions (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers (id) on delete cascade,
  google_event_id text not null,
  attempts integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trainer_id, google_event_id)
);

drop trigger if exists google_pending_deletions_set_updated_at on public.google_pending_deletions;
create trigger google_pending_deletions_set_updated_at
  before update on public.google_pending_deletions
  for each row
  execute function public.set_updated_at();

-- Server-only bookkeeping. RLS on with no policies at all: authenticated
-- sessions get nothing, the service-role key (which all sync work now uses)
-- bypasses RLS entirely.
alter table public.google_pending_deletions enable row level security;
