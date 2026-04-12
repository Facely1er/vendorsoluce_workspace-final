import { describe, expect, it } from 'vitest';
import { computeSystemicDependencyScore } from '../src/scoring/systemicDependencyScore';
import { computePropagationRiskScore } from '../src/scoring/propagationRiskScore';

describe('systemic and propagation scores', () => {
  it('computes SDS in the 0..1 range', () => {
    const score = computeSystemicDependencyScore({
      weightedDegree: 0.7,
      betweenness: 0.9,
      eigenvector: 0.5,
      closeness: 0.6,
      concentrationFactor: 0.4,
      substitutionDifficulty: 0.8,
    });

    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('computes PRS in the 0..1 range', () => {
    const score = computePropagationRiskScore({
      systemicDependencyScore: 0.8,
      inherentVendorRisk: 0.6,
      externalThreatRelevance: 0.7,
      dataSensitivityExposure: 0.5,
      controlWeaknessFactor: 0.3,
    });

    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(1);
  });
});
