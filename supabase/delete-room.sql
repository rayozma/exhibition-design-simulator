-- NDT ADIPEC 2026 Design — deleting rooms with a password.
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste all of this → Run.
-- Safe to re-run. Requires schema.sql and rooms-and-colors.sql first.
--
-- The password itself is NOT in this file (this repository is public). Set it separately,
-- in the SQL Editor, with:
--
--   insert into public.app_secrets (name, hash)
--   values ('room_delete', extensions.crypt('YOUR-PASSWORD', extensions.gen_salt('bf')))
--   on conflict (name) do update set hash = excluded.hash;
--
-- Only a bcrypt hash is stored, and the browser can't read it.

create extension if not exists pgcrypto with schema extensions;

-- Secrets readable only inside the database (no policies = anon can't select them).
create table if not exists public.app_secrets (
  name text primary key,
  hash text not null
);
alter table public.app_secrets enable row level security;
revoke all on public.app_secrets from anon, authenticated;

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
