# 🚀 Database Migration Guide

## Overview

This guide shows you how to apply all 14 database migrations to your production Supabase instance.

**Project Reference:** `nuwfdvwqiynzhbbsqagw`  
**Supabase URL:** `https://nuwfdvwqiynzhbbsqagw.supabase.co`

---

## 📋 Migration Files (14 total)

All migration files are located in: `supabase/migrations/`

1. `20250101000000_stripe_integration.sql`
2. `20250108000000_fix_function_search_path.sql` ⚠️ Security Fix
3. `20250108000001_fix_rls_policy_performance.sql` ⚠️ Performance Fix
4. `20250108000002_fix_multiple_permissive_policies.sql` ⚠️ Performance Fix
5. `20250108000003_fix_rls_enabled_no_policy.sql` ⚠️ Security Fix
6. `20250108000004_fix_unindexed_foreign_keys.sql` ⚠️ Performance Fix
7. `20250115_vendor_assessments_tables.sql`
8. `20250701042959_crimson_waterfall.sql`
9. `20250722160541_withered_glade.sql`
10. `20250724052026_broad_castle.sql`
11. `20251004090256_rename_tables_with_vs_prefix.sql`
12. `20251004090354_rename_tables_with_vs_prefix.sql`
13. `20251107_asset_management.sql`
14. `20251204_stripe_integration.sql`

---

## 🎯 Method 1: Supabase Dashboard SQL Editor (Recommended)

This is the **easiest and most reliable** method, especially if you have the service role key.

### Steps:

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/nuwfdvwqiynzhbbsqagw
   - Or: https://supabase.com/dashboard → Select your project

2. **Navigate to SQL Editor**
   - Click on **SQL Editor** in the left sidebar
   - Or go directly to: https://supabase.com/dashboard/project/nuwfdvwqiynzhbbsqagw/sql/new

3. **Apply Each Migration**
   - Open each migration file from `supabase/migrations/` directory
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click **Run** (or press `Ctrl+Enter`)
   - Wait for success message
   - Repeat for each migration file **in order**

4. **Verify Success**
   - Check for success messages after each migration
   - Go to **Database** → **Migrations** to see applied migrations
   - Check **Database** → **Linter** for any warnings

### ⚠️ Important Notes:

- **Run migrations in order** (alphabetically by filename)
- Some migrations may show "already exists" errors - this is okay if the migration was already applied
- If a migration fails, review the error and fix it before continuing
- Always backup your database before applying migrations (Supabase does this automatically)

---

## 🎯 Method 2: Supabase CLI

This method requires the **Postgres database password** (not the service role key).

### Prerequisites:

- Supabase CLI installed (already available: `npx supabase`)
- Postgres database password (get it from Supabase Dashboard → Settings → Database)

### Steps:

1. **Link to your project:**
   ```bash
   npx supabase link --project-ref nuwfdvwqiynzhbbsqagw --password YOUR_POSTGRES_PASSWORD
   ```

2. **Push all migrations:**
   ```bash
   npx supabase db push
   ```

### ⚠️ Note:

If you only have the service role key (not the Postgres password), use **Method 1** instead.

---

## 🎯 Method 3: Direct Postgres Connection

This method requires the **Postgres connection string** or **Postgres password**.

### Prerequisites:

- `pg` library installed (already installed)
- Postgres connection string or password

### Steps:

1. **Set environment variables:**
   ```bash
   # Option A: Use connection string
   export POSTGRES_CONNECTION_STRING="postgresql://postgres:[PASSWORD]@db.nuwfdvwqiynzhbbsqagw.supabase.co:5432/postgres"
   
   # Option B: Use password (will construct connection string)
   export POSTGRES_PASSWORD="your_postgres_password"
   export SUPABASE_URL="https://nuwfdvwqiynzhbbsqagw.supabase.co"
   ```

2. **Run the migration script:**
   ```bash
   node scripts/apply-migrations-direct.mjs
   ```

### ⚠️ Note:

You need the **Postgres database password**, not the service role key. Get it from:
- Supabase Dashboard → Settings → Database → Connection string

---

## 🎯 Method 4: Using Service Role Key (Advanced)

If you have the service role key, you can use it with the Supabase REST API, but this requires creating a custom RPC function first. This is more complex and not recommended for migrations.

**Recommendation:** Use **Method 1** (Supabase Dashboard SQL Editor) instead.

---

## ✅ Verification After Migration

After applying all migrations, verify they were applied correctly:

### 1. Check Applied Migrations

Go to Supabase Dashboard → Database → Migrations

You should see all 14 migrations listed.

### 2. Check Database Linter

Go to Supabase Dashboard → Database → Linter

Verify there are no warnings for:
- ✅ Function search path security
- ✅ RLS policy performance
- ✅ Multiple permissive policies
- ✅ RLS enabled without policies
- ✅ Unindexed foreign keys

### 3. Run Verification Queries

Run these queries in SQL Editor to verify:

```sql
-- Verify Function Search Path Security (should return 8 rows)
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

---

## 🚨 Troubleshooting

### Error: "relation already exists"

This means the migration was already applied. This is okay - you can skip it or continue.

### Error: "permission denied"

Make sure you're using the service role key or have proper permissions. Use the Supabase Dashboard SQL Editor (Method 1) which has full permissions.

### Error: "syntax error"

Check the migration file for syntax errors. Make sure you copied the entire file correctly.

### Error: "connection refused"

Check your Supabase URL and ensure the project is active.

---

## 📞 Quick Links

- **Supabase Dashboard:** https://supabase.com/dashboard/project/nuwfdvwqiynzhbbsqagw
- **SQL Editor:** https://supabase.com/dashboard/project/nuwfdvwqiynzhbbsqagw/sql/new
- **Database Settings:** https://supabase.com/dashboard/project/nuwfdvwqiynzhbbsqagw/settings/database
- **Migrations:** https://supabase.com/dashboard/project/nuwfdvwqiynzhbbsqagw/database/migrations

---

## 🎯 Recommended Approach

**For users with service role key:**
- ✅ Use **Method 1** (Supabase Dashboard SQL Editor)
- It's the easiest and most reliable
- No additional setup required
- Full permissions automatically

**For users with Postgres password:**
- ✅ Use **Method 2** (Supabase CLI)
- Automated and fast
- Handles all migrations at once

---

**Status:** Ready to apply migrations  
**Last Updated:** $(date)

