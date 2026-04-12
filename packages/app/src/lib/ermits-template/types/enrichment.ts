/**
 * Data enrichment: overlay or inferred metadata to improve quality and downstream processing.
 * Used with normalization; can be configured during onboarding (what to enrich, confidence thresholds).
 */

export type EnrichmentDomain =
  | 'privacy'
  | 'ransomware'
  | 'vendor'
  | 'software'
  | 'governance'
  | 'compliance';

export type ConfidenceLevel = 'low' | 'medium' | 'high';

/** Configuration for which enrichments to run (e.g. during onboarding). */
export interface EnrichmentConfig {
  id: string;
  domain: EnrichmentDomain;
  enabled: boolean;
  /** Minimum confidence to apply (below = skip or flag for review). */
  minConfidence?: ConfidenceLevel;
  /** Optional source or provider id. */
  sourceRef?: string;
}

/** Result of enriching a single entity (e.g. asset, row). */
export interface EnrichmentResult {
  entityId: string;
  domain: EnrichmentDomain;
  inferred: boolean;
  confidence: ConfidenceLevel;
  /** Domain-specific overlay (e.g. privacy_relevance, vendor_dependency). */
  overlay: Record<string, unknown>;
  lastUpdated: string;
}

/** Normalized field set produced by enrichment/normalization (common baseline shape). */
export interface NormalizedEntityFields {
  entityType: string;
  /** Normalized type/category. */
  type?: string;
  owner?: string;
  businessFunction?: string;
  vendor?: string;
  dataSensitivity?: 'Public' | 'Internal' | 'Confidential' | 'Restricted' | 'Top Secret';
  relationshipDirection?: 'inbound' | 'outbound' | 'bidirectional' | 'none';
  [key: string]: unknown;
}
