-- Exhibition Design & Simulator — object info cards.
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste all of this → Run.
-- Safe to re-run. Changes no existing data.

-- Info card of an object: { title, description, why, link, images: [url, …] }.
alter table public.objects add column if not exists info jsonb;

-- Public bucket "images" for info-card pictures: anyone can view, max 10 MB, common image types.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('images', 'images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Uploads (no sign-in): only new files at images/<valid room id>/<name>.<image extension>.
drop policy if exists "images anon upload" on storage.objects;
create policy "images anon upload" on storage.objects for insert to anon with check (
  bucket_id = 'images'
  and array_length(storage.foldername(name), 1) = 1
  and public.valid_room((storage.foldername(name))[1])
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp', 'gif')
);
