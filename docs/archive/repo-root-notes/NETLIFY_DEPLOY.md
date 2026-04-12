# VendorSoluce — Netlify Deployment Guide

This guide describes how to deploy the VendorSoluce platform application, marketing website, and vendor risk portal to Netlify. You may use a single Netlify site for the application or create separate sites for each component.

**Audience:** DevOps, release engineers, and platform administrators.  
**Repository:** `vendorsoluce-monorepo`

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Deploy the Platform Application](#1-deploy-the-platform-application)
4. [Deploy the Marketing Website](#2-deploy-the-marketing-website)
5. [Deploy the Vendor Risk Portal (Optional)](#3-deploy-the-vendor-risk-portal-optional)
6. [Configure Cross-Site Links](#4-configure-cross-site-links)
7. [Build Reference](#5-build-reference)
8. [Troubleshooting](#troubleshooting)

---

## Overview

| Component | Purpose | Typical URL |
|-----------|---------|-------------|
| **Platform application** | Main VendorSoluce app (authentication, dashboard, tools) | `www.platform.vendorsoluce.com` |
| **Marketing website** | Public marketing and product information | `www.vendorsoluce.com` |
| **Vendor risk portal** | Dedicated portal for vendors (optional separate deployment) | `www.portal.vendorsoluce.com` |

---

## Prerequisites

- A [Netlify](https://app.netlify.com) account with access to create sites
- The **vendorsoluce-monorepo** repository connected to GitHub (or GitLab / Bitbucket)
- For production use: Supabase project URL and anon key for the platform application

---

## 1. Deploy the Platform Application

This deployment serves the main VendorSoluce application (sign-in, dashboard, and tools). Use it for **www.platform.vendorsoluce.com** or your assigned `*.netlify.app` URL.

1. In Netlify: **Add new site** → **Import an existing project**.
2. Connect **GitHub** (or your Git provider) and select the **vendorsoluce-monorepo** repository.
3. **Build settings** (the root `netlify.toml` is used; verify or set):
   - **Base directory:** leave **empty** (build from repository root).
   - **Build command:** `npm ci && npm run build:app`
   - **Publish directory:** `packages/app/dist`
   - **Config file:** leave empty so the root `netlify.toml` is used.
4. **Environment variables** (required for production; optional for demo):
   - **Option A — Import from file (recommended):**
     1. Copy `env.netlify.example` to `env.netlify`, fill in your values.
     2. Run from repo root: `netlify env:import env.netlify` (requires `netlify link` if not already linked).
   - **Option B — Generate from local env:** Run `scripts/set-netlify-env.ps1` to create `env.netlify` from `packages/app/.env.local`, then `netlify env:import env.netlify`.
   - **Option C — Manual in Netlify UI:** **Site** → **Site configuration** → **Environment variables** → **Add variable** or **Import from .env**.
   - Required variables:
     - `VITE_SUPABASE_URL` — your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` — your Supabase anonymous (public) key
     - `VITE_STRIPE_PUBLISHABLE_KEY` — your Stripe publishable key (e.g. `pk_live_...` for production) so Checkout works
   - Only variables prefixed with `VITE_` are embedded into the build by Vite. For Stripe pricing, set `VITE_STRIPE_PRICE_STARTER`, `VITE_STRIPE_PRICE_PROFESSIONAL_MONTHLY`, `VITE_STRIPE_PRICE_PROFESSIONAL_ANNUAL`, `VITE_STRIPE_PRICE_ENTERPRISE_MONTHLY`, `VITE_STRIPE_PRICE_ENTERPRISE_ANNUAL` (and optionally `VITE_STRIPE_PRICE_FEDERAL`) to the Price IDs from the same Stripe account. See `env.netlify.example` for the full list.
5. Click **Deploy site**. When the build completes, the site is available at `https://<site-name>.netlify.app`.
6. **Custom domain (optional):** **Domain management** → **Add custom domain** → e.g. `www.platform.vendorsoluce.com`.

---

## 2. Deploy the Marketing Website

This deployment serves the static marketing site, typically at **www.vendorsoluce.com**.

1. **Add new site** → Import the **same repository** (vendorsoluce-monorepo).
2. **Build settings:**
   - **Base directory:** `packages/website`
   - **Build command:** `npm run build`
   - **Publish directory:** `.` (i.e. the `packages/website` directory after the build step)
   - **Config file path:** `packages/website/netlify.toml` (if present; otherwise leave empty).
3. Deploy the site. In **Domain management**, add the custom domain **www.vendorsoluce.com** (or your chosen domain).

---

## 3. Deploy the Vendor Risk Portal

The vendor risk portal is a **separate React application** (`packages/vendor-risk-portal`) that boots `PortalApp` instead of the main platform `App`. It must be built and deployed independently from the platform — they share source code but produce different bundles.

> **Important:** Do NOT reuse the platform's build (`packages/app/dist`) for the portal. It will serve the platform app, not the portal.

1. **Add new site** → Import the **same repository** (vendorsoluce-monorepo).
2. **Build settings:**
   - **Base directory:** leave **empty** (so `npm ci` runs at the repo root and installs all workspaces)
   - **Build command:** `npm ci && npm run build:portal`
   - **Publish directory:** `packages/vendor-risk-portal/dist`
   - **Config file path:** `packages/vendor-risk-portal/netlify.toml`
3. **Environment variables:** Omit for demo (no Supabase). For production, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. In **Domain management**, add the custom domain **www.portal.vendorsoluce.com**.

The portal includes these public pages (no login required):
- `/` — Home with vendor assessment ID entry form
- `/how-it-works` — Full 6-step workflow explanation
- `/for-buyers` — Buyer guide, risk tier table, evidence vault
- `/for-vendors` — Vendor guide, preparation checklist, FAQ
- `/security` — Security and privacy approach
- `/demo` — Interactive demo (service types → requirements → assessment → gap analysis)
- `/vendor-assessments/:id` — Vendor assessment completion flow

---

## 4. Configure Cross-Site Links

The marketing site’s **Sign in**, **Start trial**, and similar links must point to your deployed platform and portal URLs. Configure this in the repository (and redeploy the marketing website) or via build-time configuration if you introduce environment-based URLs.

- **File:** `packages/website/assets/js/portal-config.js`
- **Variables:**
  - `VENDOR_PORTAL_BASE` — platform URL (e.g. `https://www.platform.vendorsoluce.com`)
  - `VENDOR_RISK_PORTAL_BASE` — vendor risk portal URL (e.g. `https://www.portal.vendorsoluce.com`)

After updating `portal-config.js`, redeploy the **marketing website** site so the new URLs take effect.

---

## 5. Build Reference

| Site | Base directory | Build command | Publish directory | Config file |
|------|----------------|----------------|-------------------|-------------|
| **Platform** | *(empty)* | `npm ci && npm run build:app` | `packages/app/dist` | *(empty — root netlify.toml)* |
| **Website** | `packages/website` | `npm run build` | `.` | `packages/website/netlify.toml` |
| **Portal** | *(empty)* | `npm ci && npm run build:portal` | `packages/vendor-risk-portal/dist` | `packages/vendor-risk-portal/netlify.toml` |

---

## Troubleshooting

| Issue | Resolution |
|-------|------------|
| **Build fails with "turbo not found" / "tsc not found" or workspace errors** | Keep **Base directory** empty for the platform and portal builds and ensure install includes dev dependencies (`npm ci --include=dev`) so build tooling is available. |
| **Platform build fails or site shows 503** | Ensure **Base directory** is empty (repo root). Netlify uses the root `.nvmrc` (Node 20) and `netlify.toml`; do not set Base to `packages/app`. Clear build cache (Site → Build & deploy → Build settings → Clear cache and retry deploy). |
| **Blank page or 404 on client-side routes** | The root `netlify.toml` includes SPA redirects (`/*` → `/index.html`). If you override the config file, ensure equivalent redirects are present. |
| **Environment variables not present in build** | Vite only inlines variables that start with `VITE_`. Add them under **Site configuration** → **Environment variables** in Netlify and trigger a new deploy. |
| **Marketing site links point to wrong URLs** | Update `packages/website/assets/js/portal-config.js` with the correct platform and portal URLs, then redeploy the marketing website site. |
