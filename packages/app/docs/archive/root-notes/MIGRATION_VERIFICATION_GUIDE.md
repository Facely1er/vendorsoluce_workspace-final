# VendorSoluce - Database Migration Verification Guide

**Date:** January 2025  
**Purpose:** Verify that all database migrations have been successfully applied

---

## 📋 Overview

This guide helps you verify that all 18 database migrations for VendorSoluce have been successfully applied to your Supabase database.

---

## 🚀 Quick Verification

### Method 1: Run Verification Script (Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your VendorSoluce project
   - Navigate to **SQL Editor**

2. **Run Verification Script**
   - Click **New Query**
   - Copy the entire contents of `verify-migration-status.sql`
   - Paste into SQL Editor
   - Click **Run** (or press `Ctrl+Enter`)

3. **Review Results**
   - Check each section for ✅ PASS or ❌ FAIL status
   - Address any failures before proceeding

**Time:** ~30 seconds

---

## 📊 What Gets Verified

The verification script checks:

### ✅ Section 1: Migration Tracking
- Checks if Supabase migration tracking table exists
- Lists all applied migrations (if using Supabase CLI)
- Shows which of the 18 expected migrations are applied

### ✅ Section 2: Table Existence
- Core tables with `vs_` prefix (should be 15+)
- Stripe integration tables (should be 7+)
- Asset management tables (should be 4+)
- Assessment tables (should be 4+)
- Marketing automation tables (should be 3+)

### ✅ Section 3: Row Level Security (RLS)
- Verifies RLS is enabled on all tables
- Counts tables with/without RLS
- Should show 0 tables without RLS

### ✅ Section 4: RLS Policies
- Checks that policies exist on all tables
- Verifies critical tables have proper policies
- Lists policies per table

### ✅ Section 5: Database Functions
- Verifies critical functions exist:
  - `update_updated_at_column`
  - `update_updated_at`
  - `get_user_subscription_limits`
  - `user_has_feature_access`
  - `track_usage`
  - `check_usage_limit`
  - `get_subscription_analytics`
  - `increment_usage`

### ✅ Section 6: Indexes
- Checks indexes on critical tables
- Verifies foreign key indexes exist
- Should show 2+ indexes per critical table

### ✅ Section 7: Foreign Key Constraints
- Verifies foreign keys on critical tables
- Lists all foreign key relationships

### ✅ Section 8: Sample Data
- Checks if assessment frameworks were inserted
- Verifies pricing tiers exist
- Should show 4+ frameworks and 4+ pricing tiers

### ✅ Section 9: Overall Status Summary
- Comprehensive status check
- Shows total tables, RLS status, functions, migrations
- Provides overall ✅ COMPLETE or ❌ INCOMPLETE status

---

## 📋 Expected Results

### ✅ All Migrations Complete

You should see:
- **Tables:** 25+ tables created
- **RLS:** All tables have RLS enabled (0 disabled)
- **Functions:** 6+ critical functions exist
- **Migrations:** 18 migrations applied (if using CLI) or tables exist (if manual)
- **Overall Status:** ✅ ALL MIGRATIONS COMPLETE

---

## 🔍 Manual Verification (Alternative)

If you prefer to check manually:

### 1. Check Tables Exist

```sql
-- Count vs_ prefixed tables
SELECT COUNT(*) 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'vs_%';
-- Should return 15+

-- List all vs_ tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'vs_%'
ORDER BY table_name;
```

### 2. Check RLS Status

```sql
-- Check RLS on all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'vs_%'
ORDER BY tablename;
-- All should show rowsecurity = true
```

### 3. Check Critical Functions

```sql
-- List critical functions
SELECT routine_name 
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'update_updated_at_column',
    'get_user_subscription_limits',
    'user_has_feature_access',
    'track_usage'
);
-- Should return 4+ functions
```

### 4. Check Sample Data

