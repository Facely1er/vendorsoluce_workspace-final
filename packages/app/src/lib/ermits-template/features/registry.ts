/**
 * Feature registry: template is the core baseline; features are activated as needed per product.
 * CyberCaution, VendorSoluce, CyberCorrect (and AssetManager) derive from this and enable/disable features.
 */

import type { ConsumerId } from '../constants/consumers';

/** All features that can be toggled per product or tenant. */
export const FEATURE_IDS = {
  // Lifecycle core
  ONBOARDING: 'onboarding',
  ENVIRONMENT_CONFIG: 'environment_config',
  NORMALIZATION: 'normalization',
  ENRICHMENT: 'enrichment',
  // Assessment & implementation
  ASSESSMENT: 'assessment',
  GAP_ANALYSIS: 'gap_analysis',
  POAM: 'poam',
  RACI: 'raci',
  EVIDENCE: 'evidence',
  // Data & assets
  ASSET_MANAGEMENT: 'asset_management',
  ASSET_IMPORT: 'asset_import',
  SBOM_IMPORT: 'sbom_import',
  DATA_IMPORT_EXPORT: 'data_import_export',
  // Reporting & delivery
  REPORTING: 'reporting',
  EXPORT_PDF: 'export_pdf',
  EXPORT_JSON_CSV: 'export_json_csv',
  // Collaboration & workflow
  TEAM_COLLABORATION: 'team_collaboration',
  TASK_MANAGEMENT: 'task_management',
  COMPLIANCE_CALENDAR: 'compliance_calendar',
  // Frameworks (can be toggled per product)
  NIST_CSF: 'nist_csf',
  NIST_800_53: 'nist_800_53',
  CMMC: 'cmmc',
  FISMA: 'fisma',
  RANSOMWARE_DEFENSE: 'ransomware_defense',
  VENDOR_RISK: 'vendor_risk',
  PRIVACY_COMPLIANCE: 'privacy_compliance',
} as const;

export type FeatureId = (typeof FEATURE_IDS)[keyof typeof FEATURE_IDS];

/** Map of feature id -> enabled (default per product). */
export type FeatureFlags = Partial<Record<FeatureId, boolean>>;

