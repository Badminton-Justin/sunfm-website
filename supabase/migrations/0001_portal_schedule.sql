-- SunFM Admin Portal — Slice 1: auth roles + schedule management
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query) after creating the project.

-- ── trainers ────────────────────────────────────────────────────────────────
-- One row per staff member, 1:1 with a Supabase Auth user (auth.users.id).
create table public.trainers (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'trainer' check (role in ('owner', 'trainer')),
  created_at timestamptz not null default now()
);

-- ── appointments ────────────────────────────────────────────────────────────
-- client_name is a plain-text placeholder for this slice; will become a real
-- FK to a `clients` table in the next slice.
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers (id) on delete cascade,
  client_name text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  notes text,
  status text not null default 'booked' check (status in ('booked', 'canceled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointments_time_range check (end_time > start_time)
);

create index appointments_trainer_id_idx on public.appointments (trainer_id);
create index appointments_start_time_idx on public.appointments (start_time);

-- ── trainer_availability ────────────────────────────────────────────────────
-- Recurring weekly windows, e.g. day_of_week=1 (Monday) 09:00-17:00.
-- day_of_week: 0 = Sunday .. 6 = Saturday.
create table public.trainer_availability (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  constraint trainer_availability_time_range check (end_time > start_time)
);

create index trainer_availability_trainer_id_idx on public.trainer_availability (trainer_id);

-- ── updated_at trigger for appointments ─────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger appointments_set_updated_at
  before update on public.appointments
  for each row
  execute function public.set_updated_at();

-- ── role helper (security definer to avoid RLS recursion on trainers) ──────
create or replace function public.is_owner()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.trainers where id = auth.uid() and role = 'owner'
  );
$$;

-- ── RLS ──────────────────────────────────────────────────────────────────
alter table public.trainers enable row level security;
alter table public.appointments enable row level security;
alter table public.trainer_availability enable row level security;

-- trainers: any signed-in trainer can see the roster (needed to show names
-- in the schedule UI); only the owner can add/edit/remove trainer records.
create policy "trainers select (any signed-in trainer)"
  on public.trainers for select
  to authenticated
  using (true);

create policy "trainers insert (owner only)"
  on public.trainers for insert
  to authenticated
  with check (public.is_owner());

create policy "trainers update (owner only)"
  on public.trainers for update
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

create policy "trainers delete (owner only)"
  on public.trainers for delete
  to authenticated
  using (public.is_owner());

-- appointments: owner sees/edits everything; a trainer sees/edits only their own.
create policy "appointments select (own or owner)"
  on public.appointments for select
  to authenticated
  using (trainer_id = auth.uid() or public.is_owner());

create policy "appointments insert (own or owner)"
  on public.appointments for insert
  to authenticated
  with check (trainer_id = auth.uid() or public.is_owner());

create policy "appointments update (own or owner)"
  on public.appointments for update
  to authenticated
  using (trainer_id = auth.uid() or public.is_owner())
  with check (trainer_id = auth.uid() or public.is_owner());

create policy "appointments delete (own or owner)"
  on public.appointments for delete
  to authenticated
  using (trainer_id = auth.uid() or public.is_owner());

-- trainer_availability: same own-or-owner pattern.
create policy "availability select (own or owner)"
  on public.trainer_availability for select
  to authenticated
  using (trainer_id = auth.uid() or public.is_owner());

create policy "availability insert (own or owner)"
  on public.trainer_availability for insert
  to authenticated
  with check (trainer_id = auth.uid() or public.is_owner());

create policy "availability update (own or owner)"
  on public.trainer_availability for update
  to authenticated
  using (trainer_id = auth.uid() or public.is_owner())
  with check (trainer_id = auth.uid() or public.is_owner());

create policy "availability delete (own or owner)"
  on public.trainer_availability for delete
  to authenticated
  using (trainer_id = auth.uid() or public.is_owner());
