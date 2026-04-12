import { buildDependencyGraph, runBreachScenario, runDegradationScenario, runOutageScenario, type ScenarioType } from "@ermits/dependency-graph";
import { supabase } from "../../lib/supabase";
import { getVendorGraphData } from "./vendorGraphDataService";

export async function runVendorScenario(orgId: string, vendorNodeId: string, scenarioType: ScenarioType) {
  const dataset = await getVendorGraphData(orgId);
  const graph = buildDependencyGraph(dataset.nodes, dataset.edges);
  const output = scenarioType === "outage"
    ? runOutageScenario(graph, vendorNodeId)
    : scenarioType === "breach"
      ? runBreachScenario(graph, vendorNodeId)
      : runDegradationScenario(graph, vendorNodeId);

  const { error } = await (supabase.from("vendor_scenario_runs") as any).insert({
    org_id: orgId,
    vendor_node_id: vendorNodeId,
    scenario_type: scenarioType,
    affected_nodes: output.affectedNodeIds,
    affected_services: output.affectedServiceIds,
    affected_processing_activities: output.affectedProcessingIds,
    affected_jurisdictions: output.affectedJurisdictionIds,
    blast_radius_score: output.blastRadiusScore,
    operational_impact_score: output.operationalImpactScore,
    privacy_impact_score: output.privacyImpactScore,
    threat_amplification_score: output.threatAmplificationScore,
    confidence_score: output.confidenceScore,
    narrative: output.narrative,
  });
  if (error) throw error;
  return output;
}
