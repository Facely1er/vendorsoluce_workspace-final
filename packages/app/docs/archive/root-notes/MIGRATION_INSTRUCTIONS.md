# Database Migration Instructions
## Adding Compliance Frameworks (SOC2, ISO 27001, FedRAMP, FISMA)

**Migration File:** `supabase/migrations/20250116_add_compliance_frameworks.sql`

---

## Quick Start

### Option 1: Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor**

2. **Run Migration**
   - Click **New Query**
   - Copy the entire contents of `supabase/migrations/20250116_add_compliance_frameworks.sql`
   - Paste into the SQL Editor
   - Click **Run** (or press Ctrl+Enter)

3. **Verify Success**
   - Check for "Success. No rows returned" message
   - Navigate to **Table Editor** → `vs_assessment_frameworks`
   - Verify you see the new frameworks:
     - SOC2
     - ISO27001
     - FEDRAMP
     - FISMA
     - NIST (if not already present)

---

### Option 2: Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push

# Or run specific migration
supabase migration up 20250116_add_compliance_frameworks
```

---

### Option 3: Direct SQL Execution

If you have direct database access:

```bash
psql -h [your-host] -U [your-user] -d [your-database] -f supabase/migrations/20250116_add_compliance_frameworks.sql
```

---

## What This Migration Does

1. **Extends Framework Type Constraint**
   - Adds support for: `soc2_type_ii`, `iso_27001`, `fedramp`, `fisma`, `nist_sp_800_161`
   - Maintains backward compatibility with existing types

2. **Inserts Framework Definitions**
   - Creates framework records in `vs_assessment_frameworks` table
   - Sets appropriate metadata (name, description, estimated_time)
   - Marks all as active

3. **Creates Performance Indexes**
   - Index on `framework_type` for faster queries
   - Partial index on `is_active = true` for active framework lookups

4. **Adds Documentation**
   - Table and column comments for clarity

---

## Verification Steps

After running the migration:

### 1. Check Framework Records

```sql
SELECT name, framework_type, is_active, estimated_time 
FROM vs_assessment_frameworks 
WHERE framework_type IN ('soc2_type_ii', 'iso_27001', 'fedramp', 'fisma', 'nist_sp_800_161')
ORDER BY name;
```

**Expected Result:** 5 rows (SOC2, ISO27001, FEDRAMP, FISMA, NIST)

### 2. Verify Constraint

```sql
-- This should succeed
INSERT INTO vs_assessment_frameworks (name, framework_type, is_active)
VALUES ('Test SOC2', 'soc2_type_ii', true);

-- Clean up test
DELETE FROM vs_assessment_frameworks WHERE name = 'Test SOC2';
```

### 3. Test Framework Selection

In the application:
1. Go to **Vendor Assessments** page
2. Click **Create New Assessment**
3. Verify all frameworks appear in the dropdown:
   - CMMC Level 1
   - CMMC Level 2
   - NIST Privacy
   - **SOC2** ← New
   - **ISO27001** ← New
   - **FEDRAMP** ← New
   - **FISMA** ← New
   - **NIST** ← New (if not already present)

### 4. Verify Pricing Page

1. Go to **Pricing** page
2. Check the **Features Comparison** table
3. Verify frameworks show as ✓ for appropriate tiers:
   - **Enterprise:** NIST, CMMC, SOC2, ISO 27001, FedRAMP, FISMA
   - **Federal:** FedRAMP, FISMA, NIST, CMMC

---

## Troubleshooting

### Error: Constraint Already Exists

If you see an error about the constraint already existing:

```sql
-- Check current constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'vs_assessment_frameworks'::regclass 
AND contype = 'c';

-- If needed, manually drop and recreate
ALTER TABLE vs_assessment_frameworks 
DROP CONSTRAINT IF EXISTS vs_assessment_frameworks_framework_type_check;

-- Then re-run the migration
```

### Error: Duplicate Key

If frameworks already exist:

```sql
-- Check existing frameworks
SELECT name, framework_type FROM vs_assessment_frameworks;

-- The migration uses ON CONFLICT DO NOTHING, so duplicates are safe
-- But you can manually insert if needed
```

### Frameworks Not Appearing in UI

1. **Check RLS Policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'vs_assessment_frameworks';
   ```

2. **Verify is_active = true:**
   ```sql
   SELECT name, is_active FROM vs_assessment_frameworks;
   ```

3. **Check Application Logs:**
   - Look for errors in browser console
   - Check Supabase logs for query errors

---

## Rollback (If Needed)

If you need to rollback this migration:

```sql
-- Remove framework records (optional - they're safe to keep)
DELETE FROM vs_assessment_frameworks 
WHERE framework_type IN ('soc2_type_ii', 'iso_27001', 'fedramp', 'fisma', 'nist_sp_800_161');

-- Restore original constraint (if you had one)
ALTER TABLE vs_assessment_frameworks 
DROP CONSTRAINT IF EXISTS vs_assessment_frameworks_framework_type_check;

ALTER TABLE vs_assessment_frameworks
ADD CONSTRAINT vs_assessment_frameworks_framework_type_check 
CHECK (framework_type IN ('cmmc_level_1', 'cmmc_level_2', 'nist_privacy', 'custom'));

-- Drop indexes (optional)
DROP INDEX IF EXISTS idx_assessment_frameworks_type;
DROP INDEX IF EXISTS idx_assessment_frameworks_active;
```

---

## Post-Migration Checklist

- [ ] Migration executed successfully
- [ ] Framework records visible in database
- [ ] Frameworks appear in vendor assessment dropdown
- [ ] Pricing page shows frameworks correctly
- [ ] Can create assessment with new frameworks
- [ ] No errors in application logs

---

## Next Steps

After migration:

1. **Test Framework Selection**
   - Create a test vendor assessment with each new framework
   - Verify assessment creation works

2. **Add Framework Questions (Optional)**
   - Questions can be added incrementally
   - System works with 0 questions initially
   - Questions can be added via:
     - Database migrations (seed data)
     - Admin interface (if created)
     - Manual SQL inserts

3. **Update Documentation**
   - Update user guides if needed
   - Update API documentation if applicable

---

**Migration Created:** December 2025  
**Status:** Ready to Execute

