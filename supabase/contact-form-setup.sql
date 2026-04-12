-- Run in Supabase Dashboard → SQL Editor → New query
-- Project: dfklqsdfycwjlcasfciu
-- Creates vs_contact_submissions for ERMITS contact form (idempotent)

-- Create table if missing
CREATE TABLE IF NOT EXISTS vs_contact_submissions (
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

-- Enable RLS
ALTER TABLE vs_contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policy for anon/authenticated inserts (edge function uses service_role, bypasses RLS)
DROP POLICY IF EXISTS "Anyone can insert contact submissions" ON vs_contact_submissions;
CREATE POLICY "Anyone can insert contact submissions"
  ON vs_contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_vs_contact_submissions_created_at ON vs_contact_submissions(created_at);
