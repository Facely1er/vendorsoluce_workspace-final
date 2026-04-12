// Enhanced Stripe Product Catalog with Distinctive Monthly/Annual Itemization
// File: src/lib/stripeProducts.ts
//
// Main-tier list prices: ../config/canonical-public-pricing.json (same as www.vendorsoluce.com/pricing).

import canonical from '../config/canonical-public-pricing.json';
import { logger } from '../utils/logger';

const C = canonical as {
  starterOneTimeCents: number;
  starterUpdatesYearlyCents: number;
  professionalMonthlyCents: number;
  professionalAnnualCents: number;
  enterpriseMonthlyCents: number;
  enterpriseAnnualCents: number;
};

export interface StripeProduct {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  currency: string;
  interval: 'month' | 'year' | 'one_time';
  features: string[];
  limits: {
    users: number;
    vendors: number;
    assessments: number;
    storage: string;
  };
  stripePriceId: string; // Actual Stripe Price ID
  stripeProductId: string; // Actual Stripe Product ID
  complianceFrameworks: string[];
  whiteLabel: boolean;
  productType: 'main' | 'addon' | 'bundle';
  billingModel: 'monthly' | 'annual' | 'one_time';
}

// Starter: $999 one-time (matches website vendorsoluce.com/pricing). $99/yr Updates optional, separate SKU.
const STARTER_PRODUCT: StripeProduct = {
  id: 'starter',
  name: 'Starter',
  description: 'Local-first TPRM — one-time license. Assess vendors with zero cloud dependency. Risk scoring runs in your browser.',
  price: 99900, // $999 one-time (matches website)
  currency: 'usd',
  interval: 'one_time',
  features: [
    'Up to 5 team members',
    'Up to 25 vendor assessments',
    'NIST SP 800-161 inherent risk scoring (client-side)',
    'Vendor Review Reports — PDF export, audit-ready',
    'Vendor Threat Radar for up to 25 vendors',
    'Basic dashboard + risk assessment workflows',
    'Up to 2GB local storage',
    'Optional: $99/yr Updates & Feeds (separate SKU)'
  ],
  limits: {
    users: 5,
    vendors: 25,
    assessments: 100,
    storage: '2GB'
  },
  stripePriceId: 'price_starter_one_time', // Use env VITE_STRIPE_PRICE_STARTER
  stripeProductId: 'prod_starter',
  complianceFrameworks: ['NIST'],
  whiteLabel: false,
  productType: 'main',
  billingModel: 'one_time'
};

// MAIN PRODUCTS - MONTHLY PLANS (aligned with website pricing.html). Starter is in ONE_TIME_MAIN_PRODUCTS.
export const MONTHLY_PRODUCTS: StripeProduct[] = [
  {
    id: 'professional-monthly',
    name: 'Professional Monthly',
    description: 'Advanced features for growing companies - Monthly billing',
    price: C.professionalMonthlyCents,
    currency: 'usd',
    interval: 'month',
    features: [
      'Up to 25 team members',
      'Up to 100 vendor assessments',
      'NIST SP 800-161 + CMMC 2.0 compliance framework support',
      'Advanced risk analytics (informational purposes)',
      'Priority support (response time targets apply)',
      'Up to 15GB document storage',
      'Custom reporting & dashboards',
      'API access (10,000 calls/month)',
      'White-label options',
      'Threat intelligence integration (third-party data)',
      'Workflow automation',
      'Custom templates'
    ],
    limits: {
      users: 25,
      vendors: 100,
      assessments: 500,
      storage: '15GB'
    },
    stripePriceId: 'price_1SDebBIUB3FoXZdhcPdM4wpJ',
    stripeProductId: 'prod_professional_monthly',
    complianceFrameworks: ['NIST', 'CMMC'],
    whiteLabel: true,
    productType: 'main',
    billingModel: 'monthly'
  },
  {
    id: 'enterprise-monthly',
    name: 'Enterprise Monthly',
    description: 'Full-featured solution for large organizations - Monthly billing',
    price: 54900, // $549/month (public pricing)
    currency: 'usd',
    interval: 'month',
    features: [
      'Unlimited team members (subject to fair use)',
      'Unlimited vendor assessments (subject to fair use)',
      'Compliance framework support (NIST, CMMC, SOC2, ISO27001)',
      'AI-powered risk insights (informational purposes)',
      '24/7 support available (email/ticket; phone during business hours)',
      'Up to 200GB document storage',
      'Advanced analytics & BI',
      'Full API access',
      'Custom integrations',
      'White-label branding',
      'SLA guarantee (terms defined in Enterprise Agreement)',
      'SSO/SAML authentication',
      'Multi-tenant support',
      'Dedicated account manager'
    ],
    limits: {
      users: -1, // unlimited
      vendors: -1, // unlimited
      assessments: -1, // unlimited
      storage: '200GB'
    },
    stripePriceId: 'price_1SDebAIUB3FoXZdhVCNrKzTl',
    stripeProductId: 'prod_enterprise_monthly',
    complianceFrameworks: ['NIST', 'CMMC', 'SOC2', 'ISO27001', 'FEDRAMP', 'FISMA'],
    whiteLabel: true,
    productType: 'main',
    billingModel: 'monthly'
  },
  {
    id: 'federal-monthly',
    name: 'Federal Monthly',
    description: 'Government-grade compliance for federal contractors - Monthly billing',
    price: 0, // Custom pricing - contact sales
    currency: 'usd',
    interval: 'month',
    features: [
      'Unlimited team members (subject to fair use)',
      'Unlimited vendor assessments (subject to fair use)',
      'FedRAMP and FISMA compliance tracking and reporting tools',
      'Government security standards alignment',
      'Dedicated federal support team (business hours)',
      'Up to 1TB secure document storage',
      'FedRAMP reporting templates',
      'FISMA compliance tracking tools',
      'Government API access',
      'Custom federal integrations',
      'White-label government branding',
      'SLA guarantee (terms defined in Federal Agreement)'
    ],
    limits: {
      users: -1, // unlimited
      vendors: -1, // unlimited
      assessments: -1, // unlimited
      storage: '1TB'
    },
    stripePriceId: 'price_1SEW7LIUB3FoXZdhCMLRq822',
    stripeProductId: 'prod_federal_monthly',
    complianceFrameworks: ['FEDRAMP', 'FISMA', 'NIST', 'CMMC'],
    whiteLabel: true,
    productType: 'main',
    billingModel: 'monthly'
  }
];

