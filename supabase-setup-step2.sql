-- Step 2: Create events table
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

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can read events" ON events;
DROP POLICY IF EXISTS "Authenticated users can insert events" ON events;
DROP POLICY IF EXISTS "Users can update their own events, admin can update all" ON events;
DROP POLICY IF EXISTS "Users can delete their own events, admin can delete all" ON events;

-- Create new policies
CREATE POLICY "Authenticated users can read events"
  ON events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (auth.email() IS NOT NULL);

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

CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
