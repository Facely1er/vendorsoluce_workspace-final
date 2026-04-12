# Rebuilding the Stripe Catalog

Use this guide when you need to recreate Products, Prices, and Payment Links in Stripe from scratch.

**Serves the website pricing page** (`packages/website/pricing.html`). The app pricing page is removed; CTAs go website → platform/checkout → Stripe.

## Prerequisites

- `STRIPE_SECRET_KEY` in environment or `packages/app/.env.local`
- Stripe account (test or live)

## Current Pricing (from packages/website/pricing.html)

**Monthly** and **Annual** are distinct products (one product = one price). No product shows 2 prices.

| Tier | Price | Env vars |
|------|-------|----------|
| **Starter** | $999 one-time (SKU); $99/yr Updates (separate SKU) | `VITE_STRIPE_PRICE_STARTER`, `VITE_STRIPE_PRICE_STARTER_UPDATES`, `VITE_STRIPE_LINK_STARTER`, `VITE_STRIPE_LINK_STARTER_UPDATES` |
| **Professional** | **Monthly:** $189/mo · **Annual:** $1,814/yr | `VITE_STRIPE_PRICE_PROFESSIONAL_MONTHLY`, `VITE_STRIPE_PRICE_PROFESSIONAL_ANNUAL`, `VITE_STRIPE_LINK_PROFESSIONAL_*` |
| **Enterprise** | **Monthly:** $549/mo · **Annual:** $5,270/yr | `VITE_STRIPE_PRICE_ENTERPRISE_MONTHLY`, `VITE_STRIPE_PRICE_ENTERPRISE_ANNUAL`, `VITE_STRIPE_LINK_ENTERPRISE_*` |
| **Federal** | Custom | Optional; create in Dashboard |

## Option A: Automated Rebuild Script

```bash
cd packages/app
npm run rebuild-stripe-catalog
```

**Dry run first** (no API calls):

```bash
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY node scripts/rebuild-stripe-catalog.js --dry-run
```

**Archive existing products** before creating new ones (use with caution):

```bash
node scripts/rebuild-stripe-catalog.js --archive
```

The script will:

1. Create Products (one product = one price):
   - Starter: 1 product with 2 prices (one-time + updates)
   - Professional - Monthly: 1 product, $189/month
   - Professional - Annual: 1 product, $1,814/year
   - Enterprise - Monthly: 1 product, $549/month
   - Enterprise - Annual: 1 product, $5,270/year
3. Create Payment Links for each Price (one per SKU)
4. Print env vars to paste into Netlify / Supabase

**Starter:** $999 one-time and $99/yr Updates are separate SKUs. Checkout uses the one-time link; the app offers the Updates link separately to existing license holders.

## Option B: Manual Build in Stripe Dashboard

1. **Products** (one product = one price; no product shows 2 prices)
   - Starter (2 prices: one-time + updates)
   - Professional - Monthly ($189/month)
   - Professional - Annual ($1,814/year)
   - Enterprise - Monthly ($549/month)
   - Enterprise - Annual ($5,270/year)
   - Federal & Custom (optional)

2. **Payment Links**
   - For each product, create a Payment Link with the recurring price
   - **After completion:** `https://www.platform.vendorsoluce.com/signin?from_checkout=true&session_id={CHECKOUT_SESSION_ID}`
   - **Cancel:** `https://www.vendorsoluce.com/pricing` (website pricing page)
   - **Metadata:** Add `plan` and `tier` so webhooks can set `subscription_tier`

3. **Env vars** (Netlify / Supabase) — set both Price IDs and Payment Links per SKU
   - Starter: `VITE_STRIPE_PRICE_STARTER`, `VITE_STRIPE_PRICE_STARTER_UPDATES`, `VITE_STRIPE_LINK_STARTER`, `VITE_STRIPE_LINK_STARTER_UPDATES`
   - Professional: `VITE_STRIPE_PRICE_PROFESSIONAL_MONTHLY`, `VITE_STRIPE_PRICE_PROFESSIONAL_ANNUAL`, `VITE_STRIPE_LINK_PROFESSIONAL_MONTHLY`, `VITE_STRIPE_LINK_PROFESSIONAL_ANNUAL`
   - Enterprise: same pattern with `_MONTHLY` and `_ANNUAL`
   - Federal: optional

## After Rebuild

1. Paste the printed env vars into your deployment (Netlify, Vercel, etc.)
2. Redeploy the app
3. Update Stripe webhooks if you changed product/price IDs so `subscription_tier` mapping still works

## Webhook Mapping

Your webhook should set `subscription_tier` from subscription metadata (`plan` or `tier`) or from the price ID. Tier keys: `starter`, `professional`, `enterprise`, `federal`.
