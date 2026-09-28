-- Exhibition Design & Simulator — complete Supabase setup: tables, RLS, realtime and storage.
-- Run in Supabase: Dashboard → SQL Editor → New query → paste all of this → Run.
-- Safe to re-run, on a new project or on one set up with the older step-by-step files.
-- Changes no existing data.
--
-- After the first run, set the room delete password (it is NOT in this file; the repository is public):
--
--   insert into public.app_secrets (name, hash)
--   values ('room_delete', extensions.crypt('YOUR-PASSWORD', extensions.gen_salt('bf')))
--   on conflict (name) do update set hash = excluded.hash;
--
-- Only a bcrypt hash is stored, and the browser can't read it.


-- ─── 1. Extensions and helpers ───────────────────────────────────────────────────────────────

create extension if not exists pgcrypto with schema extensions;

-- Room ids are random 22-character strings made by the app. Policies only accept well-formed ids.
create or replace function public.valid_room(r text) returns boolean
language sql immutable
set search_path = ''
as $$ select r ~ '^[A-Za-z0-9_-]{16,64}$' $$;

-- Keep updated_at current on every update (including upserts).
create or replace function public.touch_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$ begin new.updated_at = now(); return new; end $$;


-- ─── 2. Tables ───────────────────────────────────────────────────────────────────────────────

-- Rooms are listed on the home page so anyone can find and join them.
-- design: the room's design document (hall size, zones, booth, entrances, …) as JSON.
-- Rooms without one get the ADIPEC NDTCCS design (layout B) the first time they're opened.
create table if not exists public.rooms (
  id          text primary key check (public.valid_room(id)),
  name        text not null default 'Untitled room',
  created_by  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  design      jsonb
);

-- One row per object, per room, per layout ('main' for designs, 'B' for the original ADIPEC room).
-- Checks on layout_id and shape are in section 3.
create table if not exists public.objects (
  room        text not null check (public.valid_room(room)),
  layout_id   text not null,
  id          text not null,
  num         integer,
  name        text not null,
  category    text not null default 'misc',
  shape       text not null default 'box',
  w           double precision not null,
  d           double precision not null,
  h           double precision not null,
  x           double precision not null,
  z           double precision not null,
  rot_y       double precision not null default 0,
  elev        double precision,              -- lift above the floor (m), e.g. a screen on a counter
  material    text,
  color       text,                          -- hex like #f5f5f5; null = default for material / category
  attraction  boolean not null default false,
  note        text,
  text        text,                          -- text shown on a sign
  kind        text,                          -- built-in model ('chair', 'plant', …); null = from name / category
  parts       jsonb,                         -- combined object: { base: {w,d,h}, items: [ … ] }
  info        jsonb,                         -- info card: { title, description, why, link, images, faq: [{q, a}] }
  model_url   text,
  model_fit   boolean not null default true, -- scale the model to w/d/h (true) or keep its own size
  locked      boolean not null default false,
  updated_by  text,
  updated_at  timestamptz not null default now(),
  primary key (room, layout_id, id)
);

-- Named layout snapshots.
create table if not exists public.snapshots (
  id          uuid primary key default gen_random_uuid(),
  room        text not null check (public.valid_room(room)),
  layout_id   text not null,
  name        text not null,
  data        jsonb not null,
  created_by  text,
  created_at  timestamptz not null default now()
);
create index if not exists snapshots_room_idx on public.snapshots (room, layout_id, created_at desc);

-- Reusable items shared by all designs (any object saved with "Save to library").
create table if not exists public.library_items (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (length(name) between 1 and 80),
  item        jsonb not null,
  created_by  text,
  created_at  timestamptz not null default now()
);

