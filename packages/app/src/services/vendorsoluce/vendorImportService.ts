import { buildImportPayload } from "@ermits/dependency-graph/src/import/buildImportPayload";
import { supabase } from "../../lib/supabase";
import type { VendorGraphImportBundle } from "shared/domain/vendorsoluce";
import { recomputeVendorMetrics } from "./vendorMetricsService";

export async function importVendorGraphCsv(orgId: string, input: VendorGraphImportBundle): Promise<{ insertedNodes: number; insertedEdges: number }> {
  const payload = await buildImportPayload({ orgId, ...input });
  if (payload.nodes.length === 0) return { insertedNodes: 0, insertedEdges: 0 };

  const nodeRows = payload.nodes.map((n) => ({
    org_id: n.orgId,
    node_type: n.nodeType,
    external_key: n.externalKey ?? null,
    name: n.name,
    vendor_status: n.vendorStatus ?? null,
    vendor_type: n.vendorType ?? null,
    service_category: n.serviceCategory ?? null,
    criticality: n.criticality ?? null,
    inherent_risk: n.inherentRisk ?? null,
    substitution_difficulty: n.substitutionDifficulty ?? null,
    sensitivity: n.sensitivity ?? null,
    regulatory_weight: n.regulatoryWeight ?? null,
    internet_exposed: n.internetExposed ?? null,
    cross_border: n.crossBorder ?? null,
    special_category_flag: n.specialCategoryFlag ?? null,
    business_owner: n.businessOwner ?? null,
    environment: n.environment ?? null,
    metadata: n.metadata ?? {},
  }));

  const { error: nodeError } = await (supabase.from("graph_nodes") as any).upsert(nodeRows, { onConflict: "org_id,external_key" });
  if (nodeError) throw nodeError;

  const { data: insertedNodes, error: fetchNodeError } = await (supabase.from("graph_nodes") as any).select("id, external_key").eq("org_id", orgId);
  if (fetchNodeError) throw fetchNodeError;

  const keyToId = new Map<string, string>();
  for (const row of insertedNodes ?? []) {
    if (row.external_key) keyToId.set(String(row.external_key), String(row.id));
  }

  const edgeRows = payload.edges.map((e) => {
    const sourceId = keyToId.get(String((e.metadata as any)?.sourceExternalKey ?? ""));
    const targetId = keyToId.get(String((e.metadata as any)?.targetExternalKey ?? ""));
    if (!sourceId || !targetId) return null;
    return {
      org_id: orgId,
      source_node_id: sourceId,
      target_node_id: targetId,
      edge_type: e.edgeType,
      weight: e.weight,
      dependency_strength: e.dependencyStrength ?? null,
      operational_criticality: e.operationalCriticality ?? null,
      data_sensitivity_factor: e.dataSensitivityFactor ?? null,
      substitution_penalty: e.substitutionPenalty ?? null,
      tier_level: e.tierLevel ?? null,
      visibility_level: e.visibilityLevel,
      direct_or_indirect: e.directOrIndirect ?? null,
      shared_infrastructure_flag: e.sharedInfrastructureFlag ?? false,
      write_access_flag: e.writeAccessFlag ?? false,
      transfer_flag: e.transferFlag ?? false,
      metadata: e.metadata ?? {},
    };
  }).filter(Boolean);

  const { error: deleteError } = await (supabase.from("graph_edges") as any).delete().eq("org_id", orgId);
  if (deleteError) throw deleteError;
  if (edgeRows.length > 0) {
    const { error: edgeError } = await (supabase.from("graph_edges") as any).insert(edgeRows as any[]);
    if (edgeError) throw edgeError;
  }

  await recomputeVendorMetrics(orgId);

  return { insertedNodes: nodeRows.length, insertedEdges: edgeRows.length };
}
