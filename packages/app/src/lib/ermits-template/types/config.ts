/**
 * Client environment config: align with tenant/org and integrate their data for the workflow.
 * Supports multi-tenant, backend choice, integrations, and data mapping.
 */

import type { PrimaryUseCase } from './onboarding';
import type { NISTStandardId } from './framework';

/** App edition / deployment mode (demo vs client-configured). */
export type AppEdition = 'demo' | 'pro' | 'business';

/** Backend type for persistence and integrations. */
export type BackendType = 'local' | 'supabase' | 'custom-api';

export interface TenantConfig {
  tenantId: string;
  organizationId?: string;
  organizationName: string;
  edition: AppEdition;
  /** Primary workflow(s) enabled for this tenant. */
  primaryUseCases: PrimaryUseCase[];
  /** Frameworks enabled (from template FRAMEWORK_IDS). */
  enabledFrameworks: NISTStandardId[];
  /** Backend for assessments, evidence, POA&M. */
  backend: BackendType;
  /** Optional backend URL or project ref (e.g. Supabase URL). */
  backendEndpoint?: string;
  /** Feature flags or capability toggles. */
  features?: Record<string, boolean>;
  updatedAt: string;
}

/** Integration with external data (assets, SBOM, vendor list, etc.). */
export type IntegrationType = 'csv-import' | 'sbom-upload' | 'api-sync' | 'supabase' | 'manual';

export interface IntegrationConfig {
  id: string;
  type: IntegrationType;
  label: string;
  enabled: boolean;
  /** e.g. webhook URL, bucket path, table name. */
  config?: Record<string, string | number | boolean>;
  /** Last sync or import timestamp. */
  lastSyncAt?: string;
}

/** Workflow preferences: which phases/steps are required for this client. */
export interface WorkflowConfig {
  /** Require onboarding before first assessment. */
  requireOnboarding: boolean;
  /** Require evidence per control before marking complete. */
  requireEvidencePerControl: boolean;
  /** Require POA&M for non-implemented controls. */
  requirePOAMForGaps: boolean;
  /** Allow RACI assignment (team workflow). */
  allowRACI: boolean;
  /** Default framework when starting a new assessment. */
  defaultFrameworkId?: NISTStandardId;
  /** Require data normalization before feeding imports into the system (best performance/results). */
  requireNormalizationBeforeImport?: boolean;
  /** Run enrichment pass after normalization (e.g. infer metadata, confidence). */
  requireEnrichmentPass?: boolean;
}

/** Data mapping: how client data (e.g. CSV columns) maps to template/assessment fields. */
export interface DataMappingConfig {
  /** Source type (e.g. 'csv-assets', 'sbom-components'). */
  sourceType: string;
  /** Field mappings: client field name -> template field id. */
  fieldMappings: Record<string, string>;
  /** Optional transform (e.g. date format, enum normalization). */
  transforms?: Record<string, 'date' | 'enum' | 'number' | 'string'>;
}

/** Normalization config: baseline schema and templates for this tenant (align with common structure). */
export interface NormalizationConfig {
  /** Default baseline schema id for assets/assessment data. */
  defaultBaselineSchemaId?: string;
  /** Template ids per source type (e.g. csv-assets → template id). */
  templateBySourceType?: Record<string, string>;
}

/** Full environment config for a client/tenant (persisted per org or user). */
export interface ClientEnvironmentConfig {
  tenant: TenantConfig;
  integrations: IntegrationConfig[];
  workflow: WorkflowConfig;
  dataMapping?: DataMappingConfig[];
  /** Normalization and baseline alignment (reduce processing, ensure consistent structure). */
  normalization?: NormalizationConfig;
  /** Product that owns this config. */
  consumerId?: string;
  updatedAt: string;
}
