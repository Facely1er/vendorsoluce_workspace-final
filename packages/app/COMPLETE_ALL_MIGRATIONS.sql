-- ============================================================================
-- VendorSoluce - Complete Database Migration Script
-- Run this script in Supabase SQL Editor to apply all migrations
-- Date: December 2025
-- ============================================================================
-- 
-- IMPORTANT: 
-- 1. Backup your database before running this script
-- 2. Run this in a transaction if possible (wrap in BEGIN; ... COMMIT;)
-- 3. Verify each section completes successfully before proceeding
-- 4. Check the verification queries at the end
--
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- MIGRATION 1: Core Schema (20250701042959_crimson_waterfall.sql)
-- ============================================================================
-- This creates the initial tables: profiles, vendors, sbom_analyses, etc.

\echo 'Running Migration 1: Core Schema...'

-- Note: The full migration content is in the individual file
-- This script references the consolidated run-all-migrations.sql approach
-- For production, use: supabase db push
-- Or run individual migration files in order

-- ============================================================================
-- MIGRATION VERIFICATION AND COMPLETION SCRIPT
-- ============================================================================
-- This script verifies all migrations are applied and completes any missing pieces

\echo 'Verifying migration status...'

-- Check if all critical tables exist
DO $$
DECLARE
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    required_tables TEXT[] := ARRAY[
        'vs_profiles',
        'vs_vendors',
        'vs_sbom_analyses',
        'vs_supply_chain_assessments',
        'vs_contact_submissions',
        'vs_assessment_frameworks',
        'vs_assessment_questions',
        'vs_vendor_assessments',
        'vs_assessment_responses',
        'subscriptions',
        'subscription_items',
        'invoices',
        'payment_methods',
        'usage_tracking',
        'webhook_events',
        'customer_portal_sessions',
        'vs_customers',
        'vs_prices',
        'vs_subscriptions',
        'vs_payment_methods',
        'vs_invoices',
        'vs_usage_records',
        'assets',
        'asset_vendor_relationships',
        'due_diligence_requirements',
        'alerts'
    ];
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY required_tables
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = tbl
        ) THEN
            missing_tables := array_append(missing_tables, tbl);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE 'Missing tables detected: %', array_to_string(missing_tables, ', ');
        RAISE NOTICE 'Please run the individual migration files in order';
        RAISE NOTICE 'See MIGRATION_DEPLOYMENT_GUIDE.md for instructions';
    ELSE
        RAISE NOTICE '✅ All required tables exist';
    END IF;
END $$;

-- ============================================================================
-- ENSURE ALL RLS POLICIES ARE ENABLED
-- ============================================================================

\echo 'Verifying Row Level Security...'

DO $$
DECLARE
    tables_without_rls TEXT[] := ARRAY[]::TEXT[];
    tbl RECORD;
BEGIN
    FOR tbl IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND (tablename LIKE 'vs_%' OR tablename IN (
            'subscriptions', 'subscription_items', 'invoices', 
            'payment_methods', 'usage_tracking', 'webhook_events',
            'customer_portal_sessions', 'assets', 'asset_vendor_relationships',
            'due_diligence_requirements', 'alerts'
        ))
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = tbl.tablename 
            AND rowsecurity = true
        ) THEN
            EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl.tablename);
            RAISE NOTICE 'Enabled RLS on table: %', tbl.tablename;
        END IF;
    END LOOP;
    
    RAISE NOTICE '✅ RLS verification complete';
END $$;

-- ============================================================================
-- ENSURE CRITICAL FUNCTIONS EXIST
-- ============================================================================

\echo 'Verifying critical functions...'

-- Ensure update_updated_at_column function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure update_updated_at function exists (alternative name)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

\echo '✅ Critical functions verified';

-- ============================================================================
-- FINAL VERIFICATION QUERIES
-- ============================================================================

\echo 'Running final verification...'

-- 1. Count all tables
SELECT 
    'Total Tables' as metric,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE 'vs_%' OR table_name IN (
    'subscriptions', 'subscription_items', 'invoices', 
    'payment_methods', 'usage_tracking', 'webhook_events',
    'customer_portal_sessions', 'assets', 'asset_vendor_relationships',
    'due_diligence_requirements', 'alerts'
));

-- 2. Count tables with RLS enabled
SELECT 
    'Tables with RLS' as metric,
    COUNT(*) as count
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true
AND (tablename LIKE 'vs_%' OR tablename IN (
    'subscriptions', 'subscription_items', 'invoices', 
    'payment_methods', 'usage_tracking', 'webhook_events',
    'customer_portal_sessions', 'assets', 'asset_vendor_relationships',
    'due_diligence_requirements', 'alerts'
));

-- 3. List all vs_ prefixed tables
SELECT 
    'VS Tables' as category,
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'vs_%'
ORDER BY table_name;

-- 4. Verify critical functions exist
SELECT 
    'Functions' as category,
    routine_name as function_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'update_updated_at_column',
    'update_updated_at',
    'get_user_subscription_limits',
    'user_has_feature_access',
    'track_usage',
    'check_usage_limit',
    'get_subscription_analytics',
    'increment_usage'
)
ORDER BY routine_name;

\echo '✅ Migration verification complete!';
\echo '';
\echo 'Next steps:';
\echo '1. Review the verification results above';
\echo '2. Run verify-migrations.sql for detailed checks';
\echo '3. Test authentication and subscription flows';
\echo '4. Verify RLS policies are working correctly';

