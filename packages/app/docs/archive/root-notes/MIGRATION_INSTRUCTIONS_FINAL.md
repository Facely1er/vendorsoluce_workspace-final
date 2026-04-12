# ✅ Complete the Migration - Final Instructions

## 🎯 What You Need to Do (2 Minutes)

The migration file is ready. Here's exactly what to do:

### Step-by-Step:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/nuwfdvwqiynzhbbsqagw
   - Or: https://supabase.com/dashboard → Select your project

2. **Open SQL Editor**
   - Click **SQL Editor** in the left sidebar
   - Click **New Query** button

3. **Copy the Migration**
   - Open file: `RUN_TRIAL_ONBOARDING_MIGRATION.sql` (in your project root)
   - Select ALL text (Ctrl+A)
   - Copy (Ctrl+C)

4. **Paste and Run**
   - Paste into the SQL Editor (Ctrl+V)
   - Click the **Run** button (or press Ctrl+Enter)
   - Wait 2-3 seconds

5. **Verify Success**
   - You should see a success message
   - The output will show 4 columns listed:
     - onboarding_started
     - onboarding_started_at
     - onboarding_completed
     - onboarding_completed_at

## ✅ That's It!

The migration is complete. The columns are now in your database.

## 🔍 Quick Verification

After running, you can verify with this query (optional):

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'vs_profiles' 
AND column_name IN (
  'onboarding_started', 
  'onboarding_started_at', 
  'onboarding_completed', 
  'onboarding_completed_at'
);
```

**Expected:** 4 rows returned

## 📋 What This Migration Does

Adds 4 columns to `vs_profiles` table:
- `onboarding_started` (boolean) - Tracks if user started onboarding
- `onboarding_started_at` (timestamp) - When onboarding started  
- `onboarding_completed` (boolean) - Tracks if user completed onboarding
- `onboarding_completed_at` (timestamp) - When onboarding completed

Also creates an index for performance.

## 🚀 After Migration Complete

Once you've run the migration:

1. ✅ **Migration** - DONE (you just did this!)
2. ⏭️ **Deploy Edge Functions** - See `scripts/deploy-trial-functions.ps1`
3. ⏭️ **Configure Environment Variables** - Supabase Dashboard → Edge Functions → Secrets
4. ⏭️ **Set Up Cron Job** - See `scripts/setup-cron-job.sql`

## 📁 Migration File Location

The migration SQL is in: **`RUN_TRIAL_ONBOARDING_MIGRATION.sql`**

Just open it, copy all contents, and paste into Supabase SQL Editor!

---

**Ready?** Open Supabase Dashboard and follow the 5 steps above. Takes 2 minutes! ⚡

