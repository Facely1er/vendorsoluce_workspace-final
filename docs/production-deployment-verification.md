# v2.8 — Production Deployment Verification (ERMITS workspace ecosystem)

Products verified:
- **CyberCorrect Workspace**
- **VendorSoluce Workspace**
- **CyberCaution Workspace**

Scope: deployment, routing, env vars, proxy behavior, and documented results only.

## 1) Executive summary

**Overall decision: FAIL (blocking)**

- ✅ Deploys completed successfully for all three workspaces.
- ✅ SPA route refresh behavior verified via HTTP status checks (no 404s on deep links).
- ✅ Netlify Functions for `ermits-proxy` are bundled & deployed for all three.
- ❌ **Blocking**: `ERMITS_API_URL` and `ERMITS_API_KEY` are **not set** in Netlify production context for all three sites, causing the proxy to return **HTTP 500**.

Until `ERMITS_API_URL` + `ERMITS_API_KEY` are configured **server-side** in Netlify, the ERMITS proxy layer cannot function in production.

## 2) Deployment URLs

- **CyberCorrect**
  - Production: `https://cybercorrect-workspace.netlify.app`
  - Latest deploy logs: `https://app.netlify.com/projects/cybercorrect-workspace/deploys/69f9cc90ac936e0076349af1`
  - Unique deploy: `https://69f9cc90ac936e0076349af1--cybercorrect-workspace.netlify.app`

- **CyberCaution**
  - Production: `https://workspace.cybercaution.com`
  - Latest deploy logs: `https://app.netlify.com/projects/workspace-cybercaution/deploys/69f9cc8d84e689007624f5fb`
  - Unique deploy: `https://69f9cc8d84e689007624f5fb--workspace-cybercaution.netlify.app`

- **VendorSoluce**
  - Production: `https://vendorsoluce-workspace-internal.netlify.app`
  - Latest deploy logs: `https://app.netlify.com/projects/vendorsoluce-workspace-internal/deploys/69f9cceceeb93f0724cfb08d`
  - Unique deploy: `https://69f9cceceeb93f0724cfb08d--vendorsoluce-workspace-internal.netlify.app`

## 3) Netlify environment check (server-side)

Required server-side variables (must **NOT** be `VITE_*`):

```bash
ERMITS_API_URL=https://<project-ref>.supabase.co/functions/v1
ERMITS_API_KEY=<server-side-key>
```

Verified via CLI (`netlify env:list --context production`):
- **CyberCorrect**: **MISSING** (no variables set in production context)
- **CyberCaution**: **MISSING** (no variables set in production context)
- **VendorSoluce**: **MISSING** (no variables set in production context)

## 4) Build config check

### CyberCorrect
- `netlify.toml` present in repo root.
- Build command: `npm run build`
- Publish: `dist`
- SPA redirect: present (`/* -> /index.html` 200)

### CyberCaution
- `netlify.toml` present in repo root.
- Build command: `npm run build`
- Publish: `dist`
- SPA redirect: present (`/* -> /index.html` 200)

### VendorSoluce
- Added `packages/app/netlify.toml` to ensure:
  - Build command: `npm run build`
  - Publish: `dist`
  - Functions directory: `netlify/functions`
  - SPA redirect: present (`/* -> /index.html` 200)

## 5) Deploy status per workspace

- **CyberCorrect**: **PASS** (build + deploy succeeded; `ermits-proxy` bundled)
- **CyberCaution**: **PASS** (build + deploy succeeded; `ermits-proxy` bundled)
- **VendorSoluce**: **PASS** (build + deploy succeeded; `ermits-proxy` bundled)

## 6) Route refresh test results (deep links)

Verified by HTTP HEAD/GET status codes (expect 200 for SPA routes).

### CyberCorrect (all **200**)
- `/dashboard`
- `/intake`
- `/activities`
- `/risks`
- `/vendors`
- `/evidence`
- `/reports`
- `/reports/print`
- `/settings`

### VendorSoluce (all **200**)
- `/dashboard`
- `/intake`
- `/vendors`
- `/risks`
- `/evidence`
- `/actions`
- `/reports`
- `/settings`

### CyberCaution (all **200**)
- `/dashboard/`
- `/activities/`
- `/modules/`
- `/export/`

## 7) API proxy verification (network + security)

### Expected
- Frontend should call only: `/.netlify/functions/ermits-proxy`
- Browser must not call Supabase Edge base URL directly
- Browser request headers must not include `x-ermits-api-key`
- Bundles must not expose:
  - `ERMITS_API_KEY`
  - `VITE_ERMIT_API_KEY`
  - `VITE_ERMITS_API_KEY`
  - `ermits_live_`

### Verified (automatable in this run)
- **Bundle scans were previously performed locally** after builds and showed no matches for key strings in build artifacts.
- **Deployed proxy is present** (function bundled and deployed for each workspace).

### Not verified (requires DevTools Network tab)
- Confirming the browser’s runtime requests exclusively hit the proxy (manual step).

## 8) API endpoint test results (via deployed proxy)

Tested:

1) `GET /.netlify/functions/ermits-proxy?path=sector-risk&industry=healthcare`

Results:
- **CyberCorrect**: **FAIL** (HTTP **500**)
- **CyberCaution**: **FAIL** (HTTP **500**)
- **VendorSoluce**: **FAIL** (HTTP **500**)

Interpretation:
- Proxy is deployed, but **server-side env is missing**, so the function cannot forward to ERMITS API.

Other endpoints (NOT TESTED due to missing env):
- `GET  ?path=risk-session&sessionId=<known-session-id>`
- `POST ?path=risk-session-update`
- `POST ?path=ermits-api/v1/vendors/risk-score`

## 9) LocalStorage product flow tests

Status: **NOT TESTED (manual UI verification required)**.

## 10) Theme + logo verification

Status: **NOT TESTED (manual UI verification required)**.

## 11) Security confirmation

- ✅ Browser-side ERMITS API keys removed from the verified integration paths in source/bundles.
- ✅ Proxy injects `x-ermits-api-key` server-side only.
- ❌ Production is not functional until `ERMITS_API_URL` + `ERMITS_API_KEY` are set in Netlify (server-side).

## 12) Remaining issues / next action

**Blocking**
- In Netlify for each site, set production env vars:
  - `ERMITS_API_URL=https://<project-ref>.supabase.co/functions/v1`
  - `ERMITS_API_KEY=<server-side-key>`

**Then re-test**
- Proxy sector-risk (expect 200)
- Risk session fetch/update flows
- VendorSoluce API Core vendor risk-score proxy path
- DevTools Network tab confirmation (no direct Supabase calls; no `x-ermits-api-key` header in browser)

