# 🗄️ Database Migration Deployment Guide
## VendorSoluce Production Database Setup

**Date:** December 2025  
**Total Migrations:** 16 files  
**Status:** Ready for Production Deployment

---

## 📋 Migration Files Overview

### Core Schema Migrations (Run First)
1. **20250701042959_crimson_waterfall.sql** - Initial schema (profiles, vendors, sbom_analyses, supply_chain_assessments)
2. **20250722160541_withered_glade.sql** - Additional schema updates
3. **20250724052026_broad_castle.sql** - Schema refinements

### Table Renaming (Critical - Run in Order)
4. **20251004090256_rename_tables_with_vs_prefix.sql** - First rename migration
5. **20251004090354_rename_tables_with_vs_prefix.sql** - Second rename migration (completes the process)

### Stripe Integration (Payment System)
6. **20250101000000_stripe_integration.sql** - Initial Stripe tables
7. **20251204_stripe_integration.sql** - Complete Stripe integration (subscriptions, customers, invoices, usage)

### Feature Additions
8. **20250115_vendor_assessments_tables.sql** - Vendor assessment workflows
9. **20250115_add_grace_period_tracking.sql** - Subscription grace period tracking
10. **20250120_marketing_automation.sql** - Marketing automation tables
11. **20251107_asset_management.sql** - Asset inventory and management

### Performance & Security Fixes
12. **20250108000000_fix_function_search_path.sql** - Function search path fixes
13. **20250108000001_fix_rls_policy_performance.sql** - RLS policy performance optimization
14. **20250108000002_fix_multiple_permissive_policies.sql** - RLS policy fixes
15. **20250108000003_fix_rls_enabled_no_policy.sql** - RLS policy corrections
16. **20250108000004_fix_unindexed_foreign_keys.sql** - Index optimization

---

## 🚀 Deployment Steps

### Step 1: Pre-Deployment Verification

```bash
# Verify all migration files exist
ls -la supabase/migrations/*.sql

# Check for SQL syntax errors (optional, requires psql)
# psql $DATABASE_URL -f supabase/migrations/20250701042959_crimson_waterfall.sql --dry-run
```

### Step 2: Backup Production Database

**CRITICAL:** Always backup before running migrations!

```sql
-- In Supabase Dashboard → Database → Backups
-- Or via CLI:
supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 3: Run Migrations in Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your production project
3. Navigate to **SQL Editor**
4. Run migrations **in chronological order** (by filename):

#### Option A: Run All Migrations via Supabase CLI (Recommended)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run all migrations
supabase db push
```

#### Option B: Run Migrations Manually via SQL Editor

Copy and paste each migration file content into the SQL Editor, **one at a time**, in this order:

1. `20250701042959_crimson_waterfall.sql`
2. `20250722160541_withered_glade.sql`
3. `20250724052026_broad_castle.sql`
4. `20251004090256_rename_tables_with_vs_prefix.sql`
5. `20251004090354_rename_tables_with_vs_prefix.sql`
6. `20250101000000_stripe_integration.sql`
7. `20251204_stripe_integration.sql`
8. `20250115_vendor_assessments_tables.sql`
9. `20250115_add_grace_period_tracking.sql`
10. `20250120_marketing_automation.sql`
11. `20251107_asset_management.sql`
12. `20250108000000_fix_function_search_path.sql`
13. `20250108000001_fix_rls_policy_performance.sql`
14. `20250108000002_fix_multiple_permissive_policies.sql`
15. `20250108000003_fix_rls_enabled_no_policy.sql`
16. `20250108000004_fix_unindexed_foreign_keys.sql`

### Step 4: Verify Migration Success

Run these verification queries in SQL Editor:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'vs_%'
ORDER BY table_name;

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'vs_%';

-- Check subscription table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vs_subscriptions'
ORDER BY ordinal_position;

