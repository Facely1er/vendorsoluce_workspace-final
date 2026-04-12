import type { DependencyGraph } from '../contracts/graph';

export interface BlastRadiusResult {
  affectedNodeIds: string[];
  affectedServiceIds: string[];
  affectedProcessingIds: string[];
  affectedJurisdictionIds: string[];
  weightedImpact: number;
}

export function computeBlastRadius(
  graph: DependencyGraph,
  vendorNodeId: string,
  maxDepth = 4,
): BlastRadiusResult {
  const visited = new Set<string>();
  const queue: Array<{ nodeId: string; depth: number; pathWeight: number }> = [
    { nodeId: vendorNodeId, depth: 0, pathWeight: 1 },
  ];

  const affectedNodeIds = new Set<string>();
  const affectedServiceIds = new Set<string>();
  const affectedProcessingIds = new Set<string>();
  const affectedJurisdictionIds = new Set<string>();

  let weightedImpact = 0;

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.depth > maxDepth || visited.has(current.nodeId)) continue;
    visited.add(current.nodeId);

    const node = graph.nodes.get(current.nodeId);
    if (!node) continue;

    affectedNodeIds.add(node.id);
    if (node.nodeType === 'service') affectedServiceIds.add(node.id);
    if (node.nodeType === 'processing') affectedProcessingIds.add(node.id);
    if (node.nodeType === 'jurisdiction') affectedJurisdictionIds.add(node.id);

    weightedImpact += (node.criticality ?? node.sensitivity ?? node.regulatoryWeight ?? 0.3) * current.pathWeight;

    for (const edge of graph.outgoing.get(current.nodeId) ?? []) {
      queue.push({
        nodeId: edge.to,
        depth: current.depth + 1,
        pathWeight: current.pathWeight * edge.weight,
      });
    }
  }

  return {
    affectedNodeIds: [...affectedNodeIds],
    affectedServiceIds: [...affectedServiceIds],
    affectedProcessingIds: [...affectedProcessingIds],
    affectedJurisdictionIds: [...affectedJurisdictionIds],
    weightedImpact,
  };
}
