#!/usr/bin/env node
/**
 * Rebuild Stripe catalog from scratch: Products, Prices, and Payment Links.
 * Serves the WEBSITE pricing page (packages/website/pricing.html).
 *
 * IMPORTANT: Monthly and Annual are distinct Price objects (separate SKUs).
 * Each tier has VITE_STRIPE_PRICE_*_MONTHLY and VITE_STRIPE_PRICE_*_ANNUAL.
 *
 * Amounts come from src/config/canonical-public-pricing.json (same as www.vendorsoluce.com/pricing).
 * Federal tier: custom — optional manual Stripe setup.
 *
 * Flow: Website CTAs -> platform/checkout -> Stripe Payment Link.
 * Cancel URL points to website pricing (vendorsoluce.com/pricing).
 *
 * Usage:
 *   cd packages/app
 *   STRIPE_SECRET_KEY=sk_live_xxx node scripts/rebuild-stripe-catalog.js
 *
 * Options:
 *   --dry-run    Print what would be created, don't call Stripe
 *   --archive    Archive existing products first (use with caution)
 */

import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { readCanonicalPricing } from './readCanonicalPricing.js';

const P = readCanonicalPricing();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPaths = [
  path.join(process.cwd(), '.env.local'),
  path.join(__dirname, '..', '.env.local'),
];
if (!process.env.STRIPE_SECRET_KEY) {
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const m = line.match(/^\s*STRIPE_SECRET_KEY\s*=\s*(.+?)\s*$/);
        if (m) {
          process.env.STRIPE_SECRET_KEY = m[1].replace(/^["']|["']$/g, '').trim();
          break;
        }
      }
      if (process.env.STRIPE_SECRET_KEY) break;
    }
  }
}

const PLATFORM_URL = process.env.APP_URL || process.env.PLATFORM_URL || 'https://www.platform.vendorsoluce.com';
const WEBSITE_URL = process.env.WEBSITE_URL || 'https://www.vendorsoluce.com';
const DRY_RUN = process.argv.includes('--dry-run');
const ARCHIVE = process.argv.includes('--archive');

// For dry-run, allow placeholder key since we never call Stripe
const key = process.env.STRIPE_SECRET_KEY || (DRY_RUN ? 'sk_test_dry_run' : '');

const CATALOG = [
  {
    tier: 'starter',
    productName: 'Starter',
    productDescription: 'Local-first TPRM — one-time license.',
    prices: [
      { amountCents: P.starterOneTimeCents, nickname: 'Starter License (one-time)', recurring: null },
    ],
    paymentLinkMode: 'payment',
  },
  {
    tier: 'starter_updates',
    productName: 'Starter Updates',
    productDescription: 'Optional $99/yr for product updates, feed refreshes & support. Sold separately from Starter license.',
    prices: [
      { amountCents: P.starterUpdatesYearlyCents, nickname: 'Starter Updates (annual)', recurring: { interval: 'year' }, intervalKey: 'annual' },
    ],
    paymentLinkMode: 'subscription',
  },
  {
    tier: 'professional',
    intervalKey: 'monthly',
    productName: 'Professional - Monthly',
    productDescription: 'The complete vendor risk workflow — SaaS. Billed monthly.',
    prices: [
      { amountCents: P.professionalMonthlyCents, nickname: 'Professional Monthly', recurring: { interval: 'month' }, intervalKey: 'monthly' },
    ],
    paymentLinkMode: 'subscription',
  },
  {
    tier: 'professional',
    intervalKey: 'annual',
    productName: 'Professional - Annual',
    productDescription: 'The complete vendor risk workflow — SaaS. Billed annually (20% off).',
    prices: [
      { amountCents: P.professionalAnnualCents, nickname: 'Professional Annual', recurring: { interval: 'year' }, intervalKey: 'annual' },
    ],
    paymentLinkMode: 'subscription',
  },
  {
    tier: 'enterprise',
    intervalKey: 'monthly',
    productName: 'Enterprise - Monthly',
    productDescription: 'Client-hosted or private-backend — your infrastructure. Billed monthly.',
    prices: [
      { amountCents: P.enterpriseMonthlyCents, nickname: 'Enterprise Monthly', recurring: { interval: 'month' }, intervalKey: 'monthly' },
    ],
    paymentLinkMode: 'subscription',
  },
  {
    tier: 'enterprise',
    intervalKey: 'annual',
    productName: 'Enterprise - Annual',
    productDescription: 'Client-hosted or private-backend — your infrastructure. Billed annually (20% off).',
    prices: [
      { amountCents: P.enterpriseAnnualCents, nickname: 'Enterprise Annual', recurring: { interval: 'year' }, intervalKey: 'annual' },
    ],
    paymentLinkMode: 'subscription',
  },
  {
    tier: 'federal',
    productName: 'Federal & Custom',
    productDescription: 'CMMC, FedRAMP, FISMA — scoped per program',
    prices: [],
    paymentLinkMode: null,
    note: 'Custom pricing — create Product/Price in Dashboard and Payment Link manually.',
  },
];

