# Trial and Onboarding Implementation - Setup Complete Guide

## ✅ Implementation Status

All components for 14-day trial management and onboarding automation have been implemented and are ready for deployment.

## 📋 What's Been Implemented

### 1. Core Services ✅
- **TrialService** (`src/services/trialService.ts`)
  - Trial creation (14 days, no credit card)
  - Eligibility checking
  - Trial conversion to paid
  - Trial cancellation
  - Email notifications
  - Warning checks

- **OnboardingService** (`src/services/onboardingService.ts`)
  - Automatic trial start during onboarding
  - Default workspace creation
  - Welcome email sending
  - Onboarding progress tracking
  - Completion marking

### 2. Edge Functions ✅
- **`trial-cron`** - Daily cron job for trial management
- **`manage-trial-expiration`** - Processes expired trials
- **`send-trial-notification`** - Sends trial emails
- **`send-onboarding-complete-email`** - Sends welcome emails

### 3. UI Components ✅
- **WelcomeScreen** - Auto-starts trial on mount
- **OnboardingChecklist** - Tracks and marks completion
- **TrialStartBanner** - Trial initiation UI
- **TrialCountdownBanner** - Shows days remaining
- **TrialConversionPrompt** - Upgrade prompts

### 4. Database Schema ✅
- **vs_subscriptions** - Has all trial columns (trial_start, trial_end, status)
- **vs_profiles** - Has onboarding tracking columns (migration created)

## 🚀 Deployment Steps

### Step 1: Run Database Migration

Run the new migration to add onboarding columns:

```sql
-- File: supabase/migrations/20250117_add_onboarding_tracking.sql
-- Run this in Supabase SQL Editor
```

Or use Supabase CLI:
```bash
supabase db push
```

### Step 2: Deploy Edge Functions

Deploy all edge functions to Supabase:

```bash
# Deploy all functions
supabase functions deploy

# Or deploy individually
supabase functions deploy trial-cron
supabase functions deploy manage-trial-expiration
supabase functions deploy send-trial-notification
supabase functions deploy send-onboarding-complete-email
```

### Step 3: Configure Environment Variables

Set these secrets in Supabase Dashboard → Project Settings → Edge Functions:

1. **Email Service:**
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   EMAIL_FROM=VendorSoluce <noreply@vendorsoluce.com>
   SITE_URL=https://vendorsoluce.com
   ```

2. **Auto-configured (no action needed):**
   - `SUPABASE_URL` - Automatically set
   - `SUPABASE_SERVICE_ROLE_KEY` - Automatically set

### Step 4: Set Up Cron Job

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to Supabase Dashboard → Database → Cron Jobs
2. Click "Create Cron Job"
3. Configure:
   - **Name:** `trial-management-daily`
   - **Schedule:** `0 9 * * *` (runs daily at 9 AM UTC)
   - **Function:** `trial-cron`
   - **Enabled:** Yes

**Option B: Using SQL**

Run this SQL in Supabase SQL Editor:

```sql
-- Create pg_cron extension if not exists
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule trial management cron job
SELECT cron.schedule(
  'trial-management-daily',
  '0 9 * * *', -- Daily at 9 AM UTC
  $$
  SELECT net.http_post(
    url := 'https://[YOUR-PROJECT-REF].supabase.co/functions/v1/trial-cron',
    headers := '{"Authorization": "Bearer [YOUR-SERVICE-ROLE-KEY]", "Content-Type": "application/json"}'::jsonb
  );
  $$
);
```

**Replace:**
- `[YOUR-PROJECT-REF]` with your Supabase project reference
- `[YOUR-SERVICE-ROLE-KEY]` with your service role key

### Step 5: Verify Setup

#### Test Trial Auto-Start
1. Create a new test user account
2. Navigate to `/onboarding`
3. Check browser console for logs
4. Verify in database:
   ```sql
   SELECT * FROM vs_subscriptions 
   WHERE user_id = '[test-user-id]' 
   AND status = 'trialing';
   ```
5. Check email inbox for trial started notification

#### Test Trial Expiration
1. Manually set a trial's `trial_end` to a past date:
   ```sql
   UPDATE vs_subscriptions 
   SET trial_end = NOW() - INTERVAL '1 day'
   WHERE status = 'trialing' 
   AND user_id = '[test-user-id]';
   ```
2. Manually trigger the cron job or wait for scheduled run
3. Verify:
   - Subscription status changed to 'expired'
   - User tier reverted to 'free'
   - Expiration email sent

#### Test Trial Warnings
1. Set trial_end to 3 days from now:
   ```sql
   UPDATE vs_subscriptions 
   SET trial_end = NOW() + INTERVAL '3 days'
   WHERE status = 'trialing' 
   AND user_id = '[test-user-id]';
   ```
2. Run cron job manually
3. Verify 3-day warning email sent
4. Repeat for 1-day warning

#### Test Onboarding Completion
1. Complete all onboarding checklist items
2. Verify in database:
   ```sql
   SELECT onboarding_completed, onboarding_completed_at 
   FROM vs_profiles 
   WHERE id = '[test-user-id]';
   ```
3. Check for completion email

## 📊 Monitoring

### Check Edge Function Logs
- Supabase Dashboard → Edge Functions → Logs
- Filter by function name (trial-cron, manage-trial-expiration, etc.)

### Check Cron Job Status
```sql
SELECT * FROM cron.job_run_details 
WHERE jobname = 'trial-management-daily' 
ORDER BY start_time DESC 
LIMIT 10;
```

### Monitor Trial Metrics
```sql
-- Active trials
SELECT COUNT(*) FROM vs_subscriptions WHERE status = 'trialing';

