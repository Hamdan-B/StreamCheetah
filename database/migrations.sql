-- StreamCheetah Database Migration Script
-- Run this in your Supabase SQL Editor to set up the database

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  user_name TEXT UNIQUE NOT NULL,
  mail TEXT NOT NULL,
  image_url TEXT,
  date_of_birth TEXT NOT NULL,
  interests TEXT[] DEFAULT '{}',
  following TEXT[] DEFAULT '{}',
  followers TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create livestreams table
CREATE TABLE IF NOT EXISTS livestreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  profile_image_url TEXT NOT NULL,
  categories TEXT[] DEFAULT '{}',
  is_live BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_user_name ON users(user_name);
CREATE INDEX IF NOT EXISTS idx_livestreams_user_name ON livestreams(user_name);
CREATE INDEX IF NOT EXISTS idx_livestreams_is_live ON livestreams(is_live);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestreams ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read livestreams (public data)
CREATE POLICY "Allow public read livestreams" ON livestreams
  FOR SELECT USING (true);

-- Create policy to allow authenticated users to read users
CREATE POLICY "Allow public read users" ON users
  FOR SELECT USING (true);

-- Allow inserts/updates to users table (prototype-friendly; tighten later)
CREATE POLICY "Allow insert users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update users" ON users
  FOR UPDATE USING (true) WITH CHECK (true);

-- Allow inserts/updates to livestreams table
CREATE POLICY "Allow insert livestreams" ON livestreams
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update livestreams" ON livestreams
  FOR UPDATE USING (true) WITH CHECK (true);
