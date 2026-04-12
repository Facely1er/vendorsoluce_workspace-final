import type { DependencyGraph } from '../contracts/graph';
import type { ScenarioRunOutput } from '../contracts/scenarios';
import { computeBlastRadius } from '../analysis/blastRadius';
import { clamp01 } from '../scoring/edgeWeight';

export function runDegradationScenario(
  graph: DependencyGraph,
  vendorNodeId: string,
  confidenceScore = 0.7,
): ScenarioRunOutput {
  const blast = computeBlastRadius(graph, vendorNodeId, 3);

  return {
    blastRadiusScore: clamp01(blast.weightedImpact * 0.7),
    operationalImpactScore: clamp01(blast.affectedServiceIds.length / 15),
    privacyImpactScore: clamp01(blast.affectedProcessingIds.length / 15),
    threatAmplificationScore: 0.15,
    confidenceScore,
    affectedNodeIds: blast.affectedNodeIds,
    affectedServiceIds: blast.affectedServiceIds,
    affectedProcessingIds: blast.affectedProcessingIds,
    affectedJurisdictionIds: blast.affectedJurisdictionIds,
    narrative: {
      summary: 'Vendor degradation would create cumulative friction across dependent services rather than immediate total failure.',
      drivers: [
        'service latency sensitivity',
        'operational coupling',
      ],
      recommendedActions: [
        'define degraded-mode tolerances',
        'identify manual intervention points',
        'review SLA and observability coverage',
      ],
    },
  };
}