/** Default feature set for each front-facing product. Products can override at runtime. */
export const DEFAULT_FEATURES_BY_PRODUCT: Record<ConsumerId, FeatureFlags> = {
  cybercaution: {
    [FEATURE_IDS.ONBOARDING]: true,
    [FEATURE_IDS.ENVIRONMENT_CONFIG]: true,
    [FEATURE_IDS.NORMALIZATION]: true,
    [FEATURE_IDS.ENRICHMENT]: true,
    [FEATURE_IDS.ASSESSMENT]: true,
    [FEATURE_IDS.GAP_ANALYSIS]: true,
    [FEATURE_IDS.POAM]: true,
    [FEATURE_IDS.RACI]: true,
    [FEATURE_IDS.EVIDENCE]: true,
    [FEATURE_IDS.ASSET_MANAGEMENT]: true,
    [FEATURE_IDS.ASSET_IMPORT]: true,
    [FEATURE_IDS.SBOM_IMPORT]: true,
    [FEATURE_IDS.DATA_IMPORT_EXPORT]: true,
    [FEATURE_IDS.REPORTING]: true,
    [FEATURE_IDS.EXPORT_PDF]: true,
    [FEATURE_IDS.EXPORT_JSON_CSV]: true,
    // Team collaboration types now shared from CyberCorrect via template
    [FEATURE_IDS.TEAM_COLLABORATION]: true,
    [FEATURE_IDS.TASK_MANAGEMENT]: true,
    // Calendar: deadline tracking for POA&M milestones and assessment cycles
    [FEATURE_IDS.COMPLIANCE_CALENDAR]: true,
    [FEATURE_IDS.NIST_CSF]: true,
    [FEATURE_IDS.NIST_800_53]: true,
    [FEATURE_IDS.CMMC]: true,
    [FEATURE_IDS.FISMA]: false,
    [FEATURE_IDS.RANSOMWARE_DEFENSE]: true,
    [FEATURE_IDS.VENDOR_RISK]: false,
    // Privacy controls: NIST 800-53 privacy baseline, DPIA for system assessments
    [FEATURE_IDS.PRIVACY_COMPLIANCE]: true,
  },
  vendorsoluce: {
    [FEATURE_IDS.ONBOARDING]: true,
    [FEATURE_IDS.ENVIRONMENT_CONFIG]: true,
    [FEATURE_IDS.NORMALIZATION]: true,
    [FEATURE_IDS.ENRICHMENT]: true,
    [FEATURE_IDS.ASSESSMENT]: true,
    [FEATURE_IDS.GAP_ANALYSIS]: true,
    [FEATURE_IDS.POAM]: true,
    [FEATURE_IDS.RACI]: true,
    [FEATURE_IDS.EVIDENCE]: true,
    [FEATURE_IDS.ASSET_MANAGEMENT]: true,
    [FEATURE_IDS.ASSET_IMPORT]: true,
    [FEATURE_IDS.SBOM_IMPORT]: true,
    [FEATURE_IDS.DATA_IMPORT_EXPORT]: true,
    [FEATURE_IDS.REPORTING]: true,
    [FEATURE_IDS.EXPORT_PDF]: true,
    [FEATURE_IDS.EXPORT_JSON_CSV]: true,
    [FEATURE_IDS.TEAM_COLLABORATION]: true,
    [FEATURE_IDS.TASK_MANAGEMENT]: true,
    [FEATURE_IDS.COMPLIANCE_CALENDAR]: true,
    [FEATURE_IDS.NIST_CSF]: true,
    [FEATURE_IDS.NIST_800_53]: true,
    [FEATURE_IDS.CMMC]: true,
    [FEATURE_IDS.FISMA]: false,
    [FEATURE_IDS.RANSOMWARE_DEFENSE]: false,
    [FEATURE_IDS.VENDOR_RISK]: true,
    // Privacy features (DPIA, data inventory, vendor privacy assessment) are in a separate project
    [FEATURE_IDS.PRIVACY_COMPLIANCE]: false,
  },
  cybercorrect: {
    [FEATURE_IDS.ONBOARDING]: true,
    [FEATURE_IDS.ENVIRONMENT_CONFIG]: true,
    [FEATURE_IDS.NORMALIZATION]: true,
    [FEATURE_IDS.ENRICHMENT]: true,
    [FEATURE_IDS.ASSESSMENT]: true,
    [FEATURE_IDS.GAP_ANALYSIS]: true,
    [FEATURE_IDS.POAM]: true,
    [FEATURE_IDS.RACI]: true,
    [FEATURE_IDS.EVIDENCE]: true,
    [FEATURE_IDS.ASSET_MANAGEMENT]: true,
    [FEATURE_IDS.ASSET_IMPORT]: true,
    [FEATURE_IDS.SBOM_IMPORT]: false,
    [FEATURE_IDS.DATA_IMPORT_EXPORT]: true,
    [FEATURE_IDS.REPORTING]: true,
    [FEATURE_IDS.EXPORT_PDF]: true,
    [FEATURE_IDS.EXPORT_JSON_CSV]: true,
    [FEATURE_IDS.TEAM_COLLABORATION]: true,
    [FEATURE_IDS.TASK_MANAGEMENT]: true,
    [FEATURE_IDS.COMPLIANCE_CALENDAR]: true,
    [FEATURE_IDS.NIST_CSF]: true,
    [FEATURE_IDS.NIST_800_53]: false,
    [FEATURE_IDS.CMMC]: false,
    [FEATURE_IDS.FISMA]: false,
    [FEATURE_IDS.RANSOMWARE_DEFENSE]: false,
    [FEATURE_IDS.VENDOR_RISK]: false,
    [FEATURE_IDS.PRIVACY_COMPLIANCE]: true,
  },
  'asset-manager': {
    [FEATURE_IDS.ONBOARDING]: true,
    [FEATURE_IDS.ENVIRONMENT_CONFIG]: true,
    [FEATURE_IDS.NORMALIZATION]: true,
    [FEATURE_IDS.ENRICHMENT]: true,
    [FEATURE_IDS.ASSESSMENT]: true,
    [FEATURE_IDS.GAP_ANALYSIS]: true,
    [FEATURE_IDS.POAM]: true,
    [FEATURE_IDS.RACI]: true,
    [FEATURE_IDS.EVIDENCE]: true,
    [FEATURE_IDS.ASSET_MANAGEMENT]: true,
    [FEATURE_IDS.ASSET_IMPORT]: true,
    [FEATURE_IDS.SBOM_IMPORT]: true,
    [FEATURE_IDS.DATA_IMPORT_EXPORT]: true,
    [FEATURE_IDS.REPORTING]: true,
    [FEATURE_IDS.EXPORT_PDF]: true,
    [FEATURE_IDS.EXPORT_JSON_CSV]: true,
    [FEATURE_IDS.TEAM_COLLABORATION]: true,
    [FEATURE_IDS.TASK_MANAGEMENT]: true,
    [FEATURE_IDS.COMPLIANCE_CALENDAR]: true,
    [FEATURE_IDS.NIST_CSF]: true,
    [FEATURE_IDS.NIST_800_53]: true,
    [FEATURE_IDS.CMMC]: true,
    [FEATURE_IDS.FISMA]: true,
    [FEATURE_IDS.RANSOMWARE_DEFENSE]: false,
    [FEATURE_IDS.VENDOR_RISK]: true,
    [FEATURE_IDS.PRIVACY_COMPLIANCE]: true,
  },
};

/** Get default feature flags for a product; merge with overrides for tenant/user. */
export function getDefaultFeaturesForProduct(consumerId: ConsumerId): FeatureFlags {
  return { ...DEFAULT_FEATURES_BY_PRODUCT[consumerId] };
}

export function isFeatureEnabled(flags: FeatureFlags, featureId: FeatureId): boolean {
  return flags[featureId] === true;
}
