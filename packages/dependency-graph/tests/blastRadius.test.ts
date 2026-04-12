import { describe, expect, it } from 'vitest';
import { buildDependencyGraph } from '../src/builders/buildDependencyGraph';
import { computeBlastRadius } from '../src/analysis/blastRadius';
import type { GraphEdge, GraphNode } from '../src/contracts/graph';

const nodes: GraphNode[] = [
  { id: 'v1', orgId: 'o1', nodeType: 'vendor', name: 'Vendor A', metadata: {}, criticality: 0.9 },
  { id: 's1', orgId: 'o1', nodeType: 'service', name: 'Payroll', metadata: {}, criticality: 0.8 },
  { id: 'p1', orgId: 'o1', nodeType: 'processing', name: 'Employee Payroll', metadata: {}, sensitivity: 0.9 },
];

const edges: GraphEdge[] = [
  { id: 'e1', orgId: 'o1', sourceNodeId: 'v1', targetNodeId: 's1', edgeType: 'supports', weight: 0.9, visibilityLevel: 'known', metadata: {} },
  { id: 'e2', orgId: 'o1', sourceNodeId: 'v1', targetNodeId: 'p1', edgeType: 'processes', weight: 0.8, visibilityLevel: 'known', metadata: {} },
];

describe('computeBlastRadius', () => {
  it('collects affected service and processing nodes', () => {
    const graph = buildDependencyGraph(nodes, edges);
    const result = computeBlastRadius(graph, 'v1');

    expect(result.affectedServiceIds).toContain('s1');
    expect(result.affectedProcessingIds).toContain('p1');
    expect(result.weightedImpact).toBeGreaterThan(0);
  });
});
