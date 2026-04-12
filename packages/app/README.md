# App Package

This package contains the VendorSoluce workspace application.

## Primary folders

- `src/app/` — app bootstrap, providers, chrome, and route composition
- `src/pages/` — page ownership by surface and module
- `src/services/vendorsoluce/` — vendor intelligence and graph-backed service layer
- `src/stores/` — application state stores
- `src/components/` — UI and module-specific components
- `supabase/migrations/` — database migrations used by the app package
- `scripts/` — build and verification scripts
- `docs/archive/root-notes/` — archived implementation notes and historical status files moved out of the package root

## Operational notes

- Build: `npm run build -w app`
- Type-check: `npm run type-check -w app`
- Verify shell contract: `npm run verify:shell -w app`

## Cleanup policy

The package root should stay focused on source, config, and operational entrypoints.
Historical status notes, one-off completion summaries, and temporary migration narratives belong under `docs/archive/` rather than in the package root.

## Repository hygiene

Historical notes and transient artifacts were archived under `docs/archive/` during finalization to keep the package root operational.
