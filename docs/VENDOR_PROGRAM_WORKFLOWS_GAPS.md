# Vendor program workflows — implementation status and gaps

This document tracks what was shipped for the **NIST implementation** and **VIRA due diligence** guided pages (`/program/nist-implementation`, `/program/vira-due-diligence`), activity catalog alignment, and what remains for **full workflow completion** with **local-only** vs **backend-synced** progress.

## Shipped — wave 1

- **Two workflow routes** with a shared timeline UI: step metrics (duration, activity-catalog-mapped activity counts, deliverable/tool counts), expandable detail panels, role pills, and deep links into existing product routes.
- **Local persistence** for step completion: `localStorage` key `vendor-program-workflow-progress-v1:{workflowId}` (`nist-implementation` | `vira-due-diligence`). Users can reset progress from the workflow page.
- **Activity catalog alignment** (`vendorSupplyChainSipocCatalog.ts`):
  - `VendorSupplyProgramTrack` (`nist` | `vira`) and `VENDOR_SUPPLY_PHASE_PROGRAM_TRACKS` on each phase.
  - `countVendorSupplyActivitiesForPhases()` for workflow metrics.
  - Catalog page: program filter (All / NIST / VIRA), banner links to both workflows, per-phase "Programs: NIST | VIRA" badges.
  - Product-enablement catalog row updated to reference program routes.
- **Navigation**: Solutions menu lists both workflows first; command palette entries; NIST checklist page links to the NIST workflow.

## Shipped — wave 2

- **NIST checklist localStorage persistence** (`NISTChecklist.tsx`): checked items survive page reload under key `nist-checklist-progress-v1`. Reset button clears both state and localStorage.
- **HowItWorks.tsx**:
  - Risk calculator card link corrected: `/vendors` → `/tools/vendor-risk-calculator`.
  - New "Guided program workflows" section added above Integration Preview, with cards for both NIST and VIRA workflow pages.
- **Dashboard program shortcuts** (`DashboardPage.tsx`): new card above supply-chain-tools with direct links to `/program/nist-implementation` and `/program/vira-due-diligence`.
- **Footer** (`Footer.tsx`): `/#supply-chain-tools` anchor link replaced with `/vendor-activity-catalog`.
- **VendorActivityCatalogPage.tsx**: back link updated from `/#supply-chain-tools` to `/`.
- **Program track tags corrected**: `program-marketing-operations` removed from the `nist` track (now `[]`); `portal-vendor-experience` confirmed `vira`-only; `program-marketing-operations` phaseId removed from `nistImplementationWorkflow.ts` step 1.

## Shipped — wave 3 (SBOM removal)

- **SBOM UI removed platform-wide**: all in-app routes (`/sbom-analyzer`, `/sbom-analysis/:id`, `/tools/sbom-quick-scan`), navigation links, dashboard quick actions, workflow catalog steps, and onboarding checklist items pointing to SBOM analysis have been removed or replaced.
  - Legacy URLs redirect: `/sbom-analyzer` → `/tools/nist-checklist`, `/sbom-analysis/:id` → `/vendors`, `/tools/sbom-quick-scan` → `/tools/nist-checklist`.
  - NIST workflow step 3 now references `NIST checklist` and product security evidence instead of SBOM deliverables.
  - VIRA workflow step 4 (portfolio measurement) no longer links to SBOM analyzer; references asset management and vendor radar instead.
  - GetStartedWidget, OnboardingChecklist, GuidedSetupWorkflow, WelcomeScreen, and all home/dashboard components updated.
- **Dashboard metrics**: "Total Vulnerabilities" metric card (previously driven by SBOM analyses) replaced with "Vendor Assessments" count.

## Gaps — local experience

1. **Step status is heuristic**: first incomplete step shows "in progress" at a fixed bar width; it does not reflect partial completion inside a step.
2. **NIST checklist ↔ workflow progress not merged**: `nist-checklist-progress-v1` and `vendor-program-workflow-progress-v1:nist-implementation` are independent. *Future:* derive step-1 completion % from C-SCRM control groups c1–c2.
3. **Deliverables are navigational**, not generated artifacts. There is no `/deliverables` hub or markdown/PDF builders (contrast with CyberCorrect's `deliverableTemplates` pattern).

## Gaps — backend / multi-device

1. **No Supabase (or other) table** for `organization_id` + `workflow_id` + `step_id` + `completed_at` + `evidence_ref`. Local progress cannot sync across browsers or team members.
2. **No audit trail** tying "step complete" to user id, IP, or export hash.
3. **No server-side rules** for prerequisite steps (e.g. block "due diligence" until requirements published).
4. **No webhook or integration** to external GRC tools when a step completes.

### Suggested backend shape (future)

- Table `vendor_program_workflow_state`: `(tenant_id, user_id, workflow_id, step_id, status, updated_at, metadata jsonb)`.
- Optional `vendor_program_workflow_events` append-only log for compliance.
- API: `GET/PATCH` per workflow; merge with client `localStorage` on login (last-write-wins or server-wins policy).

## Testing checklist

- Open `/program/nist-implementation` and `/program/vira-due-diligence`, expand steps, follow internal links.
- Toggle "Mark step complete", refresh — state should persist.
- Check the NIST checklist (`/tools/nist-checklist`), tick items, refresh — ticks should survive.
- Click Reset on the checklist — ticks should clear.
- On `/vendor-activity-catalog`, switch program filter; `program-marketing-operations` should NOT appear under the NIST filter.
- On `/how-it-works`, confirm risk calculator card goes to `/tools/vendor-risk-calculator` and the "Guided program workflows" section appears.
- On `/dashboard`, confirm "Guided program workflows" card appears and both links work.
- Footer "Activity catalog" link should go to `/vendor-activity-catalog`.
- Verify `/sbom-analyzer`, `/sbom-analysis/test`, `/tools/sbom-quick-scan` all redirect (no 404).
- Authenticated-only routes linked from VIRA steps (`/team/*`) behave as today (protected).

## Related files

- `packages/app/src/catalog/nistImplementationWorkflow.ts`
- `packages/app/src/catalog/viraDueDiligenceWorkflow.ts`
- `packages/app/src/catalog/vendorSupplyChainSipocCatalog.ts`
- `packages/app/src/components/program/ImplementationWorkflowTimeline.tsx`
- `packages/app/src/hooks/useVendorProgramWorkflowProgress.ts`
- `packages/app/src/pages/NistImplementationWorkflowPage.tsx`
- `packages/app/src/pages/ViraDueDiligenceWorkflowPage.tsx`
- `packages/app/src/pages/tools/NISTChecklist.tsx`
- `packages/app/src/pages/HowItWorks.tsx`
- `packages/app/src/pages/DashboardPage.tsx`
- `packages/app/src/components/layout/Footer.tsx`
- `packages/app/src/pages/VendorActivityCatalogPage.tsx`
