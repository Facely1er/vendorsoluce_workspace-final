import { renderVendorCascadeHtml } from "@ermits/dependency-graph/src/export/htmlReportTemplate";
import { generateVendorExplanation } from "@ermits/dependency-graph/src/analysis/explanations";
import { supabase } from "../../lib/supabase";

export async function exportVendorCascadeHtml(orgId: string, vendorNodeId: string): Promise<string> {
  const [{ data: vendor, error: vendorError }, { data: metrics, error: metricsError }, { data: scenario, error: scenarioError }] = await Promise.all([
    (supabase.from("graph_nodes") as any).select("*").eq("org_id", orgId).eq("id", vendorNodeId).single(),
    (supabase.from("vendor_centrality_metrics") as any).select("*").eq("org_id", orgId).eq("node_id", vendorNodeId).single(),
    (supabase.from("vendor_scenario_runs") as any).select("*").eq("org_id", orgId).eq("vendor_node_id", vendorNodeId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  if (vendorError) throw vendorError;
  if (metricsError) throw metricsError;
  if (scenarioError) throw scenarioError;

  const explanation = generateVendorExplanation({
    vendor: {
      id: vendor.id, orgId: vendor.org_id, nodeType: vendor.node_type, name: vendor.name, substitutionDifficulty: vendor.substitution_difficulty, metadata: vendor.metadata ?? {},
    } as any,
    metrics: {
      nodeId: metrics.node_id, weightedDegree: metrics.weighted_degree, inWeightedDegree: metrics.in_weighted_degree, outWeightedDegree: metrics.out_weighted_degree, betweenness: metrics.betweenness, eigenvector: metrics.eigenvector, closeness: metrics.closeness, concentrationFactor: metrics.concentration_factor, hiddenConcentrationScore: metrics.hidden_concentration_score, systemicDependencyScore: metrics.systemic_dependency_score, propagationRiskScore: metrics.propagation_risk_score, blastRadiusServiceCount: metrics.blast_radius_service_count, blastRadiusProcessingCount: metrics.blast_radius_processing_count, blastRadiusJurisdictionCount: metrics.blast_radius_jurisdiction_count, blastRadiusWeightedImpact: metrics.blast_radius_weighted_impact, confidenceScore: metrics.confidence_score,
    },
  });

  return renderVendorCascadeHtml({
    vendor: { id: vendor.id, orgId: vendor.org_id, nodeType: vendor.node_type, name: vendor.name, substitutionDifficulty: vendor.substitution_difficulty, metadata: vendor.metadata ?? {} } as any,
    metrics: {
      nodeId: metrics.node_id, weightedDegree: metrics.weighted_degree, inWeightedDegree: metrics.in_weighted_degree, outWeightedDegree: metrics.out_weighted_degree, betweenness: metrics.betweenness, eigenvector: metrics.eigenvector, closeness: metrics.closeness, concentrationFactor: metrics.concentration_factor, hiddenConcentrationScore: metrics.hidden_concentration_score, systemicDependencyScore: metrics.systemic_dependency_score, propagationRiskScore: metrics.propagation_risk_score, blastRadiusServiceCount: metrics.blast_radius_service_count, blastRadiusProcessingCount: metrics.blast_radius_processing_count, blastRadiusJurisdictionCount: metrics.blast_radius_jurisdiction_count, blastRadiusWeightedImpact: metrics.blast_radius_weighted_impact, confidenceScore: metrics.confidence_score,
    },
    explanation,
    scenario: scenario ? {
      blastRadiusScore: scenario.blast_radius_score, operationalImpactScore: scenario.operational_impact_score, privacyImpactScore: scenario.privacy_impact_score, threatAmplificationScore: scenario.threat_amplification_score, confidenceScore: scenario.confidence_score, affectedNodeIds: scenario.affected_nodes ?? [], affectedServiceIds: scenario.affected_services ?? [], affectedProcessingIds: scenario.affected_processing_activities ?? [], affectedJurisdictionIds: scenario.affected_jurisdictions ?? [], narrative: scenario.narrative ?? { summary: "", drivers: [], recommendedActions: [] },
    } : undefined,
  });
}
