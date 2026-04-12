# VendorSoluce reference baseline

Facts below are drawn from this repository (as of documentation update, April 2026). Paths are relative to the monorepo root unless noted.

---

## Bootstrap and surfaces

- **Entry:** `packages/app/src/main.tsx` chooses which root component to render.
- **Portal vs platform:** If `isVendorPortalDomain()` is true, the app dynamically imports and renders **`PortalApp`**. Otherwise it imports and renders **`App`**.
- **Local development:** In development, `VITE_FORCE_PORTAL=true` forces the portal app on any host (for example localhost). See `packages/shared/src/utils/domainDetection.ts` (re-exported from `packages/app/src/utils/domainDetection.ts`).
- **Comment in code:** The same bundle contains both apps so a separate Netlify (or similar) split is not required for portal vs platform on that axis.

---

## App shell: `App.tsx`

Structure:

`AppProviders` > `Router` (`BrowserRouter`) > `AppChrome` > `Suspense` (fallback: `PageLoader`) > `Routes`:

- `AuthRoutes`
- `PublicRoutes`
- `WorkspaceRoutes`
- Catch-all: `NotFoundPage`

Source: `packages/app/src/App.tsx`.

---

## `AppProviders`

Nesting order (outer to inner):

1. `I18nProvider`
2. `ThemeProvider`
3. `ErrorBoundary`
4. `AuthProvider`
5. `SubscriptionProvider`
6. `ChatbotProvider` (wraps children)

Source: `packages/app/src/app/AppProviders.tsx`.

---

## `AppChrome`

Renders the global frame around routed content:

- `NotificationManager`
- `DemoModeBanner`
- `TrialModeBanner`
- `Navbar`
- `MainWrapper` (page content)
- `Footer`
- `ChatWidget`
- **Vercel Analytics:** Rendered when `enableVercelAnalytics` is true (controlled by `VITE_VERCEL_ANALYTICS`, `VERCEL`, and hostname ending in `.vercel.app`).

Source: `packages/app/src/app/AppChrome.tsx`.

---

## Route constants: `routes.json` and MR / WR / AR / PR

- **Canonical JSON:** `packages/shared/routes.json` defines objects `marketing`, `workspace`, `auth`, and `portal`.
- **Exports:** `packages/shared/src/constants/routes/index.ts` imports that JSON and exports:
  - `MR` — marketing routes
  - `WR` — workspace routes
  - `AR` — auth routes
  - `PR` — portal routes

---

## Workspace routes (`WR`) — table

Paths are the string values in `routes.json` under `workspace`.

| Key | Path |
|-----|------|
| `PLATFORM_SETUP` | `/platform-setup` |
| `ONBOARDING` | `/onboarding` |
| `PROFILE` | `/profile` |
| `BILLING` | `/billing` |
| `ACCOUNT` | `/account` |
| `USER_DASHBOARD` | `/user-dashboard` |
| `USER_ACTIVITY` | `/user-activity` |
| `NOTIFICATIONS` | `/notifications` |
| `ASSET_MANAGEMENT` | `/asset-management` |
| `ASSETS_ALIAS` | `/assets` |
| `TEAM_COLLABORATE` | `/team/collaborate` |
| `TEAM_RACI` | `/team/raci` |
| `TEAM_STAKEHOLDERS` | `/team/stakeholders` |
| `VENDOR_INTELLIGENCE` | `/workspace/vendors` |
| `VENDOR_GRAPH_IMPORT` | `/workspace/vendors/import` |
| `VENDOR_INTELLIGENCE_DETAIL` | `/workspace/vendors/:vendorId` |

---

## Public surface (`PublicRoutes` / `MR`)

`packages/app/src/app/routes/publicRoutes.tsx` registers a large **marketing (`MR`)** surface, including:

- **Marketing / site:** home and dashboard variants (`ConditionalDashboard`), pricing, checkout (or contact-sales when `VITE_LICENSE_MODE === 'true'`), contact, legal pages, downloads, templates, how-it-works, API docs, integration guides, hosting options, demo, trial.
- **Tools:** NIST checklist, Vendor Risk Radar, Vendor Risk Calculator, Vendor Privacy Assessment, DPIA, Data Inventory (paths from `MR` in `routes.json`).
- **Programs:** Vendor Activity Catalog, NIST Implementation workflow (`PROGRAM_NIST_IMPLEMENTATION`), VIRA Due Diligence (`PROGRAM_VIRA_DUE_DILIGENCE`), VIRA Reports (`VIRA_REPORTS`).
- **Assessments / results:** Supply chain and FedRAMP assessment and results routes.
- **Workspace-adjacent on public MR paths:** vendor requirements, vendors dashboard, vendor onboarding, vendor assessments listing, vendor portal redirect, etc.
- **Admin (protected):** `ADMIN_VENDORS`, `ADMIN_MARKETING`, `ADMIN_MARKETING_NEW_CAMPAIGN` use `ProtectedRoute` wrapping the corresponding admin pages.

