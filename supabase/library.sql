-- Exhibition Design & Simulator — phase 4: combined objects, stacking, and the shared item library.
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste all of this → Run.
-- Safe to re-run. Changes no existing data.

-- Lift: height of an object's base above the floor (m), e.g. a screen on a counter.
alter table public.objects add column if not exists elev double precision;

-- Parts of a combined object: { base: {w,d,h}, items: [ {shape|kind, x, y, z, w, d, h, rotY, color, …} ] }.
alter table public.objects add column if not exists parts jsonb;

-- Reusable items shared by all designs (any object saved with "Save to library").
create table if not exists public.library_items (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (length(name) between 1 and 80),
  item        jsonb not null,
  created_by  text,
  created_at  timestamptz not null default now()
);

alter table public.library_items enable row level security;
grant select, insert, delete on public.library_items to anon;

drop policy if exists "library anon select" on public.library_items;
drop policy if exists "library anon insert" on public.library_items;
drop policy if exists "library anon delete" on public.library_items;
create policy "library anon select" on public.library_items for select to anon using (true);
create policy "library anon insert" on public.library_items for insert to anon
  with check (octet_length(item::text) < 200000); -- keep entries reasonably small
create policy "library anon delete" on public.library_items for delete to anon using (true);
