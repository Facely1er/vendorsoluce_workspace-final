# VendorSoluce Monorepo

Production-oriented monorepo for the VendorSoluce platform, organized as distinct product surfaces with shared runtime primitives and a graph-backed dependency intelligence engine.

## Packages

- `packages/app` — main workspace application for operator workflows, vendor intelligence, assessments, reporting, and governance
- `packages/vendor-risk-portal` — standalone vendor-facing portal for intake and assessment flows
- `packages/website` — static marketing website
- `packages/shared` — shared routes, UI primitives, runtime helpers, shell utilities, and domain contracts
- `packages/dependency-graph` — dependency graph engine, scoring, scenarios, import pipeline, and HTML export templates

## Architecture summary

- Surface separation is explicit: website, workspace, and portal are built independently.
- Shared route constants and runtime helpers are centralized under `packages/shared`.
- Vendor intelligence is graph-backed and integrated into the workspace service/store layer.
- Portal runtime is no longer bootstrapped through the app package.

## Primary commands

From repo root:

- `npm install`
- `npm run build:app`
- `npm run build:portal`
- `npm run build:website`
- `npm run type-check`

## Package notes

- See `packages/app/README.md` for workspace package notes.
- See `packages/shared/README.md` for shared package notes.
- Archived historical notes were intentionally moved out of package roots into `docs/archive/` locations to reduce operational clutter.
