# Run Trial & Onboarding Migration

## Quick Start

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to: **SQL Editor** → **New Query**

2. **Copy and Paste**
   - Open `RUN_TRIAL_ONBOARDING_MIGRATION.sql`
   - Copy the entire contents
   - Paste into the SQL Editor

3. **Run the Migration**
   - Click **Run** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
   - Wait for success message

4. **Verify**
   - Check the output at the bottom
   - You should see 4 columns listed in the verification query results

## What This Migration Does

Adds 4 new columns to `vs_profiles` table:
- `onboarding_started` (boolean) - Tracks if user started onboarding
- `onboarding_started_at` (timestamp) - When onboarding started
- `onboarding_completed` (boolean) - Tracks if user completed onboarding
- `onboarding_completed_at` (timestamp) - When onboarding completed

Also creates an index for performance.

## Alternative: Using Supabase CLI

If you have Supabase CLI set up:

```bash
# Navigate to project root
cd /path/to/05-vendorsoluce

# Push migrations
supabase db push

# Or run specific migration
supabase migration up 20250117_add_onboarding_tracking
```

## Troubleshooting

### Error: "column already exists"
- This is safe to ignore - the migration uses `ADD COLUMN IF NOT EXISTS`
- Your columns are already there

### Error: "relation vs_profiles does not exist"
- Make sure you're running this in the correct Supabase project
- Check that `vs_profiles` table exists first:
  ```sql
  SELECT * FROM information_schema.tables 
  WHERE table_name = 'vs_profiles';
  ```

### Error: "permission denied"
- Make sure you're using a user with appropriate permissions
- Try using the service role key or project owner account

## Next Steps

After running this migration:

1. ✅ Verify columns exist (check output)
2. ✅ Deploy edge functions (see `DEPLOYMENT_CHECKLIST.md`)
3. ✅ Configure environment variables
4. ✅ Set up cron job
5. ✅ Test the system

## Support

If you encounter issues:
- Check Supabase Dashboard → Database → Migrations
- Review error messages in SQL Editor
- See `TRIAL_ONBOARDING_SETUP_COMPLETE.md` for full troubleshooting guide

