-- Fixes the actual root cause of "every event fails to write": the unique
-- index from 0004 was partial (`where google_event_id is not null`), and
-- Postgres's ON CONFLICT (column) inference does not match a partial index
-- unless the same predicate is repeated in the ON CONFLICT clause — which
-- Supabase's upsert(..., { onConflict }) helper has no way to specify.
-- Every upsert in sync.ts has been failing with "no unique or exclusion
-- constraint matching the ON CONFLICT specification" as a result.
--
-- A plain (non-partial) unique constraint works instead — Postgres already
-- treats NULLs as never conflicting with each other under a standard unique
-- constraint, so local-only appointments (google_event_id null) are still
-- unaffected; only real duplicate google_event_id values get rejected.

drop index if exists public.appointments_google_event_id_unique_idx;

alter table public.appointments
  add constraint appointments_google_event_id_key unique (google_event_id);
