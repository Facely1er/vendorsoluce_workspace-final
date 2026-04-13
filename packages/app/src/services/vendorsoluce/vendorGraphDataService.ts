import type { GraphEdge, GraphNode } from "@ermits/dependency-graph";
import type { IntegratedVendorRiskRecord } from "shared/domain/vendorsoluce";
import { supabase } from "../../lib/supabase";

export interface VendorGraphDataset {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

function meta(row: Record<string, unknown>): Record<string, unknown> {
  const m = row.metadata;
  return typeof m === "object" && m !== null && !Array.isArray(m) ? (m as Record<string, unknown>) : {};
}

/** Map Supabase snake_case rows to dependency-graph contracts (metrics/path code expects camelCase). */
export function mapGraphNodeRow(row: Record<string, unknown>): GraphNode {
  return {
    id: String(row.id),
    orgId: String(row.org_id),
    nodeType: row.node_type as GraphNode["nodeType"],
    name: String(row.name ?? ""),
    externalKey: row.external_key != null ? String(row.external_key) : null,
    vendorStatus: row.vendor_status as GraphNode["vendorStatus"],
    vendorType: row.vendor_type != null ? String(row.vendor_type) : null,
    serviceCategory: row.service_category != null ? String(row.service_category) : null,
    criticality: row.criticality != null ? Number(row.criticality) : null,
    inherentRisk: row.inherent_risk != null ? Number(row.inherent_risk) : null,
    substitutionDifficulty: row.substitution_difficulty != null ? Number(row.substitution_difficulty) : null,
    sensitivity: row.sensitivity != null ? Number(row.sensitivity) : null,
    regulatoryWeight: row.regulatory_weight != null ? Number(row.regulatory_weight) : null,
    internetExposed: typeof row.internet_exposed === "boolean" ? row.internet_exposed : null,
    crossBorder: typeof row.cross_border === "boolean" ? row.cross_border : null,
    specialCategoryFlag: typeof row.special_category_flag === "boolean" ? row.special_category_flag : null,
    businessOwner: row.business_owner != null ? String(row.business_owner) : null,
    environment: row.environment != null ? String(row.environment) : null,
    metadata: meta(row),
  };
}

export function mapGraphEdgeRow(row: Record<string, unknown>): GraphEdge {
  return {
    id: String(row.id),
    orgId: String(row.org_id),
    sourceNodeId: String(row.source_node_id),
    targetNodeId: String(row.target_node_id),
    edgeType: row.edge_type as GraphEdge["edgeType"],
    weight: Number(row.weight ?? 0),
    dependencyStrength: row.dependency_strength != null ? Number(row.dependency_strength) : null,
    operationalCriticality: row.operational_criticality != null ? Number(row.operational_criticality) : null,
    dataSensitivityFactor: row.data_sensitivity_factor != null ? Number(row.data_sensitivity_factor) : null,
    substitutionPenalty: row.substitution_penalty != null ? Number(row.substitution_penalty) : null,
    tierLevel: row.tier_level != null ? Number(row.tier_level) : null,
    visibilityLevel: (row.visibility_level as GraphEdge["visibilityLevel"]) ?? "known",
    directOrIndirect: row.direct_or_indirect != null ? String(row.direct_or_indirect) : null,
    sharedInfrastructureFlag: typeof row.shared_infrastructure_flag === "boolean" ? row.shared_infrastructure_flag : null,
    writeAccessFlag: typeof row.write_access_flag === "boolean" ? row.write_access_flag : null,
    transferFlag: typeof row.transfer_flag === "boolean" ? row.transfer_flag : null,
    metadata: meta(row),
  };
}

export async function getVendorGraphData(orgId: string): Promise<VendorGraphDataset> {
  const [{ data: nodeRows, error: nodesError }, { data: edgeRows, error: edgesError }] = await Promise.all([
    (supabase.from("graph_nodes") as any).select("*").eq("org_id", orgId),
    (supabase.from("graph_edges") as any).select("*").eq("org_id", orgId),
  ]);

  if (nodesError) throw nodesError;
  if (edgesError) throw edgesError;

  return {
    nodes: (nodeRows ?? []).map((r: Record<string, unknown>) => mapGraphNodeRow(r)),
    edges: (edgeRows ?? []).map((r: Record<string, unknown>) => mapGraphEdgeRow(r)),
  };
}

/**
 * Demo / offline ring: one vendor node per portfolio row so the portfolio page can show a graph without DB edges.
 */
export function buildDemoVendorGraphFromRecords(records: IntegratedVendorRiskRecord[]): VendorGraphDataset {
  const withNodes = records.filter((r) => r.graphNodeId);
  const orgId = "demo-local";
  const nodes: GraphNode[] = withNodes.map((r) => ({
    id: r.graphNodeId!,
    orgId,
    nodeType: "vendor",
    name: r.vendorName,
    metadata: {},
  }));
  const edges: GraphEdge[] = [];
  if (nodes.length >= 2) {
    for (let i = 0; i < nodes.length; i++) {
      const j = (i + 1) % nodes.length;
      edges.push({
        id: `demo-edge-${nodes[i].id}-${nodes[j].id}`,
        orgId,
        sourceNodeId: nodes[i].id,
        targetNodeId: nodes[j].id,
        edgeType: "relies_on",
        weight: 0.5,
        visibilityLevel: "known",
        metadata: { demo: true },
      });
    }
  }
  return { nodes, edges };
}
