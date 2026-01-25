-- Adds chat_session_id to livestreams and backfills existing rows
alter table public.livestreams
  add column if not exists chat_session_id text;

update public.livestreams
set chat_session_id = coalesce(
  chat_session_id,
  user_name || '-' || floor(extract(epoch from now()))::text
);
