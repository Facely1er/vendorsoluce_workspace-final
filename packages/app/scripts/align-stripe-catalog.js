#!/usr/bin/env node
/**
 * Align Stripe product catalog with project pricing and create Payment Links.
 * Monthly and Annual are distinct Price objects (separate SKUs).
 *
 * - Starter: $999 one-time + $99/yr Updates (separate SKU) — configure manually or use rebuild-stripe-catalog.js
 * Amounts: src/config/canonical-public-pricing.json (www.vendorsoluce.com pricing)
 *
 * Run from packages/app with STRIPE_SECRET_KEY set.
 */

import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { readCanonicalPricing } from './readCanonicalPricing.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CANON = readCanonicalPricing();
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath) && !process.env.STRIPE_SECRET_KEY) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const m = line.match(/^\s*STRIPE_SECRET_KEY\s*=\s*(.+?)\s*$/);
    if (m) {
      process.env.STRIPE_SECRET_KEY = m[1].replace(/^["']|["']$/g, '').trim();
      break;
    }
  }
}

const BASE_URL = process.env.APP_URL || 'https://www.platform.vendorsoluce.com';
const TRIAL_DAYS = 14;

const PROJECT_CATALOG = [
  {
    tier: 'starter',
    name: 'Starter',
    note: 'Use rebuild-stripe-catalog.js. $999 one-time + $99/yr Updates (separate SKU).',
  },
  {
    tier: 'professional',
    products: [
      { productName: 'Professional - Monthly', amountCents: CANON.professionalMonthlyCents, interval: 'month', envSuffix: '_MONTHLY' },
      { productName: 'Professional - Annual', amountCents: CANON.professionalAnnualCents, interval: 'year', envSuffix: '_ANNUAL' },
    ],
  },
  {
    tier: 'enterprise',
    products: [
      { productName: 'Enterprise - Monthly', amountCents: CANON.enterpriseMonthlyCents, interval: 'month', envSuffix: '_MONTHLY' },
      { productName: 'Enterprise - Annual', amountCents: CANON.enterpriseAnnualCents, interval: 'year', envSuffix: '_ANNUAL' },
    ],
  },
  { tier: 'federal', name: 'Federal', note: 'Custom pricing — configure manually.' },
];

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !key.startsWith('sk_')) {
    console.error('Set STRIPE_SECRET_KEY and run from packages/app.');
    process.exit(1);
  }

  const stripe = new Stripe(key, { apiVersion: '2023-10-16' });

  console.log('Aligning Stripe catalog (Monthly and Annual as distinct SKUs)...');
  console.log('Redirect base URL:', BASE_URL, '\n');

  const products = await stripe.products.list({ limit: 100, active: true });
  const results = [];
  const successUrl = `${BASE_URL.replace(/\/$/, '')}/signin?from_checkout=true&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${BASE_URL.replace(/\/$/, '')}/pricing`;

  for (const expected of PROJECT_CATALOG) {
    if (expected.note) {
      console.log(`  ${expected.tier}: ${expected.note}`);
      results.push({ tier: expected.tier, prices: {}, links: {} });
      continue;
    }

    const tierResults = { tier: expected.tier, prices: {}, links: {} };

    for (const pr of expected.products || []) {
      const product = products.data.find(p =>
        p.name.toLowerCase() === pr.productName.toLowerCase()
      );
      if (!product) {
        console.log(`  ${expected.tier} (${pr.envSuffix}): No product "${pr.productName}" — use rebuild-stripe-catalog.js first.`);
        continue;
      }

      const prices = await stripe.prices.list({ product: product.id, active: true });
      const interval = pr.interval === 'year' ? 'year' : 'month';
      const existing = prices.data.find(p =>
        p.recurring?.interval === interval && p.currency === 'usd' && p.unit_amount === pr.amountCents
      );

      let priceId;
      if (existing) {
        priceId = existing.id;
        console.log(`  ${expected.tier} (${pr.envSuffix}): OK $${(pr.amountCents / 100).toFixed(0)}/${interval} → ${priceId}`);
      } else {
        const newPrice = await stripe.prices.create({
          currency: 'usd',
          product: product.id,
          unit_amount: pr.amountCents,
          recurring: { interval },
          nickname: pr.productName,
        });
        priceId = newPrice.id;
        console.log(`  ${expected.tier} (${pr.envSuffix}): CREATED $${(pr.amountCents / 100).toFixed(0)}/${interval} → ${priceId}`);
      }

      tierResults.prices[pr.envSuffix] = priceId;

      const link = await stripe.paymentLinks.create({
        line_items: [{ price: priceId, quantity: 1 }],
        after_completion: { type: 'redirect', redirect: { url: successUrl } },
        metadata: { plan: expected.tier, tier: expected.tier, interval: pr.interval, source: 'align-catalog' },
        subscription_data: {
          trial_period_days: TRIAL_DAYS,
          metadata: { plan: expected.tier, tier: expected.tier, interval: pr.interval },
        },
        allow_promotion_codes: true,
        billing_address_collection: 'required',
      });
      tierResults.links[pr.envSuffix] = link.url;
      console.log(`           Payment Link${pr.envSuffix} → ${link.url}`);
    }
    results.push(tierResults);
  }

  console.log('\n--- Netlify env (Price IDs + Payment Links) ---');
  for (const r of results) {
    const tier = r.tier.toUpperCase().replace(/-/g, '_');
    if (r.prices) {
      for (const [suffix, priceId] of Object.entries(r.prices)) {
        console.log(`VITE_STRIPE_PRICE_${tier}${suffix}=${priceId}`);
      }
    }
    if (r.links) {
      for (const [suffix, url] of Object.entries(r.links)) {
        console.log(`VITE_STRIPE_LINK_${tier}${suffix}=${url}`);
      }
      if (r.links._MONTHLY) console.log(`VITE_STRIPE_LINK_${tier}=${r.links._MONTHLY}`);
    }
  }
  console.log('\nDone. Set these env vars in Netlify/Vercel.');
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});
