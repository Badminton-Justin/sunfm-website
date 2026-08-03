-- SunFM Admin Portal — open read visibility across trainers' schedules.
-- Jeff's original ask was "show all trainers' schedules" to everyone, not just
-- the owner. Run this in the Supabase SQL editor after 0001_portal_schedule.sql.
--
-- Read (SELECT) opens up to any signed-in trainer. Write (INSERT/UPDATE/DELETE)
-- stays restricted to "own row, or owner" — trainers can see the whole gym
-- floor but can only edit their own appointments/availability.

drop policy "appointments select (own or owner)" on public.appointments;
create policy "appointments select (any signed-in trainer)"
  on public.appointments for select
  to authenticated
  using (true);

drop policy "availability select (own or owner)" on public.trainer_availability;
create policy "availability select (any signed-in trainer)"
  on public.trainer_availability for select
  to authenticated
  using (true);
