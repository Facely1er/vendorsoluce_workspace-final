# Run Trial & Onboarding Migration Now

## Quick Method: Supabase Dashboard (Recommended - 2 minutes)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click **SQL Editor** in left sidebar
   - Click **New Query**

3. **Copy and Run**
   - Open file: `RUN_TRIAL_ONBOARDING_MIGRATION.sql`
   - Copy ALL contents (Ctrl+A, Ctrl+C)
   - Paste into SQL Editor
   - Click **Run** button (or press Ctrl+Enter)

4. **Verify Success**
   - Should see success message
   - Check output shows 4 columns listed

## Alternative: Node Script (If you have Postgres password)

1. **Set environment variable:**
   ```powershell
   $env:POSTGRES_PASSWORD="your_postgres_password"
   $env:SUPABASE_URL="https://nuwfdvwqiynzhbbsqagw.supabase.co"
   ```

2. **Run script:**
   ```powershell
   node scripts/apply-trial-onboarding-migration.mjs
   ```

## What This Migration Does

Adds 4 columns to `vs_profiles`:
- `onboarding_started` (boolean)
- `onboarding_started_at` (timestamp)
- `onboarding_completed` (boolean)
- `onboarding_completed_at` (timestamp)

Also creates an index for performance.

## Verification

After running, verify with:
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

Should return 4 rows.