```sql
-- Check assessment frameworks
SELECT COUNT(*) FROM vs_assessment_frameworks WHERE is_active = true;
-- Should return 4+

-- Check pricing tiers
SELECT COUNT(*) FROM vs_prices WHERE is_active = true;
-- Should return 4+
```

---

## ❌ Troubleshooting

### Issue: Tables Missing

**Symptom:** Verification shows fewer tables than expected

**Solution:**
1. Check which migrations haven't been run
2. Run missing migration files in order
3. Re-run verification script

### Issue: RLS Not Enabled

**Symptom:** Some tables show RLS disabled

**Solution:**
1. Run the RLS fix migrations:
   - `20250108000001_fix_rls_policy_performance.sql`
   - `20250108000003_fix_rls_enabled_no_policy.sql`
2. Or manually enable RLS:
   ```sql
   ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
   ```

### Issue: Functions Missing

**Symptom:** Critical functions don't exist

**Solution:**
1. Check migration files for function definitions
2. Run migrations that create functions:
   - `20250108000000_fix_function_search_path.sql`
3. Or create functions manually from migration files

### Issue: Migration Tracking Table Not Found

**Symptom:** Section 1 shows "Migration tracking table not found"

**Solution:**
- This is **normal** if migrations were run manually via SQL Editor
- The verification script will still check actual database objects
- Focus on Sections 2-9 for verification

---

## 📚 Migration Files Reference

All 18 migration files should be in `supabase/migrations/`:

1. `20250701042959_crimson_waterfall.sql` - Core schema
2. `20250722160541_withered_glade.sql` - Schema updates
3. `20250724052026_broad_castle.sql` - RLS fixes
4. `20251004090256_rename_tables_with_vs_prefix.sql` - Table renaming part 1
5. `20251004090354_rename_tables_with_vs_prefix.sql` - Table renaming part 2
6. `20250101000000_stripe_integration.sql` - Initial Stripe
7. `20251204_stripe_integration.sql` - Complete Stripe
8. `20250115_vendor_assessments_tables.sql` - Assessments
9. `20250115_add_grace_period_tracking.sql` - Grace periods
10. `20250116_add_compliance_frameworks.sql` - Compliance
11. `20250117_add_onboarding_tracking.sql` - Onboarding
12. `20250120_marketing_automation.sql` - Marketing
13. `20251107_asset_management.sql` - Assets
14. `20250108000000_fix_function_search_path.sql` - Function fixes
15. `20250108000001_fix_rls_policy_performance.sql` - RLS performance
16. `20250108000002_fix_multiple_permissive_policies.sql` - Policy fixes
17. `20250108000003_fix_rls_enabled_no_policy.sql` - RLS corrections
18. `20250108000004_fix_unindexed_foreign_keys.sql` - Index fixes

---

## ✅ Success Criteria

Migrations are **complete** when:

- ✅ All 18 migration files exist in `supabase/migrations/`
- ✅ 25+ tables created (verified in Section 2)
- ✅ All tables have RLS enabled (verified in Section 3)
- ✅ RLS policies exist on all tables (verified in Section 4)
- ✅ 6+ critical functions exist (verified in Section 5)
- ✅ Indexes exist on critical tables (verified in Section 6)
- ✅ Foreign keys are in place (verified in Section 7)
- ✅ Sample data exists (verified in Section 8)
- ✅ Overall status shows ✅ ALL MIGRATIONS COMPLETE

---

## 🎯 Next Steps After Verification

Once all migrations are verified:

1. **Test Authentication** - Create a test user, verify profile creation
2. **Test Stripe Integration** - Verify subscription tables and flows
3. **Deploy Edge Functions** - Deploy all Supabase Edge Functions
4. **Test RLS Policies** - Verify data isolation works correctly
5. **Monitor Performance** - Check query performance

---

## 📞 Support

If you encounter issues:

1. Review the verification results carefully
2. Check the troubleshooting section above
3. Review individual migration files for errors
4. Check Supabase logs for detailed error messages

---

**Status:** ✅ Verification script ready  
**Last Updated:** January 2025