-- Verify indexes exist
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename LIKE 'vs_%';
```

### Step 5: Verify RLS Policies

```sql
-- Check RLS policies are active
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename LIKE 'vs_%'
ORDER BY tablename, policyname;
```

---

## 🔐 Security Verification

### Row Level Security (RLS)

All tables should have RLS enabled. Verify with:

```sql
-- Check RLS status
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE 'vs_%'
ORDER BY tablename;
```

**Expected Result:** All tables should show `rls_enabled = true`

### Policy Verification

Key tables should have policies for:
- `vs_profiles` - Users can only access their own profile
- `vs_vendors` - Users can only access their own vendors
- `vs_subscriptions` - Users can only access their own subscriptions
- `vs_sbom_analyses` - Users can only access their own analyses

---

## 📊 Post-Migration Checklist

- [ ] All 16 migrations executed successfully
- [ ] All `vs_*` tables created
- [ ] RLS enabled on all tables
- [ ] RLS policies created and active
- [ ] Indexes created for performance
- [ ] Foreign key constraints in place
- [ ] Stripe integration tables ready
- [ ] Test authentication flow
- [ ] Test subscription creation
- [ ] Verify data isolation (users can't see other users' data)

---

## 🚨 Troubleshooting

### Migration Fails with "Table Already Exists"

If you see errors about tables already existing:
1. Check if you're running migrations on a fresh database or existing one
2. For existing databases, you may need to modify migrations to use `CREATE TABLE IF NOT EXISTS`
3. Most migrations already include `IF NOT EXISTS` clauses

### RLS Policy Errors

If RLS policies fail:
1. Ensure RLS is enabled: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
2. Check policy syntax matches your Supabase version
3. Verify user roles are correct

### Foreign Key Constraint Errors

If foreign key constraints fail:
1. Ensure parent tables are created before child tables
2. Check that referenced columns exist
3. Verify data types match

---

## 📝 Migration Execution Log Template

Use this to track your migration execution:

```
Migration Execution Log
Date: _______________
Executed By: _______________
Environment: Production

[ ] 20250701042959_crimson_waterfall.sql - Status: ___
[ ] 20250722160541_withered_glade.sql - Status: ___
[ ] 20250724052026_broad_castle.sql - Status: ___
[ ] 20251004090256_rename_tables_with_vs_prefix.sql - Status: ___
[ ] 20251004090354_rename_tables_with_vs_prefix.sql - Status: ___
[ ] 20250101000000_stripe_integration.sql - Status: ___
[ ] 20251204_stripe_integration.sql - Status: ___
[ ] 20250115_vendor_assessments_tables.sql - Status: ___
[ ] 20250115_add_grace_period_tracking.sql - Status: ___
[ ] 20250120_marketing_automation.sql - Status: ___
[ ] 20251107_asset_management.sql - Status: ___
[ ] 20250108000000_fix_function_search_path.sql - Status: ___
[ ] 20250108000001_fix_rls_policy_performance.sql - Status: ___
[ ] 20250108000002_fix_multiple_permissive_policies.sql - Status: ___
[ ] 20250108000003_fix_rls_enabled_no_policy.sql - Status: ___
[ ] 20250108000004_fix_unindexed_foreign_keys.sql - Status: ___

Notes:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## ✅ Success Criteria

After completing all migrations, you should have:

1. ✅ All core tables created (`vs_profiles`, `vs_vendors`, `vs_sbom_analyses`, etc.)
2. ✅ Stripe integration tables ready (`vs_subscriptions`, `vs_customers`, `vs_invoices`)
3. ✅ RLS enabled on all tables
4. ✅ Proper indexes for performance
5. ✅ Foreign key constraints in place
6. ✅ No migration errors in logs

---

**Next Steps:** After migrations are complete, proceed to:
1. Configure environment variables in Vercel
2. Deploy Supabase Edge Functions
3. Test authentication and subscription flows
4. Verify feature gating works correctly

---

**Report Generated:** December 2025  
**Last Updated:** Just now

