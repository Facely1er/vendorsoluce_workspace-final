# VendorSoluce — Database Migrations

## Supabase Project
Schema: vs.*  (VendorSoluce schema-isolated namespace)
Shared schema: shared.* (run 008_shared_schema.sql separately —
  lives in the ERMITS unified repo, not here)

## Migration Index

| # | Filename | Description | Schema | Run order |
|---|----------|-------------|--------|-----------|
| 1 | contact-form-setup.sql | Creates `vs_contact_submissions` table for ERMITS contact form with RLS and index | public (vs_*) | 1 |

## How to Apply

### Via Supabase Dashboard (no CLI)
1. Open your Supabase project → SQL Editor
2. Run migrations in the order listed above, one at a time
3. Confirm each migration succeeds before running the next

### Via Supabase CLI
```bash
supabase db push
```

## Pending (not yet applied to production)
Verify against production schema before applying.

## Schema Map
- **vs_\*** — VendorSoluce application tables: contact form submissions (`vs_contact_submissions`), vendor assessments, subscriptions, and related application data
- **shared.\*** — cross-product infrastructure (org, members, attestation tokens) — applied separately from the ERMITS unified repo
