-- Supabase Schema for Lab Site
-- Run this SQL in Supabase SQL Editor (https://supabase.com/dashboard/project/tgitprtaxkfrlzpedhsr/sql/new)

-- 1. Create approved_emails table
CREATE TABLE IF NOT EXISTS approved_emails (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE approved_emails ENABLE ROW LEVEL SECURITY;

-- RLS Policies for approved_emails
-- Anyone authenticated can read (needed to check if their own email is approved)
CREATE POLICY "Anyone can read approved emails"
  ON approved_emails FOR SELECT
  TO authenticated
  USING (true);

-- Only admin email can insert/update/delete
CREATE POLICY "Only admin can manage approved emails"
  ON approved_emails FOR ALL
  TO authenticated
  USING (auth.email() = 'knk6103@gmail.com')
  WITH CHECK (auth.email() = 'knk6103@gmail.com');

-- Seed admin email
INSERT INTO approved_emails (email)
VALUES ('knk6103@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- 2. Create events table (for calendar)
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  description TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events
-- All authenticated users can read events
CREATE POLICY "Authenticated users can read events"
  ON events FOR SELECT
  TO authenticated
  USING (true);

-- All authenticated users can insert events
CREATE POLICY "Authenticated users can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (auth.email() IS NOT NULL);

-- Users can update/delete their own events, admin can update/delete all
CREATE POLICY "Users can update their own events, admin can update all"
  ON events FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.email() OR
    auth.email() = 'knk6103@gmail.com'
  );

CREATE POLICY "Users can delete their own events, admin can delete all"
  ON events FOR DELETE
  TO authenticated
  USING (
    created_by = auth.email() OR
    auth.email() = 'knk6103@gmail.com'
  );

-- 3. Create equipment table
CREATE TABLE IF NOT EXISTS equipment (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('available', 'in-use', 'maintenance')),
  location TEXT,
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

-- RLS Policies for equipment
-- All authenticated users can read equipment
CREATE POLICY "Authenticated users can read equipment"
  ON equipment FOR SELECT
  TO authenticated
  USING (true);

-- All authenticated users can insert equipment
CREATE POLICY "Authenticated users can insert equipment"
  ON equipment FOR INSERT
  TO authenticated
  WITH CHECK (auth.email() IS NOT NULL);

-- Users can update/delete their own equipment, admin can update/delete all
CREATE POLICY "Users can update their own equipment, admin can update all"
  ON equipment FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.email() OR
    auth.email() = 'knk6103@gmail.com'
  );

CREATE POLICY "Users can delete their own equipment, admin can delete all"
  ON equipment FOR DELETE
  TO authenticated
  USING (
    created_by = auth.email() OR
    auth.email() = 'knk6103@gmail.com'
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(category);
CREATE INDEX IF NOT EXISTS idx_equipment_created_by ON equipment(created_by);
