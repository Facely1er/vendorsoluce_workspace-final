# Page Ownership

- `public/`: public marketing and acquisition pages that still exist in the app surface pending website extraction.
- `legal/`: legal and policy pages.
- `auth/`: authentication and password reset.
- `workspace/`: authenticated operator workspace pages.
- `workspace/team/`: team and collaboration pages.
- `admin/`: admin-only operational pages.
- `assessments/`: assessment flows and results.
- `programs/`: program workflow and reporting pages.
- `portal/`: legacy portal-facing pages that should migrate to `packages/vendor-risk-portal`.
- `legacy/`: older pages retained for compatibility and cleanup sequencing.

## Phase 9 cleanup

- Router and dashboard helpers now import owned page folders directly.
- Flat compatibility shims were removed where no route, component, or test still depended on them.
- `NotFoundPage` now lives under `pages/public/`.
