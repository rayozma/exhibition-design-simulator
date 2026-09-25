-- Exhibition Design & Simulator — designs: each room stores its own design document.
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste all of this → Run.
-- Safe to re-run. Requires schema.sql and rooms-and-colors.sql first. Changes no existing data.

-- The design (hall size, zones, your booth, entrances, …) as JSON on the room.
-- Rooms from before this change get the ADIPEC NDTCCS design (layout B) the first time they're opened.
alter table public.rooms add column if not exists design jsonb;

-- One layout per design: layout ids are no longer limited to 'A' / 'B'.
-- (Existing ADIPEC objects keep 'B'; the old 'A' rows stay in the table untouched.)
alter table public.objects drop constraint if exists objects_layout_id_check;
alter table public.objects add constraint objects_layout_id_check check (layout_id ~ '^[A-Za-z0-9_-]{1,32}$');
alter table public.snapshots drop constraint if exists snapshots_layout_id_check;
alter table public.snapshots add constraint snapshots_layout_id_check check (layout_id ~ '^[A-Za-z0-9_-]{1,32}$');

-- Realtime on rooms, so design edits (next phase) reach everyone in the room live.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'rooms'
  ) then
    alter publication supabase_realtime add table public.rooms;
  end if;
end $$;
