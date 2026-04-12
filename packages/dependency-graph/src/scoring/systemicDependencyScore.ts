import { clamp01 } from './edgeWeight';

export function computeSystemicDependencyScore(input: {
  weightedDegree: number;
  betweenness: number;
  eigenvector: number;
  closeness: number;
  concentrationFactor: number;
  substitutionDifficulty: number;
}): number {
  const score =
    0.20 * input.weightedDegree +
    0.30 * input.betweenness +
    0.20 * input.eigenvector +
    0.10 * input.closeness +
    0.10 * input.concentrationFactor +
    0.10 * input.substitutionDifficulty;

  return clamp01(score);
}
