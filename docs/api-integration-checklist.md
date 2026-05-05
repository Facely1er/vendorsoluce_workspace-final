# ERMITS API integration checklist (env vars)

This checklist inventories **environment variables** referenced by the workspace ecosystem for ERMITS risk-session integration.

**Do not place real secrets in repo.** Examples below are placeholders.

## Workspace frontends (Vite)

These are used by:
- **VendorSoluce Workspace** (`packages/app`)
- **CyberCorrect Workspace** (`cybercorrect-workspace-v1/cybercorrect-workspace-v1`)
- **CyberCaution Workspace** (`cybercaution-suite-production/cybercaution-workspace`)

### `VITE_ERMIT_API_URL`
- **Used by**: VendorSoluce, CyberCorrect, CyberCaution
- **Required**: Optional (only required if ERMITS session mode is enabled)
- **Example**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1`
- **Netlify config**: Site settings → Build & deploy → Environment → Environment variables

### `VITE_ERMIT_API_KEY`
- **Used by**: VendorSoluce, CyberCorrect, CyberCaution
- **Required**: Optional (only required if ERMITS session mode is enabled)
- **Example**: `ermits_live_replace_me`
- **Netlify config**: Site settings → Build & deploy → Environment → Environment variables
- **Security note**: In `ermits-api-integration-production/ermits-deploy/integration/README.md`, the intended pattern is **not** to ship `ERMITS_API_KEY` to the browser; instead, frontends should call a **same-origin proxy**. Current workspaces reference `VITE_ERMIT_API_KEY` directly (documented as a gap in `docs/api-integration-status.md`).

### `VITE_CYBERCAUTION_WORKSPACE_URL`
- **Used by**: VendorSoluce, CyberCorrect (readiness pages redirect into CyberCaution)
- **Required**: Optional
- **Example**: `https://workspace.example.com/workspace`
- **Netlify config**: Site settings → Build & deploy → Environment → Environment variables

## ERMITS API / Supabase Edge Functions (server-side secrets)

These are used by:
- **ERMITS API deploy repo** (`ermits-api-integration-production/supabase/functions/*`)

### `ERMITS_API_KEY`
- **Used by**: Supabase Edge Functions `risk-session`, `risk-session-update`, `sector-risk`
- **Required**: Required (blocking)
- **Example**: `ermits_live_replace_me`
- **Where to configure (Supabase)**: Project Settings → Edge Functions → Secrets

### `SUPABASE_URL`
- **Used by**: `risk-session`, `risk-session-update`
- **Required**: Required (blocking)
- **Example**: `https://YOUR_PROJECT_REF.supabase.co`
- **Where to configure (Supabase)**: Project Settings → Edge Functions → Secrets

### `ERMITS_SERVICE_ROLE_KEY`
- **Used by**: `risk-session`, `risk-session-update`
- **Required**: Required (blocking)
- **Example**: `YOUR_SERVICE_ROLE_KEY`
- **Where to configure (Supabase)**: Project Settings → Edge Functions → Secrets

## Optional / planned (proxy pattern in deploy repo)

### `VITE_ERMIT_API_PROXY_URL`
- **Used by**: Documented by deploy repo as the preferred frontend integration route.
- **Required**: Not currently used by the three workspaces listed in this verification.
- **Example**: `/functions/v1/ermits-risk-session-proxy`
- **Reference**: `ermits-api-integration-production/ermits-deploy/integration/README.md`

