# Trial and Onboarding Automation - Setup Guide

## Overview

This document describes the complete automation system for trial management and onboarding that has been implemented.

## What's Been Implemented

### 1. Edge Functions Created

#### `manage-trial-expiration`
- **Location:** `supabase/functions/manage-trial-expiration/index.ts`
- **Purpose:** Automatically expires trials and reverts users to free tier
- **When it runs:** Called by cron job or manually
- **What it does:**
  - Finds all expired trials (trial_end <= now)
  - Updates subscription status to 'expired'
  - Reverts user tier to 'free'
  - Sends expiration email notification

#### `send-trial-notification`
- **Location:** `supabase/functions/send-trial-notification/index.ts`
- **Purpose:** Sends email notifications for trial events
- **Notification types:**
  - `started`: When trial begins
  - `ending_soon`: 3 days and 1 day before trial ends
  - `expired`: When trial expires
- **Email service:** Uses Resend API (configurable)

#### `trial-cron`
- **Location:** `supabase/functions/trial-cron/index.ts`
- **Purpose:** Daily cron job to manage all trial-related tasks
- **What it does:**
  - Checks for expired trials
  - Sends 3-day warnings
  - Sends 1-day warnings
  - Processes trial expiration

#### `send-onboarding-complete-email`
- **Location:** `supabase/functions/send-onboarding-complete-email/index.ts`
- **Purpose:** Sends welcome/completion email when onboarding finishes
- **When it runs:** After onboarding checklist is completed

### 2. Enhanced Services

#### `TrialService` (Enhanced)
- **Location:** `src/services/trialService.ts`
- **New methods:**
  - `sendTrialNotification()`: Sends trial notification emails
  - `checkAndSendTrialWarnings()`: Manually check and send warnings

#### `OnboardingService` (New)
- **Location:** `src/services/onboardingService.ts`
- **Methods:**
  - `completeOnboarding()`: Auto-starts trial and sets up user
  - `markOnboardingCompleted()`: Marks onboarding as done
  - `isOnboardingCompleted()`: Checks completion status
  - `getOnboardingProgress()`: Gets checklist progress

### 3. Updated Components

#### `WelcomeScreen`
- **Location:** `src/components/onboarding/WelcomeScreen.tsx`
- **Changes:**
  - Auto-starts trial when component mounts (first step)
  - Calls `OnboardingService.completeOnboarding()` automatically
  - Marks onboarding as completed when user finishes

#### `OnboardingChecklist`
- **Location:** `src/components/onboarding/OnboardingChecklist.tsx`
- **Changes:**
  - Auto-marks onboarding as completed when all items are done
  - Integrates with `OnboardingService`

## Setup Instructions

### Step 1: Deploy Edge Functions

Deploy all Edge Functions to Supabase:

```bash
# Deploy each function
supabase functions deploy manage-trial-expiration
supabase functions deploy send-trial-notification
supabase functions deploy trial-cron
supabase functions deploy send-onboarding-complete-email
```

Or deploy all at once:
```bash
supabase functions deploy
```

### Step 2: Configure Environment Variables

Set the following secrets in Supabase Dashboard → Project Settings → Edge Functions:

1. **Email Service Configuration:**
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   EMAIL_FROM=VendorSoluce <noreply@vendorsoluce.com>
   SITE_URL=https://vendorsoluce.com
   ```

2. **Supabase Configuration (auto-set):**
   - `SUPABASE_URL` - Automatically set
   - `SUPABASE_SERVICE_ROLE_KEY` - Automatically set

### Step 3: Set Up Cron Job

1. Go to Supabase Dashboard → Database → Cron Jobs
2. Create a new cron job:
   - **Name:** `trial-management-daily`
   - **Schedule:** `0 9 * * *` (runs daily at 9 AM UTC)
   - **Function:** `trial-cron`
   - **Enabled:** Yes

### Step 4: Test the Automation

#### Test Trial Auto-Start
1. Create a new user account
2. Navigate to `/onboarding`
3. Verify trial starts automatically (check database `vs_subscriptions` table)
4. Check email for trial started notification

#### Test Trial Expiration
1. Manually set a trial's `trial_end` to a past date in database
2. Run the cron job manually or wait for scheduled run
3. Verify:
   - Subscription status changes to 'expired'
   - User tier reverts to 'free'
   - Expiration email is sent

#### Test Trial Warnings
1. Set a trial's `trial_end` to 3 days from now
2. Run cron job
3. Verify 3-day warning email is sent
4. Set `trial_end` to 1 day from now
5. Run cron job again
6. Verify 1-day warning email is sent

#### Test Onboarding Completion
1. Complete all onboarding checklist items
2. Verify onboarding is marked as completed in database
3. Check for completion email

## Automation Flow

### New User Onboarding Flow

```
1. User signs up
   ↓