// MAIN PRODUCTS - ANNUAL PLANS — amounts from canonical-public-pricing.json (website headlines)
export const ANNUAL_PRODUCTS: StripeProduct[] = [
  {
    id: 'professional-annual',
    name: 'Professional Annual',
    description: 'Advanced features for growing companies - Annual billing (Save 20%)',
    price: C.professionalAnnualCents,
    currency: 'usd',
    interval: 'year',
    features: [
      'Up to 25 team members',
      'Up to 100 vendor assessments',
      'NIST SP 800-161 + CMMC 2.0 compliance framework support',
      'Advanced risk analytics (informational purposes)',
      'Priority support (response time targets apply)',
      'Up to 15GB document storage',
      'Custom reporting & dashboards',
      'API access (10,000 calls/month)',
      'White-label options',
      'Threat intelligence integration (third-party data)',
      'Workflow automation',
      'Custom templates',
      '20% annual discount',
      'Priority feature requests',
      'Quarterly business reviews'
    ],
    limits: {
      users: 25,
      vendors: 100,
      assessments: 500,
      storage: '15GB'
    },
    stripePriceId: 'price_1SDebBIUB3FoXZdhkYjMHNtc',
    stripeProductId: 'prod_professional_annual',
    complianceFrameworks: ['NIST', 'CMMC'],
    whiteLabel: true,
    productType: 'main',
    billingModel: 'annual'
  },
  {
    id: 'enterprise-annual',
    name: 'Enterprise Annual',
    description: 'Full-featured solution for large organizations - Annual billing (Save 20%)',
    price: C.enterpriseAnnualCents,
    currency: 'usd',
    interval: 'year',
    features: [
      'Unlimited team members (subject to fair use)',
      'Unlimited vendor assessments (subject to fair use)',
      'Compliance framework support (NIST, CMMC, SOC2, ISO27001)',
      'AI-powered risk insights (informational purposes)',
      '24/7 support available (email/ticket; phone during business hours)',
      'Up to 200GB document storage',
      'Advanced analytics & BI',
      'Full API access',
      'Custom integrations',
      'White-label branding',
      'SLA guarantee (terms defined in Enterprise Agreement)',
      'SSO/SAML authentication',
      'Multi-tenant support',
      'Dedicated account manager',
      '20% annual discount',
      'Priority feature requests',
      'Quarterly business reviews',
      'Dedicated success manager'
    ],
    limits: {
      users: -1, // unlimited
      vendors: -1, // unlimited
      assessments: -1, // unlimited
      storage: '200GB'
    },
    stripePriceId: 'price_1SDebAIUB3FoXZdhxCMBROTw',
    stripeProductId: 'prod_enterprise_annual',
    complianceFrameworks: ['NIST', 'CMMC', 'SOC2', 'ISO27001', 'FEDRAMP', 'FISMA'],
    whiteLabel: true,
    productType: 'main',
    billingModel: 'annual'
  },
  {
    id: 'federal-annual',
    name: 'Federal Annual',
    description: 'Government-grade compliance for federal contractors - Annual billing (Save 20%)',
    price: 0, // Custom pricing - contact sales
    currency: 'usd',
    interval: 'year',
    features: [
      'Unlimited team members (subject to fair use)',
      'Unlimited vendor assessments (subject to fair use)',
      'FedRAMP and FISMA compliance tracking and reporting tools',
      'Government security standards alignment',
      'Dedicated federal support team (business hours)',
      'Up to 1TB secure document storage',
      'FedRAMP reporting templates',
      'FISMA compliance tracking tools',
      'Government API access',
      'Custom federal integrations',
      'White-label government branding',
      'SLA guarantee (terms defined in Federal Agreement)',
      '20% annual discount',
      'Priority feature requests',
      'Quarterly business reviews',
      'Dedicated federal success manager'
    ],
    limits: {
      users: -1, // unlimited
      vendors: -1, // unlimited
      assessments: -1, // unlimited
      storage: '1TB'
    },
    stripePriceId: 'price_1SEW7MIUB3FoXZdhbOONitHb',
    stripeProductId: 'prod_federal_annual',
    complianceFrameworks: ['FEDRAMP', 'FISMA', 'NIST', 'CMMC'],
    whiteLabel: true,
    productType: 'main',
    billingModel: 'annual'
  }
];

