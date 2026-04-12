# ⚡ Next Steps: Fix RLS Policy Performance Issues

## ✅ What Was Fixed

All RLS policies have been updated to wrap `auth.uid()` and `auth.role()` calls in `(select ...)` to prevent re-evaluation for each row. This significantly improves query performance at scale.

### Fixed Issues:
1. ✅ **auth_rls_initplan warnings** - Fixed by wrapping `auth.uid()` in `(select auth.uid())`
2. ✅ **auth.role() calls** - Fixed by wrapping `auth.role()` in `(select auth.role())`

### Tables Fixed:
- `subscriptions` - 3 policies fixed
- `subscription_items` - 2 policies fixed
- `invoices` - 1 policy fixed
- `payment_methods` - 4 policies fixed
- `usage_tracking` - 3 policies fixed
- `customer_portal_sessions` - 2 policies fixed
- `vs_vendor_assessments` - 4 policies fixed
- `vs_assessment_responses` - 4 policies fixed
- `vs_profiles` - 3 policies fixed
- `vs_vendors` - 4 policies fixed
- `vs_sbom_analyses` - 4 policies fixed
- `vs_supply_chain_assessments` - 4 policies fixed
- `assets` - 4 policies fixed
- `asset_vendor_relationships` - 4 policies fixed
- `due_diligence_requirements` - 4 policies fixed
- `alerts` - 2 policies fixed
- `vs_customers` - 2 policies fixed
- `vs_prices` - 1 policy fixed
- `vs_subscriptions` - 2 policies fixed
- `vs_payment_methods` - 3 policies fixed
- `vs_invoices` - 2 policies fixed
- `vs_usage_records` - 2 policies fixed

**Total: ~60+ RLS policies fixed**

## ⚠️ Note on Multiple Permissive Policies

The `multiple_permissive_policies` warnings indicate that some tables have multiple permissive policies for the same role/action combination. These are less critical performance issues and can be addressed separately by consolidating policies. The current fix addresses the more critical `auth_rls_initplan` performance issue.

## 📋 Next Steps

### Step 1: Apply the Migration to Your Database

You have two options to apply the fixes:

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor**
4. Open the file: `supabase/migrations/20250108000001_fix_rls_policy_performance.sql`
5. Copy the entire contents
6. Paste into the SQL Editor
7. Click **Run** to execute

#### Option B: Using Supabase CLI

```bash
# Link to your project (if not already linked)
npx supabase link --project-ref YOUR_PROJECT_REF

# Apply the migration
npx supabase db push

# Or apply just this migration
npx supabase migration up
```

### Step 2: Verify the Fixes

After applying the migration, verify that the policies have been updated:

```sql
-- Check policy definitions (should see (select auth.uid()) instead of auth.uid())
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
ORDER BY tablename, policyname;
```

You should see `(select auth.uid())` in the policy definitions instead of `auth.uid()`.

### Step 3: Run Database Linter Again

1. Go to Supabase Dashboard → **Database** → **Linter**
2. Check that the `auth_rls_initplan` warnings are gone
3. All affected policies should no longer appear in the warnings list

### Step 4: Test the Policies

Verify that the RLS policies still work correctly:

```sql
-- Test that users can still access their own data
-- (These should work exactly as before, just faster)

-- Test subscription access
SELECT * FROM subscriptions WHERE user_id = auth.uid();

-- Test vendor access
SELECT * FROM vs_vendors WHERE user_id = auth.uid();

-- Test profile access
SELECT * FROM vs_profiles WHERE id = auth.uid();
```

### Step 5: Monitor Performance

After applying the fix, you should see improved query performance, especially for:
- Queries that scan many rows
- Tables with large datasets
- Complex queries with multiple RLS policy checks

## 🔍 Performance Impact

**Before:** `auth.uid()` was re-evaluated for each row, causing:
- Slower queries on large tables
- Increased CPU usage
- Poor query plan optimization

**After:** `(select auth.uid())` is evaluated once per query, resulting in:
- Faster queries (especially on large tables)
- Better query plan optimization
- Reduced CPU usage
- Improved scalability

## 📝 Files Modified

### New Migration File Created:
- ✅ `supabase/migrations/20250108000001_fix_rls_policy_performance.sql` - Fixes all RLS policy performance issues

## ⚠️ Important Notes

1. **No Breaking Changes**: These fixes are backward compatible and don't change policy behavior
2. **Security**: Security is maintained - policies work exactly the same, just more efficiently
3. **Testing**: All policies should work exactly as before, just faster
4. **Rollback**: If needed, you can rollback by removing the `(select ...)` wrappers

## ✅ Success Criteria

- [ ] Migration applied successfully
- [ ] All RLS policies updated with `(select auth.uid())` or `(select auth.role())`
- [ ] Database linter shows no `auth_rls_initplan` warnings
- [ ] All policies tested and working correctly
- [ ] Query performance improved (especially on large tables)
- [ ] Changes committed to git

## 🔄 Next: Multiple Permissive Policies (Optional)

If you want to address the `multiple_permissive_policies` warnings, you would need to:
1. Identify redundant policies
2. Consolidate them into single policies where appropriate
3. Ensure security is maintained
4. Test thoroughly

This is a separate optimization that can be done later if needed.

---

**Status:** Ready to apply migration  
**Priority:** High (Performance Fix)  
**Estimated Time:** 5-10 minutes  
**Impact:** Significant performance improvement for queries on large tables

