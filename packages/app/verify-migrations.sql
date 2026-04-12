-- ============================================================================
-- Migration Verification Queries
-- Run these after running run-all-migrations.sql to verify everything worked
-- ============================================================================

-- 1. Check that all expected tables exist
SELECT 
    'Tables Check' as check_type,
    COUNT(*) as table_count,
    STRING_AGG(table_name, ', ' ORDER BY table_name) as tables_found
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (
    table_name LIKE 'vs_%' 
    OR table_name IN (
        'subscriptions', 
        'subscription_items', 
        'invoices', 
        'payment_methods', 
        'usage_tracking', 
        'webhook_events', 
        'customer_portal_sessions', 
        'assets', 
        'asset_vendor_relationships', 
        'due_diligence_requirements', 
        'alerts'
    )
);

-- 2. List all vs_ prefixed tables (should be many)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'vs_%'
ORDER BY table_name;

-- 3. Check RLS (Row Level Security) is enabled on all tables
SELECT 
    tablename, 
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ Enabled'
        ELSE '❌ Disabled'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND (
    tablename LIKE 'vs_%' 
    OR tablename IN (
        'subscriptions', 
        'subscription_items', 
        'invoices', 
        'payment_methods', 
        'usage_tracking', 
        'webhook_events', 
        'customer_portal_sessions', 
        'assets', 
        'asset_vendor_relationships', 
        'due_diligence_requirements', 
        'alerts'
    )
)
ORDER BY tablename;

-- 4. Check that key functions were created
SELECT 
    routine_name as function_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'update_updated_at_column',
    'get_user_subscription_limits',
    'user_has_feature_access',
    'track_usage',
    'check_usage_limit',
    'get_subscription_analytics',
    'increment_usage',
    'check_usage_limit'
)
ORDER BY routine_name;

-- 5. Check that assessment frameworks were inserted
SELECT 
    name,
    framework_type,
    question_count,
    is_active
FROM vs_assessment_frameworks
ORDER BY framework_type;

-- 6. Check that pricing tiers were inserted
SELECT 
    tier,
    product_name,
    price_amount,
    interval,
    is_active
FROM vs_prices
ORDER BY price_amount;

-- Expected Results Summary:
-- ✅ Should see ~20+ tables with vs_ prefix
-- ✅ All tables should have RLS enabled (rowsecurity = true)
-- ✅ Should see 8+ functions created
-- ✅ Should see 4 assessment frameworks
-- ✅ Should see 4 pricing tiers

