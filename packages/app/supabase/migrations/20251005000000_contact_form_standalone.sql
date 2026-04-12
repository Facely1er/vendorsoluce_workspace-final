-- ERMITS Contact Form: vs_contact_submissions (standalone fallback)
-- Runs after rename migrations. Idempotent: ensures vs_contact_submissions exists.
-- If contact_submissions exists but vs_ doesn't, renames. Else creates from scratch.

DO $$
BEGIN
  -- Case 1: contact_submissions exists, vs_contact_submissions does not → rename
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contact_submissions')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vs_contact_submissions') THEN
    ALTER TABLE contact_submissions RENAME TO vs_contact_submissions;
    DROP POLICY IF EXISTS "Anyone can insert contact submissions" ON vs_contact_submissions;
    CREATE POLICY "Anyone can insert contact submissions"
      ON vs_contact_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);

  -- Case 2: neither table exists → create vs_contact_submissions
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vs_contact_submissions') THEN
    CREATE TABLE vs_contact_submissions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      first_name text NOT NULL DEFAULT 'Contact',
      last_name text NOT NULL DEFAULT 'Form',
      email text NOT NULL,
      phone text,
      company text,
      topic text,
      message text NOT NULL,
      status text DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
      created_at timestamptz DEFAULT now()
    );
    ALTER TABLE vs_contact_submissions ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Anyone can insert contact submissions"
      ON vs_contact_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
    CREATE INDEX IF NOT EXISTS idx_vs_contact_submissions_created_at ON vs_contact_submissions(created_at);
  END IF;
END $$;
