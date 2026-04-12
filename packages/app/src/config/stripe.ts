/**
 * Stripe Configuration and Product Catalog
 *
 * Tier definitions and feature/limit helpers come from ./tiers.
 * This file adds Stripe-specific: priceId, productId, price, interval, checkout/portal.
 *
 * IMPORTANT: Monthly and Annual billing are distinct Price objects in the Stripe catalog.
 * Each has its own Price ID and Payment Link (e.g. VITE_STRIPE_PRICE_PROFESSIONAL_MONTHLY vs
 * VITE_STRIPE_PRICE_PROFESSIONAL_ANNUAL). Do not conflate them.
 *
 * | Tier          | Public list price (vendorsoluce.com) | Env vars (distinct Price IDs) |
 * |---------------|----------------------------------------|-------------------------------|
 * | starter       | See canonical-public-pricing.json      | VITE_STRIPE_PRICE_STARTER, VITE_STRIPE_PRICE_STARTER_UPDATES |
 * | professional  | See canonical-public-pricing.json      | VITE_STRIPE_PRICE_PROFESSIONAL_MONTHLY, VITE_STRIPE_PRICE_PROFESSIONAL_ANNUAL |
 * | enterprise    | See canonical-public-pricing.json      | VITE_STRIPE_PRICE_ENTERPRISE_MONTHLY, VITE_STRIPE_PRICE_ENTERPRISE_ANNUAL |
 * | federal       | Custom                                 | VITE_STRIPE_PRICE_FEDERAL     |
 *
 * Payment Links: VITE_STRIPE_LINK_*_MONTHLY and VITE_STRIPE_LINK_*_ANNUAL map to distinct
 * Stripe Payment Links (one per Price). getPaymentLink(plan, interval) returns the correct one.
 */

import {
  PRODUCTS as TIER_PRODUCTS,
  FEATURE_FLAGS,
  canAccessFeature as tiersCanAccessFeature,
  getUsageLimit as tiersGetUsageLimit,
  type TierKey,
} from './tiers';
import canonical from './canonical-public-pricing.json';

export { FEATURE_FLAGS };

const C = canonical as {
  starterOneTimeCents: number;
  starterUpdatesYearlyCents: number;
  professionalMonthlyCents: number;
  professionalAnnualCents: number;
  enterpriseMonthlyCents: number;
  enterpriseAnnualCents: number;
};

function formatUsdFromCents(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  // webhookSecret must NOT be read client-side — it is a server-only secret.
  // Webhooks are verified in Netlify Functions / Edge Functions, not in the browser bundle.
  webhookSecret: '',
  apiVersion: '2023-10-16' as const,
  currency: 'usd',
  trialPeriodDays: 14,
};

type StripeProduct = (typeof TIER_PRODUCTS)[TierKey] & {
  priceId: string | null;
  productId: string | null;
  /** Recurring list price in USD for monthly tiers; 0 where pricing is custom or non-monthly in UI */
  price: number;
  interval: 'month' | null;
};

export const PRODUCTS: Record<TierKey, StripeProduct> = {
  free: {
    ...TIER_PRODUCTS.free,
    priceId: null,
    productId: null,
    price: 0,
    interval: null,
  },
  starter: {
    ...TIER_PRODUCTS.starter,
    priceId: import.meta.env.VITE_STRIPE_PRICE_STARTER || null,
    productId: import.meta.env.VITE_STRIPE_PRODUCT_STARTER || null,
    price: 0,
    interval: null,
  },
  professional: {
    ...TIER_PRODUCTS.professional,
    priceId: import.meta.env.VITE_STRIPE_PRICE_PROFESSIONAL_MONTHLY || import.meta.env.VITE_STRIPE_PRICE_PROFESSIONAL || null,
    productId: import.meta.env.VITE_STRIPE_PRODUCT_PROFESSIONAL || null,
    price: C.professionalMonthlyCents / 100,
    interval: 'month',
  },
  enterprise: {
    ...TIER_PRODUCTS.enterprise,
    priceId: import.meta.env.VITE_STRIPE_PRICE_ENTERPRISE_MONTHLY || import.meta.env.VITE_STRIPE_PRICE_ENTERPRISE || null,
    productId: import.meta.env.VITE_STRIPE_PRODUCT_ENTERPRISE || null,
    price: C.enterpriseMonthlyCents / 100,
    interval: 'month',
  },
  federal: {
    ...TIER_PRODUCTS.federal,
    priceId: import.meta.env.VITE_STRIPE_PRICE_FEDERAL || null,
    productId: import.meta.env.VITE_STRIPE_PRODUCT_FEDERAL || null,
    price: 0,
    interval: 'month',
  },
};

