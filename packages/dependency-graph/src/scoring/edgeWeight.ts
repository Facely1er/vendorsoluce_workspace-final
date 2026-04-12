export type EdgeWeightInputs = {
  dependencyStrength: number;
  operationalCriticality: number;
  dataSensitivityFactor: number;
  substitutionPenalty: number;
};

export function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

export function computeEdgeWeight(input: EdgeWeightInputs): number {
  const value =
    0.35 * input.dependencyStrength +
    0.25 * input.operationalCriticality +
    0.20 * input.dataSensitivityFactor +
    0.20 * input.substitutionPenalty;

  return clamp01(Number(value.toFixed(6)));
}
