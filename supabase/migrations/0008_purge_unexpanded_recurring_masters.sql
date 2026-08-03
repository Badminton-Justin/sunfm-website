-- Clears out appointments written from unexpanded recurring master events.
-- Run in the Supabase SQL editor after 0007, together with the pagination fix
-- in src/lib/google/calendar.ts (they are only correct as a pair).
--
-- What happened: listEventsPaged sent only `pageToken` when following
-- pagination, dropping singleEvents=true along with timeMin/timeMax. From
-- page two onward Google therefore returned recurring *masters* rather than
-- expanded instances. A master's start is the series' DTSTART, so each
-- recurring client collapsed from one row per weekly session into a single
-- row dated at the start of the series — often on a day whose real instance
-- had since been moved or deleted, which is why they surfaced as phantom
-- overlapping sessions in the first week while later weeks emptied out.
--
-- These rows cannot self-heal. A correct sync returns instance ids
-- (`<masterId>_<UTC timestamp>`), which never collide with the master ids
-- already stored, so nothing would ever update or retire them.
--
-- Rather than guess which rows are masters — a master id is
-- indistinguishable from an ordinary non-recurring event id — re-derive the
-- whole Google-backed set from Google, which is authoritative for every one
-- of these events.

-- Appointments that exist in Google. Anything created in the portal and
-- already pushed lives there too, so a full resync brings it back; only the
-- local row id changes, which nothing references.
delete from public.appointments
  where google_event_id is not null;

-- Local-only appointments (google_event_id is null) are deliberately kept.
-- They have never reached Google, and the push sweep will mirror them up on
-- the next sync.

-- Force a full re-fetch rather than an incremental one: the stored sync token
-- describes a checkpoint reached with the broken pagination, and
-- sync_window_end must be cleared alongside it so the window is re-anchored
-- from scratch.
update public.google_calendar_connections
  set sync_token = null,
      sync_window_end = null,
      consecutive_failed_pulls = 0;

-- Queued deletes reference events that are about to be re-imported; a stale
-- entry here would suppress an event from ever coming back.
delete from public.google_pending_deletions;
