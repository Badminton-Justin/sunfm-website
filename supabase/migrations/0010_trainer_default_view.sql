-- Which calendar view the schedule page opens on, per trainer. Run in the
-- Supabase SQL editor. Safe to re-run.
--
-- Stored on the trainer rather than in localStorage so the schedule page can
-- render the right view on the server. Reading a browser-side preference would
-- mean rendering Day first and swapping after hydration — a visible flicker on
-- every load, or a hydration mismatch if the initial state disagreed.
--
-- Defaults to 'day', which is what the page did before this column existed.
-- Nobody's view changes until they pick one in Settings.

alter table public.trainers
  add column if not exists default_calendar_view text not null default 'day';

do $$
begin
  alter table public.trainers
    add constraint trainers_default_calendar_view_check
    check (default_calendar_view in ('day', 'week', 'month'));
exception
  when duplicate_object then null;
end $$;

-- No RLS change. "trainers update (owner only)" stays as it is: opening the
-- table to self-updates would also let a trainer set their own role to owner,
-- since RLS gates rows and not columns. The preferences route writes this one
-- column with the service client, scoped to the caller's own id.
