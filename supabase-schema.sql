-- Verbaly Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Writing samples table
CREATE TABLE IF NOT EXISTS writing_samples (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  word_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Rewrites table
CREATE TABLE IF NOT EXISTS rewrites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  original_text TEXT NOT NULL,
  rewritten_text TEXT NOT NULL,
  intensity INTEGER NOT NULL DEFAULT 5 CHECK (intensity >= 1 AND intensity <= 10),
  match_score INTEGER NOT NULL DEFAULT 0 CHECK (match_score >= 0 AND match_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Style traits table
CREATE TABLE IF NOT EXISTS style_traits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trait_name VARCHAR(100) NOT NULL,
  trait_value TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, trait_name)
);

-- Row Level Security (RLS) policies

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewrites ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_traits ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Writing samples policies
CREATE POLICY "Users can view own writing samples" ON writing_samples
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own writing samples" ON writing_samples
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own writing samples" ON writing_samples
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own writing samples" ON writing_samples
  FOR DELETE USING (auth.uid() = user_id);

-- Rewrites policies
CREATE POLICY "Users can view own rewrites" ON rewrites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rewrites" ON rewrites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own rewrites" ON rewrites
  FOR DELETE USING (auth.uid() = user_id);

-- Style traits policies
CREATE POLICY "Users can view own style traits" ON style_traits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own style traits" ON style_traits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own style traits" ON style_traits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own style traits" ON style_traits
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS writing_samples_user_id_idx ON writing_samples(user_id);
CREATE INDEX IF NOT EXISTS rewrites_user_id_idx ON rewrites(user_id);
CREATE INDEX IF NOT EXISTS rewrites_created_at_idx ON rewrites(created_at DESC);
CREATE INDEX IF NOT EXISTS style_traits_user_id_idx ON style_traits(user_id);

-- Add preset_type to profiles (run if profiles table already exists)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preset_type VARCHAR(50);
