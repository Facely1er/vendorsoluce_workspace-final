import type { GraphEdge, GraphNode } from '../contracts/graph';

function keyify(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function dedupeNodes(nodes: GraphNode[]): GraphNode[] {
  const seen = new Map<string, GraphNode>();

  for (const node of nodes) {
    const key = `${node.orgId}:${node.nodeType}:${node.externalKey ?? keyify(node.name)}`;
    if (!seen.has(key)) {
      seen.set(key, node);
    }
  }

  return [...seen.values()];
}

export function dedupeEdges(edges: GraphEdge[]): GraphEdge[] {
  const seen = new Map<string, GraphEdge>();

  for (const edge of edges) {
    const key = [
      edge.orgId,
      edge.sourceNodeId,
      edge.targetNodeId,
      edge.edgeType,
      edge.tierLevel ?? '',
    ].join(':');

    const existing = seen.get(key);
    if (!existing || edge.weight > existing.weight) {
      seen.set(key, edge);
    }
  }

  return [...seen.values()];
}
