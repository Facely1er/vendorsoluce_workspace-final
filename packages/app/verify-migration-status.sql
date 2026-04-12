-- ============================================================================
-- VendorSoluce - Migration Status Verification Script
-- Run this in Supabase SQL Editor to verify all migrations are complete
-- Date: January 2025
-- ============================================================================

\echo '🔍 Starting Migration Status Verification...'
\echo ''

-- ============================================================================
-- SECTION 1: Check Supabase Migration Tracking
-- ============================================================================

\echo '📋 SECTION 1: Checking Supabase Migration Tracking...'
\echo ''

-- Check if schema_migrations table exists (Supabase tracks migrations here)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'supabase_migrations' 
        AND table_name = 'schema_migrations'
    ) THEN
        RAISE NOTICE '✅ Migration tracking table exists';
    ELSE
        RAISE NOTICE '⚠️  Migration tracking table not found (may be using manual migrations)';
    END IF;
END $$;

-- List all applied migrations (if tracking table exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'supabase_migrations' 
        AND table_name = 'schema_migrations'
    ) THEN
        RAISE NOTICE 'Listing applied migrations from tracking table...';
    ELSE
        RAISE NOTICE 'Migration tracking table not found - migrations may have been run manually';
    END IF;
END $$;

-- List applied migrations (only if table exists)
SELECT 
    'Applied Migrations' as category,
    version as migration_version,
    name as migration_name,
    inserted_at as applied_at
FROM supabase_migrations.schema_migrations
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'supabase_migrations' 
    AND table_name = 'schema_migrations'
)
ORDER BY inserted_at DESC;

-- Expected migrations list (only check if tracking table exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'supabase_migrations' 
        AND table_name = 'schema_migrations'
    ) THEN
        RAISE NOTICE 'Checking migration status against tracking table...';
    ELSE
        RAISE NOTICE 'Skipping migration tracking check - table does not exist';
        RAISE NOTICE 'This is normal if migrations were run manually via SQL Editor';
    END IF;
END $$;

\echo ''
\echo '✅ Migration tracking check complete'
\echo ''

-- ============================================================================
-- SECTION 2: Table Existence Verification
-- ============================================================================

\echo '📊 SECTION 2: Checking Table Existence...'
\echo ''

-- Core Tables (vs_ prefix)
SELECT 
    'Core Tables (vs_ prefix)' as category,
    COUNT(*) as table_count,
    CASE 
        WHEN COUNT(*) >= 15 THEN '✅ PASS'
        ELSE '❌ FAIL - Missing tables'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'vs_%';

-- List all vs_ tables
SELECT 
    'VS Tables' as category,
    table_name,
    '✅ EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'vs_%'
ORDER BY table_name;

-- Stripe Integration Tables
SELECT 
    'Stripe Tables' as category,
    COUNT(*) as table_count,
    CASE 
        WHEN COUNT(*) >= 7 THEN '✅ PASS'
        ELSE '❌ FAIL - Missing Stripe tables'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
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
    'vs_usage_records'
);

-- Asset Management Tables
SELECT 
    'Asset Management Tables' as category,
    COUNT(*) as table_count,
    CASE 
        WHEN COUNT(*) >= 4 THEN '✅ PASS'
        ELSE '❌ FAIL - Missing asset tables'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'assets',
    'asset_vendor_relationships',
    'due_diligence_requirements',
    'alerts'
);

-- Assessment Tables
SELECT 
    'Assessment Tables' as category,
    COUNT(*) as table_count,
    CASE 
        WHEN COUNT(*) >= 4 THEN '✅ PASS'
        ELSE '❌ FAIL - Missing assessment tables'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'vs_assessment_frameworks',
    'vs_assessment_questions',
    'vs_vendor_assessments',
    'vs_assessment_responses'
);

-- Marketing Tables
SELECT 
    'Marketing Tables' as category,
    COUNT(*) as table_count,
    CASE 
        WHEN COUNT(*) >= 3 THEN '✅ PASS'
        ELSE '⚠️  WARNING - Some marketing tables missing'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'vs_marketing%';

\echo ''
\echo '✅ Table existence check complete'
\echo ''

-- ============================================================================
-- SECTION 3: Row Level Security (RLS) Verification
-- ============================================================================

\echo '🔒 SECTION 3: Checking Row Level Security...'
\echo ''

-- Check RLS status on all tables
SELECT 
    'RLS Status' as category,
    tablename as table_name,
    CASE 
        WHEN rowsecurity THEN '✅ ENABLED'
        ELSE '❌ DISABLED'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND (tablename LIKE 'vs_%' OR tablename IN (
    'subscriptions', 'subscription_items', 'invoices', 
    'payment_methods', 'usage_tracking', 'webhook_events',
    'customer_portal_sessions', 'assets', 'asset_vendor_relationships',
    'due_diligence_requirements', 'alerts'
))
ORDER BY tablename;

