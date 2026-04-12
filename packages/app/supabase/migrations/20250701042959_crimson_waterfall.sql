/*
  # Initial VendorSoluce Database Schema

  1. New Tables
    - `profiles` - User profile information
    - `vendors` - Vendor information and risk data
    - `sbom_analyses` - SBOM analysis results
    - `supply_chain_assessments` - Supply chain assessment data
    - `contact_submissions` - Contact form submissions

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for contact submissions
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  company text,
  role text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  industry text,
  website text,
  contact_email text,
  risk_score integer CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level text CHECK (risk_level IN ('Low', 'Medium', 'High', 'Critical')),
  compliance_status text CHECK (compliance_status IN ('Compliant', 'Partial', 'Non-Compliant')),
  last_assessment_date timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sbom_analyses table
CREATE TABLE IF NOT EXISTS sbom_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  filename text NOT NULL,
  file_type text NOT NULL,
  total_components integer DEFAULT 0,
  total_vulnerabilities integer DEFAULT 0,
  risk_score integer CHECK (risk_score >= 0 AND risk_score <= 100),
  analysis_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create supply_chain_assessments table
CREATE TABLE IF NOT EXISTS supply_chain_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_name text,
  overall_score integer CHECK (overall_score >= 0 AND overall_score <= 100),
  section_scores jsonb,
  answers jsonb,
  status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'archived')),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  topic text,
  message text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sbom_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE supply_chain_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = id::text);

-- Create policies for vendors
CREATE POLICY "Users can read own vendors"
  ON vendors
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own vendors"
  ON vendors
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own vendors"
  ON vendors
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own vendors"
  ON vendors
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Create policies for sbom_analyses
CREATE POLICY "Users can read own SBOM analyses"
  ON sbom_analyses
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own SBOM analyses"
  ON sbom_analyses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own SBOM analyses"
  ON sbom_analyses
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own SBOM analyses"
  ON sbom_analyses
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Create policies for supply_chain_assessments
CREATE POLICY "Users can read own assessments"
  ON supply_chain_assessments
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own assessments"
  ON supply_chain_assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own assessments"
  ON supply_chain_assessments
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own assessments"
  ON supply_chain_assessments
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Create policies for contact_submissions
CREATE POLICY "Anyone can insert contact submissions"
  ON contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_sbom_analyses_user_id ON sbom_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_supply_chain_assessments_user_id ON supply_chain_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sbom_analyses_updated_at
  BEFORE UPDATE ON sbom_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supply_chain_assessments_updated_at
  BEFORE UPDATE ON supply_chain_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();