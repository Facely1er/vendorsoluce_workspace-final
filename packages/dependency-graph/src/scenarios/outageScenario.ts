import type { DependencyGraph } from '../contracts/graph';
import type { ScenarioRunOutput } from '../contracts/scenarios';
import { computeBlastRadius } from '../analysis/blastRadius';
import { clamp01 } from '../scoring/edgeWeight';

export function runOutageScenario(
  graph: DependencyGraph,
  vendorNodeId: string,
  confidenceScore = 0.7,
): ScenarioRunOutput {
  const blast = computeBlastRadius(graph, vendorNodeId, 4);

  return {
    blastRadiusScore: clamp01(blast.weightedImpact),
    operationalImpactScore: clamp01(blast.affectedServiceIds.length / 10),
    privacyImpactScore: clamp01(blast.affectedProcessingIds.length / 10),
    threatAmplificationScore: 0.2,
    confidenceScore,
    affectedNodeIds: blast.affectedNodeIds,
    affectedServiceIds: blast.affectedServiceIds,
    affectedProcessingIds: blast.affectedProcessingIds,
    affectedJurisdictionIds: blast.affectedJurisdictionIds,
    narrative: {
      summary: 'Vendor outage would disrupt dependent services and linked operational flows.',
      drivers: [
        'high downstream dependency density',
        'service criticality concentration',
      ],
      recommendedActions: [
        'validate fallback providers',
        'review service continuity clauses',
        'test manual workaround paths',
      ],
    },
  };
}
