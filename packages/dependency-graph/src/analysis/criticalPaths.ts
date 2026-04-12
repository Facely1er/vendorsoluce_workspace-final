import type { DependencyGraph } from '../contracts/graph';

export interface CriticalPath {
  nodeIds: string[];
  edgeIds: string[];
  pathScore: number;
  pathType: 'operational' | 'privacy' | 'threat' | 'mixed';
}

function classifyPath(graph: DependencyGraph, nodeIds: string[]): CriticalPath['pathType'] {
  let hasService = false;
  let hasProcessing = false;
  for (const id of nodeIds) {
    const node = graph.nodes.get(id);
    if (!node) continue;
    if (node.nodeType === 'service') hasService = true;
    if (node.nodeType === 'processing' || node.nodeType === 'jurisdiction' || node.nodeType === 'data_domain') hasProcessing = true;
  }
  if (hasService && hasProcessing) return 'mixed';
  if (hasProcessing) return 'privacy';
  if (hasService) return 'operational';
  return 'threat';
}

function computePathScore(graph: DependencyGraph, nodeIds: string[], edgeWeights: number[]): number {
  const avgEdgeWeight = edgeWeights.length ? edgeWeights.reduce((a,b)=>a+b,0) / edgeWeights.length : 0;
  const avgNodeImportance = nodeIds.length
    ? nodeIds.map((id) => {
        const n = graph.nodes.get(id);
        return n?.criticality ?? n?.sensitivity ?? n?.regulatoryWeight ?? 0.3;
      }).reduce((a,b)=>a+b,0) / nodeIds.length
    : 0;
  return Math.max(0, Math.min(1, 0.6 * avgEdgeWeight + 0.4 * avgNodeImportance));
}

export function extractCriticalPaths(
  graph: DependencyGraph,
  startNodeId: string,
  maxDepth = 4,
  limit = 5,
): CriticalPath[] {
  const found: CriticalPath[] = [];

  function dfs(currentId: string, depth: number, nodeIds: string[], edgeIds: string[], edgeWeights: number[]) {
    const currentNode = graph.nodes.get(currentId);
    if (!currentNode) return;

    if (depth > 0 && ['service','processing','jurisdiction','data_domain'].includes(currentNode.nodeType)) {
      found.push({
        nodeIds: [...nodeIds],
        edgeIds: [...edgeIds],
        pathScore: computePathScore(graph, nodeIds, edgeWeights),
        pathType: classifyPath(graph, nodeIds),
      });
    }

    if (depth >= maxDepth) return;

    for (const edge of graph.outgoing.get(currentId) ?? []) {
      if (nodeIds.includes(edge.to)) continue;
      dfs(edge.to, depth + 1, [...nodeIds, edge.to], [...edgeIds, edge.edgeId], [...edgeWeights, edge.weight]);
    }
  }

  dfs(startNodeId, 0, [startNodeId], [], []);
  return found.sort((a,b)=>b.pathScore-a.pathScore).slice(0, limit);
}
