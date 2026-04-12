import { computeAllVendorMetrics } from "@ermits/dependency-graph";
import type { VendorCentralityMetrics } from "@ermits/dependency-graph";
import { supabase } from "../../lib/supabase";
import { getVendorGraphData } from "./vendorGraphDataService";

export async function recomputeVendorMetrics(orgId: string): Promise<VendorCentralityMetrics[]> {
  const dataset = await getVendorGraphData(orgId);
  const metrics = await computeAllVendorMetrics(dataset);

  if (metrics.length === 0) return [];

  const rows = metrics.map((m) => ({
    org_id: orgId,
    node_id: m.nodeId,
    weighted_degree: m.weightedDegree,
    in_weighted_degree: m.inWeightedDegree,
    out_weighted_degree: m.outWeightedDegree,
    betweenness: m.betweenness,
    eigenvector: m.eigenvector,
    closeness: m.closeness,
    concentration_factor: m.concentrationFactor,
    hidden_concentration_score: m.hiddenConcentrationScore,
    systemic_dependency_score: m.systemicDependencyScore,
    propagation_risk_score: m.propagationRiskScore,
    blast_radius_service_count: m.blastRadiusServiceCount,
    blast_radius_processing_count: m.blastRadiusProcessingCount,
    blast_radius_jurisdiction_count: m.blastRadiusJurisdictionCount,
    blast_radius_weighted_impact: m.blastRadiusWeightedImpact,
    confidence_score: m.confidenceScore,
    computed_at: new Date().toISOString(),
  }));

  const { error } = await (supabase.from("vendor_centrality_metrics") as any).upsert(rows, { onConflict: "org_id,node_id" });
  if (error) throw error;
  return metrics;
}