-- Count tables with RLS enabled
SELECT 
    'RLS Summary' as category,
    COUNT(*) FILTER (WHERE rowsecurity = true) as enabled_count,
    COUNT(*) FILTER (WHERE rowsecurity = false) as disabled_count,
    COUNT(*) as total_count,
    CASE 
        WHEN COUNT(*) FILTER (WHERE rowsecurity = false) = 0 THEN '✅ ALL ENABLED'
        ELSE '❌ SOME DISABLED'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND (tablename LIKE 'vs_%' OR tablename IN (
    'subscriptions', 'subscription_items', 'invoices', 
    'payment_methods', 'usage_tracking', 'webhook_events',
    'customer_portal_sessions', 'assets', 'asset_vendor_relationships',
    'due_diligence_requirements', 'alerts'
));

\echo ''
\echo '✅ RLS verification complete'
\echo ''

-- ============================================================================
-- SECTION 4: RLS Policies Verification
-- ============================================================================

\echo '🛡️  SECTION 4: Checking RLS Policies...'
\echo ''

-- Count policies per table
SELECT 
    'Policy Count' as category,
    tablename as table_name,
    COUNT(*) as policy_count,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ HAS POLICIES'
        ELSE '❌ NO POLICIES'
    END as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND (tablename LIKE 'vs_%' OR tablename IN (
        'subscriptions', 'subscription_items', 'invoices', 
        'payment_methods', 'usage_tracking', 'assets',
        'asset_vendor_relationships', 'due_diligence_requirements', 'alerts'
    ))
)
GROUP BY tablename
ORDER BY tablename;

-- Check critical tables have policies
SELECT 
    'Critical Tables Policies' as category,
    tablename,
    policyname,
    cmd as operation,
    CASE 
        WHEN cmd IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE') THEN '✅ HAS POLICY'
        ELSE '⚠️  CHECK POLICY'
    END as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('vs_profiles', 'vs_vendors', 'vs_subscriptions', 'vs_sbom_analyses')
ORDER BY tablename, cmd;

\echo ''
\echo '✅ RLS policies check complete'
\echo ''

-- ============================================================================
-- SECTION 5: Database Functions Verification
-- ============================================================================

\echo '⚙️  SECTION 5: Checking Database Functions...'
\echo ''

-- Check critical functions exist
SELECT 
    'Functions' as category,
    routine_name as function_name,
    routine_type,
    CASE 
        WHEN routine_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
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

-- Count total functions
SELECT 
    'Function Summary' as category,
    COUNT(*) as total_functions,
    COUNT(*) FILTER (WHERE routine_name IN (
        'update_updated_at_column',
        'update_updated_at',
        'get_user_subscription_limits',
        'user_has_feature_access',
        'track_usage',
        'check_usage_limit',
        'get_subscription_analytics',
        'increment_usage'
    )) as critical_functions,
    CASE 
        WHEN COUNT(*) FILTER (WHERE routine_name IN (
            'update_updated_at_column',
            'update_updated_at',
            'get_user_subscription_limits',
            'user_has_feature_access',
            'track_usage',
            'check_usage_limit',
            'get_subscription_analytics',
            'increment_usage'
        )) >= 6 THEN '✅ CRITICAL FUNCTIONS EXIST'
        ELSE '❌ MISSING CRITICAL FUNCTIONS'
    END as status
FROM information_schema.routines
WHERE routine_schema = 'public';

\echo ''
\echo '✅ Functions check complete'
\echo ''

-- ============================================================================
-- SECTION 6: Indexes Verification
-- ============================================================================

\echo '📇 SECTION 6: Checking Indexes...'
\echo ''

-- Count indexes on critical tables
SELECT 
    'Index Count' as category,
    tablename,
    COUNT(*) as index_count,
    CASE 
        WHEN COUNT(*) >= 2 THEN '✅ GOOD'
        WHEN COUNT(*) = 1 THEN '⚠️  MINIMAL'
        ELSE '❌ NO INDEXES'
    END as status
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
    'vs_profiles', 'vs_vendors', 'vs_subscriptions', 
    'vs_sbom_analyses', 'vs_vendor_assessments', 'subscriptions'
)
GROUP BY tablename
ORDER BY tablename;

-- Check foreign key indexes
SELECT 
    'Foreign Key Indexes' as category,
    COUNT(*) as fk_index_count,
    CASE 
        WHEN COUNT(*) >= 10 THEN '✅ GOOD'
        ELSE '⚠️  CHECK INDEXES'
    END as status
FROM pg_indexes
WHERE schemaname = 'public'
AND (indexname LIKE '%_user_id%'
   OR indexname LIKE '%_vendor_id%'
   OR indexname LIKE '%_subscription_id%');

\echo ''
\echo '✅ Indexes check complete'
\echo ''

-- ============================================================================
-- SECTION 7: Foreign Key Constraints Verification
-- ============================================================================

\echo '🔗 SECTION 7: Checking Foreign Key Constraints...'
\echo ''