/** Payment Link URLs by plan and billing interval. */
export type BillingInterval = 'month' | 'year';

const PAYMENT_LINKS_RAW: Record<string, string | undefined> = {
  starter: import.meta.env.VITE_STRIPE_LINK_STARTER || undefined,
  starter_updates: import.meta.env.VITE_STRIPE_LINK_STARTER_UPDATES || undefined,
  professional: import.meta.env.VITE_STRIPE_LINK_PROFESSIONAL_MONTHLY || import.meta.env.VITE_STRIPE_LINK_PROFESSIONAL || undefined,
  professional_monthly: import.meta.env.VITE_STRIPE_LINK_PROFESSIONAL_MONTHLY || undefined,
  professional_annual: import.meta.env.VITE_STRIPE_LINK_PROFESSIONAL_ANNUAL || undefined,
  enterprise_monthly: import.meta.env.VITE_STRIPE_LINK_ENTERPRISE_MONTHLY || import.meta.env.VITE_STRIPE_LINK_ENTERPRISE || undefined,
  enterprise_annual: import.meta.env.VITE_STRIPE_LINK_ENTERPRISE_ANNUAL || undefined,
  // enterprise fallback resolves to monthly (or the generic link) when no interval specified
  enterprise: import.meta.env.VITE_STRIPE_LINK_ENTERPRISE_MONTHLY || import.meta.env.VITE_STRIPE_LINK_ENTERPRISE || undefined,
  // Federal is custom/contact-sales — no self-serve payment link is exposed to the client bundle.
  federal: undefined,
};

/** Get Payment Link URL for plan and optional billing interval. Starter uses one-time only (no interval). */
export function getPaymentLink(plan: TierKey, interval?: BillingInterval): string | undefined {
  if (plan === 'free') return undefined;
  if (plan === 'starter') return PAYMENT_LINKS_RAW.starter; // One-time $999 only
  const intervalKey = interval === 'year' ? 'annual' : interval === 'month' ? 'monthly' : null;
  const compound = intervalKey ? `${plan}_${intervalKey}` : plan;
  const url = PAYMENT_LINKS_RAW[compound] || PAYMENT_LINKS_RAW[plan];
  return url || undefined;
}

/** Optional $99/yr updates link for Starter (sold separately, used from app billing). */
export function getStarterUpdatesLink(): string | undefined {
  return PAYMENT_LINKS_RAW.starter_updates;
}

/** @deprecated Use getPaymentLink(plan, interval) instead. Fallback for compatibility. */
export const PAYMENT_LINKS: Partial<Record<TierKey, string>> = {
  starter: getPaymentLink('starter') ?? undefined,
  professional: getPaymentLink('professional', 'month') ?? undefined,
  enterprise: getPaymentLink('enterprise', 'month') ?? undefined,
  federal: getPaymentLink('federal') ?? undefined,
};

/** User-facing price line for checkout and billing (aligned with vendorsoluce.com pricing). */
export function getPlanPriceLabel(plan: TierKey, interval?: BillingInterval): string {
  switch (plan) {
    case 'free':
      return 'Free';
    case 'starter':
      return `${formatUsdFromCents(C.starterOneTimeCents)} one-time license. ${formatUsdFromCents(C.starterUpdatesYearlyCents)}/yr Updates & Feeds is optional (separate SKU).`;
    case 'professional':
      return interval === 'year'
        ? `${formatUsdFromCents(C.professionalAnnualCents)}/year (Save 20%)`
        : `${formatUsdFromCents(C.professionalMonthlyCents)}/month`;
    case 'enterprise':
      return interval === 'year'
        ? `${formatUsdFromCents(C.enterpriseAnnualCents)}/year (Save 20%)`
        : `${formatUsdFromCents(C.enterpriseMonthlyCents)}/month`;
    case 'federal':
      return 'Custom pricing — contact sales';
    default:
      return '';
  }
}