-- Trials ending today
SELECT COUNT(*) FROM vs_subscriptions 
WHERE status = 'trialing' 
AND trial_end::date = CURRENT_DATE;

-- Trials ending in 3 days
SELECT COUNT(*) FROM vs_subscriptions 
WHERE status = 'trialing' 
AND trial_end::date = CURRENT_DATE + INTERVAL '3 days';

-- Expired trials (last 7 days)
SELECT COUNT(*) FROM vs_subscriptions 
WHERE status = 'expired' 
AND updated_at > NOW() - INTERVAL '7 days';
```

## 🔧 Troubleshooting

### Trial Not Auto-Starting
1. Check browser console for errors
2. Verify user is authenticated (`user?.id` exists)
3. Check `TrialService.isEligibleForTrial()` returns true
4. Verify database connection
5. Check Edge Function logs for errors

### Emails Not Sending
1. Verify `RESEND_API_KEY` is set correctly
2. Check Resend dashboard for email status
3. Verify `EMAIL_FROM` is a verified domain in Resend
4. Check Edge Function logs for email errors
5. Test email function manually:
   ```bash
   curl -X POST https://[project-ref].supabase.co/functions/v1/send-trial-notification \
     -H "Authorization: Bearer [anon-key]" \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "test-user-id",
       "email": "test@example.com",
       "name": "Test User",
       "type": "started"
     }'
   ```

### Cron Job Not Running
1. Verify cron job is enabled in Supabase Dashboard
2. Check cron schedule syntax is correct (`0 9 * * *`)
3. Verify function name matches exactly (`trial-cron`)
4. Check cron job logs:
   ```sql
   SELECT * FROM cron.job_run_details 
   WHERE jobname = 'trial-management-daily' 
   ORDER BY start_time DESC;
   ```
5. Test function manually to ensure it works

### Trial Not Expiring
1. Verify `trial_end` date is in the past
2. Check subscription `status` is 'trialing'
3. Verify cron job is running
4. Check `manage-trial-expiration` function logs
5. Manually trigger expiration:
   ```bash
   curl -X POST https://[project-ref].supabase.co/functions/v1/manage-trial-expiration \
     -H "Authorization: Bearer [service-role-key]"
   ```

## 📝 Manual Testing Commands

### Test Trial Expiration Manually
```bash
curl -X POST https://[project-ref].supabase.co/functions/v1/manage-trial-expiration \
  -H "Authorization: Bearer [service-role-key]" \
  -H "Content-Type: application/json"
```

### Test Trial Notification Manually
```bash
curl -X POST https://[project-ref].supabase.co/functions/v1/send-trial-notification \
  -H "Authorization: Bearer [anon-key]" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id",
    "email": "test@example.com",
    "name": "Test User",
    "type": "started"
  }'
```

### Test Cron Job Manually
```bash
curl -X POST https://[project-ref].supabase.co/functions/v1/trial-cron \
  -H "Authorization: Bearer [service-role-key]" \
  -H "Content-Type: application/json"
```

## ✅ Completion Checklist

- [ ] Database migration run (onboarding columns added)
- [ ] All edge functions deployed
- [ ] Environment variables configured (RESEND_API_KEY, EMAIL_FROM, SITE_URL)
- [ ] Cron job scheduled and enabled
- [ ] Trial auto-start tested
- [ ] Trial expiration tested
- [ ] Trial warnings tested (3-day and 1-day)
- [ ] Onboarding completion tested
- [ ] Email notifications verified
- [ ] Monitoring queries set up

## 🎯 Next Steps

1. **Monitor First Week:** Watch logs and metrics for any issues
2. **Adjust Email Templates:** Customize email content as needed
3. **Set Up Alerts:** Configure alerts for critical failures
4. **Track Conversion:** Monitor trial-to-paid conversion rates
5. **Optimize Timing:** Adjust warning email timing based on user behavior

## 📚 Related Documentation

- `TRIAL_AND_ONBOARDING_AUTOMATION_SETUP.md` - Detailed setup guide
- `TRIAL_AND_ONBOARDING_IMPLEMENTATION.md` - Implementation details
- `IMPLEMENTATION_SUMMARY.md` - Feature summary

## 🆘 Support

For issues or questions:
- Check Edge Function logs in Supabase Dashboard
- Review browser console for frontend errors
- Verify all environment variables are set
- Test individual functions manually
- Check database for data integrity

