import type { DependencyGraph } from '../contracts/graph';
import { shortestPathsFrom } from './closeness';

/**
 * Bounded approximation for starter deployments.
 * Replace with weighted Brandes when scaling beyond modest graphs.
 */
export function computeBetweenness(
  graph: DependencyGraph,
  candidateNodeIds: string[],
  sampleLimit = 25,
): Map<string, number> {
  const scores = new Map<string, number>();
  for (const id of candidateNodeIds) scores.set(id, 0);

  const sources = candidateNodeIds.slice(0, sampleLimit);
  for (const sourceId of sources) {
    const distances = shortestPathsFrom(graph, sourceId);

    for (const targetId of candidateNodeIds) {
      if (targetId === sourceId) continue;
      const targetDist = distances.get(targetId);
      if (!targetDist || !Number.isFinite(targetDist)) continue;

      for (const candidateId of candidateNodeIds) {
        if (candidateId === sourceId || candidateId === targetId) continue;
        const distToCandidate = distances.get(candidateId);
        if (!distToCandidate || !Number.isFinite(distToCandidate)) continue;

        const fromCandidate = shortestPathsFrom(graph, candidateId).get(targetId);
        if (!fromCandidate || !Number.isFinite(fromCandidate)) continue;

        if (Math.abs((distToCandidate + fromCandidate) - targetDist) < 1e-6) {
          scores.set(candidateId, (scores.get(candidateId) ?? 0) + 1);
        }
      }
    }
  }

  const maxVal = Math.max(1, ...scores.values())

  for (const [id, value] of scores.entries()) scores.set(id, value / maxVal);
  return scores;
}
