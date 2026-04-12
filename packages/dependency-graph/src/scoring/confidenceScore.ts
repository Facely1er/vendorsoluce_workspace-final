import { clamp01 } from './edgeWeight';

export function computeConfidenceScore(input: {
  edgeCoverage: number;
  knownVisibilityRatio: number;
  serviceMappingCompleteness: number;
  processingMappingCompleteness: number;
  aliasResolutionQuality: number;
}): number {
  const score =
    0.30 * input.edgeCoverage +
    0.25 * input.knownVisibilityRatio +
    0.20 * input.serviceMappingCompleteness +
    0.15 * input.processingMappingCompleteness +
    0.10 * input.aliasResolutionQuality;

  return clamp01(score);
}
