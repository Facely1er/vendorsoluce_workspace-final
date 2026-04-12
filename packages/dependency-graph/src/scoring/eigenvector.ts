import type { DependencyGraph } from '../contracts/graph';

export function computeEigenvectorCentrality(
  graph: DependencyGraph,
  iterations = 100,
  tolerance = 1e-6,
): Map<string, number> {
  const nodeIds = [...graph.nodes.keys()];
  let scores = new Map(nodeIds.map((id) => [id, 1 / Math.max(nodeIds.length, 1)]));

  for (let i = 0; i < iterations; i++) {
    const next = new Map<string, number>();
    let norm = 0;

    for (const id of nodeIds) {
      const incoming = graph.incoming.get(id) ?? [];
      let value = 0;
      for (const edge of incoming) value += (scores.get(edge.from) ?? 0) * edge.weight;
      next.set(id, value);
      norm += value * value;
    }

    norm = Math.sqrt(norm) || 1;
    let delta = 0;

    for (const id of nodeIds) {
      const normalized = (next.get(id) ?? 0) / norm;
      delta += Math.abs(normalized - (scores.get(id) ?? 0));
      next.set(id, normalized);
    }

    scores = next;
    if (delta < tolerance) break;
  }

  return scores;
}
