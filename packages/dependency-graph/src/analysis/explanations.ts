import type { VendorCentralityMetrics } from '../contracts/metrics';
import type { GraphNode } from '../contracts/graph';

export interface VendorExplanationContext {
  vendor: GraphNode;
  metrics: VendorCentralityMetrics;
  criticalServiceCount?: number;
  processingLinkCount?: number;
}

function band(score: number): string {
  if (score >= 0.75) return 'critical';
  if (score >= 0.5) return 'high';
  if (score >= 0.25) return 'moderate';
  return 'limited';
}

export function generateVendorExplanation(ctx: VendorExplanationContext): string {
  const drivers: string[] = [];

  if (ctx.metrics.betweenness >= 0.6) drivers.push('acts as a bridge across dependency paths');
  if (ctx.metrics.hiddenConcentrationScore >= 0.5) drivers.push('shares upstream concentration that can amplify disruption');
  if ((ctx.criticalServiceCount ?? 0) > 0) drivers.push(`supports ${ctx.criticalServiceCount} mapped critical service${(ctx.criticalServiceCount ?? 0) === 1 ? '' : 's'}`);
  if ((ctx.processingLinkCount ?? 0) > 0) drivers.push(`touches ${ctx.processingLinkCount} processing activit${(ctx.processingLinkCount ?? 0) === 1 ? 'y' : 'ies'}`);
  if ((ctx.vendor.substitutionDifficulty ?? 0) >= 0.7) drivers.push('has high substitution difficulty');

  const driverText = drivers.length > 0 ? drivers.join(', ') : 'has mapped dependency relevance';
  return `${ctx.vendor.name} is a ${band(ctx.metrics.systemicDependencyScore)} systemic dependency node because it ${driverText}. Propagation risk is ${band(ctx.metrics.propagationRiskScore)} and mapping confidence is ${band(ctx.metrics.confidenceScore)}.`;
}
