# VendorSoluce normalization reference

**Purpose:** Finish cross-surface **normalization** (routing, tokens, shells, verification) so the monorepo stays consistent with ERMITS expectations and with its own documented baselines.

**Audience:** Engineers touching `packages/app`, `packages/website`, `packages/vendor-risk-portal`, or `packages/shared`.

**Companion docs:**

| Document | Use for |
|----------|---------|
| [vendorsoluce-reference-baseline.md](./vendorsoluce-reference-baseline.md) | What exists today (bootstrap, providers, `MR`/`WR`/`AR`/`PR`, `WorkspacePageShell`, `ermits-template`) |
| [vendorsoluce-known-debt-summary.md](./vendorsoluce-known-debt-summary.md) | Persistence, licensing, tenancy gaps |
| [../DESIGN-SYSTEM-CHECKLIST.md](../DESIGN-SYSTEM-CHECKLIST.md) | Brand colors, layout, shell, theming rules |
| ERMITS Canonical Design System Pack (same multi-repo deployment root as this monorepo, if present) | ERMITS-wide layer model (tokens, `components/ui`, layout shells) |

---

## 1. Definition of “normalized” (target state)

Normalization is complete when all of the following are true:

1. **Routes** — New UI and links use **`MR` / `WR` / `AR` / `PR`** from `packages/shared/src/constants/routes` (backed by `packages/shared/routes.json`). Avoid ad hoc path strings except in redirect definitions or one-off legacy `Navigate` targets that are explicitly documented.
2. **Color and theme** — No raw hex and no arbitrary Tailwind color fragments in app/portal source outside the **allowlisted sinks** enforced by `verify:ui-inline` (see `packages/shared/README.md`). Shared brand values live in **`packages/shared/tailwind-colors.js`** and consumed via Tailwind + shared config.
3. **Surfaces** — **Website**, **app** (platform), and **portal** share the same brand tokens and spacing conventions per `DESIGN-SYSTEM-CHECKLIST.md` (max width, padding, dark mode discipline).
4. **Verification** — `npm run verify:ui` (repo root) passes after changes that touch styling or Tailwind config.
5. **Cross-product contracts** — Theme and lifecycle alignment with sibling products continues to flow through **`packages/app/src/lib/ermits-template`** (`theme/tokens.ts`, `lifecycle/phases.ts`, `services/contracts.ts`) without forking duplicate token philosophies inside feature folders.

---

## 2. ERMITS design system pack vs this repo (mapping)

The ERMITS pack (CyberCaution reference) expects layers such as `src/design/tokens.css` and `src/components/ui/` at a single app root. **VendorSoluce is a monorepo** and uses a **deliberate equivalent**:

| ERMITS pack expectation | VendorSoluce implementation |
|-------------------------|-----------------------------|
| Token layer in dedicated CSS files | **`packages/shared/tailwind-colors.js`** + **`sharedTheme`** in shared Tailwind config; app **`index.css`** for `:root` / `.dark` variables |
| One `components/ui` primitive set | **`packages/app/src/components/ui/`** (platform); portal has its own tree — both must pull colors from shared Tailwind, not new hex |
| Marketing / workspace / assessment / report shells | **Single `AppChrome`** (Navbar, MainWrapper, Footer) for platform routes; **portal** uses `PortalApp` with `PortalNav` / `PortalFooter`; **website** uses static includes. Full **shell split** (e.g. separate MarketingShell) is **not** required for normalization if behavior and visuals match the checklist — optional future refactor |
| No inline styles | Prefer **Tailwind + `cn()`**; **`inlineUiTokens.ts`** and PDF/email allowlists are exceptions |

**Action:** When adding features, do **not** introduce a second token file with competing `--accent` / `--bg` semantics. Extend `tailwind-colors.js` and shared config if a new semantic color is truly required.

---

## 3. Workstreams and completion checklist

### A. Route constants (`MR` / `WR` / `AR` / `PR`)

- [ ] **Add or change paths only in** `packages/shared/routes.json`, then use exported constants.
- [ ] **Grep** for hardcoded paths in new code (`/workspace/vendors`, `/pricing`, etc.) and replace with `MR.*` / `WR.*` / `AR.*` / `PR.*` where practical.
- [ ] **Document** any remaining legacy strings (e.g. redirects) with a one-line comment in `publicRoutes.tsx` / `workspaceRoutes.tsx`.

