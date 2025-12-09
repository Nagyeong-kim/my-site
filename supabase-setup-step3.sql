-- Step 3: Create equipment table
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

ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can read equipment" ON equipment;
DROP POLICY IF EXISTS "Authenticated users can insert equipment" ON equipment;
DROP POLICY IF EXISTS "Users can update their own equipment, admin can update all" ON equipment;
DROP POLICY IF EXISTS "Users can delete their own equipment, admin can delete all" ON equipment;

-- Create new policies
CREATE POLICY "Authenticated users can read equipment"
  ON equipment FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert equipment"
  ON equipment FOR INSERT
  TO authenticated
  WITH CHECK (auth.email() IS NOT NULL);

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

CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(category);
CREATE INDEX IF NOT EXISTS idx_equipment_created_by ON equipment(created_by);
