-- Weekly bookings with no end date. Run in the Supabase SQL editor after
-- 0009. Safe to re-run.
--
-- There is no way to store an infinite number of appointments, so an
-- open-ended series is kept materialised out to a rolling horizon and topped
-- up by the daily cron — the same shape as the Google sync's own 180-day
-- window, which re-anchors as it drains. Past that horizon an appointment
-- would not reach the trainer's Google Calendar anyway.
--
-- A flag on the appointment rather than a series table: the top-up needs the
-- trainer, client, notes, weekday, time and duration, and reads all of them
-- off the latest occurrence. The only thing missing was whether the series
-- was meant to keep going. Deleting or cancelling "this and all later ones"
-- clears it, which is what ends the recurrence.

alter table public.appointments
  add column if not exists series_open_ended boolean not null default false;

-- The top-up asks one question: per open-ended series, what is the latest
-- occurrence? Partial, because almost no rows qualify.
create index if not exists appointments_open_ended_series_idx
  on public.appointments (series_id, start_time desc)
  where series_open_ended;
