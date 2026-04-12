# ⚡ Quick Migration Execution Guide

**Date:** December 2025  
**Total Migrations:** 18 files  
**Estimated Time:** 5-10 minutes

---

## 🚀 Execute Migrations Now

### Step 1: Get Your Postgres Password

1. Go to: https://supabase.com/dashboard/project/nuwfdvwqiynzhbbsqagw/settings/database
2. Find **Connection string** section
3. Copy the password (the part after `postgres.` and before `@`)

### Step 2: Run Migration Script

**Windows PowerShell:**
```powershell
# Set password
$env:POSTGRES_PASSWORD = "paste_your_password_here"

# Execute migrations
.\EXECUTE_MIGRATIONS.ps1
```

**Alternative (Node.js - Cross-platform):**
```bash
# Set password
export POSTGRES_PASSWORD="paste_your_password_here"

# Execute migrations
node scripts/apply-migrations-direct.mjs
```

**Alternative (Supabase CLI):**
```bash
# Link and push
npx supabase link --project-ref nuwfdvwqiynzhbbsqagw --password "paste_your_password_here" --yes
npx supabase db push
```

### Step 3: Verify Completion

After execution, run in Supabase SQL Editor:
```sql
-- Copy and paste VERIFY_MIGRATION_COMPLETION.sql
```

---

## 📋 Migration Files (18 total - will run automatically)

1. 20250101000000_stripe_integration.sql
2. 20250108000000_fix_function_search_path.sql
3. 20250108000001_fix_rls_policy_performance.sql
4. 20250108000002_fix_multiple_permissive_policies.sql
5. 20250108000003_fix_rls_enabled_no_policy.sql
6. 20250108000004_fix_unindexed_foreign_keys.sql
7. 20250115_add_grace_period_tracking.sql
8. 20250115_vendor_assessments_tables.sql
9. 20250116_add_compliance_frameworks.sql
10. 20250117_add_onboarding_tracking.sql
11. 20250120_marketing_automation.sql
12. 20250701042959_crimson_waterfall.sql
13. 20250722160541_withered_glade.sql
14. 20250724052026_broad_castle.sql
15. 20251004090256_rename_tables_with_vs_prefix.sql
16. 20251004090354_rename_tables_with_vs_prefix.sql
17. 20251107_asset_management.sql
18. 20251204_stripe_integration.sql

---

## ✅ Success Indicators

After execution, you should see:
- ✅ "All migrations applied successfully"
- ✅ 18 migrations in Supabase Dashboard → Database → Migrations
- ✅ Verification script shows all checks passing

---

## 🆘 Need Help?

See **MIGRATION_EXECUTION_WITH_CREDENTIALS.md** for detailed instructions and troubleshooting.

---

**Ready to execute!** Just provide your Postgres password and run the script. 🚀