Auth route `AR.RESET_PASSWORD` is also registered here. Legacy paths redirect with `Navigate` where defined.

---

## `WorkspacePageShell`

- **File:** `packages/app/src/components/vendorsoluce-intelligence/WorkspacePageShell.tsx`
- **Role:** Workspace page layout: hero section (eyebrow, title, description, optional action buttons), optional stat cards, then a grid of child content.
- **UI:** Uses `Button` and `Card` / `CardContent` from `packages/app/src/components/ui/`, and `cn` from `packages/app/src/utils/cn`.

---

## `ermits-template` (NIST / ERMITS baseline)

- **Location:** `packages/app/src/lib/ermits-template/` (synced copy; see `README.md` in that folder — not a published npm dependency).
- **Themes:** `theme/tokens.ts` defines `THEME_BASELINE_LIGHT` and `THEME_BASELINE_DARK` (`ThemeTokens` interface) and `mergeTheme` for brand overrides. Comments note alignment across CyberCaution, VendorSoluce, and CyberCorrect token names.
- **Lifecycle:** `lifecycle/phases.ts` exports `LIFECYCLE_PHASES` (onboarding through reporting/export); comments reference CyberCaution, VendorSoluce, and CyberCorrect running the same lifecycle with different feature activation.
- **Contracts:** `services/contracts.ts` defines TypeScript service interfaces (assessment, evidence, POA&M, gap, RACI, export, onboarding, environment config, normalization, enrichment, DPIA, privacy compliance, collaboration). Header and DPIA/collaboration sections explicitly mention **CyberCorrect** (and other products) as intended implementers or consumers.

Imports typically use paths such as `@/lib/ermits-template` or relative imports from `../lib/ermits-template` per local README.

---

## Packages (from root `README.md`)

- `packages/app` — main workspace application (operator workflows, vendor intelligence, assessments, reporting, governance).
- `packages/vendor-risk-portal` — standalone vendor-facing portal.
- `packages/website` — static marketing website.
- `packages/shared` — shared routes, UI primitives, runtime helpers, shell utilities, domain contracts.
- `packages/dependency-graph` — dependency graph engine, scoring, scenarios, import pipeline, HTML export templates.

Architecture note in the root README: website, workspace, and portal are built as distinct surfaces; shared route constants live under `packages/shared`.

---

## Reporting surface (not CyberCaution `ReportShell`)

- This codebase does **not** use a **`ReportShell`** component (no matches under `packages/app` for that identifier).
- Reporting and program-style outputs are exposed through **dedicated pages** wired in public routes — for example **`ViraReportsPage`** (`MR.VIRA_REPORTS`), plus **tool** experiences such as **Vendor Risk Radar** and the **NIST checklist** (`MR.NIST_CHECKLIST` / related navigations).
- **Contrast with CyberCaution:** CyberCaution baseline documentation centers on a **report definition registry**, **`ReportShell`**, and generator/export patterns. VendorSoluce here favors **route-level program and tool pages** and shared `ermits-template` contracts; align at the product level without assuming the same registry implementation.

---

## Cross-product alignment

- **Shared routes and types:** `packages/shared` and `ermits-template` types/contracts are the main cross-repo alignment points for routes, theme token names, and service interface shapes.
- **Theme:** `THEME_BASELINE_LIGHT` / `THEME_BASELINE_DARK` are explicitly framed as a common baseline across CyberCaution, VendorSoluce, and CyberCorrect (see `theme/tokens.ts`).
- **Lifecycle and compliance narrative:** `LIFECYCLE_PHASES` and framework/feature registries under `ermits-template` tie VendorSoluce to the same phased story as sibling products, with per-product branding and feature flags.
- **CyberCaution consumers:** When reading CyberCaution `docs/baseline`, treat VendorSoluce as a **vendor- and portal-oriented surface** with a **different reporting UX pattern** (no `ReportShell` in this app package) unless a future change introduces it.

---

**Document type:** Reference baseline (VendorSoluce monorepo)  
**Last updated:** April 2026

