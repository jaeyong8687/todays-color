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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (kakao_user_id, profile_id, date)
);

-- Indexes for fast queries
CREATE INDEX idx_records_user_profile ON color_records (kakao_user_id, profile_id);
CREATE INDEX idx_records_date ON color_records (date);
CREATE INDEX idx_profiles_user ON profiles (kakao_user_id);

-- Row Level Security (public access via anon key, scoped by kakao_user_id)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE color_records ENABLE ROW LEVEL SECURITY;

-- Allow all operations via anon key (data is scoped by kakao_user_id in app logic)
CREATE POLICY "Allow all for profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for color_records" ON color_records FOR ALL USING (true) WITH CHECK (true);