-- Secrets readable only inside the database (no policies = anon can't select them).
create table if not exists public.app_secrets (
  name text primary key,
  hash text not null
);


-- ─── 3. Upgrades for databases set up before the current version ─────────────────────────────
-- On a new project these do nothing (columns exist already) or just recreate the same checks.

alter table public.rooms   add column if not exists design    jsonb;
alter table public.objects add column if not exists elev      double precision;
alter table public.objects add column if not exists color     text;
alter table public.objects add column if not exists text      text;
alter table public.objects add column if not exists kind      text;
alter table public.objects add column if not exists parts     jsonb;
alter table public.objects add column if not exists info      jsonb;
alter table public.objects add column if not exists model_fit boolean not null default true;

-- Layout ids: any short id (originally only 'A' / 'B'; old 'A' rows stay untouched).
alter table public.objects drop constraint if exists objects_layout_id_check;
alter table public.objects add constraint objects_layout_id_check check (layout_id ~ '^[A-Za-z0-9_-]{1,32}$');
alter table public.snapshots drop constraint if exists snapshots_layout_id_check;
alter table public.snapshots add constraint snapshots_layout_id_check check (layout_id ~ '^[A-Za-z0-9_-]{1,32}$');

alter table public.objects drop constraint if exists objects_shape_check;
alter table public.objects add constraint objects_shape_check
  check (shape in ('box', 'cylinder', 'sphere', 'cone', 'wedge', 'panel', 'sign'));

-- Register rooms that were created before the rooms table existed.
insert into public.rooms (id, name, created_by)
select distinct room, 'Room ' || left(room, 6), 'migration' from public.objects
on conflict (id) do nothing;


-- ─── 4. Triggers and functions ───────────────────────────────────────────────────────────────

drop trigger if exists objects_touch on public.objects;
create trigger objects_touch before update on public.objects
  for each row execute function public.touch_updated_at();

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

-- Delete a room and everything in it, if the password matches. Returns false for a wrong password.
create or replace function public.delete_room(p_room text, p_password text) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  h text;
begin
  select hash into h from public.app_secrets where name = 'room_delete';
  if h is null then
    raise exception 'Room deletion is not set up yet (no password configured in app_secrets)';
  end if;
  if extensions.crypt(p_password, h) <> h then
    perform pg_sleep(1); -- slow down password guessing
    return false;
  end if;
  delete from public.snapshots where room = p_room;
  delete from public.objects where room = p_room;
  delete from public.rooms where id = p_room;
  return true;
end $$;

revoke all on function public.delete_room(text, text) from public;
grant execute on function public.delete_room(text, text) to anon;


-- ─── 5. Row Level Security ───────────────────────────────────────────────────────────────────
-- No sign-in, so the anon role may read/write rows of any well-formed room.
-- The app always filters by its own room id; the room id in the link acts as the shared secret.

alter table public.rooms         enable row level security;
alter table public.objects       enable row level security;
alter table public.snapshots     enable row level security;
alter table public.library_items enable row level security;
alter table public.app_secrets   enable row level security;

grant select, insert, update         on public.rooms to anon;
grant select, insert, update, delete on public.objects, public.snapshots to anon;
grant select, insert, delete         on public.library_items to anon;
revoke all on public.app_secrets from anon, authenticated;

drop policy if exists "rooms anon select" on public.rooms;
drop policy if exists "rooms anon insert" on public.rooms;
drop policy if exists "rooms anon update" on public.rooms;
create policy "rooms anon select" on public.rooms for select to anon using (true);
create policy "rooms anon insert" on public.rooms for insert to anon with check (public.valid_room(id));
create policy "rooms anon update" on public.rooms for update to anon
  using (public.valid_room(id)) with check (public.valid_room(id));

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

drop policy if exists "library anon select" on public.library_items;
drop policy if exists "library anon insert" on public.library_items;
drop policy if exists "library anon delete" on public.library_items;
create policy "library anon select" on public.library_items for select to anon using (true);
create policy "library anon insert" on public.library_items for insert to anon
  with check (octet_length(item::text) < 200000); -- keep entries reasonably small
create policy "library anon delete" on public.library_items for delete to anon using (true);


-- ─── 6. Realtime ─────────────────────────────────────────────────────────────────────────────
-- Broadcast row changes on objects and rooms (design edits) to everyone in the room.

do $$
declare
  t text;
begin
  foreach t in array array['objects', 'rooms'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;


-- ─── 7. Storage ──────────────────────────────────────────────────────────────────────────────
-- Public buckets: anyone can download (needed to show the files). Uploads need no sign-in, but only
-- new files at <bucket>/<valid room id>/<name>.<ext>. Size and MIME type are enforced by the bucket.
-- No update/delete policies: uploaded files can't be overwritten or removed from the app.

-- "models": GLB 3D models, max 25 MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('models', 'models', true, 26214400, array['model/gltf-binary'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "models anon upload" on storage.objects;
create policy "models anon upload" on storage.objects for insert to anon with check (
  bucket_id = 'models'
  and array_length(storage.foldername(name), 1) = 1
  and public.valid_room((storage.foldername(name))[1])
  and lower(storage.extension(name)) = 'glb'
);

-- "images": info-card pictures, max 10 MB, common image types.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('images', 'images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "images anon upload" on storage.objects;
create policy "images anon upload" on storage.objects for insert to anon with check (
  bucket_id = 'images'
  and array_length(storage.foldername(name), 1) = 1
  and public.valid_room((storage.foldername(name))[1])
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp', 'gif')
);
