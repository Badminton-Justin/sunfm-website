-- One-time reset to clear out the push-side duplicate appointments created
-- before the atomic-claim fix in src/lib/google/sync.ts (pushAppointmentToGoogle
-- could be invoked concurrently from the OAuth callback, manual "Sync now",
-- and the daily cron — all three racing on the same trainer produced two
-- distinct real Google events for a handful of appointments).
--
-- A plain row DELETE here would not remove the orphaned Google Calendar
-- event, which a future full resync would just re-pull as a "new"
-- appointment — recreating the exact duplicate. Truncating and forcing a
-- full resync instead re-derives local state from Google (the source of
-- truth for events that already exist there) using the now-fixed sync code,
-- so it can't reintroduce the same duplicates.
--
-- Run this in the Supabase SQL editor, then trigger a resync (click
-- "Sync now" in the portal, or wait for the daily cron).

truncate table public.appointments;

update public.google_calendar_connections set sync_token = null;