// ADD-ON PRODUCTS - MONTHLY
export const MONTHLY_ADDONS: StripeProduct[] = [
  {
    id: 'additional-users-monthly',
    name: 'Additional Users Monthly',
    description: 'Add more team members to your plan - Monthly billing',
    price: 1000, // $10/month per user
    currency: 'usd',
    interval: 'month',
    features: [
      'Additional team member access',
      'Same permissions as base plan',
      'Monthly billing flexibility'
    ],
    limits: {
      users: 1,
      vendors: 0,
      assessments: 0,
      storage: '0GB'
    },
    stripePriceId: 'price_1SEW7NIUB3FoXZdhkqaB5Qd5',
    stripeProductId: 'prod_additional_users_monthly',
    complianceFrameworks: [],
    whiteLabel: false,
    productType: 'addon',
    billingModel: 'monthly'
  },
  {
    id: 'additional-vendors-monthly',
    name: 'Additional Vendors Monthly',
    description: 'Add more vendor assessment capacity - Monthly billing',
    price: 500, // $5/month per vendor
    currency: 'usd',
    interval: 'month',
    features: [
      'Additional vendor assessment slots',
      'Same assessment features as base plan',
      'Monthly billing flexibility'
    ],
    limits: {
      users: 0,
      vendors: 1,
      assessments: 0,
      storage: '0GB'
    },
    stripePriceId: 'price_1SDeb7IUB3FoXZdhZy1NxkUb',
    stripeProductId: 'prod_additional_vendors_monthly',
    complianceFrameworks: [],
    whiteLabel: false,
    productType: 'addon',
    billingModel: 'monthly'
  },
  {
    id: 'compliance-consulting-monthly',
    name: 'Compliance Consulting Monthly',
    description: 'Expert compliance consulting services - Monthly billing',
    price: 20000, // $200/month
    currency: 'usd',
    interval: 'month',
    features: [
      '2 hours monthly consulting (subject to availability)',
      'Compliance strategy guidance (informational only)',
      'Risk assessment reviews (informational purposes)',
      'Implementation support'
    ],
    limits: {
      users: 0,
      vendors: 0,
      assessments: 0,
      storage: '0GB'
    },
    stripePriceId: 'price_1SDeb6IUB3FoXZdhvMWpC2wD',
    stripeProductId: 'prod_compliance_consulting_monthly',
    complianceFrameworks: [],
    whiteLabel: false,
    productType: 'addon',
    billingModel: 'monthly'
  },
  {
    id: 'white-label-branding-monthly',
    name: 'White-Label Branding Monthly',
    description: 'Custom branding and white-label options - Monthly billing',
    price: 50000, // $500/month
    currency: 'usd',
    interval: 'month',
    features: [
      'Custom logo and branding',
      'White-label domain setup',
      'Custom email templates',
      'Branded reports and dashboards'
    ],
    limits: {
      users: 0,
      vendors: 0,
      assessments: 0,
      storage: '0GB'
    },
    stripePriceId: 'price_1SDeb5IUB3FoXZdhhyykch2G',
    stripeProductId: 'prod_white_label_branding_monthly',
    complianceFrameworks: [],
    whiteLabel: true,
    productType: 'addon',
    billingModel: 'monthly'
  }
];

