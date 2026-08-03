-- SunFM Admin Portal — Google Calendar two-way sync.
-- Run this in the Supabase SQL editor after 0001 and 0002.
--
-- Each trainer can connect their own Google account. We create/use a
-- dedicated secondary calendar ("SunFM Schedule") on their account rather
-- than syncing their primary calendar, so client sessions never mix with
-- personal events in either direction.

create table public.google_calendar_connections (
  trainer_id uuid primary key references public.trainers (id) on delete cascade,
  google_calendar_id text not null,
  access_token text not null,
  access_token_expires_at timestamptz not null,
  refresh_token text not null,
  sync_token text,
  watch_channel_id text,
  watch_resource_id text,
  watch_channel_expires_at timestamptz,
  watch_verification_token text,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger google_calendar_connections_set_updated_at
  before update on public.google_calendar_connections
  for each row
  execute function public.set_updated_at();

-- OAuth tokens are personal credentials — restrict strictly to the owning
-- trainer, even the gym owner role does not get a bypass here. Server-only
-- background work (webhook, cron renewal) uses the service-role key instead
-- of a user session, so it isn't affected by this policy at all.
alter table public.google_calendar_connections enable row level security;

create policy "google connection select (self only)"
  on public.google_calendar_connections for select
  to authenticated
  using (trainer_id = auth.uid());

create policy "google connection insert (self only)"
  on public.google_calendar_connections for insert
  to authenticated
  with check (trainer_id = auth.uid());

create policy "google connection update (self only)"
  on public.google_calendar_connections for update
  to authenticated
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

create policy "google connection delete (self only)"
  on public.google_calendar_connections for delete
  to authenticated
  using (trainer_id = auth.uid());

-- Link appointments to their mirrored Google Calendar event, when synced.
alter table public.appointments
  add column google_event_id text,
  add column google_synced_at timestamptz;

create index appointments_google_event_id_idx
  on public.appointments (google_event_id)
  where google_event_id is not null;
