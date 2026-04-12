/*
  # VendorSoluce Schema Migration - Add vs_ Prefix and Missing Columns

  ## Overview
  This migration adds the "vs_" prefix to all VendorSoluce tables to differentiate them
  from other projects in the shared Supabase instance. It also adds missing columns that
  the application code references but don't exist in the current schema.

  ## Table Changes
  - `profiles` → `vs_profiles` (with added columns: company_size, industry, tour_completed)
  - `vendors` → `vs_vendors`
  - `sbom_analyses` → `vs_sbom_analyses`
  - `supply_chain_assessments` → `vs_supply_chain_assessments` (with added column: vendor_id)
  - `contact_submissions` → `vs_contact_submissions`

  ## New Columns Added
  ### vs_profiles:
    - `company_size` (text, nullable) - Company size classification
    - `industry` (text, nullable) - User's industry sector
    - `tour_completed` (boolean, default false) - Whether user completed app tour

  ### vs_supply_chain_assessments:
    - `vendor_id` (uuid, nullable) - Foreign key reference to vs_vendors table

  ## Security
  - All RLS policies are recreated on new table names
  - Foreign key constraints updated to reference new prefixed tables
  - Indexes recreated with vs_ prefix
  - Triggers updated to reference new table names

  ## Important Notes
  - Uses ALTER TABLE RENAME TO preserve all existing data
  - All policies dropped from old tables and recreated on new tables
  - Foreign key constraints automatically updated by PostgreSQL
  - Maintains full data integrity and security model
*/

-- ============================================================================
-- STEP 1: Add Missing Columns to Existing Tables (Before Rename)
-- ============================================================================

-- Add missing columns to profiles table
DO $$
BEGIN
  -- Add company_size column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'company_size'
  ) THEN
    ALTER TABLE profiles ADD COLUMN company_size text;
  END IF;

  -- Add industry column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'industry'
  ) THEN
    ALTER TABLE profiles ADD COLUMN industry text;
  END IF;

  -- Add tour_completed column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'tour_completed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN tour_completed boolean DEFAULT false;
  END IF;
END $$;

-- Add vendor_id column to supply_chain_assessments table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'supply_chain_assessments' AND column_name = 'vendor_id'
  ) THEN
    ALTER TABLE supply_chain_assessments ADD COLUMN vendor_id uuid;
  END IF;
END $$;

-- ============================================================================
-- STEP 2: Drop All Existing RLS Policies
-- ============================================================================

-- Drop policies on profiles
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Drop policies on vendors
DROP POLICY IF EXISTS "Users can read own vendors" ON vendors;
DROP POLICY IF EXISTS "Users can insert own vendors" ON vendors;
DROP POLICY IF EXISTS "Users can update own vendors" ON vendors;
DROP POLICY IF EXISTS "Users can delete own vendors" ON vendors;

-- Drop policies on sbom_analyses
DROP POLICY IF EXISTS "Users can read own SBOM analyses" ON sbom_analyses;
DROP POLICY IF EXISTS "Users can insert own SBOM analyses" ON sbom_analyses;
DROP POLICY IF EXISTS "Users can update own SBOM analyses" ON sbom_analyses;
DROP POLICY IF EXISTS "Users can delete own SBOM analyses" ON sbom_analyses;

-- Drop policies on supply_chain_assessments
DROP POLICY IF EXISTS "Users can read own assessments" ON supply_chain_assessments;
DROP POLICY IF EXISTS "Users can insert own assessments" ON supply_chain_assessments;
DROP POLICY IF EXISTS "Users can update own assessments" ON supply_chain_assessments;
DROP POLICY IF EXISTS "Users can delete own assessments" ON supply_chain_assessments;

-- Drop policies on contact_submissions
DROP POLICY IF EXISTS "Anyone can insert contact submissions" ON contact_submissions;

-- ============================================================================
-- STEP 3: Rename Tables with vs_ Prefix
-- ============================================================================

-- Rename profiles to vs_profiles
ALTER TABLE IF EXISTS profiles RENAME TO vs_profiles;

