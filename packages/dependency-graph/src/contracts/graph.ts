export type GraphNodeType =
  | 'vendor'
  | 'service'
  | 'asset'
  | 'processing'
  | 'data_domain'
  | 'jurisdiction'
  | 'control';

export type GraphEdgeType =
  | 'supports'
  | 'relies_on'
  | 'integrates_with'
  | 'processes'
  | 'enables'
  | 'subject_to'
  | 'depends_on_control';

export type VisibilityLevel = 'known' | 'partial' | 'inferred';
export type ScenarioType = 'outage' | 'breach' | 'degradation';

export interface GraphNode {
  id: string;
  orgId: string;
  nodeType: GraphNodeType;
  name: string;
  externalKey?: string | null;
  vendorStatus?: 'active' | 'inactive' | 'planned' | 'retired' | null;
  vendorType?: string | null;
  serviceCategory?: string | null;
  criticality?: number | null;
  inherentRisk?: number | null;
  substitutionDifficulty?: number | null;
  sensitivity?: number | null;
  regulatoryWeight?: number | null;
  internetExposed?: boolean | null;
  crossBorder?: boolean | null;
  specialCategoryFlag?: boolean | null;
  businessOwner?: string | null;
  environment?: string | null;
  metadata: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  orgId: string;
  sourceNodeId: string;
  targetNodeId: string;
  edgeType: GraphEdgeType;
  weight: number;
  dependencyStrength?: number | null;
  operationalCriticality?: number | null;
  dataSensitivityFactor?: number | null;
  substitutionPenalty?: number | null;
  tierLevel?: number | null;
  visibilityLevel: VisibilityLevel;
  directOrIndirect?: string | null;
  sharedInfrastructureFlag?: boolean | null;
  writeAccessFlag?: boolean | null;
  transferFlag?: boolean | null;
  metadata: Record<string, unknown>;
}

export interface GraphAdjacencyEdge {
  edgeId: string;
  from: string;
  to: string;
  type: GraphEdgeType;
  weight: number;
  visibilityLevel?: VisibilityLevel;
}

export interface DependencyGraph {
  nodes: Map<string, GraphNode>;
  outgoing: Map<string, GraphAdjacencyEdge[]>;
  incoming: Map<string, GraphAdjacencyEdge[]>;
}
