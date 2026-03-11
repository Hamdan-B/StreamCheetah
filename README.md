##About
A preconfigured streaming site project.

## Quick setup

1. Install deps

- `npm install`

2. Configure Supabase

- Create a project (free tier is fine).
- In Supabase Dashboard > Settings > API, copy `Project URL` to `NEXT_PUBLIC_SUPABASE_URL` and `anon` key to `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your `.env.local`.
- In Supabase SQL editor, run the migration helper at `database/add_chat_session_id.sql` (creates `chat_session_id` and backfills livestreams).

3. Run dev server

- `npm run dev`
- Open http://localhost:3000
