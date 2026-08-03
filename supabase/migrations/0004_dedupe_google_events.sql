-- Cleans up duplicate/orphaned appointment rows created by a since-fixed
-- race condition (a stuck sync request kept running server-side after the
-- client gave up with a 504, racing a subsequent "Sync now" click — both
-- ended up inserting rows for the same Google events instead of one
-- updating the other). Run this in the Supabase SQL editor after 0003.
--
-- Confirmed with the user this is still test/practice data — wiping and
-- letting a fresh sync repopulate from Google (the source of truth) is
-- simpler and safer than trying to surgically identify every orphaned row.

truncate table public.appointments;

-- Force the next sync to do a full re-fetch from Google rather than an
-- incremental one based on the now-cleared local state.
update public.google_calendar_connections set sync_token = null;

-- Structurally prevent this class of duplicate from ever happening again —
-- at most one appointment per Google event. Required for the
-- upsert(..., { onConflict: "google_event_id" }) call in sync.ts to work
-- atomically.
create unique index appointments_google_event_id_unique_idx
  on public.appointments (google_event_id)
  where google_event_id is not null;
