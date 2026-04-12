/**
 * Onboarding: align client environment and integrate their data for the needed workflow.
 * Includes normalization and enrichment setup so client data is normalized before feeding the system.
 */

import type { NISTStandardId } from './framework';
import type { EnrichmentConfig } from './enrichment';

/** Primary use case / workflow the client will run (drives framework and feature set). */
export type PrimaryUseCase =
  | 'cmmc'
  | 'fisma'
  | 'nist-csf'
  | 'vendor-risk'
  | 'ransomware'
  | 'privacy'
  | 'both'
  | string;

export type OrganizationType =
  | 'DoD Contractor'
  | 'Federal Agency'
  | 'Federal Contractor'
  | 'Defense Industrial Base'
  | 'Enterprise'
  | 'SMB'
  | 'Other';

/** FIPS 199–style impact levels (used in FISMA/CMMC onboarding). */
export interface FIPS199Categorization {
  confidentiality: 'Low' | 'Moderate' | 'High';
  integrity: 'Low' | 'Moderate' | 'High';
  availability: 'Low' | 'Moderate' | 'High';
}

/** Data sources the client will integrate (CSV, SBOM, API, etc.). */
export type DataSourceKind = 'csv' | 'json' | 'sbom' | 'api' | 'supabase' | 'manual';

export interface DataSourceConfig {
  id: string;
  kind: DataSourceKind;
  label: string;
  enabled: boolean;
  /** e.g. column mapping for CSV, endpoint for API */
  mappingHint?: Record<string, string>;
  /** Optional schema or sample for validation */
  schemaRef?: string;
  /** Baseline schema to normalize this source to (reduces processing effort). */
  baselineSchemaId?: string;
  /** Normalization template id (rules to transform source → baseline). */
  normalizationTemplateId?: string;
}

/** Single onboarding step (product-specific steps extend this). */
export interface OnboardingStep {
  id: string;
  order: number;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  /** Route or workflow entry after this step (e.g. /dashboard/cmmc-assessment). */
  destinationRoute?: string;
}

export interface OnboardingState {
  step: number;
  useCase: PrimaryUseCase | null;
  organizationName: string;
  organizationType: OrganizationType | null;
  systemName: string;
  /** For FISMA/CMMC: optional FIPS 199 categorization. */
  fips199?: FIPS199Categorization;
  /** Frameworks the client intends to use (from template FRAMEWORK_IDS). */
  selectedFrameworks?: NISTStandardId[];
  /** Data sources to integrate for assessment/evidence workflow. */
  dataSources?: DataSourceConfig[];
  /** Steps and completion (product-specific checklist). */
  steps?: OnboardingStep[];
  /** Common baseline schema id for normalized data (align system with shared structure). */
  baselineSchemaId?: string;
  /** Default normalization template for first import (client data normalized before feed). */
  normalizationTemplateId?: string;
  /** Require normalization before data is fed into assessments/evidence (recommended for best results). */
  requireNormalizationBeforeImport?: boolean;
  /** Enrichment options to run (e.g. privacy, ransomware, vendor); configured during onboarding. */
  enrichmentConfigs?: EnrichmentConfig[];
  completedAt: string | null;
  /** Product that created this state (cybercaution, cybercorrect, vendorsoluce, asset-manager). */
  consumerId?: string;
}

/** Result of completing onboarding: where to send the user and what to preload. */
export interface OnboardingCompletion {
  completedAt: string;
  useCase: PrimaryUseCase | null;
  destinationRoute: string;
  suggestedFirstAssessment?: {
    frameworkId: string;
    systemName?: string;
  };
}
