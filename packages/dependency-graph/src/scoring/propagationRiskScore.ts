import { clamp01 } from './edgeWeight';

export function computePropagationRiskScore(input: {
  systemicDependencyScore: number;
  inherentVendorRisk: number;
  externalThreatRelevance: number;
  dataSensitivityExposure: number;
  controlWeaknessFactor: number;
}): number {
  const score =
    0.35 * input.systemicDependencyScore +
    0.20 * input.inherentVendorRisk +
    0.20 * input.externalThreatRelevance +
    0.15 * input.dataSensitivityExposure +
    0.10 * input.controlWeaknessFactor;

  return clamp01(score);
}
