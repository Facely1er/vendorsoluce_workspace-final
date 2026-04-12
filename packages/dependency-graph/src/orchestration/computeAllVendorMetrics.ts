import type { GraphEdge, GraphNode } from '../contracts/graph';
import type { VendorCentralityMetrics } from '../contracts/metrics';
import { buildDependencyGraph } from '../builders/buildDependencyGraph';
import { computeWeightedDegree } from '../scoring/weightedDegree';
import { computeBlastRadius } from '../analysis/blastRadius';
import { computeSystemicDependencyScore } from '../scoring/systemicDependencyScore';
import { computePropagationRiskScore } from '../scoring/propagationRiskScore';
import { computeConfidenceScore } from '../scoring/confidenceScore';
import { computeBetweenness } from '../scoring/betweenness';
import { computeEigenvectorCentrality } from '../scoring/eigenvector';
import { computeCloseness } from '../scoring/closeness';
import { computeConcentrationFactor, computeHiddenConcentrationScore } from '../scoring/concentration';

function normalizeMetricMap(values: Map<string, number>): Map<string, number> {
  const entries = [...values.entries()];
  const nums = entries.map(([, v]) => v);
  const min = Math.min(...nums);
  const max = Math.max(...nums);

  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    return new Map(entries.map(([k]) => [k, 0]));
  }

  return new Map(entries.map(([k, v]) => [k, (v - min) / (max - min)]));
}

export interface ComputeVendorMetricsContext {
  nodes: GraphNode[];
  edges: GraphEdge[];
  threatOverlay?: Map<string, number>;
  controlWeaknessOverlay?: Map<string, number>;
  dataSensitivityOverlay?: Map<string, number>;
  confidenceInputs?: Map<string, {
    edgeCoverage: number;
    knownVisibilityRatio: number;
    serviceMappingCompleteness: number;
    processingMappingCompleteness: number;
    aliasResolutionQuality: number;
  }>;
}

export async function computeAllVendorMetrics(
  ctx: ComputeVendorMetricsContext,
): Promise<VendorCentralityMetrics[]> {
  const graph = buildDependencyGraph(ctx.nodes, ctx.edges);
  const vendorNodes = ctx.nodes.filter((n) => n.nodeType === 'vendor');

  const weightedDegreeRaw = new Map<string, number>();
  const inDegreeRaw = new Map<string, number>();
  const outDegreeRaw = new Map<string, number>();
  const closenessRaw = new Map<string, number>();
  const concentrationRaw = new Map<string, number>();
  const hiddenConcentrationRaw = new Map<string, number>();

  for (const vendor of vendorNodes) {
    const wd = computeWeightedDegree(graph, vendor.id);
    weightedDegreeRaw.set(vendor.id, wd.weightedDegree);
    inDegreeRaw.set(vendor.id, wd.inWeightedDegree);
    outDegreeRaw.set(vendor.id, wd.outWeightedDegree);
    closenessRaw.set(vendor.id, computeCloseness(graph, vendor.id));
    concentrationRaw.set(vendor.id, computeConcentrationFactor(graph, vendor.id));
    hiddenConcentrationRaw.set(vendor.id, computeHiddenConcentrationScore(graph, vendor.id));
  }

  const betweennessRaw = computeBetweenness(graph, vendorNodes.map((v) => v.id));
  const eigenvectorRaw = computeEigenvectorCentrality(graph);

  const wdNorm = normalizeMetricMap(weightedDegreeRaw);
  const closenessNorm = normalizeMetricMap(closenessRaw);
  const concentrationNorm = normalizeMetricMap(concentrationRaw);
  const hiddenConcentrationNorm = normalizeMetricMap(hiddenConcentrationRaw);
  const betweennessNorm = normalizeMetricMap(betweennessRaw);
  const eigenvectorNorm = normalizeMetricMap(eigenvectorRaw);

  return vendorNodes.map((vendor) => {
    const blast = computeBlastRadius(graph, vendor.id, 4);

    const confidenceInput = ctx.confidenceInputs?.get(vendor.id) ?? {
      edgeCoverage: 0.5,
      knownVisibilityRatio: 0.5,
      serviceMappingCompleteness: 0.5,
      processingMappingCompleteness: 0.5,
      aliasResolutionQuality: 0.5,
    };

    const confidenceScore = computeConfidenceScore(confidenceInput);

    const systemicDependencyScore = computeSystemicDependencyScore({
      weightedDegree: wdNorm.get(vendor.id) ?? 0,
      betweenness: betweennessNorm.get(vendor.id) ?? 0,
      eigenvector: eigenvectorNorm.get(vendor.id) ?? 0,
      closeness: closenessNorm.get(vendor.id) ?? 0,
      concentrationFactor: concentrationNorm.get(vendor.id) ?? 0,
      substitutionDifficulty: vendor.substitutionDifficulty ?? 0.5,
    });

    const propagationRiskScore = computePropagationRiskScore({
      systemicDependencyScore,
      inherentVendorRisk: vendor.inherentRisk ?? 0.5,
      externalThreatRelevance: ctx.threatOverlay?.get(vendor.id) ?? 0.5,
      dataSensitivityExposure: ctx.dataSensitivityOverlay?.get(vendor.id) ?? 0.5,
      controlWeaknessFactor: ctx.controlWeaknessOverlay?.get(vendor.id) ?? 0.5,
    });

    return {
      nodeId: vendor.id,
      weightedDegree: wdNorm.get(vendor.id) ?? 0,
      inWeightedDegree: inDegreeRaw.get(vendor.id) ?? 0,
      outWeightedDegree: outDegreeRaw.get(vendor.id) ?? 0,
      betweenness: betweennessNorm.get(vendor.id) ?? 0,
      eigenvector: eigenvectorNorm.get(vendor.id) ?? 0,
      closeness: closenessNorm.get(vendor.id) ?? 0,
      concentrationFactor: concentrationNorm.get(vendor.id) ?? 0,
      hiddenConcentrationScore: hiddenConcentrationNorm.get(vendor.id) ?? 0,
      systemicDependencyScore,
      propagationRiskScore,
      blastRadiusServiceCount: blast.affectedServiceIds.length,
      blastRadiusProcessingCount: blast.affectedProcessingIds.length,
      blastRadiusJurisdictionCount: blast.affectedJurisdictionIds.length,
      blastRadiusWeightedImpact: blast.weightedImpact,
      confidenceScore,
    };
  });
}
