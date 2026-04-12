# Deploy and verify VendorSoluce

Use this to get the **website**, **platform app**, and **vendor risk portal** deployed and verified.

---

## Domains

| Product | Domain | Description |
|--------|--------|-------------|
| **Website** | www.vendorsoluce.com | Marketing site (HTML, `packages/website`) |
| **Platform (App)** | www.platform.vendorsoluce.com | Main app: sign-in, dashboard, billing (`packages/app`) |
| **Vendor Risk Portal** | www.portal.vendorsoluce.com | Vendor assessment portal: landing + assessment by ID (same app or `packages/vendor-risk-portal`) |

Links from the website use `packages/website/assets/js/portal-config.js`: `VENDOR_PORTAL_BASE` points to the platform (Sign in / Start trial); `VENDOR_RISK_PORTAL_BASE` points to the portal.

---

## 1. Build locally (optional)

From the **repo root**:

```bash
npm ci
npm run build:app
```

Output: `packages/app/dist`. Preview:

```bash
cd packages/app && npx serve dist -p 4173
```

Open http://localhost:4173 and confirm the app loads.

---

## 2. Deploy options

### A. Deploy via GitHub Actions (Vercel)

- **Staging:** Push to `develop` → workflow deploys to staging (e.g. https://staging.vendorsoluce.com).
- **Production:** Push to `main` → workflow deploys to production (e.g. https://www.vendorsoluce.com for marketing; platform uses https://www.platform.vendorsoluce.com).

**Required GitHub secrets:** `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.  
Optional: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (fallbacks exist in the workflow for build).

1. Push your branch.
2. Open the **Actions** tab and confirm the run (quality → build → test → deploy).
3. Open the environment URL from the workflow or your Vercel project.

### B. Deploy via Vercel (connect repo)

1. [Vercel](https://vercel.com) → Add New Project → Import the `vendorsoluce-monorepo` repo.
2. **Root Directory:** leave as `.` (repo root). The root `vercel.json` already has:
   - Build Command: `npm run build:app`
   - Output Directory: `packages/app/dist`
3. Add **Environment variables** (at least for full backend):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - (Optional) `VITE_APP_ENV=production`, Stripe keys, etc.
4. Deploy. Vercel will build and serve the app.

### C. Deploy via Netlify

1. Go to [Netlify](https://app.netlify.com) → **Add new site** → **Import an existing project** → connect **GitHub** and select **vendorsoluce-monorepo**.
2. **Build settings** (Netlify will read the root `netlify.toml`; confirm or set):
   - **Base directory:** leave empty (repo root).
   - **Build command:** `npm run build:app`
   - **Publish directory:** `packages/app/dist`
   - **Config file:** leave empty so the root `netlify.toml` is used.
3. **Environment variables** (optional for demo; required for full backend):  
   Site **Settings** → **Environment variables** → **Add variable** (or **Import from .env**):
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key  
   (Use these exact names so Vite embeds them in the build.)
4. Click **Deploy site**. After the build, the portal URL will be like `https://<random>.netlify.app`. You can set a **custom domain** under **Domain management**.

---

## 3. Verify after deploy

**Platform (www.platform.vendorsoluce.com)**

- [ ] App URL loads (no blank page).
- [ ] Sign-in page shows (with or without “backend not configured” message if Supabase isn’t set).
- [ ] **Without backend:** SBOM Quick Scan → hit free-scan limit → submit email → success message and “5 more scans” (demo bypass).
- [ ] **With backend:** Sign up / sign in, add a vendor, open an assessment.
- [ ] No console errors on first load and after one navigation.

**Vendor Risk Portal (www.portal.vendorsoluce.com) – works for demo without backend**

- [ ] Portal URL loads; landing page shows "Access Your Assessment".
- [ ] **Without backend:** Enter any valid assessment ID (e.g. `123e4567-e89b-12d3-a456-426614174000`) → opens assessment with mock data; answer questions; file upload shows "uploaded" (demo mode, no persistence).
- [ ] **With backend:** Enter a real assessment ID from your tenant → full flow.
- [ ] No console errors on first load and after opening an assessment.

---

## 4. Env vars reference

| Variable | Required for | Notes |
|----------|----------------|-------|
| `VITE_SUPABASE_URL` | Auth, data, assessments | Without: app runs in demo mode. |
| `VITE_SUPABASE_ANON_KEY` | Same as above | From Supabase → Settings → API. |
| `VITE_APP_ENV` | Optional | `production` or `staging`. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Billing / checkout | Optional for verify. |

For Supabase, run migrations in `packages/app/supabase/migrations/` against your project before testing full flows.

---

## 5. Deploying website, platform, and portal separately

Deploy three sites: **Website** (www.vendorsoluce.com), **Platform** (www.platform.vendorsoluce.com), **Vendor risk portal** (www.portal.vendorsoluce.com). Build platform and portal with `npm run build:app` → `packages/app/dist`; website per `packages/website`.

### Netlify (example)

1. **Website** – Base: `packages/website`, build/publish per its netlify.toml. Custom domain: www.vendorsoluce.com.
2. **Platform** – Base: repo root, build: `npm run build:app`, publish: `packages/app/dist`. Custom domain: www.platform.vendorsoluce.com.
3. **Portal** – Same build as platform; custom domain: www.portal.vendorsoluce.com. Omit `VITE_SUPABASE_*` for demo without backend (any valid UUID opens mock assessment; file upload is local-only).

### Making the “Sign in” / “Start trial” link work

The website has **“Sign in”** / **“Start Vendor Intake”** links that must point to your **portal URL**. When the portal is deployed separately (e.g. to Netlify), set that URL in one place:

- **File:** `packages/website/assets/js/portal-config.js`
- **Variable:** `window.VENDOR_PORTAL_BASE`
- Set it to your portal’s base URL, e.g.:
  - `https://vendorsoluce-app.netlify.app` (if the app is on Netlify)
- **Variable:** `window.VENDOR_PORTAL_BASE` – set to the **platform** URL (e.g. `https://www.platform.vendorsoluce.com`) so Sign in / Start trial go to the main app.
- **Variable:** `window.VENDOR_RISK_PORTAL_BASE` – set to the **portal** URL (e.g. `https://www.portal.vendorsoluce.com`) for the vendor assessment portal.

Any link with `data-portal-path="/signin"` uses `VENDOR_PORTAL_BASE + /signin`. Redeploy the website after changing `portal-config.js`.

---

## 6. Repository Hygiene

### Enable automatic branch deletion after merge

To prevent stale branches from accumulating, enable **"Automatically delete head branches"** in the GitHub repository settings:

1. Go to **Settings → General → Pull Requests**.
2. Check **✓ Automatically delete head branches**.

This ensures feature/fix branches are deleted as soon as their pull request is merged into `main`.
