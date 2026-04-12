# 🚀 Deployment Update Required

## Overview

**5 new database migrations** have been created to fix critical security and performance issues. These migrations must be applied to your production Supabase database before deployment.

## ⚠️ Critical: Apply These Migrations

### New Migration Files (2025-01-08)

1. **`20250108000000_fix_function_search_path.sql`** - Security Fix
   - Fixes function search_path security vulnerabilities
   - Prevents search path manipulation attacks
   - Affects 8 functions

2. **`20250108000001_fix_rls_policy_performance.sql`** - Performance Fix
   - Optimizes RLS policy performance
   - Fixes auth_rls_initplan warnings
   - Improves query performance at scale
   - Affects 60+ RLS policies

3. **`20250108000002_fix_multiple_permissive_policies.sql`** - Performance Fix
   - Consolidates redundant service role policies
   - Reduces policy evaluation overhead
   - Improves query performance

4. **`20250108000003_fix_rls_enabled_no_policy.sql`** - Security Fix
   - Adds missing RLS policies for `profiles` and `webhook_events` tables
   - Ensures proper security when RLS is enabled

5. **`20250108000004_fix_unindexed_foreign_keys.sql`** - Performance Fix
   - Creates indexes on foreign key columns
   - Improves join and constraint check performance
   - Affects `vs_invoices` and `vs_vendor_assessments` tables

## 📋 Deployment Steps

### Step 1: Apply Migrations to Production

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `nuwfdvwqiynzhbbsqagw`
3. Navigate to **SQL Editor**
4. Run each migration file in order:

```
1. 20250108000000_fix_function_search_path.sql
2. 20250108000001_fix_rls_policy_performance.sql
3. 20250108000002_fix_multiple_permissive_policies.sql
4. 20250108000003_fix_rls_enabled_no_policy.sql
5. 20250108000004_fix_unindexed_foreign_keys.sql
```

**Important:** Run them in this exact order!

#### Option B: Using Supabase CLI

```bash
# Link to your production project
npx supabase link --project-ref nuwfdvwqiynzhbbsqagw

# Push all migrations (including new ones)
npx supabase db push
```

### Step 2: Verify Migrations Applied

Run this verification query in Supabase SQL Editor:

```sql
-- Verify Function Search Path Security (should return 8 rows, all ✅)
SELECT 
  proname as function_name,
  CASE 
    WHEN pg_get_functiondef(oid) LIKE '%SET search_path%' THEN '✅ Fixed'
    ELSE '❌ Missing'
  END as status
FROM pg_proc 
WHERE proname IN (
  'update_updated_at_column',
  'increment_usage',
  'get_user_subscription_limits',
  'user_has_feature_access',
  'track_usage',
  'get_subscription_analytics',
  'check_usage_limit',
  'update_updated_at'
)
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;

-- Verify Foreign Key Indexes (should return 2 rows)
SELECT 
  tablename,
  indexname,
  '✅ Index exists' as status
FROM pg_indexes
WHERE tablename IN ('vs_invoices', 'vs_vendor_assessments')
AND indexname IN ('idx_vs_invoices_subscription_id', 'idx_vs_vendor_assessments_framework_id');

-- Verify RLS Policies Exist (should return 2 rows)
SELECT 
  tablename,
  COUNT(*) as policy_count,
  '✅ Has policies' as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'webhook_events')
GROUP BY tablename;
```

### Step 3: Check Database Linter

1. Go to Supabase Dashboard → Your Project → **Database** → **Linter**
2. Verify all warnings are resolved:
   - ✅ No `function_search_path_mutable` warnings
   - ✅ No `auth_rls_initplan` warnings
   - ✅ No `multiple_permissive_policies` warnings
   - ✅ No `rls_enabled_no_policy` warnings
   - ✅ No `unindexed_foreign_keys` warnings

## ✅ Success Criteria

Your deployment is updated when:

- [x] All 5 new migrations applied successfully
- [x] All 8 functions have `SET search_path` configured
- [x] All RLS policies optimized (60+ policies)
- [x] Foreign key indexes created
- [x] Database Linter shows zero warnings
- [x] Verification queries return expected results

## 🚨 Important Notes

1. **Order Matters**: Run migrations in chronological order (by filename)
2. **No Downtime**: These migrations are safe to run on production (no data changes)
3. **Backup First**: Always backup your database before applying migrations
4. **Test First**: Consider testing on a staging environment first

## 📝 Migration Files Location

All migration files are located in:
```
supabase/migrations/
```

## 🔗 Related Documentation

- [DEPLOY_TO_PRODUCTION.md](./DEPLOY_TO_PRODUCTION.md) - Full deployment guide
- [DEPLOYMENT_NEXT_STEPS.md](./DEPLOYMENT_NEXT_STEPS.md) - Next steps guide
- [PASTE_INTO_SUPABASE.md](./PASTE_INTO_SUPABASE.md) - SQL scripts for manual application

## 🎯 Next Steps After Migration

1. ✅ Verify all migrations applied successfully
2. ✅ Run verification queries
3. ✅ Check Database Linter
4. ✅ Test critical user flows
5. ✅ Monitor performance metrics
6. ✅ Deploy application updates

---

**Status:** ✅ **Migrations Applied** - Verification In Progress  
**Last Updated:** 2025-01-08  
**Priority:** 🔴 **High** - Security and performance fixes  
**Next Step:** Complete verification checklist in `MIGRATION_VERIFICATION_CHECKLIST.md`