// ADD-ON PRODUCTS - ANNUAL (20% DISCOUNT)
export const ANNUAL_ADDONS: StripeProduct[] = [
  {
    id: 'additional-users-annual',
    name: 'Additional Users Annual',
    description: 'Add more team members to your plan - Annual billing (Save 20%)',
    price: 9600, // $96/year per user (20% off $120)
    currency: 'usd',
    interval: 'year',
    features: [
      'Additional team member access',
      'Same permissions as base plan',
      '20% annual discount',
      'Priority support for add-on users'
    ],
    limits: {
      users: 1,
      vendors: 0,
      assessments: 0,
      storage: '0GB'
    },
    stripePriceId: 'price_1SEW7OIUB3FoXZdha3XuErNl',
    stripeProductId: 'prod_additional_users_annual',
    complianceFrameworks: [],
    whiteLabel: false,
    productType: 'addon',
    billingModel: 'annual'
  },
  {
    id: 'additional-vendors-annual',
    name: 'Additional Vendors Annual',
    description: 'Add more vendor assessment capacity - Annual billing (Save 20%)',
    price: 4800, // $48/year per vendor (20% off $60)
    currency: 'usd',
    interval: 'year',
    features: [
      'Additional vendor assessment slots',
      'Same assessment features as base plan',
      '20% annual discount',
      'Priority support for add-on vendors'
    ],
    limits: {
      users: 0,
      vendors: 1,
      assessments: 0,
      storage: '0GB'
    },
    stripePriceId: 'price_1SDeb7IUB3FoXZdhIIop7wuC',
    stripeProductId: 'prod_additional_vendors_annual',
    complianceFrameworks: [],
    whiteLabel: false,
    productType: 'addon',
    billingModel: 'annual'
  },
  {
    id: 'compliance-consulting-annual',
    name: 'Compliance Consulting Annual',
    description: 'Expert compliance consulting services - Annual billing (Save 20%)',
    price: 192000, // $1,920/year (20% off $2,400)
    currency: 'usd',
    interval: 'year',
    features: [
      '24 hours annual consulting (subject to availability)',
      'Compliance strategy guidance (informational only)',
      'Risk assessment reviews (informational purposes)',
      'Implementation support',
      '20% annual discount',
      'Quarterly compliance reviews'
    ],
    limits: {
      users: 0,
      vendors: 0,
      assessments: 0,
      storage: '0GB'
    },
    stripePriceId: 'price_1SDeb6IUB3FoXZdhx3gbyyVI',
    stripeProductId: 'prod_compliance_consulting_annual',
    complianceFrameworks: [],
    whiteLabel: false,
    productType: 'addon',
    billingModel: 'annual'
  },
  {
    id: 'white-label-branding-annual',
    name: 'White-Label Branding Annual',
    description: 'Custom branding and white-label options - Annual billing (Save 20%)',
    price: 480000, // $4,800/year (20% off $6,000)
    currency: 'usd',
    interval: 'year',
    features: [
      'Custom logo and branding',
      'White-label domain setup',
      'Custom email templates',
      'Branded reports and dashboards',
      '20% annual discount',
      'Priority branding support'
    ],
    limits: {
      users: 0,
      vendors: 0,
      assessments: 0,
      storage: '0GB'
    },
    stripePriceId: 'price_1SDeb5IUB3FoXZdhPQReXHuc',
    stripeProductId: 'prod_white_label_branding_annual',
    complianceFrameworks: [],
    whiteLabel: true,
    productType: 'addon',
    billingModel: 'annual'
  }
];

