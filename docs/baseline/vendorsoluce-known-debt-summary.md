# VendorSoluce known debt summary

This document lists **known client-side persistence and verification gaps** inferred from the current codebase. It is not a full security audit.

---

## localStorage: workspace local store

**File:** `packages/app/src/services/local/workspaceLocalStore.ts`

- Persists **vendors** and **supply chain assessments** under keys `vendorsoluce.local.vendors` and `vendorsoluce.local.assessments`.
- Uses `readJson` / `writeJson` against `window.localStorage` for the happy path; seed data is created when empty.
- Data is filtered by `user_id` after load, but storage is still **browser-local** and not a substitute for authoritative server state.

**Recommendation:** Verify which flows are backed by **Supabase** (or another backend) in production and that local storage is only a fallback, cache, or dev path. Document the intended source of truth per feature.

---

## localStorage: license service (enterprise / on-premise mode)

**File:** `packages/app/src/services/licenseService.ts`

- Stores validated license payload under key `vs_license` (and auxiliary key storage for the raw key) when **license mode** is active.
- Comment in file: enterprise on-premise builds; no Stripe dependency; license held in localStorage after validation.
- Notes that production would verify a signature or call a license server (still a design gap if not implemented).

**Recommendation:** Confirm signing or server validation for any production on-prem deployment; treat stored keys as sensitive in threat models.

---

## Multi-tenant and organization scoping

- Shared **ermits** contracts (`packages/app/src/lib/ermits-template/services/contracts.ts`) reference **organization** and **tenant** concepts in interface shapes (for example `listByOrganization`, `tenantId`).
- **Action item:** Treat **multi-tenant isolation** (RLS, org IDs on rows, cross-tenant leakage tests) as an **area to verify** for this product, independent of CyberCaution's known debt. Align implementation with Supabase RLS and app-layer checks where applicable.

---

## Supabase / backend coverage

- The app includes Supabase client types (`database.types.ts`, etc.) and services may target remote tables. **Do not assume** every UI path that still touches `workspaceLocalStore` is fully mirrored server-side.

**Recommendation:** Maintain a short internal matrix: feature → primary store (Supabase vs local vs hybrid) → sync strategy.

---

## Relation to CyberCaution debt docs

CyberCaution `cybercaution-known-debt-summary.md` emphasizes register persistence and multi-user readiness. VendorSoluce has **overlapping themes** (localStorage, tenancy) but **different surfaces** (portal split, MR-heavy public routes, vendor intelligence). Use this file for **this repo**; cross-reference CyberCaution only where behaviors are intentionally shared.

---

**Last updated:** April 2026
