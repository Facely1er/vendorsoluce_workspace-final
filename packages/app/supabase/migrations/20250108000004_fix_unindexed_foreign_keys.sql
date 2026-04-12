-- ============================================================================
-- Migration: Fix Unindexed Foreign Keys
-- Date: 2025-01-08
-- Description: Adds indexes to foreign key columns to improve query performance
--              when doing joins or foreign key constraint checks.
-- ============================================================================

-- Fix vs_invoices table - add index on subscription_id foreign key
-- This foreign key references vs_subscriptions(id)
-- Note: Using full index (not partial) so linter recognizes it
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vs_invoices') THEN
    DROP INDEX IF EXISTS idx_vs_invoices_subscription_id;
    CREATE INDEX IF NOT EXISTS idx_vs_invoices_subscription_id ON vs_invoices(subscription_id);
  END IF;
END $$;

-- Fix vs_vendor_assessments table - add index on framework_id foreign key
-- This foreign key references vs_assessment_frameworks(id)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vs_vendor_assessments') THEN
    DROP INDEX IF EXISTS idx_vs_vendor_assessments_framework_id;
    CREATE INDEX IF NOT EXISTS idx_vs_vendor_assessments_framework_id ON vs_vendor_assessments(framework_id);
  END IF;
END $$;

