-- Supabase Schema for "오늘의 색" (Today's Color)
-- Run this in Supabase SQL Editor after creating a project

-- Profiles table
CREATE TABLE profiles (
  kakao_user_id TEXT NOT NULL,
  profile_id TEXT NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🙂',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (kakao_user_id, profile_id)
);

-- Color records table
CREATE TABLE color_records (
  kakao_user_id TEXT NOT NULL,
  profile_id TEXT NOT NULL,
  date TEXT NOT NULL,
  color JSONB NOT NULL,
  memo TEXT DEFAULT '',
  emotion JSONB NOT NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (kakao_user_id, profile_id, date)
);

-- Migration guide for existing projects:
-- 1) Add the optional tags array column.
-- 2) Existing rows can remain NULL; the app treats missing tags as optional.
ALTER TABLE color_records
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Indexes for fast queries
CREATE INDEX idx_records_user_profile ON color_records (kakao_user_id, profile_id);
CREATE INDEX idx_records_date ON color_records (date);
CREATE INDEX idx_profiles_user ON profiles (kakao_user_id);

-- Row Level Security
-- ⚠️  SECURITY NOTE: Current policies use USING(true) which exposes ALL user data
-- via the anon key. This is acceptable ONLY for personal/prototype use.
--
-- For production, either:
--   A) Move all Supabase calls to a Vercel API route that validates Kakao tokens
--   B) Use Supabase custom JWT with kakao_user_id as sub claim, then:
--      USING (auth.uid()::text = kakao_user_id)
--
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE color_records ENABLE ROW LEVEL SECURITY;

-- Allow all operations via anon key (data is scoped by kakao_user_id in app logic)
CREATE POLICY "Allow all for profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for color_records" ON color_records FOR ALL USING (true) WITH CHECK (true);
