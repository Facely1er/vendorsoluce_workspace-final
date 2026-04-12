import { describe, expect, it } from 'vitest';
import { computeEdgeWeight } from '../src/scoring/edgeWeight';

describe('computeEdgeWeight', () => {
  it('calculates deterministic weighted score', () => {
    const weight = computeEdgeWeight({
      dependencyStrength: 1,
      operationalCriticality: 0.8,
      dataSensitivityFactor: 0.5,
      substitutionPenalty: 0.25,
    });

    expect(weight).toBeCloseTo(0.35 + 0.20 + 0.10 + 0.05, 6);
  });

  it('clamps values to 0..1', () => {
    const weight = computeEdgeWeight({
      dependencyStrength: 5,
      operationalCriticality: 5,
      dataSensitivityFactor: 5,
      substitutionPenalty: 5,
    });

    expect(weight).toBe(1);
  });
});
