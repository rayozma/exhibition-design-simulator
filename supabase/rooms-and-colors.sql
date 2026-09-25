-- NDT ADIPEC 2026 Design — upgrade: named rooms list + per-object colors.
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste all of this → Run.
-- Safe to re-run. Requires schema.sql to have been run first.

-- Rooms are listed on the home page so anyone can find and join them.
create table if not exists public.rooms (
  id          text primary key check (public.valid_room(id)),
  name        text not null default 'Untitled room',
  created_by  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.rooms enable row level security;
grant select, insert, update on public.rooms to anon;

drop policy if exists "rooms anon select" on public.rooms;
drop policy if exists "rooms anon insert" on public.rooms;
drop policy if exists "rooms anon update" on public.rooms;
create policy "rooms anon select" on public.rooms for select to anon using (true);
create policy "rooms anon insert" on public.rooms for insert to anon with check (public.valid_room(id));
create policy "rooms anon update" on public.rooms for update to anon
  using (public.valid_room(id)) with check (public.valid_room(id));

-- Keep rooms.updated_at current whenever an object in the room changes (for "last edited" sorting).
create or replace function public.touch_room() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.rooms set updated_at = now() where id = coalesce(new.room, old.room);
  return null;
end $$;

drop trigger if exists objects_touch_room on public.objects;
create trigger objects_touch_room after insert or update or delete on public.objects
  for each row execute function public.touch_room();

-- Register rooms that were created before this table existed.
insert into public.rooms (id, name, created_by)
select distinct room, 'Room ' || left(room, 6), 'migration' from public.objects
on conflict (id) do nothing;

-- Per-object display color (hex like #f5f5f5); null = default color for its material / category.
alter table public.objects add column if not exists color text;
