# VendorSoluce implementation baseline

> Extracted for alignment with CyberCorrect, CyberCaution, and shared ERMITS baselines.

This folder summarizes **what this VendorSoluce monorepo implements today** (routing, shell, shared packages, reporting surface) so other products can align without guessing.

## Documents

### [vendorsoluce-reference-baseline.md](./vendorsoluce-reference-baseline.md)

**Purpose:** Product surface, app bootstrap, provider tree, chrome, route constants, public vs workspace routes, `WorkspacePageShell`, `ermits-template`, packages, and how reporting differs from CyberCaution's registry pattern.

**Read this if:** You need the authoritative map of `packages/app` structure, MR/WR/AR/PR routes, or cross-product theme and lifecycle alignment.

---

### [vendorsoluce-known-debt-summary.md](./vendorsoluce-known-debt-summary.md)

**Purpose:** Known client-side persistence and licensing storage, backend verification notes, and multi-tenant areas to validate.

**Read this if:** You are hardening production, auditing data flows, or comparing to CyberCaution debt docs.

---

### [VENDORSOLUCE_NORMALIZATION_REFERENCE.md](./VENDORSOLUCE_NORMALIZATION_REFERENCE.md)

**Purpose:** Action-oriented checklist to **complete normalization**: route constants (`MR`/`WR`/`AR`/`PR`), shared tokens and `verify:ui`, shell/surface rules, ERMITS pack mapping, verification commands, and suggested work order.

**Read this if:** You are standardizing new work across app, website, and portal, or closing gaps against the design checklist and shared Tailwind enforcement.

---

### [WEBSITE_STATIC_NORMALIZATION.md](./WEBSITE_STATIC_NORMALIZATION.md)

**Purpose:** Static marketing site (`packages/website`): how `routes.json` feeds the route manifest, token/Tailwind verification, canonical `includes/` header and footer, intentional padding vs the general design checklist, and `npm run verify` / `npm run verify:website` workflow.

**Read this if:** You edit HTML, radar assets, or static chrome for VendorSoluce.

---

## Quick start by use case

| Goal | Start here |
|------|----------------|
| Understand how the app boots (main vs portal) | Reference baseline: Bootstrap |
| Trace providers and global chrome | Reference baseline: `AppProviders`, `AppChrome` |
| Find canonical paths | Reference baseline: Routes; `packages/shared/routes.json` |
| Align UI tokens / NIST template | Reference baseline: `ermits-template` |
| Finish cross-surface normalization (routes, tokens, verification) | [Normalization reference](./VENDORSOLUCE_NORMALIZATION_REFERENCE.md) |
| Static website (HTML, radar, embed pipeline) | [Website static normalization](./WEBSITE_STATIC_NORMALIZATION.md) |
| Assess localStorage / license / tenancy risk | Known debt summary |

---

## Maintenance and updates

1. After meaningful routing or shell changes, update the **reference baseline** sections that changed.
2. When fixing persistence or auth, update the **known debt** doc to reflect what is now server-backed.
3. Optionally note the repo commit hash and date in the updated section (same idea as CyberCaution baseline maintenance).

---

## Relation to CyberCaution

CyberCaution's `docs/baseline` describes **RiskWorkspace** (e.g. `ReportShell`, report definition registry, register-focused flows). This VendorSoluce baseline describes **this repo**: multi-surface app/portal/website, MR-heavy public routes, program pages such as VIRA reports, and tools (Vendor Risk Radar, NIST checklist, etc.) **without** assuming CyberCaution's reporting registry pattern. Use both baselines when aligning products: reuse concepts where intentional; do not assume identical reporting architecture.

---

**Status:** Baseline hub (VendorSoluce monorepo)  
**Last updated:** April 2026
