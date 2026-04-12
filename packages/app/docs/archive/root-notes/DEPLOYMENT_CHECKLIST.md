# Trial & Onboarding Deployment Checklist

Quick reference checklist for deploying the 14-day trial and onboarding system.

## Pre-Deployment

- [ ] Review `TRIAL_ONBOARDING_SETUP_COMPLETE.md` for full details
- [ ] Ensure Resend account is set up and API key is available
- [ ] Verify email domain is verified in Resend
- [ ] Have Supabase project credentials ready

## Database Setup

- [ ] Run migration: `supabase/migrations/20250117_add_onboarding_tracking.sql`
  ```bash
  # Option 1: Via Supabase CLI
  supabase db push
  
  # Option 2: Via Supabase Dashboard SQL Editor
  # Copy and paste migration SQL
  ```
- [ ] Verify columns exist:
  ```sql
  SELECT column_name 
  FROM information_schema.columns 
  WHERE table_name = 'vs_profiles' 
  AND column_name IN ('onboarding_started', 'onboarding_started_at', 'onboarding_completed', 'onboarding_completed_at');
  ```

## Edge Functions Deployment

- [ ] Deploy all functions:
  ```bash
  supabase functions deploy
  ```
- [ ] Or deploy individually:
  - [ ] `trial-cron`
  - [ ] `manage-trial-expiration`
  - [ ] `send-trial-notification`
  - [ ] `send-onboarding-complete-email`

## Environment Variables

Set in Supabase Dashboard → Project Settings → Edge Functions → Secrets:

- [ ] `RESEND_API_KEY` = `re_xxxxxxxxxxxxx`
- [ ] `EMAIL_FROM` = `VendorSoluce <noreply@vendorsoluce.com>`
- [ ] `SITE_URL` = `https://vendorsoluce.com`

## Cron Job Setup

- [ ] Go to Supabase Dashboard → Database → Cron Jobs
- [ ] Create new cron job:
  - Name: `trial-management-daily`
  - Schedule: `0 9 * * *` (9 AM UTC daily)
  - Function: `trial-cron`
  - Enabled: Yes
- [ ] Or use SQL (see `TRIAL_ONBOARDING_SETUP_COMPLETE.md`)

## Testing

### Trial Auto-Start
- [ ] Create test user account
- [ ] Navigate to `/onboarding`
- [ ] Check browser console (should see "Trial auto-started")
- [ ] Verify in database:
  ```sql
  SELECT * FROM vs_subscriptions 
  WHERE user_id = '[test-user-id]' 
  AND status = 'trialing';
  ```
- [ ] Check email for trial started notification

### Trial Expiration
- [ ] Set test trial to expire:
  ```sql
  UPDATE vs_subscriptions 
  SET trial_end = NOW() - INTERVAL '1 day'
  WHERE user_id = '[test-user-id]' 
  AND status = 'trialing';
  ```
- [ ] Manually trigger cron or wait for scheduled run
- [ ] Verify status = 'expired' and tier = 'free'
- [ ] Check for expiration email

### Trial Warnings
- [ ] Set trial_end to 3 days from now
- [ ] Run cron manually
- [ ] Verify 3-day warning email sent
- [ ] Repeat for 1-day warning

### Onboarding Completion
- [ ] Complete all checklist items
- [ ] Verify `onboarding_completed = true` in database
- [ ] Check for completion email

## Post-Deployment

- [ ] Monitor Edge Function logs for first 24 hours
- [ ] Check cron job execution logs
- [ ] Verify email delivery in Resend dashboard
- [ ] Set up alerts for critical failures (optional)
- [ ] Document any customizations made

## Rollback Plan

If issues occur:

1. **Disable cron job** in Supabase Dashboard
2. **Check Edge Function logs** for errors
3. **Verify environment variables** are correct
4. **Test functions manually** to isolate issues
5. **Review database** for data integrity

## Support Resources

- Full Setup Guide: `TRIAL_ONBOARDING_SETUP_COMPLETE.md`
- Implementation Details: `TRIAL_AND_ONBOARDING_IMPLEMENTATION.md`
- Automation Setup: `TRIAL_AND_ONBOARDING_AUTOMATION_SETUP.md`
