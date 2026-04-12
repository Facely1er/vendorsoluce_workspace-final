import type { DependencyGraph } from '../contracts/graph';
import type { ScenarioRunOutput } from '../contracts/scenarios';
import { computeBlastRadius } from '../analysis/blastRadius';
import { clamp01 } from '../scoring/edgeWeight';

export function runBreachScenario(
  graph: DependencyGraph,
  vendorNodeId: string,
  threatRelevance = 0.5,
  confidenceScore = 0.7,
): ScenarioRunOutput {
  const blast = computeBlastRadius(graph, vendorNodeId, 4);

  return {
    blastRadiusScore: clamp01(blast.weightedImpact),
    operationalImpactScore: clamp01(blast.affectedServiceIds.length / 12),
    privacyImpactScore: clamp01((blast.affectedProcessingIds.length + blast.affectedJurisdictionIds.length) / 12),
    threatAmplificationScore: clamp01(threatRelevance),
    confidenceScore,
    affectedNodeIds: blast.affectedNodeIds,
    affectedServiceIds: blast.affectedServiceIds,
    affectedProcessingIds: blast.affectedProcessingIds,
    affectedJurisdictionIds: blast.affectedJurisdictionIds,
    narrative: {
      summary: 'Vendor breach would propagate through linked processing activities and jurisdictional exposure paths.',
      drivers: [
        'sensitive data involvement',
        'cross-border dependency',
        'high dependency centrality',
      ],
      recommendedActions: [
        'review processor obligations',
        'confirm incident notification windows',
        'map impacted data subjects and systems',
      ],
    },
  };
}
