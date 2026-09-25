-- Exhibition Design & Simulator — phase 3: basic shapes and the item library.
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste all of this → Run.
-- Safe to re-run. Changes no existing data.

-- More shapes than box / cylinder.
alter table public.objects drop constraint if exists objects_shape_check;
alter table public.objects add constraint objects_shape_check
  check (shape in ('box', 'cylinder', 'sphere', 'cone', 'wedge', 'panel', 'sign'));

-- Text shown on a sign.
alter table public.objects add column if not exists text text;

-- Which built-in model an object uses (e.g. 'chair', 'plant'); null = decided from its name / category.
alter table public.objects add column if not exists kind text;
