# VendorSoluce database migrations

Run in order using the Supabase CLI:
  supabase db push

Or apply individually in Supabase SQL Editor in timestamp order.

## Migration sequence

- `20250101000000_stripe_integration.sql`: Create Stripe integration schema (subscriptions, invoices, payment methods, usage tracking, webhooks, portal sessions) and RLS policies.
- `20250101_create_vendor_requirements.sql`: Create `vendor_requirements` table for Stage 2 requirements/gaps and related trigger/indexes.
- `20250108000000_fix_function_search_path.sql`: Harden database functions with explicit `SET search_path` to address linter/security warnings.
- `20250108000001_fix_rls_policy_performance.sql`: Improve RLS policy performance by avoiding per-row re-evaluation of `auth.*()` calls.
- `20250108000002_fix_multiple_permissive_policies.sql`: Consolidate redundant permissive RLS policies (service role scoping and cleanup).
- `20250108000003_fix_rls_enabled_no_policy.sql`: Add missing RLS policies for tables that had RLS enabled without policies.
- `20250108000004_fix_unindexed_foreign_keys.sql`: Add indexes for foreign key columns to improve join and constraint performance.
- `20250115000001_vendor_assessments_tables.sql`: Create vendor assessment framework/questions/assessments/responses tables with RLS and indexes.
- `20250115_add_grace_period_tracking.sql`: Add grace-period and read-only tracking columns to `vs_subscriptions` with supporting indexes.
- `20250116_add_compliance_frameworks.sql`: Extend framework types and seed additional frameworks (SOC2, ISO 27001, FedRAMP, FISMA).
- `20250116_add_refund_requests.sql`: Create `vs_refund_requests` table for refund request tracking and indexes/comments.
- `20250117_add_onboarding_tracking.sql`: Add onboarding progress columns to `vs_profiles` plus an onboarding status index.
- `20250120_marketing_automation.sql`: Create marketing automation tables (campaigns, templates, workflows, sends) and supporting schema.
- `20250120000001_fix_duplicate_permissive_policies.sql`: Remove duplicate permissive RLS policies to avoid policy evaluation/perf issues.
- `20250302000000_trial_mode_default_tier.sql`: Ensure trial-mode defaults to the free tier and update `check_usage_limit` to treat null tiers as free.
- `20250322120000_portal_vendor_assessment_access.sql`: Add portal snapshot + answers table and SECURITY DEFINER RPCs for vendor portal load/save flows.
- `20260327000000_portal_submit_vendor_assessment.sql`: Add SECURITY DEFINER RPC to submit vendor assessments (`in_progress` → `submitted`).
- `20250701042959_crimson_waterfall.sql`: Create the initial core schema (profiles/vendors/SBOM/assessments/contact submissions) with RLS, policies, indexes, triggers.
- `20250722160541_withered_glade.sql`: Add `is_first_login` to `profiles` to support onboarding flow triggers.
- `20250724052026_broad_castle.sql`: Fix `profiles` RLS policies to allow user signup with correct `auth.uid()` usage.
- `20251004090256_rename_tables_with_vs_prefix.sql`: Rename core tables to `vs_` prefixed versions, recreate policies/indexes/triggers, and add missing columns.
- `20251004090354_rename_tables_with_vs_prefix.sql`: Continue `vs_` prefix migration and ensure RLS/policies/indexes/triggers are recreated safely.
- `20251005000000_contact_form_standalone.sql`: Ensure `vs_contact_submissions` exists (rename or create) with RLS and insert policy.
- `20251107_asset_management.sql`: Add asset inventory, asset-vendor relationships, due diligence requirements, and alerts tables with RLS and indexes.
- `20251204_stripe_integration.sql`: Add `vs_*` Stripe billing tables (customers/prices/subscriptions/invoices/payment methods/usage) with RLS and helper functions.
- `20260411_vendorsoluce_graph.sql`: Create vendor graph schema (orgs, nodes, edges, centrality metrics, critical paths, scenario runs, aliases) with indexes.
- `20260411_vendorsoluce_rls.sql`: Enable RLS and install read-only select policies for vendor graph tables.

## Adding new migrations

Name new files: YYYYMMDDHHMMSS_description.sql
Always use IF NOT EXISTS, DROP POLICY IF EXISTS before CREATE POLICY,
and CREATE OR REPLACE for functions and triggers.

