# StreamCheetah - Setup Guide

## Database Setup with Your Own Supabase Project

Follow these steps to set up a new Supabase project for StreamCheetah:

### 1. Create a New Supabase Project

- Go to [supabase.com](https://supabase.com)
- Sign up or log in
- Click "New Project"
- Fill in the project details and create it

### 2. Get Your Credentials

- In your Supabase dashboard, go to **Settings → API**
- Copy your:
  - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
  - **Publishable KEY** (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 3. Update Environment Variables

Replace the values in your `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_publishable_key_here
```

### 4. Create Database Tables

- Go to your Supabase dashboard
- Click **SQL Editor** in the left sidebar
- Copy and paste the contents of `database/migrations.sql`
- Click "Run" to execute the SQL
- Copy and paste the contents of `database/add_chat_session_id.sql`
- Click "Run" to execute the SQL
