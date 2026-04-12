-- Migration: Create vendor_requirements table for Stage 2
-- Purpose: Store vendor-specific control requirements based on risk tiers
-- Date: 2025-01-01

-- Create vendor_requirements table
CREATE TABLE IF NOT EXISTS vendor_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_tier TEXT NOT NULL CHECK (risk_tier IN ('Critical', 'High', 'Medium', 'Low')),
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  gaps JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendor_requirements_vendor_id ON vendor_requirements(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_requirements_user_id ON vendor_requirements(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_requirements_risk_tier ON vendor_requirements(risk_tier);
CREATE INDEX IF NOT EXISTS idx_vendor_requirements_status ON vendor_requirements(status);
CREATE INDEX IF NOT EXISTS idx_vendor_requirements_user_vendor ON vendor_requirements(user_id, vendor_id);

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_vendor_requirements_updated_at ON vendor_requirements;
CREATE TRIGGER update_vendor_requirements_updated_at
  BEFORE UPDATE ON vendor_requirements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE vendor_requirements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own vendor requirements" ON vendor_requirements;
DROP POLICY IF EXISTS "Users can create their own vendor requirements" ON vendor_requirements;
DROP POLICY IF EXISTS "Users can update their own vendor requirements" ON vendor_requirements;
DROP POLICY IF EXISTS "Users can delete their own vendor requirements" ON vendor_requirements;

-- RLS Policies
CREATE POLICY "Users can view their own vendor requirements"
  ON vendor_requirements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vendor requirements"
  ON vendor_requirements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vendor requirements"
  ON vendor_requirements FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vendor requirements"
  ON vendor_requirements FOR DELETE
  USING (auth.uid() = user_id);

-- Add comment to table
COMMENT ON TABLE vendor_requirements IS 'Stores vendor-specific control requirements generated in Stage 2 based on risk tiers from Stage 1';
COMMENT ON COLUMN vendor_requirements.requirements IS 'JSONB array of ControlRequirement objects';
COMMENT ON COLUMN vendor_requirements.gaps IS 'JSONB array of RequirementGap objects';
