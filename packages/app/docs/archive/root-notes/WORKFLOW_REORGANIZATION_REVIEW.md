# App Project Reorganization for Website Workflow Alignment

**Date:** March 2025  
**Purpose:** Review and document the reorganization needed in the App project for clear alignment with the website workflow

---

## Executive Summary

The App project has **routing and navigation misalignment** with the website workflow. Stage 2 of the vendor workflow is **Vendor Requirements Definition** (`/vendor-requirements`), but the App and website currently route users to **Supply Chain Assessment** (`/supply-chain-assessment`), which is the **Foundation Track** (VRM program maturity), not Stage 2.

**Critical fix:** Route Stage 2 to `/vendor-requirements` everywhere.

---

## Website Workflow Definition

From `index.html`, `how-it-works.html`, and `best-practices.html`:

| Stage | Title | Outcome | Correct Route |
|-------|-------|---------|---------------|
| **1** | Discover Your Vendor Exposure | "I know exactly which vendors pose the greatest risk" | `/vendor-risk-radar` |
| **2** | Understand Your Compliance Gaps | "I know exactly which security controls and compliance requirements I need from each vendor based on their risk level" | `/vendor-requirements` |
| **3** | Close the Compliance Gaps | "I have evidence-based proof of vendor compliance" | `/vendor-assessments` |

**Foundation Track (separate):** Supply Chain Assessment — evaluates YOUR organization's VRM maturity. Route: `/supply-chain-assessment`.

---

## Current vs Required State

### Stage 2 Routing Mismatch

| Location | Current | Required |
|----------|---------|----------|
| **JourneyProgress.tsx** | `path: '/supply-chain-assessment'` | `path: '/vendor-requirements'` |
| **Website index.html** | CTA → `platform.../supply-chain-assessment` | CTA → `platform.../vendor-requirements` |
| **Website best-practices.html** | Stage 2 nav → `supply-chain-assessment` | Stage 2 nav → `vendor-requirements` |
| **VendorRiskRadar.tsx** | "Continue to Stage 2" → `/supply-chain-assessment` | → `/vendor-requirements` |
| **App Navbar toolItems** | Supply Chain Assessment listed (no Vendor Requirements) | Add Vendor Requirements, reorder by workflow |

### How-It-Works Page Links

| Card | Current Link | Required |
|------|--------------|----------|
| Card 1 (Radar) | `radar/vendor-threat-radar.html` | ✅ OK (or `platform.../vendor-risk-radar`) |
| Card 2 (Assessment) | `platform.vendorsoluce.com` (generic) | `platform.../vendor-requirements` |
| Card 3 (Due Diligence) | `platform.vendorsoluce.com` (generic) | `platform.../vendor-assessments` or `portal.vendorsoluce.com` |

---

## Reorganization Checklist

### Priority 1: Fix Stage 2 Routing (Critical)

- [x] **JourneyProgress.tsx** (line 34): Change `path: '/supply-chain-assessment'` → `path: '/vendor-requirements'`
- [x] **VendorRiskRadar.tsx** (lines 493–496): Change "Continue to Stage 2" link from `/supply-chain-assessment` → `/vendor-requirements`, update button text to "Vendor Requirements"
- [x] **Website index.html** (line 3134): Change Stage 2 CTA href from `supply-chain-assessment` → `vendor-requirements`, update button text to "Define Vendor Requirements"
- [x] **Website best-practices.html** (lines 235–237): Change Stage 2 nav link and label
- [x] **Website best-practices.html** (mobile menu ~4288): Same change for mobile Solutions

### Priority 2: Add Vendor Requirements to App Navbar

- [x] **Navbar.tsx** toolItems: Add `{ label: 'Vendor Requirements', href: '/vendor-requirements' }` with Stage 2 context
- [x] Reordered toolItems to: Radar → Vendor Requirements → Vendor Assessments → Supply Chain Assessment (Foundation) → Vendors → etc.

### Priority 3: Website How-It-Works Links

- [x] **how-it-works.html** Card 2 (line 899): Change "Start Assessment" → `platform.../vendor-requirements`
- [x] **how-it-works.html** Card 3 (line 921): Change "Open Vendor Portal" → `platform.../vendor-assessments`

### Priority 4: Foundation Track Clarification

- [x] **SupplyChainAssessment.tsx**: Removed "Stage 2" labeling; now presents as "Foundation Track" / "VRM Program Assessment"
- [x] **SupplyChainAssessment.tsx**: Removed JourneyProgress; completion CTAs now link to Vendor Requirements (Stage 2) and Vendor Assessments (Stage 3)
- [ ] **Navbar**: Consider labeling Supply Chain Assessment as "VRM Assessment" or "Program Maturity" (optional)
- [ ] **Website**: Add separate section or nav item for Foundation Track (optional)

### Priority 5: Cross-Page Links Audit

Update all internal links that point Stage 2 to supply-chain-assessment:

- [ ] **VendorRequirementsDefinition.tsx**: Verify "Continue to Stage 3" → `/vendor-assessments` ✅ (already correct)
- [ ] **VendorAssessmentPortal.tsx**: "Back" links
- [ ] **HowItWorks.tsx** (React): Stage CTAs
- [ ] **ValuePropositionSection.tsx**: Stage links
- [ ] **HeroSection.tsx**, **FeatureSection.tsx**: Any Stage 2 references

---

## Navbar Reorganization Proposal

**Current order:**
1. Vendor Risk Radar
2. Supply Chain Assessment
3. Vendor Assessments
4. Vendor Risk Dashboard
5. VendorIQ
6. (Privacy tools...)

**Proposed order (workflow-first):**
1. **Vendor Risk Radar** — Stage 1
2. **Vendor Requirements** — Stage 2 (currently missing from nav)
3. **Vendor Assessments** — Stage 3
4. *divider*
5. **Supply Chain Assessment** — VRM / Foundation Track
6. **Vendor Risk Dashboard** — Vendors list
7. VendorIQ, etc.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/journey/JourneyProgress.tsx` | Stage 2 path → `/vendor-requirements` |
| `src/pages/tools/VendorRiskRadar.tsx` | Stage 2 CTA → `/vendor-requirements` |
| `src/components/layout/Navbar.tsx` | Add Vendor Requirements, reorder |
| `packages/website/index.html` | Stage 2 CTA → vendor-requirements |
| `packages/website/best-practices.html` | Stage 2 nav (desktop + mobile) → vendor-requirements |
| `packages/website/how-it-works.html` | Card 2 & 3 links |
| `src/pages/SupplyChainAssessment.tsx` | Remove Stage 2 labeling if present |

---

## Data Flow Verification

After routing fixes, verify:

1. **Stage 1 → Stage 2:** VendorRiskRadar vendors flow to VendorRequirementsDefinition via `useVendorPortfolio` ✅
2. **Stage 2 → Stage 3:** VendorRequirementsDefinition requirements available to VendorSecurityAssessments
3. **Portal:** Vendor assessments sent to `portal.vendorsoluce.com` for vendor completion

---

## Summary

The core reorganization is **routing Stage 2 to `/vendor-requirements`** instead of `/supply-chain-assessment`. The Vendor Requirements Definition page exists and is functional; it is simply not linked in the workflow. Supply Chain Assessment should be presented as the optional Foundation Track, not as Stage 2.
