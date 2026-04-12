import type { DependencyGraph, GraphNode } from '../contracts/graph';

function collectReachableByType(
  graph: DependencyGraph,
  startId: string,
  nodeType: GraphNode['nodeType'],
  maxDepth = 3,
): GraphNode[] {
  const visited = new Set<string>();
  const queue: Array<{ id: string; depth: number }> = [{ id: startId, depth: 0 }];
  const results: GraphNode[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.depth > maxDepth || visited.has(current.id)) continue;
    visited.add(current.id);

    const node = graph.nodes.get(current.id);
    if (node && node.nodeType === nodeType && current.id !== startId) results.push(node);

    for (const edge of graph.outgoing.get(current.id) ?? []) {
      queue.push({ id: edge.to, depth: current.depth + 1 });
    }
  }

  return results;
}

export function computeConcentrationFactor(graph: DependencyGraph, vendorNodeId: string): number {
  const impactedServices = collectReachableByType(graph, vendorNodeId, 'service', 3);
  if (impactedServices.length === 0) return 0;

  const weighted = impactedServices.reduce((sum, node) => sum + (node.criticality ?? 0.5), 0);
  return Math.max(0, Math.min(1, weighted / impactedServices.length));
}

export function computeHiddenConcentrationScore(graph: DependencyGraph, vendorNodeId: string): number {
  const visited = new Set<string>();
  const queue: Array<{ id: string; depth: number; score: number }> = [{ id: vendorNodeId, depth: 0, score: 1 }];
  const upstreamCounts = new Map<string, { count: number; score: number; inferred: number }>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.depth > 3) continue;

    for (const edge of graph.incoming.get(current.id) ?? []) {
      const nextScore = current.score * edge.weight;
      const prev = upstreamCounts.get(edge.from) ?? { count: 0, score: 0, inferred: 0 };
      prev.count += 1;
      prev.score += nextScore;
      if (edge.visibilityLevel === 'inferred') prev.inferred += 1;
      upstreamCounts.set(edge.from, prev);

      if (!visited.has(edge.from)) {
        visited.add(edge.from);
        queue.push({ id: edge.from, depth: current.depth + 1, score: nextScore });
      }
    }
  }

  let raw = 0;
  for (const [, entry] of upstreamCounts.entries()) {
    if (entry.count > 1) raw += entry.score * (entry.inferred > 0 ? 1.1 : 1);
  }
  return raw;
}
