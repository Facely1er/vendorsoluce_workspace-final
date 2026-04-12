import { describe, expect, it } from 'vitest';
import { generateVendorExplanation } from '../src/analysis/explanations';

describe('generateVendorExplanation', () => {
  it('returns a plain-language explanation', () => {
    const text = generateVendorExplanation({
      vendor: {
        id: 'v1',
        orgId: 'o1',
        nodeType: 'vendor',
        name: 'Okta',
        substitutionDifficulty: 0.8,
        metadata: {},
      },
      metrics: {
        nodeId: 'v1',
        weightedDegree: 0.5,
        inWeightedDegree: 1,
        outWeightedDegree: 1,
        betweenness: 0.7,
        eigenvector: 0.2,
        closeness: 0.3,
        concentrationFactor: 0.6,
        hiddenConcentrationScore: 0.55,
        systemicDependencyScore: 0.78,
        propagationRiskScore: 0.66,
        blastRadiusServiceCount: 4,
        blastRadiusProcessingCount: 2,
        blastRadiusJurisdictionCount: 1,
        blastRadiusWeightedImpact: 1.4,
        confidenceScore: 0.72,
      },
      criticalServiceCount: 4,
      processingLinkCount: 2,
    });

    expect(text).toContain('Okta');
    expect(text).toContain('systemic dependency');
  });
});
