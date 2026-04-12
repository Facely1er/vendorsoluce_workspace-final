import type { GraphNode, ScenarioRunOutput, VendorCentralityMetrics } from "@ermits/dependency-graph";

export type VendorGraphNode = GraphNode;
export type VendorMetricSnapshot = VendorCentralityMetrics;
export type VendorScenarioSnapshot = ScenarioRunOutput;

export interface VendorNodeLink {
  vendorId: string;
  graphNodeId: string;
  matchType: "id" | "external_key" | "name" | "metadata";
  confidence: number;
}

export interface VendorIntelligenceSnapshot {
  vendorId: string;
  graphNodeId?: string;
  nodeName?: string;
  linked: boolean;
  matchType?: VendorNodeLink["matchType"];
  confidence: number;
  weightedDegree?: number;
  betweenness?: number;
  closeness?: number;
  eigenvector?: number;
  concentrationFactor?: number;
  hiddenConcentrationScore?: number;
  systemicDependencyScore?: number;
  propagationRiskScore?: number;
  blastRadiusWeightedImpact?: number;
  confidenceScore?: number;
}

export interface IntegratedVendorRiskRecord {
  vendorId: string;
  vendorName: string;
  userId: string;
  inherentRiskScore: number | null;
  systemicDependencyScore: number | null;
  propagationRiskScore: number | null;
  concentrationFactor: number | null;
  blastRadiusWeightedImpact: number | null;
  graphConfidenceScore: number | null;
  finalRiskScore: number | null;
  graphNodeId?: string;
  graphNodeName?: string;
  graphLinked: boolean;
}

export interface VendorGraphImportBundle {
  vendorsCsv: string;
  servicesCsv: string;
  processingCsv: string;
  edgesCsv: string;
}
