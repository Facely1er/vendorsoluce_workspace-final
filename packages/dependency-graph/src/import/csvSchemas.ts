import type { GraphEdgeType, GraphNodeType, VisibilityLevel } from '../contracts/graph';

export type VendorCsvRow = {
  vendor_name: string;
  external_key?: string;
  vendor_type?: string;
  criticality?: string;
  inherent_risk?: string;
  substitution_difficulty?: string;
  status?: string;
};

export type ServiceCsvRow = {
  service_name: string;
  external_key?: string;
  criticality?: string;
  business_owner?: string;
};

export type ProcessingCsvRow = {
  processing_name: string;
  external_key?: string;
  sensitivity?: string;
  regulatory_weight?: string;
  cross_border?: string;
};

export type EdgeCsvRow = {
  source_key: string;
  target_key: string;
  edge_type: GraphEdgeType;
  dependency_strength?: string;
  operational_criticality?: string;
  data_sensitivity_factor?: string;
  substitution_penalty?: string;
  tier_level?: string;
  visibility_level?: VisibilityLevel;
};

export type ParsedCsvResult<T> = {
  rows: T[];
  errors: string[];
};

export const ALLOWED_NODE_TYPES: GraphNodeType[] = ['vendor', 'service', 'processing'];
export const ALLOWED_EDGE_TYPES: GraphEdgeType[] = ['supports', 'relies_on', 'processes'];
export const ALLOWED_VISIBILITY: VisibilityLevel[] = ['known', 'partial', 'inferred'];