export const ANNUAL_DISCOUNT = 0.2;

export const USAGE_PRICING = {
  sbom_scans: { starter: 5, professional: 3, enterprise: 0 },
  vendor_assessments: { starter: 10, professional: 5, enterprise: 0 },
  api_calls: { starter: 0.01, professional: 0.005, enterprise: 0 },
  additional_users: { starter: 0, professional: 20, enterprise: 0, federal: 0 },
};

const PRICE_ID_TO_TIER: Record<string, TierKey> = {};
function buildPriceIdMap() {
  const ids = [
    ['VITE_STRIPE_PRICE_STARTER', 'starter'],
    ['VITE_STRIPE_PRICE_STARTER_UPDATES', 'starter'],
    ['VITE_STRIPE_PRICE_PROFESSIONAL_MONTHLY', 'professional'],
    ['VITE_STRIPE_PRICE_PROFESSIONAL_ANNUAL', 'professional'],
    ['VITE_STRIPE_PRICE_ENTERPRISE_MONTHLY', 'enterprise'],
    ['VITE_STRIPE_PRICE_ENTERPRISE_ANNUAL', 'enterprise'],
    ['VITE_STRIPE_PRICE_FEDERAL', 'federal'],
  ] as const;
  for (const [envKey, tier] of ids) {
    const id = import.meta.env[envKey];
    if (id) PRICE_ID_TO_TIER[id] = tier;
  }
}
buildPriceIdMap();

export function getPlanByPriceId(priceId: string): TierKey | undefined {
  return PRICE_ID_TO_TIER[priceId] ?? (Object.entries(PRODUCTS).find(
    ([, p]) => p.priceId === priceId
  )?.[0] as TierKey) ?? undefined;
}

export function canAccessFeature(userTier: TierKey, feature: string): boolean {
  return tiersCanAccessFeature(userTier, feature);
}

export function getUsageLimit(
  userTier: TierKey,
  resource: keyof (typeof TIER_PRODUCTS)['free']['limits']
): number {
  return tiersGetUsageLimit(userTier, resource);
}

export function calculateOveragePrice(
  userTier: TierKey,
  resource: keyof typeof USAGE_PRICING,
  quantity: number
): number {
  const limit = getUsageLimit(
    userTier,
    resource as keyof (typeof TIER_PRODUCTS)['free']['limits']
  );
  if (limit === -1) return 0;
  const overage = Math.max(0, quantity - limit);
  const pricePerUnit =
    USAGE_PRICING[resource][userTier as keyof (typeof USAGE_PRICING)['sbom_scans']];
  return overage * (pricePerUnit || 0);
}

export function getCheckoutConfig(plan: TierKey) {
  const product = PRODUCTS[plan];
  if (!product.priceId) {
    throw new Error(`No price ID configured for plan: ${plan}`);
  }
  return {
    mode: 'subscription' as const,
    lineItems: [{ price: product.priceId, quantity: 1 }],
    customerEmail: undefined,
    clientReferenceId: undefined,
    successUrl: `${window.location.origin}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${window.location.origin}/pricing`,
    allowPromotionCodes: true,
    billingAddressCollection: 'required' as const,
    metadata: { plan, source: 'website' },
    subscriptionData: {
      trialPeriodDays: STRIPE_CONFIG.trialPeriodDays,
      metadata: { plan },
    },
  };
}

export function getCustomerPortalUrl(): string {
  return `${import.meta.env.VITE_API_URL || ''}/api/create-portal-session`;
}

export default STRIPE_CONFIG;