// BUNDLE PRODUCTS - MONTHLY
export const MONTHLY_BUNDLES: StripeProduct[] = [
  {
    id: 'compliance-suite-monthly',
    name: 'Compliance Suite Monthly',
    description: 'Complete compliance package with NIST, CMMC, and SOC2 - Monthly billing',
    price: 29900, // $299/month
    currency: 'usd',
    interval: 'month',
    features: [
      'Up to 50 team members',
      'Up to 200 vendor assessments',
      'Compliance framework support (NIST SP 800-161, CMMC 2.0, SOC2)',
      'Advanced risk analytics (informational purposes)',
      'Priority support (response time targets apply)',
      'Up to 25GB document storage',
      'Custom reporting & dashboards',
      'API access',
      'White-label options',
      'Compliance consulting included (2 hours/month)'
    ],
    limits: {
      users: 50,
      vendors: 200,
      assessments: 1000,
      storage: '25GB'
    },
    stripePriceId: 'price_1SDeb4IUB3FoXZdhfm0xRNs7',
    stripeProductId: 'prod_compliance_suite_monthly',
    complianceFrameworks: ['NIST', 'CMMC', 'SOC2'],
    whiteLabel: true,
    productType: 'bundle',
    billingModel: 'monthly'
  },
  {
    id: 'enterprise-plus-monthly',
    name: 'Enterprise Plus Monthly',
    description: 'Ultimate enterprise solution with all compliance frameworks - Monthly billing',
    price: 59900, // $599/month
    currency: 'usd',
    interval: 'month',
    features: [
      'Unlimited team members (subject to fair use)',
      'Unlimited vendor assessments (subject to fair use)',
      'Compliance framework support (NIST, CMMC, SOC2, ISO27001, FedRAMP, FISMA)',
      'AI-powered risk insights (informational purposes)',
      '24/7 support available (email/ticket; phone during business hours)',
      'Up to 500GB document storage',
      'Advanced analytics & BI',
      'Full API access',
      'Custom integrations',
      'White-label branding',
      'SLA guarantee (terms defined in Enterprise Agreement)',
      'Compliance consulting included (2 hours/month)',
      'Dedicated success manager'
    ],
    limits: {
      users: -1, // unlimited
      vendors: -1, // unlimited
      assessments: -1, // unlimited
      storage: '500GB'
    },
    stripePriceId: 'price_1SDeb3IUB3FoXZdhAiZ0Cryw',
    stripeProductId: 'prod_enterprise_plus_monthly',
    complianceFrameworks: ['NIST', 'CMMC', 'SOC2', 'ISO27001', 'FEDRAMP', 'FISMA'],
    whiteLabel: true,
    productType: 'bundle',
    billingModel: 'monthly'
  }
];

// BUNDLE PRODUCTS - ANNUAL (20% DISCOUNT)
export const ANNUAL_BUNDLES: StripeProduct[] = [
  {
    id: 'compliance-suite-annual',
    name: 'Compliance Suite Annual',
    description: 'Complete compliance package with NIST, CMMC, and SOC2 - Annual billing (Save 20%)',
    price: 287000, // $2,870/year (20% off $3,588)
    currency: 'usd',
    interval: 'year',
    features: [
      'Up to 50 team members',
      'Up to 200 vendor assessments',
      'Compliance framework support (NIST SP 800-161, CMMC 2.0, SOC2)',
      'Advanced risk analytics (informational purposes)',
      'Priority support (response time targets apply)',
      'Up to 25GB document storage',
      'Custom reporting & dashboards',
      'API access',
      'White-label options',
      'Compliance consulting included (2 hours/month)',
      '20% annual discount',
      'Priority feature requests',
      'Quarterly business reviews'
    ],
    limits: {
      users: 50,
      vendors: 200,
      assessments: 1000,
      storage: '25GB'
    },
    stripePriceId: 'price_1SDeb4IUB3FoXZdheg2gbYTo',
    stripeProductId: 'prod_compliance_suite_annual',
    complianceFrameworks: ['NIST', 'CMMC', 'SOC2'],
    whiteLabel: true,
    productType: 'bundle',
    billingModel: 'annual'
  },
  {
    id: 'enterprise-plus-annual',
    name: 'Enterprise Plus Annual',
    description: 'Ultimate enterprise solution with all compliance frameworks - Annual billing (Save 20%)',
    price: 575000, // $5,750/year (20% off $7,188)
    currency: 'usd',
    interval: 'year',
    features: [
      'Unlimited team members (subject to fair use)',
      'Unlimited vendor assessments (subject to fair use)',
      'Compliance framework support (NIST, CMMC, SOC2, ISO27001, FedRAMP, FISMA)',
      'AI-powered risk insights (informational purposes)',
      '24/7 support available (email/ticket; phone during business hours)',
      'Up to 500GB document storage',
      'Advanced analytics & BI',
      'Full API access',
      'Custom integrations',
      'White-label branding',
      'SLA guarantee (terms defined in Enterprise Agreement)',
      'Compliance consulting included (2 hours/month)',
      'Dedicated success manager',
      '20% annual discount',
      'Priority feature requests',
      'Quarterly business reviews'
    ],
    limits: {
      users: -1, // unlimited
      vendors: -1, // unlimited
      assessments: -1, // unlimited
      storage: '500GB'
    },
    stripePriceId: 'price_1SDeb3IUB3FoXZdhQHPKzfEy',
    stripeProductId: 'prod_enterprise_plus_annual',
    complianceFrameworks: ['NIST', 'CMMC', 'SOC2', 'ISO27001', 'FEDRAMP', 'FISMA'],
    whiteLabel: true,
    productType: 'bundle',
    billingModel: 'annual'
  }
];

