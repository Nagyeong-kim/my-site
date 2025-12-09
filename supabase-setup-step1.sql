-- Step 1: Create approved_emails table
CREATE TABLE IF NOT EXISTS approved_emails (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE approved_emails ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read approved emails" ON approved_emails;
DROP POLICY IF EXISTS "Only admin can manage approved emails" ON approved_emails;

-- Create new policies
CREATE POLICY "Anyone can read approved emails"
  ON approved_emails FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admin can manage approved emails"
  ON approved_emails FOR ALL
  TO authenticated
  USING (auth.email() = 'knk6103@gmail.com')
  WITH CHECK (auth.email() = 'knk6103@gmail.com');

INSERT INTO approved_emails (email)
VALUES ('knk6103@gmail.com')
ON CONFLICT (email) DO NOTHING;
