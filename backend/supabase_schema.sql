-- Create scans table in Supabase
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL,
  food_name TEXT NOT NULL,
  confidence INTEGER,
  image_path TEXT,
  nutrition_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_scans_user_created ON scans(user_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (you can restrict this later)
CREATE POLICY "Allow all operations" ON scans
  FOR ALL
  USING (true)
  WITH CHECK (true);
