-- ============================================================================
-- Verify Trial & Onboarding Setup
-- File: scripts/verify-setup.sql
-- ============================================================================
-- 
-- Run this script to verify all components are set up correctly
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================================

-- 1. Check onboarding columns exist in vs_profiles
SELECT 
  '✅ Onboarding columns check' AS check_name,
  CASE 
    WHEN COUNT(*) = 4 THEN 'PASS'
    ELSE 'FAIL - Missing columns'
  END AS status,
  COUNT(*) AS columns_found,
  ARRAY_AGG(column_name) AS found_columns
FROM information_schema.columns 
WHERE table_name = 'vs_profiles' 
AND column_name IN (
  'onboarding_started', 
  'onboarding_started_at', 
  'onboarding_completed', 
  'onboarding_completed_at'
);

-- 2. Check trial columns exist in vs_subscriptions
SELECT 
  '✅ Trial columns check' AS check_name,
  CASE 
    WHEN COUNT(*) >= 2 THEN 'PASS'
    ELSE 'FAIL - Missing columns'
  END AS status,
  COUNT(*) AS columns_found,
  ARRAY_AGG(column_name) AS found_columns
FROM information_schema.columns 
WHERE table_name = 'vs_subscriptions' 
AND column_name IN ('trial_start', 'trial_end', 'status');

-- 3. Check index exists
SELECT 
  '✅ Index check' AS check_name,
  CASE 
    WHEN COUNT(*) > 0 THEN 'PASS'
    ELSE 'FAIL - Index missing'
  END AS status,
  COUNT(*) AS indexes_found
FROM pg_indexes 
WHERE tablename = 'vs_profiles' 
AND indexname = 'idx_vs_profiles_onboarding_status';

-- 4. Check for active trials
SELECT 
  '📊 Active trials' AS check_name,
  COUNT(*) AS count,
  'INFO' AS status
FROM vs_subscriptions 
WHERE status = 'trialing';

-- 5. Check for expired trials (last 7 days)
SELECT 
  '📊 Expired trials (last 7 days)' AS check_name,
  COUNT(*) AS count,
  'INFO' AS status
FROM vs_subscriptions 
WHERE status = 'expired' 
AND updated_at > NOW() - INTERVAL '7 days';

-- 6. Check onboarding status summary
SELECT 
  '📊 Onboarding status' AS check_name,
  COUNT(*) FILTER (WHERE onboarding_started = true) AS started,
  COUNT(*) FILTER (WHERE onboarding_completed = true) AS completed,
  COUNT(*) AS total_users,
  'INFO' AS status
FROM vs_profiles;

-- 7. Check cron job (if pg_cron is enabled)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    RAISE NOTICE '✅ pg_cron extension is enabled';
    
    -- Check if cron job exists
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'trial-management-daily') THEN
      RAISE NOTICE '✅ Cron job "trial-management-daily" exists';
    ELSE
      RAISE WARNING '⚠️  Cron job "trial-management-daily" not found. Run setup-cron-job.sql';
    END IF;
  ELSE
    RAISE WARNING '⚠️  pg_cron extension not enabled. Cron jobs may not work.';
  END IF;
END $$;

-- 8. Summary
SELECT 
  '📋 Setup Verification Complete' AS summary,
  'Review the results above to verify all components are configured' AS next_steps;