-- Check foreign keys on critical tables
SELECT 
    'Foreign Keys' as category,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    '✅ EXISTS' as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND tc.table_name IN (
    'vs_vendors', 'vs_vendor_assessments', 'vs_subscriptions',
    'vs_assessment_responses', 'asset_vendor_relationships'
)
ORDER BY tc.table_name, kcu.column_name;

\echo ''
\echo '✅ Foreign keys check complete'
\echo ''

-- ============================================================================
-- SECTION 8: Data Verification (Sample Data)
-- ============================================================================

\echo '📦 SECTION 8: Checking Sample Data...'
\echo ''

-- Check assessment frameworks were inserted
SELECT 
    'Assessment Frameworks' as category,
    COUNT(*) as framework_count,
    STRING_AGG(name, ', ' ORDER BY name) as frameworks,
    CASE 
        WHEN COUNT(*) >= 4 THEN '✅ DATA EXISTS'
        ELSE '⚠️  CHECK DATA'
    END as status
FROM vs_assessment_frameworks
WHERE is_active = true;

-- Check pricing tiers were inserted
SELECT 
    'Pricing Tiers' as category,
    COUNT(*) as price_count,
    STRING_AGG(tier, ', ' ORDER BY price_amount) as tiers,
    CASE 
        WHEN COUNT(*) >= 4 THEN '✅ DATA EXISTS'
        ELSE '⚠️  CHECK DATA'
    END as status
FROM vs_prices
WHERE is_active = true;

\echo ''
\echo '✅ Sample data check complete'
\echo ''

-- ============================================================================
-- SECTION 9: Overall Migration Status Summary
-- ============================================================================

\echo '📊 SECTION 9: Overall Migration Status Summary'
\echo ''

-- Comprehensive status check
WITH table_check AS (
    SELECT COUNT(*) as count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND (table_name LIKE 'vs_%' OR table_name IN (
        'subscriptions', 'subscription_items', 'invoices', 
        'payment_methods', 'usage_tracking', 'webhook_events',
        'customer_portal_sessions', 'assets', 'asset_vendor_relationships',
        'due_diligence_requirements', 'alerts'
    ))
),
rls_check AS (
    SELECT COUNT(*) FILTER (WHERE rowsecurity = false) as disabled_count
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND (tablename LIKE 'vs_%' OR tablename IN (
        'subscriptions', 'subscription_items', 'invoices', 
        'payment_methods', 'usage_tracking', 'webhook_events',
        'customer_portal_sessions', 'assets', 'asset_vendor_relationships',
        'due_diligence_requirements', 'alerts'
    ))
),
function_check AS (
    SELECT COUNT(*) as count
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name IN (
        'update_updated_at_column', 'update_updated_at',
        'get_user_subscription_limits', 'user_has_feature_access',
        'track_usage', 'check_usage_limit'
    )
),
migration_check AS (
    SELECT 
        COALESCE((
            SELECT COUNT(*) 
            FROM supabase_migrations.schema_migrations
            WHERE EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_schema = 'supabase_migrations' 
                AND table_name = 'schema_migrations'
            )
            AND version IN (
                '20250701042959_crimson_waterfall',
                '20250722160541_withered_glade',
                '20250724052026_broad_castle',
                '20251004090256_rename_tables_with_vs_prefix',
                '20251004090354_rename_tables_with_vs_prefix',
                '20250101000000_stripe_integration',
                '20251204_stripe_integration',
                '20250115_vendor_assessments_tables',
                '20250115_add_grace_period_tracking',
                '20250116_add_compliance_frameworks',
                '20250117_add_onboarding_tracking',
                '20250120_marketing_automation',
                '20251107_asset_management',
                '20250108000000_fix_function_search_path',
                '20250108000001_fix_rls_policy_performance',
                '20250108000002_fix_multiple_permissive_policies',
                '20250108000003_fix_rls_enabled_no_policy',
                '20250108000004_fix_unindexed_foreign_keys'
            )
        ), 0) as applied_count
)
SELECT 
    'OVERALL STATUS' as category,
    (SELECT count FROM table_check) as tables_created,
    (SELECT disabled_count FROM rls_check) as tables_without_rls,
    (SELECT count FROM function_check) as functions_created,
    COALESCE((SELECT applied_count FROM migration_check), 0) as migrations_applied,
    CASE 
        WHEN (SELECT count FROM table_check) >= 25 
         AND (SELECT disabled_count FROM rls_check) = 0
         AND (SELECT count FROM function_check) >= 6
        THEN '✅ ALL MIGRATIONS COMPLETE'
        WHEN (SELECT count FROM table_check) >= 20
        THEN '⚠️  MOSTLY COMPLETE - Review details above'
        ELSE '❌ INCOMPLETE - Run missing migrations'
    END as overall_status;

\echo ''
\echo '============================================================================'
\echo '✅ Migration Verification Complete!'
\echo '============================================================================'
\echo ''
\echo '📋 Next Steps:'
\echo '1. Review all sections above'
\echo '2. Address any ❌ FAIL or ⚠️  WARNING items'
\echo '3. Run missing migrations if needed'
\echo '4. Re-run this verification after fixes'
\echo ''

