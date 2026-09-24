-- NDT ADIPEC 2026 Design — database schema.
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste all of this → Run.
-- Safe to re-run.

-- Room ids are random 22-character strings made by the app. Policies only accept well-formed ids.
create or replace function public.valid_room(r text) returns boolean
language sql immutable
set search_path = ''
as $$ select r ~ '^[A-Za-z0-9_-]{16,64}$' $$;

-- One row per object, per room, per layout option (A / B).
create table if not exists public.objects (
  room        text not null check (public.valid_room(room)),
  layout_id   text not null check (layout_id in ('A', 'B')),
  id          text not null,
  num         integer,
  name        text not null,
  category    text not null default 'misc',
  shape       text not null default 'box' check (shape in ('box', 'cylinder')),
  w           double precision not null,
  d           double precision not null,
  h           double precision not null,
  x           double precision not null,
  z           double precision not null,
  rot_y       double precision not null default 0,
  material    text,
  attraction  boolean not null default false,
  note        text,
  model_url   text,
  model_fit   boolean not null default true,  -- added in phase 4 (storage.sql)
  locked      boolean not null default false,
  updated_by  text,
  updated_at  timestamptz not null default now(),
  primary key (room, layout_id, id)
);

-- Keep updated_at current on every update (including upserts).
create or replace function public.touch_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$ begin new.updated_at = now(); return new; end $$;

drop trigger if exists objects_touch on public.objects;
create trigger objects_touch before update on public.objects
  for each row execute function public.touch_updated_at();

-- Named layout snapshots (used in phase 6).
create table if not exists public.snapshots (
  id          uuid primary key default gen_random_uuid(),
  room        text not null check (public.valid_room(room)),
  layout_id   text not null check (layout_id in ('A', 'B')),
  name        text not null,
  data        jsonb not null,
  created_by  text,
  created_at  timestamptz not null default now()
);
create index if not exists snapshots_room_idx on public.snapshots (room, layout_id, created_at desc);

-- Row Level Security: no sign-in, so the anon role may read/write rows of any well-formed room.
-- The app always filters by its own room id; the room id in the link acts as the shared secret.
alter table public.objects enable row level security;
alter table public.snapshots enable row level security;

grant select, insert, update, delete on public.objects, public.snapshots to anon;

drop policy if exists "objects anon select" on public.objects;
drop policy if exists "objects anon insert" on public.objects;
drop policy if exists "objects anon update" on public.objects;
drop policy if exists "objects anon delete" on public.objects;
create policy "objects anon select" on public.objects for select to anon using (public.valid_room(room));
create policy "objects anon insert" on public.objects for insert to anon with check (public.valid_room(room));
create policy "objects anon update" on public.objects for update to anon
  using (public.valid_room(room)) with check (public.valid_room(room));
create policy "objects anon delete" on public.objects for delete to anon using (public.valid_room(room));

drop policy if exists "snapshots anon select" on public.snapshots;
drop policy if exists "snapshots anon insert" on public.snapshots;
drop policy if exists "snapshots anon delete" on public.snapshots;
create policy "snapshots anon select" on public.snapshots for select to anon using (public.valid_room(room));
create policy "snapshots anon insert" on public.snapshots for insert to anon with check (public.valid_room(room));
create policy "snapshots anon delete" on public.snapshots for delete to anon using (public.valid_room(room));

-- Realtime: broadcast row changes on objects to subscribed clients.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'objects'
  ) then
    alter publication supabase_realtime add table public.objects;
  end if;
end $$;
