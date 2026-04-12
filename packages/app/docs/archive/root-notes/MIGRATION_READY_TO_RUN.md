# ✅ Migration Ready to Run

The trial and onboarding migration is ready. Choose one of these methods:

## 🎯 Method 1: Supabase Dashboard (Easiest - Recommended)

**Time: 2 minutes**

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click **SQL Editor** in left sidebar
   - Click **New Query**

3. **Copy Migration SQL**
   - Open file: `RUN_TRIAL_ONBOARDING_MIGRATION.sql`
   - Select all (Ctrl+A)
   - Copy (Ctrl+C)

4. **Paste and Run**
   - Paste into SQL Editor
   - Click **Run** button (or press Ctrl+Enter)
   - Wait for success message

5. **Verify**
   - Check output shows 4 columns listed
   - Should see: `onboarding_started`, `onboarding_started_at`, `onboarding_completed`, `onboarding_completed_at`

## 🎯 Method 2: Node Script (If you have Postgres password)

**Time: 1 minute**

1. **Set Environment Variables**
   ```powershell
   $env:POSTGRES_PASSWORD="your_postgres_password"
   $env:SUPABASE_URL="https://nuwfdvwqiynzhbbsqagw.supabase.co"
   ```
   
   **Get Postgres Password:**
   - Supabase Dashboard → Settings → Database → Database Password
   - Click "Reset database password" if needed

2. **Run Script**
   ```powershell
   node scripts/apply-trial-onboarding-migration.mjs
   ```

3. **Verify**
   - Script will automatically verify the migration
   - Should see "✅ Migration completed successfully!"

## 📋 What Gets Added

The migration adds these columns to `vs_profiles`:
- `onboarding_started` (boolean) - Tracks if user started onboarding
- `onboarding_started_at` (timestamp) - When onboarding started
- `onboarding_completed` (boolean) - Tracks if user completed onboarding
- `onboarding_completed_at` (timestamp) - When onboarding completed

Also creates index: `idx_vs_profiles_onboarding_status`

## ✅ Verification Query

After running, verify with this SQL:

```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable
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

## 🚀 After Migration

Once migration is complete:

1. ✅ Deploy edge functions (see `scripts/deploy-trial-functions.ps1`)
2. ✅ Configure environment variables (Supabase Dashboard → Edge Functions → Secrets)
3. ✅ Set up cron job (see `scripts/setup-cron-job.sql`)
4. ✅ Test the system (see `DEPLOYMENT_CHECKLIST.md`)

## 🆘 Troubleshooting

### "column already exists" error
- This is safe to ignore
- Migration uses `IF NOT EXISTS` so it won't fail
- Columns are already there

### "relation vs_profiles does not exist"
- Make sure you're in the correct Supabase project
- Check that `vs_profiles` table exists

### "permission denied"
- Use service role key or project owner account
- Or use Supabase Dashboard SQL Editor (has full permissions)

## 📚 Full Documentation

- **Quick Start:** `QUICK_START_TRIAL_ONBOARDING.md`
- **Complete Setup:** `TRIAL_ONBOARDING_SETUP_COMPLETE.md`
- **Deployment Checklist:** `DEPLOYMENT_CHECKLIST.md`

---

**Ready to run!** Choose Method 1 (Dashboard) for easiest setup.

