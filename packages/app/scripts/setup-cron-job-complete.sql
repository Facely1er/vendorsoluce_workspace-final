-- ============================================================================
-- Setup Trial Management Cron Job - Complete Version
-- File: scripts/setup-cron-job-complete.sql
-- Project: dfklqsdfycwjlcasfciu
-- ============================================================================
-- 
-- This script sets up the daily cron job for trial management
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================================

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Drop existing job if it exists (to avoid duplicates)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'trial-management-daily'
  ) THEN
    PERFORM cron.unschedule('trial-management-daily');
    RAISE NOTICE 'Removed existing cron job';
  END IF;
END $$;

-- Schedule the trial management cron job
-- Runs daily at 9 AM UTC
SELECT cron.schedule(
  'trial-management-daily',                    -- Job name
  '0 9 * * *',                                 -- Schedule: Daily at 9 AM UTC
  $$                                            -- SQL to execute
  SELECT net.http_post(
    url := 'https://dfklqsdfycwjlcasfciu.supabase.co/functions/v1/trial-cron',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  ) AS response;
  $$
);

-- Alternative: Direct function call (if service role key is available)
-- Uncomment and replace YOUR_SERVICE_ROLE_KEY with actual key:
/*
SELECT cron.schedule(
  'trial-management-daily',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://dfklqsdfycwjlcasfciu.supabase.co/functions/v1/trial-cron',
    headers := jsonb_build_object(
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  ) AS response;
  $$
);
*/

-- Verify the cron job was created
SELECT 
  jobid,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active
FROM cron.job 
WHERE jobname = 'trial-management-daily';

-- Show success message
DO $$
BEGIN
  RAISE NOTICE '✅ Cron job "trial-management-daily" scheduled successfully!';
  RAISE NOTICE '📅 Schedule: Daily at 9 AM UTC (0 9 * * *)';
  RAISE NOTICE '🔧 Function: trial-cron';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  Note: If the cron job fails, you may need to:';
  RAISE NOTICE '   1. Ensure the service role key is set correctly';
  RAISE NOTICE '   2. Verify the trial-cron function is deployed';
  RAISE NOTICE '   3. Check cron job logs: SELECT * FROM cron.job_run_details WHERE jobname = ''trial-management-daily'';';
END $$;