2. Redirected to /onboarding
   ↓
3. WelcomeScreen component mounts
   ↓
4. OnboardingService.completeOnboarding() called automatically
   ├─→ TrialService.startTrial() (if eligible)
   ├─→ TrialService.sendTrialNotification('started')
   ├─→ Create default workspace
   └─→ Send welcome email
   ↓
5. User completes onboarding steps
   ↓
6. OnboardingChecklist tracks progress
   ↓
7. When all items complete:
   ├─→ OnboardingService.markOnboardingCompleted()
   └─→ Send completion email
```

### Daily Trial Management Flow

```
1. Cron job triggers at 9 AM UTC
   ↓
2. trial-cron function runs
   ├─→ Calls manage-trial-expiration
   │   └─→ Expires old trials, reverts to free tier
   ├─→ Finds trials ending in 3 days
   │   └─→ Sends 3-day warning emails
   └─→ Finds trials ending in 1 day
       └─→ Sends 1-day warning emails
```

## Email Templates

All email templates are HTML-based and include:
- Branded styling
- Clear call-to-action buttons
- Responsive design
- Dark mode support

### Email Types

1. **Trial Started**
   - Subject: "Welcome to Your 14-Day Free Trial - VendorSoluce"
   - Sent: Immediately when trial starts
   - Content: Trial benefits, dashboard link

2. **Trial Ending Soon (3 days)**
   - Subject: "Your Free Trial Ends in 3 Days - VendorSoluce"
   - Sent: 3 days before trial ends
   - Content: Upgrade prompt, pricing info

3. **Trial Ending Soon (1 day)**
   - Subject: "Your Free Trial Ends Tomorrow - VendorSoluce"
   - Sent: 1 day before trial ends
   - Content: Urgent upgrade prompt

4. **Trial Expired**
   - Subject: "Your Free Trial Has Ended - VendorSoluce"
   - Sent: When trial expires
   - Content: Upgrade options, data retention info

5. **Onboarding Complete**
   - Subject: "Welcome to VendorSoluce - You're All Set!"
   - Sent: When onboarding checklist is completed
   - Content: Next steps, feature highlights

## Database Schema Requirements

Ensure these columns exist in `vs_profiles`:
- `onboarding_started` (boolean)
- `onboarding_started_at` (timestamp)
- `onboarding_completed` (boolean)
- `onboarding_completed_at` (timestamp)

Ensure these columns exist in `vs_subscriptions`:
- `status` (enum: 'trialing', 'active', 'expired', 'canceled')
- `trial_start` (timestamp)
- `trial_end` (timestamp)
- `cancel_at` (timestamp, nullable)

## Monitoring and Logging

All functions include comprehensive logging:
- Success operations logged with details
- Errors logged with full context
- Email sends logged with email IDs

Check logs in:
- Supabase Dashboard → Edge Functions → Logs
- Browser console (for frontend operations)

## Troubleshooting

### Trial Not Auto-Starting
- Check browser console for errors
- Verify user is authenticated
- Check `TrialService.isEligibleForTrial()` returns true
- Verify database connection

### Emails Not Sending
- Verify `RESEND_API_KEY` is set correctly
- Check Resend dashboard for email status
- Verify `EMAIL_FROM` is a verified domain in Resend
- Check Edge Function logs for errors

### Cron Job Not Running
- Verify cron job is enabled in Supabase Dashboard
- Check cron schedule syntax is correct
- Verify function name matches exactly
- Check Edge Function logs for execution

### Trial Not Expiring
- Verify `trial_end` date is in the past
- Check subscription `status` is 'trialing'
- Verify cron job is running
- Check `manage-trial-expiration` function logs

## Manual Testing Commands

### Test Trial Expiration Manually
```bash
# Invoke the function directly
curl -X POST https://[project-ref].supabase.co/functions/v1/manage-trial-expiration \
  -H "Authorization: Bearer [anon-key]" \
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
  -H "Authorization: Bearer [anon-key]" \
  -H "Content-Type: application/json"
```

## Next Steps

1. **Set up email service** (Resend recommended)
2. **Deploy Edge Functions** to Supabase
3. **Configure cron job** in Supabase Dashboard
4. **Test the automation** with test accounts
5. **Monitor logs** for the first few days
6. **Adjust email templates** as needed
7. **Set up alerts** for critical failures

## Support

For issues or questions:
- Check Edge Function logs in Supabase Dashboard
- Review browser console for frontend errors
- Verify all environment variables are set
- Test individual functions manually

