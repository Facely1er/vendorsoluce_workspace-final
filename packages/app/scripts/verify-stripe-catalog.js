#!/usr/bin/env node
/**
 * Verify Stripe product catalog against app expectations.
 * Run from packages/app:  node scripts/verify-stripe-catalog.js
 * Requires STRIPE_SECRET_KEY in env or in packages/app/.env.local (as STRIPE_SECRET_KEY=sk_live_...)
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

/** Monthly and Annual are distinct products (one product = one price). Amounts: canonical-public-pricing.json */
const EXPECTED_CATALOG = [
  { tier: 'starter', name: 'Starter', prices: [
    { amountCents: CANON.starterOneTimeCents, interval: null, envSuffix: '', productName: 'Starter' },
    { amountCents: CANON.starterUpdatesYearlyCents, interval: 'year', envSuffix: '_UPDATES', productName: 'Starter' },
  ]},
  { tier: 'professional', prices: [
    { amountCents: CANON.professionalMonthlyCents, interval: 'month', envSuffix: '_MONTHLY', productName: 'Professional - Monthly' },
    { amountCents: CANON.professionalAnnualCents, interval: 'year', envSuffix: '_ANNUAL', productName: 'Professional - Annual' },
  ]},
  { tier: 'enterprise', prices: [
    { amountCents: CANON.enterpriseMonthlyCents, interval: 'month', envSuffix: '_MONTHLY', productName: 'Enterprise - Monthly' },
    { amountCents: CANON.enterpriseAnnualCents, interval: 'year', envSuffix: '_ANNUAL', productName: 'Enterprise - Annual' },
  ]},
  { tier: 'federal', name: 'Federal', prices: [] },
];

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !key.startsWith('sk_')) {
    console.error('Set STRIPE_SECRET_KEY (e.g. sk_live_...) in env or .env.local and run from packages/app:');
    console.error('  node scripts/verify-stripe-catalog.js');
    console.error('  Or: STRIPE_SECRET_KEY=sk_live_xxx node scripts/verify-stripe-catalog.js');
    process.exit(1);
  }

  const stripe = new Stripe(key, { apiVersion: '2023-10-16' });

  console.log('Fetching Stripe products and prices...\n');

  const products = await stripe.products.list({ limit: 100, active: true });
  const allPrices = [];
  for (const p of products.data) {
    const prices = await stripe.prices.list({ product: p.id, limit: 20, active: true });
    for (const pr of prices.data) {
      allPrices.push({
        productId: p.id,
        productName: p.name,
        priceId: pr.id,
        unitAmount: pr.unit_amount,
        currency: pr.currency,
        recurring: pr.recurring,
      });
    }
  }

  console.log('--- Products in Stripe ---');
  for (const p of products.data) {
    const pricesForProduct = allPrices.filter(pr => pr.productId === p.id);
    console.log(`  ${p.id}  ${p.name}`);
    for (const pr of pricesForProduct) {
      const amt = pr.unit_amount != null ? `$${(pr.unit_amount / 100).toFixed(2)}` : 'N/A';
      const interval = pr.recurring?.interval ? `/${pr.recurring.interval}` : '';
      console.log(`    → ${pr.priceId}  ${amt}${interval}  ${pr.currency || ''}`);
    }
    console.log('');
  }

  console.log('--- Match to app catalog (Monthly and Annual as distinct SKUs) ---');
  const netlifyLines = [];

  for (const expected of EXPECTED_CATALOG) {
    const tierEnv = expected.tier.toUpperCase().replace(/-/g, '_');

    if (expected.tier === 'federal') {
      const federalPrice = allPrices.find(p =>
        p.productName.toLowerCase().includes('federal') && p.recurring?.interval === 'month'
      );
      if (federalPrice) {
        console.log(`  ${expected.tier}: (custom) ${federalPrice.priceId}  [${federalPrice.productName}]`);
        netlifyLines.push(`VITE_STRIPE_PRICE_${tierEnv}=${federalPrice.priceId}`);
      } else {
        console.log(`  ${expected.tier}: (custom) → configure manually`);
        netlifyLines.push(`# VITE_STRIPE_PRICE_${tierEnv}=price_xxx  # optional`);
      }
      continue;
    }

    for (const pr of expected.prices || []) {
      const envVar = `VITE_STRIPE_PRICE_${tierEnv}${pr.envSuffix || ''}`;
      const interval = pr.interval === 'year' ? 'year' : pr.interval === 'month' ? 'month' : null;

      const candidates = allPrices.filter(p => {
        if (p.currency !== 'usd') return false;
        if (interval === null) return !p.recurring && p.unit_amount === pr.amountCents;
        return p.recurring?.interval === interval && p.unit_amount === pr.amountCents;
      });

      const productName = pr.productName || expected.name;
      const nameMatch = candidates.find(p =>
        p.productName.toLowerCase() === productName.toLowerCase()
      );
      const chosen = nameMatch || candidates[0];

      if (chosen) {
        const amt = chosen.unit_amount != null ? `$${(chosen.unit_amount / 100).toFixed(0)}` : 'N/A';
        const inter = interval ? `/${interval}` : ' one-time';
        console.log(`  ${expected.tier}${pr.envSuffix}: ${chosen.priceId}  [${chosen.productName}] ${amt}${inter}`);
        netlifyLines.push(`${envVar}=${chosen.priceId}`);
      } else {
        const inter = interval ? `/${interval}` : ' one-time';
        console.log(`  ${expected.tier}${pr.envSuffix}: NOT FOUND — create $${(pr.amountCents / 100).toFixed(0)}${inter}`);
        netlifyLines.push(`# ${envVar}=price_xxx  # create: $${(pr.amountCents / 100).toFixed(0)}${inter}`);
      }
    }
  }

  console.log('\n--- Netlify env (paste Price IDs) ---');
  console.log(netlifyLines.join('\n'));
  console.log('\nDone.');
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});
