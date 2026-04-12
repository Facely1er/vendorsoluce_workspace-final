import type { DependencyGraph } from '../contracts/graph';

export function computeWeightedDegree(
  graph: DependencyGraph,
  nodeId: string,
): { inWeightedDegree: number; outWeightedDegree: number; weightedDegree: number } {
  const incoming = graph.incoming.get(nodeId) ?? [];
  const outgoing = graph.outgoing.get(nodeId) ?? [];

  const inWeightedDegree = incoming.reduce((sum, e) => sum + e.weight, 0);
  const outWeightedDegree = outgoing.reduce((sum, e) => sum + e.weight, 0);

  return {
    inWeightedDegree,
    outWeightedDegree,
    weightedDegree: inWeightedDegree + outWeightedDegree,
  };
}
