# ERMITS API integration status (workspace ecosystem)

Scope verified:
- CyberCorrect Workspace
- VendorSoluce Workspace
- CyberCaution Workspace
- ERMITS API / deploy repo (`ermits-api-integration-production`)

Strict verification rules followed: **no new features**, **no UI redesign**, **no business-logic changes** (this output is inspection + documentation only).

## Executive Summary

**Status: PARTIAL**

- **ERMITS API Edge endpoints exist** in the deploy repo and match the browser clients’ expected paths (`/functions/v1/risk-session`, `/functions/v1/risk-session-update`, `/functions/v1/sector-risk`).
- **VendorSoluce + CyberCorrect** include real ERMITS session integration (fetch/update by `sessionId`).
- **CyberCaution** can **consume** a session (best-effort) but is still primarily **localStorage-backed** and does not create/update sessions in normal flow.
- The integration is **API-ready but commonly disabled** unless `VITE_ERMIT_API_URL` and `VITE_ERMIT_API_KEY` are set.

## Per-product status

### CyberCorrect Workspace

- **Mode**: **API-ready but disabled by default**
- **Calls an API?** Yes, when configured.
- **Endpoints**
  - `POST {VITE_ERMIT_API_URL}/risk-session-update`
  - `GET  {VITE_ERMIT_API_URL}/risk-session?sessionId=...`
  - `GET  {VITE_ERMIT_API_URL}/sector-risk?industry=...` (client supports it; consumption depends on page)
- **Environment variables**
  - `VITE_ERMIT_API_URL` (required to enable)
  - `VITE_ERMIT_API_KEY` (required to enable)
  - `VITE_CYBERCAUTION_WORKSPACE_URL` (redirect target from readiness page)
- **Data sent**
  - On update: `{ sessionId, source: "cybercorrect", updates: { privacy: { readinessNotes, dataCategoriesSummary, completedAt }}}`
- **Data received**
  - `ErmitsRiskSession` JSON (see “Verified endpoints” below)
- **Fallback if API fails**
  - UI displays error (e.g., “not configured” or fetch/update error). No automatic local substitute for session contexts.
- **Real vs placeholder**
  - **Real** integration (actual `fetch()` calls, real env variables, sessionId persistence in `localStorage`).

Key files:
- `cybercorrect-workspace-v1/cybercorrect-workspace-v1/src/integrations/ermitsSessionClient.ts`
- `cybercorrect-workspace-v1/cybercorrect-workspace-v1/src/pages/PrivacyReadinessPage.tsx`

### VendorSoluce Workspace

- **Mode**: **API-ready but disabled by default**
- **Calls an API?** Yes, when configured.
- **Endpoints**
  - `POST {VITE_ERMIT_API_URL}/risk-session-update`
  - `GET  {VITE_ERMIT_API_URL}/risk-session?sessionId=...`
  - `GET  {VITE_ERMIT_API_URL}/sector-risk?industry=...` (client supports it; usage depends on pages)
- **Environment variables**
  - `VITE_ERMIT_API_URL` (required to enable)
  - `VITE_ERMIT_API_KEY` (required to enable)
  - `VITE_CYBERCAUTION_WORKSPACE_URL` (redirect target from readiness page)
- **Data sent**
  - On update: `{ sessionId, source: "vendorsoluce", updates: { vendors: { readinessNotes, criticalVendorsSummary, completedAt }}}`
- **Data received**
  - `ErmitsRiskSession` JSON
- **Fallback if API fails**
  - UI displays error. No automatic local substitute for session contexts.
- **Real vs placeholder**
  - **Real** integration (actual `fetch()` calls and session update path).

Key files:
- `vendorsoluce_workspace-final/packages/app/src/integrations/ermitsSessionClient.ts`
- `vendorsoluce_workspace-final/packages/app/src/pages/public/VendorReadinessPage.tsx`

### CyberCaution Workspace

- **Mode**: **Local-first with optional ERMITS session consumption**
- **Calls an API?**
  - **Yes, optionally**: attempts to load `session` from URL via `fetchErmitsRiskSession()` and also calls `fetchSectorRisk()`.
  - If anything fails, it silently continues local mode.
- **Endpoints**
  - `GET {VITE_ERMIT_API_URL}/risk-session?sessionId=...`
  - `GET {VITE_ERMIT_API_URL}/sector-risk?industry=...`
  - (Client also implements `POST .../risk-session-update` and `POST .../risk-session`, but these are not part of the main workspace flow in the verified code path.)
- **Environment variables**
  - `VITE_ERMIT_API_URL` (optional)
  - `VITE_ERMIT_API_KEY` (optional)
