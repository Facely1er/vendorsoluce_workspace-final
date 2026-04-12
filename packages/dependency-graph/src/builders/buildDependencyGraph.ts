import type {
  DependencyGraph,
  GraphAdjacencyEdge,
  GraphEdge,
  GraphNode,
} from '../contracts/graph';

export function buildDependencyGraph(
  nodes: GraphNode[],
  edges: GraphEdge[],
): DependencyGraph {
  const nodeMap = new Map<string, GraphNode>();
  const outgoing = new Map<string, GraphAdjacencyEdge[]>();
  const incoming = new Map<string, GraphAdjacencyEdge[]>();

  for (const node of nodes) {
    nodeMap.set(node.id, node);
    outgoing.set(node.id, []);
    incoming.set(node.id, []);
  }

  for (const edge of edges) {
    if (!nodeMap.has(edge.sourceNodeId) || !nodeMap.has(edge.targetNodeId)) {
      continue;
    }

    const adj: GraphAdjacencyEdge = {
      edgeId: edge.id,
      from: edge.sourceNodeId,
      to: edge.targetNodeId,
      type: edge.edgeType,
      weight: edge.weight,
      visibilityLevel: edge.visibilityLevel,
    };

    outgoing.get(edge.sourceNodeId)!.push(adj);
    incoming.get(edge.targetNodeId)!.push(adj);
  }

  return { nodes: nodeMap, outgoing, incoming };
}