// COMBINED PRODUCT CATALOG (Starter included once via ONE_TIME_MAIN; appears in both monthly/annual views)
export const ONE_TIME_MAIN_PRODUCTS: StripeProduct[] = [STARTER_PRODUCT];

export const ALL_STRIPE_PRODUCTS: StripeProduct[] = [
  ...MONTHLY_PRODUCTS,
  ...ANNUAL_PRODUCTS,
  ...ONE_TIME_MAIN_PRODUCTS,
  ...MONTHLY_ADDONS,
  ...ANNUAL_ADDONS,
  ...MONTHLY_BUNDLES,
  ...ANNUAL_BUNDLES
];

// Debug logging
logger.log('ALL_STRIPE_PRODUCTS loaded:', {
  total: ALL_STRIPE_PRODUCTS.length,
  monthly: MONTHLY_PRODUCTS.length,
  annual: ANNUAL_PRODUCTS.length,
  monthlyAddons: MONTHLY_ADDONS.length,
  annualAddons: ANNUAL_ADDONS.length,
  monthlyBundles: MONTHLY_BUNDLES.length,
  annualBundles: ANNUAL_BUNDLES.length,
  mainProducts: ALL_STRIPE_PRODUCTS.filter(p => p.productType === 'main').length,
  addonProducts: ALL_STRIPE_PRODUCTS.filter(p => p.productType === 'addon').length,
  bundleProducts: ALL_STRIPE_PRODUCTS.filter(p => p.productType === 'bundle').length
});

// HELPER FUNCTIONS
export const getProductById = (id: string): StripeProduct | undefined => {
  return ALL_STRIPE_PRODUCTS.find(p => p.id === id);
};

// Order: Starter, Professional, Enterprise, Federal (matches website pricing.html)
const MAIN_PRODUCT_ORDER = ['starter', 'professional', 'enterprise', 'federal'];

export const getMainProducts = (interval: 'monthly' | 'annual') => {
  const products = ALL_STRIPE_PRODUCTS.filter(p =>
    p.productType === 'main' && (p.billingModel === interval || p.billingModel === 'one_time')
  );
  return products.sort((a, b) => {
    const aIdx = MAIN_PRODUCT_ORDER.findIndex(t => a.id.startsWith(t) || a.name.toLowerCase().includes(t));
    const bIdx = MAIN_PRODUCT_ORDER.findIndex(t => b.id.startsWith(t) || b.name.toLowerCase().includes(t));
    return (aIdx < 0 ? 99 : aIdx) - (bIdx < 0 ? 99 : bIdx);
  });
};

export const getAddonProducts = (interval: 'monthly' | 'annual') => {
  return ALL_STRIPE_PRODUCTS.filter(p => 
    p.productType === 'addon' && p.billingModel === interval
  );
};

export const getBundleProducts = (interval: 'monthly' | 'annual') => {
  return ALL_STRIPE_PRODUCTS.filter(p => 
    p.productType === 'bundle' && p.billingModel === interval
  );
};

export const getProductsByBillingModel = (billingModel: 'monthly' | 'annual') => {
  return ALL_STRIPE_PRODUCTS.filter(p => p.billingModel === billingModel);
};

export const getProductsByType = (productType: 'main' | 'addon' | 'bundle') => {
  return ALL_STRIPE_PRODUCTS.filter(p => p.productType === productType);
};

// PRICING COMPARISON HELPERS
export const calculateAnnualSavings = (monthlyPrice: number): number => {
  const annualPrice = monthlyPrice * 12;
  const discountedAnnualPrice = annualPrice * 0.8; // 20% discount
  return annualPrice - discountedAnnualPrice;
};

export const getSavingsPercentage = (): number => {
  return 20; // 20% discount for annual plans
};