**Sources:** `packages/shared/src/constants/routes/index.ts`, `packages/app/src/app/routes/*.tsx`.

---

### B. UI tokens and Tailwind

- [ ] After editing **`tailwind.config.js`** in app, website, or portal, confirm **`sharedTheme`** import per `packages/shared/README.md`.
- [ ] Run **`npm run verify:ui`** from monorepo root before merge.
- [ ] Keep **Vendor Risk Radar** and static radar HTML aligned with **`verify-static-radar-design`** when touching `packages/website/radar/` or radar CSS.

---

### C. App shell and surface clarity

- [ ] **Platform:** `AppProviders` → `Router` → `AppChrome` → routes (see reference baseline). Do not duplicate global Navbar/Footer inside individual pages unless there is a documented exception (fullscreen flows).
- [ ] **Portal:** `PortalApp` path — do not mix portal layout components into platform routes.
- [ ] **Workspace density:** Prefer **`WorkspacePageShell`** for vendor intelligence and similar workspace pages for consistent hero + grid layout (`packages/app/src/components/vendorsoluce-intelligence/WorkspacePageShell.tsx`).

---

### D. Provider order (document when changing)

Current order (**outer → inner**): `I18nProvider` → `ThemeProvider` → `ErrorBoundary` → `AuthProvider` → `SubscriptionProvider` → `ChatbotProvider`.

If you add a context (e.g. org, entitlements), **update** `vendorsoluce-reference-baseline.md` § `AppProviders` so the baseline stays accurate.

---

### E. Reporting and programs (avoid wrong patterns)

- [ ] Do **not** assume CyberCaution’s **`ReportShell`** + report registry — this app uses **route-level program and tool pages** (see reference baseline § Reporting surface).
- [ ] For export/PDF flows, reuse **`ermits-template`** contracts and existing PDF/html helpers rather than new ad hoc generators.

---

### F. Website static package

- [x] **Header/footer** — Canonical sources: `packages/website/includes/header.html`, `footer.html`; `embed-header-footer.js` propagates on `npm run build`. See [WEBSITE_STATIC_NORMALIZATION.md](./WEBSITE_STATIC_NORMALIZATION.md) for nav vs body padding (static site uses a deliberate tighter nav strip than the generic checklist row).
- [x] **Routes** — `generate-route-manifest.mjs` reads `packages/shared/routes.json` (same as `MR`).
- [x] **Verification** — `npm run verify` in `packages/website` passes; root **`npm run verify:website`** runs the same suite.

---

### G. Backend and persistence (normalization of “truth”)

Not strictly UI normalization, but blocks a coherent product story:

- [ ] Maintain a short **feature → store** matrix (Supabase vs `workspaceLocalStore` vs hybrid) per `vendorsoluce-known-debt-summary.md`.
- [ ] License / enterprise mode: follow `licenseService` notes; do not treat localStorage as authoritative for multi-user production without explicit design.

---

## 4. Verification commands (run from repo root)

| Command | Purpose |
|---------|---------|
| `npm run verify:ui` | UI token import + inline color rules (`shared` scripts) |
| `npm run type-check` | TypeScript across app + portal |
| `npm run build:app` | Production build app |
| `npm run build:website` | Static site build |
| `npm run build:portal` | Portal build |

Use package-level `npm run verify` for website when documented in `packages/website/package.json`.

---

## 5. Suggested order of work

1. **Lock routes** — Any open PRs that add hardcoded paths: switch to `MR`/`WR`/`AR`/`PR`.
2. **Pass `verify:ui`** — Fix Tailwind/hex violations before large UI refactors.
3. **Align new pages** with `WorkspacePageShell` or existing layout primitives before adding bespoke page frames.
4. **Reconcile docs** — After behavioral changes, update `vendorsoluce-reference-baseline.md` and this file’s checklist if the definition of “normalized” shifts.

---

## 6. Revision history

| Date | Notes |
|------|--------|
| 2026-04-12 | Initial normalization reference (complements `vendorsoluce-reference-baseline.md` and `DESIGN-SYSTEM-CHECKLIST.md`) |
