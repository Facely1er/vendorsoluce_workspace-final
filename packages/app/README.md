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

## Build modes & output directories

The Vite config supports three build variants, each producing a distinct output directory:

| Script | Mode / Env var | `outDir` | Notes |
|---|---|---|---|
| `npm run build` | production (default) | `dist` | Standard production build |
| `npm run build:demo:react` | `--mode demo` or `BUILD_MODE=demo` | `dist-demo` | Demo build — sourcemaps on, console logs kept, Stripe live keys blocked |
| `npm run build:enterprise` | `--mode enterprise` or `VITE_LICENSE_MODE=true` | `dist-enterprise` | Enterprise / license build — Stripe removed |

### Base path (`VITE_BASE_PATH`)

The Vite `base` option is driven by the `VITE_BASE_PATH` environment variable and defaults to `'/'`.
Set it when deploying to a non-root sub-path:

```sh
VITE_BASE_PATH=/app/ npm run build
```

Dynamic imports and asset URLs will automatically use the configured base.

### Preview scripts

| Script | Serves | Port |
|---|---|---|
| `npm run preview` | `dist` (production build) | 4173 |
| `npm run preview:demo` | `demo/` static directory | — |
| `npm run preview:enterprise` | `dist-enterprise` | 4174 |

### Cleaning build outputs

```sh
npm run clean   # removes dist/, dist-demo/, dist-enterprise/, and node_modules/
```

## Operational notes

- Build: `npm run build -w app`
- Type-check: `npm run type-check -w app`
- Verify shell contract: `npm run verify:shell -w app`

## Cleanup policy

The package root should stay focused on source, config, and operational entrypoints.
Historical status notes, one-off completion summaries, and temporary migration narratives belong under `docs/archive/` rather than in the package root.

## Repository hygiene

Historical notes and transient artifacts were archived under `docs/archive/` during finalization to keep the package root operational.
