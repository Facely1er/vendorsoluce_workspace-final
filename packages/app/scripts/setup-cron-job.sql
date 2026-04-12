-- ============================================================================
-- Setup Trial Management Cron Job
-- File: scripts/setup-cron-job.sql
-- ============================================================================
-- 
-- This script sets up the daily cron job for trial management
-- Run this in: Supabase Dashboard → SQL Editor
--
-- IMPORTANT: Replace placeholders with your actual values:
--   [YOUR-PROJECT-REF] - Your Supabase project reference
--   [YOUR-SERVICE-ROLE-KEY] - Your service role key (from Project Settings → API)
-- ============================================================================

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Drop existing job if it exists (to avoid duplicates)
SELECT cron.unschedule('trial-management-daily') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'trial-management-daily'
);

-- Schedule the trial management cron job
-- Runs daily at 9 AM UTC (adjust schedule as needed)
SELECT cron.schedule(
  'trial-management-daily',                    -- Job name
  '0 9 * * *',                                 -- Schedule: Daily at 9 AM UTC
  $$                                            -- SQL to execute
  SELECT net.http_post(
    url := 'https://[YOUR-PROJECT-REF].supabase.co/functions/v1/trial-cron',
    headers := jsonb_build_object(
      'Authorization', 'Bearer [YOUR-SERVICE-ROLE-KEY]',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  ) AS response;
  $$
);

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
  RAISE NOTICE '🔧 To modify schedule, use: SELECT cron.unschedule(''trial-management-daily''); then re-run this script';
END $$;

-- ============================================================================
-- Alternative: Manual Cron Job Setup via Dashboard
-- ============================================================================
-- 
-- If you prefer using the Supabase Dashboard:
-- 
-- 1. Go to: Database → Cron Jobs
-- 2. Click "Create Cron Job"
-- 3. Configure:
--    - Name: trial-management-daily
--    - Schedule: 0 9 * * *
--    - Function: trial-cron
--    - Enabled: Yes
-- 4. Click "Create"
-- 
-- ============================================================================

-- ============================================================================
-- Useful Commands
-- ============================================================================

-- View all cron jobs
-- SELECT * FROM cron.job;

-- View cron job execution history
-- SELECT * FROM cron.job_run_details 
-- WHERE jobname = 'trial-management-daily' 
-- ORDER BY start_time DESC 
-- LIMIT 10;

-- Disable cron job (if needed)
-- SELECT cron.unschedule('trial-management-daily');

-- Enable cron job (if disabled)
-- UPDATE cron.job SET active = true WHERE jobname = 'trial-management-daily';

-- Delete cron job (if needed)
-- SELECT cron.unschedule('trial-management-daily');

