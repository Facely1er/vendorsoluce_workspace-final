/**
 * Data normalization: common baseline structure so client data is normalized before feeding
 * the system, reducing processing effort and aligning all products to a shared schema.
 * Critical for best performance and results; integrated into onboarding.
 */

export type TransformationType =
  | 'direct'
  | 'mapping'
  | 'calculation'
  | 'validation'
  | 'format'
  | 'enum';

/** Single rule: source field → target field with optional transform. */
export interface TransformationRule {
  id: string;
  sourceField: string;
  targetField: string;
  transformationType: TransformationType;
  parameters?: Record<string, unknown>;
  isRequired: boolean;
  description?: string;
}

/** Standard (baseline) field definition that all normalized data should conform to. */
export interface StandardField {
  id: string;
  name: string;
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'enum' | 'object';
  description?: string;
  isRequired: boolean;
  validationRules?: string[];
  examples?: string[];
}

/**
 * Baseline schema: common structure for assets, assessments, or other entities.
 * Products align client data to this (or a product-specific extension) to reduce processing.
 */
export interface BaselineSchema {
  id: string;
  name: string;
  description: string;
  entityType: 'asset' | 'assessment' | 'evidence' | 'inventory' | string;
  version: string;
  standardFields: StandardField[];
  /** Optional: which framework or use case this baseline supports. */
  scope?: string[];
}

/**
 * Normalization template: defines how a given source (e.g. client CSV) maps to the baseline.
 * Created or selected during onboarding so data is normalized before feeding the system.
 */
export interface NormalizationTemplate {
  id: string;
  name: string;
  description?: string;
  dataType: string;
  format: 'csv' | 'json' | 'xlsx';
  sourceSystem?: string;
  baselineSchemaId: string;
  transformationRules: TransformationRule[];
  standardFields: StandardField[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface NormalizedRecord {
  id: string;
  templateId: string;
  sourceData: Record<string, unknown>;
  normalizedData: Record<string, unknown>;
  processingStatus: ProcessingStatus;
  errorMessage?: string;
  processedAt: string;
}

export interface DataQualityMetrics {
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  qualityScore: number;
  commonIssues: string[];
  processingTimeMs: number;
}
