import type { ScenarioType } from './graph';

export interface ScenarioRunInput {
  orgId: string;
  vendorNodeId: string;
  scenarioType: ScenarioType;
  threatRelevance?: number;
  controlWeaknessFactor?: number;
}

export interface ScenarioNarrative {
  summary: string;
  drivers: string[];
  recommendedActions: string[];
}

export interface ScenarioRunOutput {
  blastRadiusScore: number;
  operationalImpactScore: number;
  privacyImpactScore: number;
  threatAmplificationScore: number;
  confidenceScore: number;
  affectedNodeIds: string[];
  affectedServiceIds: string[];
  affectedProcessingIds: string[];
  affectedJurisdictionIds: string[];
  narrative: ScenarioNarrative;
}
