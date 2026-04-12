export interface VendorCentralityMetrics {
  nodeId: string;
  weightedDegree: number;
  inWeightedDegree: number;
  outWeightedDegree: number;
  betweenness: number;
  eigenvector: number;
  closeness: number;
  concentrationFactor: number;
  hiddenConcentrationScore: number;
  systemicDependencyScore: number;
  propagationRiskScore: number;
  blastRadiusServiceCount: number;
  blastRadiusProcessingCount: number;
  blastRadiusJurisdictionCount: number;
  blastRadiusWeightedImpact: number;
  confidenceScore: number;
}
