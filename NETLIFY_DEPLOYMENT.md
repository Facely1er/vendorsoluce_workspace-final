# Netlify deployment — VendorSoluce (`vendorsoluce_workspace-final`)

Use **separate Netlify sites** (each with its own custom domain) connected to **this repository**. Unless noted, paths are relative to the **repo root** and **Base directory** is **empty** so `npm ci` uses the **root** `package-lock.json`.

Shared checklist: **`docs/NETLIFY_MONOREPO_TEMPLATE.md`** in **CyberCorrect** (`PrivacyWorkspace-byERMITS`). CyberCaution uses the same multi-file pattern; see **`NETLIFY_DEPLOYMENT.md`** in **`CyberCaution-RiskWorkspace-byERMITS`**.

---

## Build stability

- Run **`npm ci --no-audit --no-fund`** (with **`--include=dev`** where Vite/turbo need devDependencies) before workspace builds.
- Pin **`NODE_VERSION=20`**, **`CI=true`**, **`NODE_OPTIONS=--max-old-space-size=6144`**, **`NPM_CONFIG_AUDIT=false`**, **`NPM_CONFIG_FUND=false`**, and **`SECRETS_SCAN_SMART_DETECTION_ENABLED=false`** where many `VITE_*` vars are intentional public client values.

---

## Domain map (recommended)

| Custom domain | Surface | Base directory | Netlify configuration file |
|---------------|---------|----------------|----------------------------|
| **`www.vendorsoluce.com`** (marketing) | Static website | *(empty)* | `packages/website/netlify.toml` |
| **`app.vendorsoluce.com`** | Main React app — **demo** build (`dist-demo`, Vite `--mode demo`) | *(empty)* | `packages/app/netlify.app-demo.toml` |
| **`platform.vendorsoluce.com`** | Main React app — **production** (`packages/app/dist`) | *(empty)* | `netlify.platform.toml` or `netlify.toml` |
| **`portal.vendorsoluce.com`** | Vendor risk portal | *(empty)* | `packages/vendor-risk-portal/netlify.toml` |

**`netlify.toml`** and **`netlify.platform.toml`** at the repo root are kept **in sync** for the platform site. Prefer **`netlify.platform.toml`** in the Netlify UI for naming consistency with other ERMITS repos.

---

## 1. Marketing — `www.vendorsoluce.com`

| Field | Value |
|-------|--------|
| Base directory | *(empty)* |
| Config file | `packages/website/netlify.toml` |
| Publish | *(from file)* `packages/website` |

Apex → `www` is handled by **`packages/website/_redirects`** where configured.

**Links from `www`:** CTAs in **`packages/website/`** (footer, hero, radar handoff, etc.) should open the **public demo** at **`https://app.vendorsoluce.com/...`**, not `platform.*`. Billing, org sign-in, and the vendor assurance **portal** stay on **`platform.vendorsoluce.com`** / **`portal.vendorsoluce.com`** as appropriate. Short path **`/app/*`** on `www` redirects to **`app.vendorsoluce.com`** via **`packages/website/_redirects`**.

---

## 2. App demo — `app.vendorsoluce.com`

| Field | Value |
|-------|--------|
| Base directory | *(empty)* |
| Config file | `packages/app/netlify.app-demo.toml` |

Build runs **`npm run build:demo:react -w app`**; publish **`packages/app/dist-demo`**. The `packages/app` script uses Unix-style `BUILD_MODE=demo` inline, which is fine on **Netlify’s Linux** builders.

This site is the **ungated** browser demo linked from marketing; do not point `www` “try the app” buttons at **`platform.*`** unless the flow explicitly requires a signed-in org (e.g. checkout).

---

## 3. Platform — `platform.vendorsoluce.com`

| Field | Value |
|-------|--------|
| Base directory | *(empty)* |
| Config file | `netlify.platform.toml` (or `netlify.toml`) |
| Publish | *(from file)* `packages/app/dist` |

Set environment variables in Netlify (see repo `env.netlify.example`, `scripts/set-netlify-env.ps1`, and package READMEs). Do not commit secrets.

---

## 4. Portal — `portal.vendorsoluce.com`

| Field | Value |
|-------|--------|
| Base directory | *(empty)* |
| Config file | `packages/vendor-risk-portal/netlify.toml` |
| Publish | *(from file)* `packages/vendor-risk-portal/dist` |

Use the portal’s Supabase/Stripe keys in Netlify as required by that app.
