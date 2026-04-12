import type { GraphEdge, GraphNode } from '../contracts/graph';
import { computeEdgeWeight } from '../scoring/edgeWeight';
import type { EdgeCsvRow, ProcessingCsvRow, ServiceCsvRow, VendorCsvRow } from './csvSchemas';
import { resolveAlias } from './aliasResolver';

function num(value?: string, fallback = 0.5): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function bool(value?: string): boolean {
  return String(value).toLowerCase() === 'true';
}

export interface ImportPayload {
  nodes: Omit<GraphNode, 'id'>[];
  edges: Omit<GraphEdge, 'id'>[];
}

export function buildImportPayload(input: {
  orgId: string;
  vendors: VendorCsvRow[];
  services: ServiceCsvRow[];
  processing: ProcessingCsvRow[];
  edges: EdgeCsvRow[];
  aliasMap?: Map<string, string>;
}): ImportPayload {
  const aliasMap = input.aliasMap ?? new Map<string, string>();
  const nodes: Omit<GraphNode, 'id'>[] = [];

  for (const vendor of input.vendors) {
    nodes.push({
      orgId: input.orgId,
      nodeType: 'vendor',
      name: vendor.vendor_name,
      externalKey: resolveAlias(vendor.external_key || vendor.vendor_name, aliasMap),
      vendorStatus: (vendor.status as GraphNode['vendorStatus']) ?? 'active',
      vendorType: vendor.vendor_type ?? null,
      serviceCategory: vendor.vendor_type ?? null,
      criticality: num(vendor.criticality),
      inherentRisk: num(vendor.inherent_risk),
      substitutionDifficulty: num(vendor.substitution_difficulty),
      sensitivity: null,
      regulatoryWeight: null,
      metadata: {},
    });
  }

  for (const service of input.services) {
    nodes.push({
      orgId: input.orgId,
      nodeType: 'service',
      name: service.service_name,
      externalKey: resolveAlias(service.external_key || service.service_name, aliasMap),
      businessOwner: service.business_owner ?? null,
      criticality: num(service.criticality),
      metadata: {},
    });
  }

  for (const item of input.processing) {
    nodes.push({
      orgId: input.orgId,
      nodeType: 'processing',
      name: item.processing_name,
      externalKey: resolveAlias(item.external_key || item.processing_name, aliasMap),
      sensitivity: num(item.sensitivity),
      regulatoryWeight: num(item.regulatory_weight),
      crossBorder: bool(item.cross_border),
      metadata: {},
    });
  }

  const edges: Omit<GraphEdge, 'id'>[] = input.edges.map((edge) => ({
    orgId: input.orgId,
    sourceNodeId: resolveAlias(edge.source_key, aliasMap),
    targetNodeId: resolveAlias(edge.target_key, aliasMap),
    edgeType: edge.edge_type,
    weight: computeEdgeWeight({
      dependencyStrength: num(edge.dependency_strength),
      operationalCriticality: num(edge.operational_criticality),
      dataSensitivityFactor: num(edge.data_sensitivity_factor),
      substitutionPenalty: num(edge.substitution_penalty),
    }),
    dependencyStrength: num(edge.dependency_strength),
    operationalCriticality: num(edge.operational_criticality),
    dataSensitivityFactor: num(edge.data_sensitivity_factor),
    substitutionPenalty: num(edge.substitution_penalty),
    tierLevel: edge.tier_level ? Number(edge.tier_level) : null,
    visibilityLevel: edge.visibility_level ?? 'known',
    metadata: {},
  }));

  return { nodes, edges };
}
