-- Groups the appointments that "Repeat weekly" creates in one batch, so the
-- portal can offer "this appointment" vs "this and all later ones" the way a
-- calendar app does. Run in the Supabase SQL editor. Safe to re-run.
--
-- Deliberately not a real recurrence rule. Each occurrence stays its own row
-- with its own Google event, exactly as before — series_id only records that
-- they were booked together. That keeps the sync path untouched: Google is
-- pulled with singleEvents=true and unexpanded masters are refused, so the
-- portal never has to reason about RRULEs in either direction.
--
-- Null for everything that already exists, including past repeat batches:
-- which rows were booked together is not recoverable after the fact, and
-- guessing by trainer + client + weekday would silently group appointments
-- that were only ever booked one at a time. Those keep behaving as single
-- appointments, which is what they have always been.

alter table public.appointments
  add column if not exists series_id uuid;

-- Partial: only a minority of rows are ever part of a series, and every
-- lookup that uses this column is filtering for a specific non-null id.
create index if not exists appointments_series_id_idx
  on public.appointments (series_id)
  where series_id is not null;