async function main() {
  if (!key || !key.startsWith('sk_')) {
    console.error('Set STRIPE_SECRET_KEY (e.g. sk_live_...) and run from packages/app:');
    console.error('  node scripts/rebuild-stripe-catalog.js');
    process.exit(1);
  }

  const stripe = new Stripe(key, { apiVersion: '2023-10-16' });

  console.log('Stripe catalog rebuild (for website pricing page)');
  console.log('  Platform (success):', PLATFORM_URL);
  console.log('  Website (cancel):', WEBSITE_URL);
  console.log('  Mode:', DRY_RUN ? 'DRY RUN (no API calls)' : 'LIVE');
  if (ARCHIVE) console.log('  Archive: will archive existing products');
  console.log('');

  const successUrl = `${PLATFORM_URL.replace(/\/$/, '')}/signin?from_checkout=true&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${WEBSITE_URL.replace(/\/$/, '')}/pricing`;

  const results = [];
  const resultsByTier = {}; // accumulate by tier for multi-product tiers (professional, enterprise)

  for (const plan of CATALOG) {
    const label = plan.intervalKey ? `${plan.tier}-${plan.intervalKey}` : plan.tier;
    console.log(`--- ${label.toUpperCase()} ---`);

    if (plan.note && !plan.prices?.length) {
      console.log('  ', plan.note);
      results.push({ tier: plan.tier, productId: null, priceIds: [], paymentLinkUrl: null });
      continue;
    }

    let product;
    if (!DRY_RUN) {
      if (ARCHIVE) {
        const existing = await stripe.products.list({ limit: 100, active: true });
        const matches = existing.data.filter(p =>
          p.name.toLowerCase() === plan.productName.toLowerCase()
        );
        for (const m of matches) {
          await stripe.products.update(m.id, { active: false });
          console.log('  Archived:', m.id, m.name);
        }
      }

      product = await stripe.products.create({
        name: plan.productName,
        description: plan.productDescription,
        metadata: { tier: plan.tier, source: 'rebuild-script' },
      });
      console.log('  Created product:', product.id, product.name);
    } else {
      console.log('  [DRY RUN] Would create product:', plan.productName);
      product = { id: 'prod_xxx' };
    }

    const priceIds = [];
    for (const pr of plan.prices || []) {
      if (DRY_RUN) {
        console.log(
          '  [DRY RUN] Would create price:',
          `$${(pr.amountCents / 100).toFixed(0)}`,
          pr.recurring ? `/${pr.recurring.interval}` : 'one-time'
        );
        priceIds.push('price_xxx');
        continue;
      }

      const priceParams = {
        currency: 'usd',
        product: product.id,
        unit_amount: pr.amountCents,
        nickname: pr.nickname,
        metadata: { tier: plan.tier },
      };
      if (pr.recurring) priceParams.recurring = pr.recurring;

      const price = await stripe.prices.create(priceParams);
      priceIds.push(price.id);
      console.log('  Created price:', price.id, `$${pr.amountCents / 100}`, pr.recurring ? `/${pr.recurring.interval}` : 'one-time');
    }

    const paymentLinks = {}; // { monthly, annual } for subscription plans; { one_time, updates } for starter

    if (plan.paymentLinkMode === 'payment' && priceIds.length > 0) {
      // Starter: one-time $999 only. $99/yr updates optional (sold separately).
      const oneTimePrice = (plan.prices || []).find(p => !p.recurring);
      if (oneTimePrice) {
        const priceId = priceIds[plan.prices.indexOf(oneTimePrice)];
        if (DRY_RUN) {
          console.log('  [DRY RUN] Would create Payment Link (one-time):', priceId);
          paymentLinks.one_time = 'https://buy.stripe.com/xxx';
        } else {
          const link = await stripe.paymentLinks.create({
            line_items: [{ price: priceId, quantity: 1 }],
            after_completion: { type: 'redirect', redirect: { url: successUrl } },
            metadata: { plan: plan.tier, tier: plan.tier, source: 'rebuild-script' },
            allow_promotion_codes: true,
            billing_address_collection: 'required',
          });
          paymentLinks.one_time = link.url;
          console.log('  Created Payment Link (one-time):', link.url);
        }
      }
      // Optional: create link for $99/yr updates (for use in app when user adds updates later)
      const updatesPrice = (plan.prices || []).find(p => p.recurring && p.intervalKey === 'annual');
      if (updatesPrice) {
        const priceId = priceIds[plan.prices.indexOf(updatesPrice)];
        if (DRY_RUN) {
          console.log('  [DRY RUN] Would create Payment Link (updates, optional):', priceId);
          paymentLinks.updates = 'https://buy.stripe.com/xxx';
        } else {
          const link = await stripe.paymentLinks.create({
            line_items: [{ price: priceId, quantity: 1 }],
            after_completion: { type: 'redirect', redirect: { url: successUrl } },
            metadata: { plan: plan.tier, tier: plan.tier, interval: 'annual', type: 'updates', source: 'rebuild-script' },
            subscription_data: {
              metadata: { plan: plan.tier, tier: plan.tier, type: 'updates' },
            },
            allow_promotion_codes: true,
            billing_address_collection: 'required',
          });
          paymentLinks.updates = link.url;
          console.log('  Created Payment Link (updates, optional):', link.url);
        }
      }
    } else if (plan.paymentLinkMode === 'subscription' && priceIds.length > 0) {
      const recurringPrices = (plan.prices || []).filter(p => p.recurring);
      for (let i = 0; i < recurringPrices.length; i++) {
        const pr = recurringPrices[i];
        const priceId = priceIds[plan.prices.indexOf(pr)];
        const intervalKey = pr.intervalKey || pr.recurring?.interval || 'monthly';

        if (DRY_RUN) {
          console.log(`  [DRY RUN] Would create Payment Link (${intervalKey}):`, priceId);
          paymentLinks[intervalKey] = 'https://buy.stripe.com/xxx';
        } else {
          const linkParams = {
            line_items: [{ price: priceId, quantity: 1 }],
            after_completion: { type: 'redirect', redirect: { url: successUrl } },
            metadata: { plan: plan.tier, tier: plan.tier, interval: intervalKey, source: 'rebuild-script' },
            subscription_data: {
              metadata: { plan: plan.tier, tier: plan.tier, interval: intervalKey },
            },
            allow_promotion_codes: true,
            billing_address_collection: 'required',
          };
          const link = await stripe.paymentLinks.create(linkParams);
          paymentLinks[intervalKey] = link.url;
          console.log(`  Created Payment Link (${intervalKey}):`, link.url);
        }
      }
    }

    const oneTimeIdx = (plan.prices || []).findIndex(p => !p.recurring);
    const entry = {
      tier: plan.tier,
      productId: product?.id,
      priceIds,
      priceOneTime: oneTimeIdx >= 0 ? priceIds[oneTimeIdx] : null,
      priceByInterval: Object.fromEntries(
        (plan.prices || []).filter(p => p.recurring).map((p) => {
          const idx = plan.prices.indexOf(p);
          return [p.intervalKey || p.recurring?.interval || 'monthly', priceIds[idx]];
        })
      ),
      paymentLinks,
    };

    if (plan.intervalKey && resultsByTier[plan.tier]) {
      Object.assign(resultsByTier[plan.tier].priceByInterval, entry.priceByInterval);
      Object.assign(resultsByTier[plan.tier].paymentLinks, entry.paymentLinks);
    } else {
      const merged = { ...entry };
      resultsByTier[plan.tier] = merged;
      results.push(merged);
    }
    console.log('');
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('ENV VARS — paste into Netlify / Supabase / .env');
  console.log('═══════════════════════════════════════════════════════════\n');

  for (const r of results) {
    const t = r.tier.toUpperCase();
    if (r.tier === 'starter') {
      if (r.priceOneTime) console.log(`VITE_STRIPE_PRICE_STARTER=${r.priceOneTime}`);
      if (r.paymentLinks?.one_time) {
        console.log(`VITE_STRIPE_LINK_STARTER=${r.paymentLinks.one_time}`);
      }
    } else if (r.tier === 'starter_updates') {
      const priceId = r.priceByInterval?.annual || r.priceIds?.[0];
      if (priceId) console.log(`VITE_STRIPE_PRICE_STARTER_UPDATES=${priceId}`);
      if (r.paymentLinks?.annual) {
        console.log(`VITE_STRIPE_LINK_STARTER_UPDATES=${r.paymentLinks.annual}`);
      }
    } else {
      if (r.priceByInterval) {
        for (const [intervalKey, priceId] of Object.entries(r.priceByInterval)) {
          const suffix = intervalKey === 'monthly' ? '_MONTHLY' : '_ANNUAL';
          console.log(`VITE_STRIPE_PRICE_${t}${suffix}=${priceId}`);
        }
      }
      if (r.paymentLinks) {
        for (const [intervalKey, url] of Object.entries(r.paymentLinks)) {
          const envSuffix = intervalKey === 'monthly' ? '_MONTHLY' : '_ANNUAL';
          console.log(`VITE_STRIPE_LINK_${t}${envSuffix}=${url}`);
        }
        const defaultKey = 'monthly';
        if (r.paymentLinks[defaultKey]) {
          console.log(`VITE_STRIPE_LINK_${t}=${r.paymentLinks[defaultKey]}`);
        }
      }
    }
  }

  console.log('\nDone.');
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});
