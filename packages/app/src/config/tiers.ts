/**
 * Tier configuration — shared by SaaS (Stripe) and Enterprise (license) builds.
 * No Stripe or payment references. Used for feature flags and usage limits.
 *
 * Deployment context (see `deploymentOfferings.ts`):
 * - Standalone / no backend: these limits can be enforced entirely in the client or via license file.
 * - Your backend: same tier keys; Stripe (or license) defines entitlement while data lives in the customer project.
 * - Custom integration: tiers extend to SOW-specific SLAs and environments.
 */

import { getActiveTier, isPortalEnabled } from '../lib/licenseActivation';
import type { VendorSoluceTier } from '../lib/licenseActivation';

export type TierKey = 'free' | 'starter' | 'professional' | 'enterprise' | 'federal' | 'assessor';

export interface TierLimits {
  vendors: number;
  sbom_scans: number;
  assessments: number;
  users: number;
  api_calls: number;
  data_export: boolean;
  custom_branding: boolean;
  sso: boolean;
  priority_support: boolean;
}

export interface TierProduct {
  name: string;
  description: string;
  features: string[];
  limits: TierLimits;
}

export const PRODUCTS: Record<TierKey, TierProduct> = {
  free: {
    name: 'Free',
    description: 'Get started with basic features',
    features: [
      'Up to 5 vendors',
      '3 SBOM scans per month',
      '1 supply chain assessment',
      '1 user account',
      'Basic dashboard',
      'Community support',
    ],
    limits: {
      vendors: 5,
      sbom_scans: 3,
      assessments: 1,
      users: 1,
      api_calls: 0,
      data_export: false,
      custom_branding: false,
      sso: false,
      priority_support: false,
    },
  },
  starter: {
    name: 'Starter',
    description: 'Suitable for small teams getting started',
    features: [
      'Up to 5 team members',
      'Up to 25 vendor assessments',
      'NIST SP 800-161 compliance',
      'Basic risk scoring',
      'Email support',
      '2GB document storage',
      'PDF report generation',
    ],
    limits: {
      vendors: 25,
      sbom_scans: 10,
      assessments: 100,
      users: 5,
      api_calls: 100,
      data_export: true,
      custom_branding: false,
      sso: false,
      priority_support: false,
    },
  },
  professional: {
    name: 'Professional',
    description: 'Additional features for growing organizations',
    features: [
      'Up to 25 team members',
      'Up to 100 vendor assessments',
      'NIST SP 800-161 + CMMC 2.0 compliance',
      'Advanced risk analytics',
      'Priority support',
      '15GB document storage',
      'API access (10,000 calls/month)',
      'White-label options',
      'Advanced threat intelligence',
      'Workflow automation',
      'Custom templates',
    ],
    limits: {
      vendors: 100,
      sbom_scans: 50,
      assessments: 500,
      users: 25,
      api_calls: 10000,
      data_export: true,
      custom_branding: true,
      sso: false,
      priority_support: true,
    },
  },
  enterprise: {
    name: 'Enterprise',
    description: 'Comprehensive solution for large organizations',
    features: [
      'Unlimited vendors',
      'Unlimited SBOM scans',
      'Unlimited assessments',
      'Unlimited users',
      'NIST compliance tools',
      'Unlimited API access',
      'Dedicated account manager',
      'Custom integrations',
      'SSO/SAML authentication',
      'Advanced threat intelligence',
      'Professional services',
      'SLA guarantees',
      'Custom branding',
      'Multi-tenant support',
    ],
    limits: {
      vendors: -1,
      sbom_scans: -1,
      assessments: -1,
      users: -1,
      api_calls: -1,
      data_export: true,
      custom_branding: true,
      sso: true,
      priority_support: true,
    },
  },
  federal: {
    name: 'Federal',
    description: 'Government-grade compliance for federal contractors',
    features: [
      'All Enterprise features',
      'NIST SP 800-161 Extended assessment',
      'Enhanced audit logging',
      'Long-term evidence retention',
      'Compliance mappings to vendor portal',
      'SBOM Integration add-on available',
    ],
    limits: {
      vendors: -1,
      sbom_scans: -1,
      assessments: -1,
      users: -1,
      api_calls: -1,
      data_export: true,
      custom_branding: true,
      sso: true,
      priority_support: true,
    },
  },
  assessor: {
    name: 'Assessor',
    description: 'Third-party assessor access for managing client vendor portfolios',
    features: [
      'All Enterprise features',
      'Client portfolio management',
      'Multi-org vendor portfolio',
      'Attestation token issuance',
      'Cross-org reporting',
    ],
    limits: {
      vendors: -1,
      sbom_scans: -1,
      assessments: -1,
      users: -1,
      api_calls: -1,
      data_export: true,
      custom_branding: true,
      sso: true,
      priority_support: true,
    },
  },
};

export const FEATURE_FLAGS: Record<TierKey, string[]> = {
  free: [
    'basic_dashboard',
    'basic_sbom_scan',
    'basic_vendor_management',
    'basic_reporting',
    'workspace_vira',
  ],
  starter: [
    'basic_dashboard',
    'basic_sbom_scan',
    'basic_vendor_management',
    'basic_reporting',
    'nist_compliance',
    'pdf_export',
    'email_support',
    'standard_templates',
    'workspace_vira',
  ],
  professional: [
    'all_starter_features',
    'advanced_analytics',
    'api_access',
    'threat_intelligence',
    'workflow_automation',
    'custom_templates',
    'priority_support',
    'custom_branding',
    'remediation_tracking',
    'evidence_vault',
    'governance_framework',
  ],
  enterprise: [
    'all_features',
    'sso_saml',
    'multi_tenant',
    'custom_integrations',
    'dedicated_support',
    'sla_guarantees',
    'professional_services',
  ],
  federal: [
    'all_features',
    'sso_saml',
    'multi_tenant',
    'custom_integrations',
    'dedicated_support',
    'sla_guarantees',
    'professional_services',
    'nist_800_161_extended',
    'enhanced_audit_logging',
  ],
  assessor: [
    'all_features',
    'sso_saml',
    'multi_tenant',
    'custom_integrations',
    'dedicated_support',
    'sla_guarantees',
    'professional_services',
    'vendor_portfolio_management',
    'attestation_issuance',
  ],
};

export function canAccessFeature(userTier: TierKey, feature: string): boolean {
  const flags = FEATURE_FLAGS[userTier];
  if (!flags || !Array.isArray(flags)) return false;
  if (flags.includes('all_features')) return true;
  if (flags.includes(feature)) return true;
  if (userTier === 'professional' && flags.includes('all_starter_features')) {
    const starterFlags = FEATURE_FLAGS.starter;
    return Array.isArray(starterFlags) && starterFlags.includes(feature);
  }
  return false;
}

export function getUsageLimit(
  userTier: TierKey,
  resource: keyof TierLimits
): number {
  const limit = PRODUCTS[userTier].limits[resource];
  if (typeof limit === 'number') return limit;
  return 0;
}

export function canAccessPortal(): boolean {
  return isPortalEnabled();
}

export function getActiveLicenseTier(): VendorSoluceTier | null {
  return getActiveTier();
}

export function canManageClientPortfolio(
  tier: VendorSoluceTier | null = getActiveLicenseTier()
): boolean {
  return tier === 'enterprise' || tier === 'assessor';
}