- **Data sent**
  - None in the main “consume session” flow (read-only).
- **Data received**
  - `ErmitsRiskSession` JSON + sector profile JSON
- **Fallback if API fails**
  - **Yes**: continues using local `cybercaution:riskPayload` (localStorage) and a built-in fallback payload generator.
- **Real vs placeholder**
  - **Real** fetch integration exists, but it is **best-effort** and not required for the app to operate.

Key files:
- `cybercaution-suite-production/cybercaution-workspace/src/integrations/ermitsSessionClient.ts`
- `cybercaution-suite-production/cybercaution-workspace/src/sessionMerge.ts`
- `cybercaution-suite-production/cybercaution-workspace/src/main.tsx`

### ERMITS API / deploy repo

- **Status**: **Endpoints present (Supabase Edge Functions)**
- **Verified functions**
  - `GET/POST /functions/v1/risk-session`
  - `POST /functions/v1/risk-session-update`
  - `GET /functions/v1/sector-risk`
- **Authentication**
  - Required header: `x-ermits-api-key: <key>`
  - Verified in function code (`Deno.env.get("ERMITS_API_KEY")`)
- **Server-side required secrets**
  - `ERMITS_API_KEY`
  - `SUPABASE_URL`
  - `ERMITS_SERVICE_ROLE_KEY`

Key files:
- `ermits-api-integration-production/supabase/functions/risk-session/index.ts`
- `ermits-api-integration-production/supabase/functions/risk-session-update/index.ts`
- `ermits-api-integration-production/supabase/functions/sector-risk/index.ts`
- `ermits-api-integration-production/supabase/config.toml`

## Verified endpoints (paths, schemas, headers)

### `POST /functions/v1/risk-session`

- **Path**: `/functions/v1/risk-session`
- **Headers**
  - `Content-Type: application/json`
  - `x-ermits-api-key: <YOUR_KEY>`
- **Env/secrets required (function runtime)**
  - `ERMITS_API_KEY`
  - `SUPABASE_URL`
  - `ERMITS_SERVICE_ROLE_KEY`
- **Request body (as used by browser clients)**

```json
{
  "source": "cybercorrect | vendorsoluce | cybercaution | assessmenthub | sectorintel | cyberbrief",
  "industry": "finance | healthcare | education | manufacturing | tech | other",
  "companySize": "1-10 | 11-50 | 51-200 | 201-1000 | 1000+",
  "region": "US | EU | Africa | Global",
  "dataSensitivity": "low | moderate | high",
  "dependencyLevel": "low | moderate | high"
}
```

- **Response body**
  - Shape returned by the function:

```json
{
  "sessionId": "<uuid>",
  "source": "<string>",
  "input": { },
  "payload": { },
  "contexts": {
    "brief": {},
    "privacy": {},
    "vendors": {},
    "assets": {},
    "cyber": {},
    "assessment": {},
    "sector": {}
  },
  "createdAt": "<iso>",
  "updatedAt": "<iso>"
}
```

### `GET /functions/v1/risk-session?sessionId=...`

- **Path**: `/functions/v1/risk-session`
- **Query**
  - `sessionId` (required)
- **Headers**
  - `x-ermits-api-key: <YOUR_KEY>`
- **Response**: same shape as `POST /risk-session`

### `POST /functions/v1/risk-session-update`

- **Path**: `/functions/v1/risk-session-update`
- **Headers**
  - `Content-Type: application/json`
  - `x-ermits-api-key: <YOUR_KEY>`
- **Request body (as used by VendorSoluce/CyberCorrect readiness pages)**

```json
{
  "sessionId": "<uuid>",
  "source": "cybercorrect | vendorsoluce | cybercaution | assessmenthub | sectorintel | cyberbrief | cybersoluce",
  "updates": {
    "privacy": { "any": "json" },
    "vendors": { "any": "json" },
    "brief": { "any": "json" },
    "assets": { "any": "json" },
    "cyber": { "any": "json" },
    "assessment": { "any": "json" },
    "sector": { "any": "json" }
  }
}
```

- **Response**: same `ErmitsRiskSession`-like shape, plus an `updates` object (function includes `updates` in response).

### `GET /functions/v1/sector-risk?industry=...`

- **Path**: `/functions/v1/sector-risk`
- **Query**
  - `industry` (optional; defaults to `other`)
- **Headers**
  - `x-ermits-api-key: <YOUR_KEY>`
- **Response body**
  - A sector profile object, e.g.:

```json
{
  "industry": "healthcare",
  "headlineRisk": "High ransomware and data breach exposure",
  "ransomware": 90,
  "supplyChain": 75,
  "dataBreach": 95,
  "regulatory": 90,
  "operations": 80,
  "priorityActions": ["..."]
}
```

