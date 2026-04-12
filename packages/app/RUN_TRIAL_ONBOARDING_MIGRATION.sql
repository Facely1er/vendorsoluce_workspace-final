-- ============================================================================
-- Trial & Onboarding Migration - Run This in Supabase SQL Editor
-- File: RUN_TRIAL_ONBOARDING_MIGRATION.sql
-- Date: 2025-01-17
-- ============================================================================
-- 
-- This migration adds onboarding tracking columns to vs_profiles table
-- Required for the 14-day trial and onboarding automation system
--
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================================

-- Add onboarding tracking columns to vs_profiles table
ALTER TABLE vs_profiles 
ADD COLUMN IF NOT EXISTS onboarding_started BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN vs_profiles.onboarding_started IS 'Whether the user has started the onboarding process';
COMMENT ON COLUMN vs_profiles.onboarding_started_at IS 'Timestamp when onboarding was first started';
COMMENT ON COLUMN vs_profiles.onboarding_completed IS 'Whether the user has completed all onboarding steps';
COMMENT ON COLUMN vs_profiles.onboarding_completed_at IS 'Timestamp when onboarding was completed';

-- Create index for faster queries on onboarding status
CREATE INDEX IF NOT EXISTS idx_vs_profiles_onboarding_status 
ON vs_profiles(onboarding_started, onboarding_completed);

-- Verify the migration
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Columns added: onboarding_started, onboarding_started_at, onboarding_completed, onboarding_completed_at';
  RAISE NOTICE 'Index created: idx_vs_profiles_onboarding_status';
END $$;

-- Verify columns exist (optional check)
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'vs_profiles' 
AND column_name IN (
  'onboarding_started', 
  'onboarding_started_at', 
  'onboarding_completed', 
  'onboarding_completed_at'
)
ORDER BY column_name;

