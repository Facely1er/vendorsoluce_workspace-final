import type { DependencyGraph } from '../contracts/graph';

function edgeCost(weight: number): number {
  return weight <= 0 ? Number.POSITIVE_INFINITY : 1 / weight;
}

export function shortestPathsFrom(
  graph: DependencyGraph,
  sourceId: string,
): Map<string, number> {
  const distances = new Map<string, number>();
  const visited = new Set<string>();

  for (const nodeId of graph.nodes.keys()) distances.set(nodeId, Number.POSITIVE_INFINITY);
  distances.set(sourceId, 0);

  while (visited.size < graph.nodes.size) {
    let currentId: string | null = null;
    let currentDist = Number.POSITIVE_INFINITY;

    for (const [nodeId, dist] of distances.entries()) {
      if (!visited.has(nodeId) && dist < currentDist) {
        currentId = nodeId;
        currentDist = dist;
      }
    }

    if (!currentId || !Number.isFinite(currentDist)) break;
    visited.add(currentId);

    for (const edge of graph.outgoing.get(currentId) ?? []) {
      const alt = currentDist + edgeCost(edge.weight);
      if (alt < (distances.get(edge.to) ?? Number.POSITIVE_INFINITY)) {
        distances.set(edge.to, alt);
      }
    }
  }

  return distances;
}

export function computeCloseness(graph: DependencyGraph, nodeId: string): number {
  const distances = shortestPathsFrom(graph, nodeId);
  const finite = [...distances.values()].filter((d) => Number.isFinite(d) && d > 0);
  if (finite.length === 0) return 0;
  const total = finite.reduce((sum, d) => sum + d, 0);
  return total > 0 ? finite.length / total : 0;
}
