# Quick Start: Trial & Onboarding Setup

## 🚀 5-Minute Setup Guide

Follow these steps to deploy the trial and onboarding system:

### Step 1: Run Database Migration (2 minutes)

**Option A: Via Supabase Dashboard (Recommended)**
1. Open Supabase Dashboard → SQL Editor
2. Open `RUN_TRIAL_ONBOARDING_MIGRATION.sql`
3. Copy and paste into SQL Editor
4. Click **Run**

**Option B: Via Supabase CLI**
```bash
supabase db push
```

### Step 2: Deploy Edge Functions (2 minutes)

**Option A: Via Script (Recommended)**
```bash
# Windows PowerShell
.\scripts\deploy-trial-functions.ps1

# Mac/Linux
chmod +x scripts/deploy-trial-functions.sh
./scripts/deploy-trial-functions.sh
```

**Option B: Manual Deployment**
```bash
supabase functions deploy trial-cron
supabase functions deploy manage-trial-expiration
supabase functions deploy send-trial-notification
supabase functions deploy send-onboarding-complete-email
```

### Step 3: Configure Environment Variables (1 minute)

Go to: **Supabase Dashboard → Project Settings → Edge Functions → Secrets**

Add these secrets:
- `RESEND_API_KEY` = `re_xxxxxxxxxxxxx` (from Resend dashboard)
- `EMAIL_FROM` = `VendorSoluce <noreply@vendorsoluce.com>`
- `SITE_URL` = `https://vendorsoluce.com`

### Step 4: Set Up Cron Job (1 minute)

**Option A: Via Supabase Dashboard (Recommended)**
1. Go to: **Database → Cron Jobs**
2. Click **Create Cron Job**
3. Configure:
   - Name: `trial-management-daily`
   - Schedule: `0 9 * * *` (9 AM UTC daily)
   - Function: `trial-cron`
   - Enabled: Yes
4. Click **Create**

**Option B: Via SQL**
1. Open `scripts/setup-cron-job.sql`
2. Replace `[YOUR-PROJECT-REF]` and `[YOUR-SERVICE-ROLE-KEY]`
3. Run in SQL Editor

### Step 5: Verify Setup (1 minute)

Run verification script:
1. Open `scripts/verify-setup.sql`
2. Run in SQL Editor
3. Check all items show ✅ PASS

## ✅ Done!

Your trial and onboarding system is now live!

## 🧪 Quick Test

1. Create a test user account
2. Navigate to `/onboarding`
3. Check browser console - should see "Trial auto-started"
4. Verify in database:
   ```sql
   SELECT * FROM vs_subscriptions 
   WHERE status = 'trialing' 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```

## 📚 Full Documentation

- **Complete Setup Guide:** `TRIAL_ONBOARDING_SETUP_COMPLETE.md`
- **Deployment Checklist:** `DEPLOYMENT_CHECKLIST.md`
- **Implementation Summary:** `IMPLEMENTATION_COMPLETE.md`

## 🆘 Troubleshooting

If something doesn't work:
1. Check `scripts/verify-setup.sql` results
2. Review Edge Function logs in Supabase Dashboard
3. See troubleshooting section in `TRIAL_ONBOARDING_SETUP_COMPLETE.md`

