-- Migration: Add Onboarding Tracking Columns to vs_profiles
-- Description: Adds columns to track onboarding progress for trial and onboarding automation
-- Date: 2025-01-17

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

