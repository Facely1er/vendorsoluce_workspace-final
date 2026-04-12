-- Migration: Add Grace Period Tracking for Data Deletion
-- File: supabase/migrations/20250115_add_grace_period_tracking.sql
-- Description: Adds grace period tracking fields to vs_subscriptions table

-- Add grace period fields to vs_subscriptions (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vs_subscriptions') THEN
    ALTER TABLE vs_subscriptions
      ADD COLUMN IF NOT EXISTS grace_period_start TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS grace_period_end TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS data_deleted_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS is_read_only BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create indexes (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vs_subscriptions') THEN
    CREATE INDEX IF NOT EXISTS idx_vs_subscriptions_grace_period_end 
      ON vs_subscriptions(grace_period_end) 
      WHERE grace_period_end IS NOT NULL;

    CREATE INDEX IF NOT EXISTS idx_vs_subscriptions_read_only 
      ON vs_subscriptions(is_read_only) 
      WHERE is_read_only = true;
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN vs_subscriptions.grace_period_start IS 'Start of grace period for data export after cancellation';
COMMENT ON COLUMN vs_subscriptions.grace_period_end IS 'End of grace period - data will be deleted after this date';
COMMENT ON COLUMN vs_subscriptions.data_deleted_at IS 'Timestamp when user data was permanently deleted';
COMMENT ON COLUMN vs_subscriptions.is_read_only IS 'Whether account is in read-only mode during grace period';