-- Rename vendors to vs_vendors
ALTER TABLE IF EXISTS vendors RENAME TO vs_vendors;

-- Rename sbom_analyses to vs_sbom_analyses
ALTER TABLE IF EXISTS sbom_analyses RENAME TO vs_sbom_analyses;

-- Rename supply_chain_assessments to vs_supply_chain_assessments
ALTER TABLE IF EXISTS supply_chain_assessments RENAME TO vs_supply_chain_assessments;

-- Rename contact_submissions to vs_contact_submissions
ALTER TABLE IF EXISTS contact_submissions RENAME TO vs_contact_submissions;

-- ============================================================================
-- STEP 4: Add Foreign Key Constraint for vendor_id
-- ============================================================================

-- Add foreign key constraint for vendor_id in vs_supply_chain_assessments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'vs_supply_chain_assessments_vendor_id_fkey'
    AND table_name = 'vs_supply_chain_assessments'
  ) THEN
    ALTER TABLE vs_supply_chain_assessments
    ADD CONSTRAINT vs_supply_chain_assessments_vendor_id_fkey
    FOREIGN KEY (vendor_id) REFERENCES vs_vendors(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================================
-- STEP 5: Recreate RLS Policies on New Tables
-- ============================================================================

-- RLS policies for vs_profiles
CREATE POLICY "Users can read own profile"
  ON vs_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON vs_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON vs_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS policies for vs_vendors
CREATE POLICY "Users can read own vendors"
  ON vs_vendors
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vendors"
  ON vs_vendors
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vendors"
  ON vs_vendors
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own vendors"
  ON vs_vendors
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS policies for vs_sbom_analyses
CREATE POLICY "Users can read own SBOM analyses"
  ON vs_sbom_analyses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own SBOM analyses"
  ON vs_sbom_analyses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own SBOM analyses"
  ON vs_sbom_analyses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own SBOM analyses"
  ON vs_sbom_analyses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS policies for vs_supply_chain_assessments
CREATE POLICY "Users can read own assessments"
  ON vs_supply_chain_assessments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments"
  ON vs_supply_chain_assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments"
  ON vs_supply_chain_assessments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assessments"
  ON vs_supply_chain_assessments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS policies for vs_contact_submissions
CREATE POLICY "Anyone can insert contact submissions"
  ON vs_contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ============================================================================
-- STEP 6: Recreate Indexes with vs_ Prefix
-- ============================================================================

-- Drop old indexes if they exist (they may have been renamed automatically)
DROP INDEX IF EXISTS idx_vendors_user_id;
DROP INDEX IF EXISTS idx_sbom_analyses_user_id;
DROP INDEX IF EXISTS idx_supply_chain_assessments_user_id;
DROP INDEX IF EXISTS idx_contact_submissions_created_at;

-- Create new indexes with vs_ prefix
CREATE INDEX IF NOT EXISTS idx_vs_vendors_user_id ON vs_vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_vs_sbom_analyses_user_id ON vs_sbom_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_vs_supply_chain_assessments_user_id ON vs_supply_chain_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_vs_supply_chain_assessments_vendor_id ON vs_supply_chain_assessments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vs_contact_submissions_created_at ON vs_contact_submissions(created_at);

-- ============================================================================
-- STEP 7: Recreate Triggers with New Table Names
-- ============================================================================

-- Drop old triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON vs_profiles;
DROP TRIGGER IF EXISTS update_vendors_updated_at ON vs_vendors;
DROP TRIGGER IF EXISTS update_sbom_analyses_updated_at ON vs_sbom_analyses;
DROP TRIGGER IF EXISTS update_supply_chain_assessments_updated_at ON vs_supply_chain_assessments;

-- Create triggers for vs_ prefixed tables
CREATE TRIGGER update_vs_profiles_updated_at
  BEFORE UPDATE ON vs_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vs_vendors_updated_at
  BEFORE UPDATE ON vs_vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vs_sbom_analyses_updated_at
  BEFORE UPDATE ON vs_sbom_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vs_supply_chain_assessments_updated_at
  BEFORE UPDATE ON vs_supply_chain_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
