# Run Migration - Quick Guide

## Option 1: Supabase Dashboard (Easiest - Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Copy and Run Migration**
   - Open file: `supabase/migrations/20250116_add_compliance_frameworks.sql`
   - Copy **ALL** contents (Ctrl+A, Ctrl+C)
   - Paste into SQL Editor
   - Click **Run** button (or press Ctrl+Enter)

4. **Verify Success**
   - Should see: "Success. No rows returned"
   - If errors, check the error message

---

## Option 2: Supabase CLI (If Installed)

```bash
# Navigate to project directory
cd "C:\Users\facel\Downloads\GitHub\ERMITS_PRODUCTION\05-vendorsoluce"

# Link to your Supabase project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

---

## Verification Query

After running migration, execute this in SQL Editor to verify:

```sql
SELECT name, framework_type, is_active, estimated_time 
FROM vs_assessment_frameworks 
WHERE framework_type IN ('soc2_type_ii', 'iso_27001', 'fedramp', 'fisma', 'nist_sp_800_161')
ORDER BY name;
```

**Expected Result:** Should return 5 rows:
- FEDRAMP
- FISMA  
- ISO27001
- NIST
- SOC2

---

## Quick Copy-Paste SQL

If you just want to copy-paste the migration directly:

```sql
-- Copy everything below this line into Supabase SQL Editor
-- (The full migration is in: supabase/migrations/20250116_add_compliance_frameworks.sql)
```

