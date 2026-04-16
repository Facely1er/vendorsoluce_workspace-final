# Netlify Deployment – VendorSoluce

This monorepo is set up for **two separate Netlify sites**: one for the **marketing website** and one for the **React app**. Use the same Git repository and the settings below for each site.

**Important:** Create two different sites in Netlify (same repo, different build settings). Do not use a single site for both.

---

## Site 1: Marketing Website

**Purpose:** Static marketing site at **`https://www.vendorsoluce.com`** (apex redirects to `www` via `_redirects`). Build runs **inside** `packages/website` using the local `npm run build` (Tailwind CSS).

| Setting | Value |
|--------|--------|
| **Repository** | This repo (same as app) |
| **Base directory** | `packages/website` |
| **Config file path** | `packages/website/netlify.toml` |
| **Build command** | *(from config)* `npm run build` |
| **Publish directory** | *(from config)* `.` (i.e. `packages/website`) |
| **Branch** | `main` (or your production branch) |

### Steps

1. In Netlify: **Add new site** → **Import an existing project** → choose this repo.
2. **Build & deploy** → **Build settings**:
   - **Base directory:** `packages/website`
   - **Config file path:** `packages/website/netlify.toml`
3. Leave **Build command** and **Publish directory** empty so the config file is used.
4. Enable **Netlify Forms** if you use the contact form (`contact.html` with `data-netlify="true"`).
5. Deploy. The site uses `_redirects` and security headers from the config.

---

## Site 2: React App (VendorSoluce application)

**Purpose:** SPA (e.g. `www.platform.vendorsoluce.com`).

| Setting | Value |
|--------|--------|
| **Repository** | This repo (same as website) |
| **Base directory** | *(leave empty – repo root)* |
| **Config file path** | *(leave empty – uses root `netlify.toml`)* |
| **Build command** | *(from root config)* `npm run build:app` |
| **Publish directory** | *(from root config)* `packages/app/dist` |
| **Branch** | `main` (or your production branch) |

### Steps

1. In Netlify: **Add new site** again → **Import an existing project** → same repo.
2. **Build & deploy** → **Build settings**:
   - **Base directory:** leave empty (root).
   - **Config file path:** leave empty so root `netlify.toml` is used.
3. **Environment variables** (Site → Environment variables): add all required `VITE_*` and other vars from `packages/app/.env.example`, e.g.:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_ENV` = `production`
   - `VITE_STRIPE_PUBLISHABLE_KEY`
   - `VITE_SENTRY_DSN` (optional)
   - Any other `VITE_*` or API URLs the app needs.
4. Deploy. SPA routing is handled by `packages/app/public/_redirects` (copied into `dist` by Vite).

---

## Local build checks

From the repo root:

- **Website:** `npm run build:website` → builds Tailwind into `packages/website/assets/css/tailwind.css`.
- **App:** `npm run build:app` → builds the React app into `packages/app/dist`.

---

## Summary

| | Website | App |
|--|--------|-----|
| Base directory | `packages/website` | *(empty)* |
| Config | `packages/website/netlify.toml` | Root `netlify.toml` |
| Build | `npm run build` (Tailwind in package) | `npm run build:app` (Turbo) |
| Publish | `.` (website package) | `packages/app/dist` |
| Env vars | Optional | Optional (Supabase, Stripe, etc.) |

After deployment, point your domains in Netlify (e.g. `vendorsoluce.com` / `www.vendorsoluce.com` → website site with **primary domain `www.vendorsoluce.com`**; `www.platform.vendorsoluce.com` → app site) and configure DNS as instructed by Netlify.

---

## Troubleshooting

- **"Failed to parse configuration"** – Netlify could not read `netlify.toml`. Ensure the file uses valid TOML (no inline `environment = { ... }`; use a `[build.environment]` section instead). Both configs in this repo use that format.
- **Website build fails** – Confirm **Base directory** is `packages/website` and **Config file path** is `packages/website/netlify.toml`. The build runs `npm run build` inside that package (Tailwind). If install fails (e.g. missing deps), ensure `packages/website` has a `package-lock.json` or try clearing Netlify build cache.
- **App build fails** – Confirm Base directory is **empty** (repo root). Root `netlify.toml` is used. Add env vars (e.g. `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in Netlify → Site → Environment variables if you use auth.
- **Wrong site deploys** – For the **website** site you must set Config file path to `packages/website/netlify.toml`; otherwise Netlify uses the root `netlify.toml` (app config) and will build the app instead.
