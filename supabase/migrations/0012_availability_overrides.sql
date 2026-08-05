-- Date-specific availability: vacation, an emergency, or "this week I start
-- at noon". Run in the Supabase SQL editor, or `supabase db push`. Safe to
-- re-run.
--
-- trainer_availability is a weekly pattern with no way to say "except this
-- Thursday", so there was nowhere for any of that to live.
--
-- One rule governs this table: if a date has any rows here, they define that
-- date completely and the weekly pattern does not apply. A single row with
-- null times means unavailable all day; rows with times are the replacement
-- windows. Vacation is one null-times row per date.
--
-- Replacement rather than subtraction is the whole point. "Off Thursday" and
-- "Thursday is 12-4 instead" are the same operation, and neither needs the
-- reader to work out what the weekly pattern was first.

create table if not exists public.availability_overrides (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers (id) on delete cascade,
  date date not null,
  -- Both null: unavailable for the whole day.
  start_time time,
  end_time time,
  note text,
  created_at timestamptz not null default now(),
  constraint availability_overrides_time_range check (
    (start_time is null and end_time is null)
    or (start_time is not null and end_time is not null and end_time > start_time)
  )
);

create index if not exists availability_overrides_trainer_date_idx
  on public.availability_overrides (trainer_id, date);

alter table public.availability_overrides enable row level security;

-- Same shape as trainer_availability after 0002: the whole gym floor is
-- readable, writes stay own-or-owner.
do $$
begin
  create policy "overrides select (any signed-in trainer)"
    on public.availability_overrides for select
    to authenticated
    using (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "overrides insert (own or owner)"
    on public.availability_overrides for insert
    to authenticated
    with check (trainer_id = auth.uid() or public.is_owner());
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "overrides update (own or owner)"
    on public.availability_overrides for update
    to authenticated
    using (trainer_id = auth.uid() or public.is_owner())
    with check (trainer_id = auth.uid() or public.is_owner());
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "overrides delete (own or owner)"
    on public.availability_overrides for delete
    to authenticated
    using (trainer_id = auth.uid() or public.is_owner());
exception when duplicate_object then null;
end $$;
