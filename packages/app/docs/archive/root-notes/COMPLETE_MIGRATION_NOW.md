# ✅ Complete Migration Now - Step by Step

I'll guide you through completing the migration. Since we need database access, here are the exact steps:

## 🎯 Quick Method: Supabase Dashboard (2 minutes)

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your project (nuwfdvwqiynzhbbsqagw)

### Step 2: Open SQL Editor
1. Click **SQL Editor** in the left sidebar
2. Click **New Query** button

### Step 3: Copy Migration SQL
1. Open file: `RUN_TRIAL_ONBOARDING_MIGRATION.sql`
2. Select ALL contents (Ctrl+A)
3. Copy (Ctrl+C)

### Step 4: Paste and Run
1. Paste into SQL Editor (Ctrl+V)
2. Click **Run** button (or press Ctrl+Enter)
3. Wait for success message

### Step 5: Verify
You should see output showing 4 columns:
- onboarding_started
- onboarding_started_at
- onboarding_completed
- onboarding_completed_at

## ✅ That's It!

The migration is complete. The columns are now added to your `vs_profiles` table.

## 🔍 Verification Query

Run this to double-check:

```sql
SELECT 
  column_name, 
  data_type
FROM information_schema.columns 
WHERE table_name = 'vs_profiles' 
AND column_name IN (
  'onboarding_started', 
  'onboarding_started_at', 
  'onboarding_completed', 
  'onboarding_completed_at'
)
ORDER BY column_name;
```

**Expected:** 4 rows returned

## 📋 Next Steps After Migration

1. ✅ **Migration Complete** (you just did this!)
2. ⏭️ Deploy edge functions (see `scripts/deploy-trial-functions.ps1`)
3. ⏭️ Configure environment variables (Supabase Dashboard → Edge Functions → Secrets)
4. ⏭️ Set up cron job (see `scripts/setup-cron-job.sql`)

---

**The migration SQL is ready in:** `RUN_TRIAL_ONBOARDING_MIGRATION.sql`

Just copy, paste, and run in Supabase Dashboard SQL Editor!