## Cross-product data flow check

### CyberCaution
- **Create or receive a risk session**: **Receive: IMPLEMENTED** (best-effort, requires env + `?session=...`). **Create: NOT IMPLEMENTED** in normal flow.
- **Store risk payload**: **IMPLEMENTED** via `localStorage` key `cybercaution:riskPayload` (local-first).
- **Export or hand off vendor/privacy signals**: **NOT IMPLEMENTED** (no API write-back in the verified workspace flow; export is local report JSON/print).

### VendorSoluce
- **Consume vendor-related signals**: **IMPLEMENTED** via `GET /risk-session` (reads consolidated contexts) when configured.
- **Enrich vendor readiness/criticality**: **IMPLEMENTED** via `POST /risk-session-update` (writes `vendors` context) when configured.

### CyberCorrect
- **Consume privacy/data exposure signals**: **IMPLEMENTED** via `GET /risk-session` when configured.
- **Enrich readiness/processing activity context**: **IMPLEMENTED** via `POST /risk-session-update` (writes `privacy` context) when configured.

## Workspace API mode check (summary)

- **CyberCorrect**: **API-ready but disabled** (requires `VITE_ERMIT_API_URL` + `VITE_ERMIT_API_KEY`)
- **VendorSoluce**: **API-ready but disabled** (requires `VITE_ERMIT_API_URL` + `VITE_ERMIT_API_KEY`)
- **CyberCaution**: **Local-only by default**, **API-consume if available** (best-effort; continues local on failure)

## Gaps / risks (documented, not fixed here)

- **Browser-shipped API key**: The deploy repo’s intended pattern is to keep `ERMITS_API_KEY` server-side and use a proxy (`VITE_ERMIT_API_PROXY_URL`). Current workspace code uses `VITE_ERMIT_API_KEY` directly in browser fetches.
- **Two API surfaces exist in deploy repo**:
  - “Direct” Edge Functions (`/functions/v1/risk-session*`, `/functions/v1/sector-risk`)
  - “API Core” (`/functions/v1/ermits-api/v1/...`) described in `ermits-api-core/docs/openapi.yaml`
  - The three workspaces verified here integrate with the **direct Edge Functions**, not the API Core paths.

## Recommended next action

1. Decide and standardize which API surface is the contract:
   - keep using direct Edge functions (`/functions/v1/risk-session*`) OR
   - migrate frontends to the proxy + API Core paths (`/functions/v1/ermits-risk-session-proxy` → `/functions/v1/ermits-api/v1/...`)
2. If staying with direct Edge functions, ensure:
   - secrets are configured in Supabase Edge Function secrets (`ERMITS_API_KEY`, `SUPABASE_URL`, `ERMITS_SERVICE_ROLE_KEY`)
   - frontends have correct `VITE_ERMIT_API_URL` and (if still required) `VITE_ERMIT_API_KEY`

## API testing

Results in this verification: **NOT RUN** (no local Supabase runtime invoked in this session).

Use these curl examples with placeholder values only:

### 1) POST risk session

```bash
curl -X POST "$ERMITS_API_URL/functions/v1/risk-session" \
  -H "Content-Type: application/json" \
  -H "x-ermits-api-key: <YOUR_KEY>" \
  -d '{
    "source": "cybercaution",
    "industry": "education",
    "companySize": "11-50",
    "region": "US",
    "dataSensitivity": "moderate",
    "dependencyLevel": "moderate"
  }'
```

### 2) GET risk session by sessionId

```bash
curl -X GET "$ERMITS_API_URL/functions/v1/risk-session?sessionId=<SESSION_ID>" \
  -H "x-ermits-api-key: <YOUR_KEY>"
```

### 3) GET sector risk by industry

```bash
curl -X GET "$ERMITS_API_URL/functions/v1/sector-risk?industry=education" \
  -H "x-ermits-api-key: <YOUR_KEY>"
```

### 4) POST risk session update (vendor/privacy handoff)

```bash
curl -X POST "$ERMITS_API_URL/functions/v1/risk-session-update" \
  -H "Content-Type: application/json" \
  -H "x-ermits-api-key: <YOUR_KEY>" \
  -d '{
    "sessionId": "<SESSION_ID>",
    "source": "vendorsoluce",
    "updates": {
      "vendors": {
        "criticalVendorsSummary": "Example critical vendors summary",
        "readinessNotes": "Example readiness notes",
        "completedAt": "2026-05-05T00:00:00.000Z"
      }
    }
  }'
```

## Build / test result

Build verification: **PENDING** (will be executed as `npm run build` per workspace after docs generation).

