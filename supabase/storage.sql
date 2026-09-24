-- NDT ADIPEC 2026 Design — phase 4: 3D model uploads.
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste all of this → Run.
-- Safe to re-run. Requires schema.sql to have been run first.

-- New column: scale an attached model to fit the object's w/d/h (true) or keep its own size (false).
alter table public.objects add column if not exists model_fit boolean not null default true;

-- Public bucket "models": anyone can download (needed to show models), max 25 MB, GLB only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('models', 'models', true, 26214400, array['model/gltf-binary'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Uploads (no sign-in): only new files at models/<valid room id>/<name>.glb.
-- The 25 MB limit and the MIME type are enforced by the bucket settings above.
-- No update/delete policies: uploaded files can't be overwritten or removed from the app.
drop policy if exists "models anon upload" on storage.objects;
create policy "models anon upload" on storage.objects for insert to anon with check (
  bucket_id = 'models'
  and array_length(storage.foldername(name), 1) = 1
  and public.valid_room((storage.foldername(name))[1])
  and lower(storage.extension(name)) = 'glb'
);
