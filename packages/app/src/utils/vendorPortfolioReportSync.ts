import type { VendorRadar } from '../types/vendorRadar';
import { inherentRiskTierFromScore } from './riskCalculations';

/** sessionStorage key: full portfolio JSON written before opening vendor-portfolio-report.html (same origin). */
export const VS_PORTFOLIO_SESSION_KEY = 'vs_portfolio_import';

/** localStorage key consumed by vendor-portfolio-report.html */
export const VS_PORTFOLIO_STORAGE_KEY = 'vs_portfolio';

/** Same bands as Vendor Inherent Risk report and vendor-portfolio-report.html (90 / 70 / 40). */
export function tierFromInherentScore(score: number): 'critical' | 'high' | 'medium' | 'low' {
  return inherentRiskTierFromScore(score);
}

const CATEGORY_VENDOR_TYPE: Record<VendorRadar['category'], string> = {
  critical: 'Critical dependency',
  strategic: 'Strategic',
  tactical: 'Tactical',
  commodity: 'Commodity',
};

/**
 * Maps Vendor Risk Radar rows into the shape expected by packages/website/vendor-portfolio-report.html.
 * Rich fields (BAA/DPA, subprocessors) are inferred only where Radar has data (e.g. dataTypes).
 */
export function mapVendorRadarToPortfolioEntry(v: VendorRadar): Record<string, unknown> {
  const score = Math.round(v.inherentRisk ?? 0);
  const tier = tierFromInherentScore(score);
  const inherent = v.inherentRisk ?? score;
  const residual = v.residualRisk ?? inherent;
  const residual_assessed = residual < inherent - 0.5;

  const categories = [...(v.dataTypes?.length ? v.dataTypes : [])];
  const upper = categories.map((c) => c.toUpperCase());
  const hasPhi = upper.some((c) => c.includes('PHI') || c.includes('HEALTH'));
  const hasPii = upper.some((c) => c.includes('PII'));

  const frameworks = new Set<string>(['NIST SP 800-161']);
  if (hasPhi) frameworks.add('HIPAA');
  if (hasPii || hasPhi) frameworks.add('GDPR');

  const baaRequired = hasPhi;
  const dpaRequired = hasPii || hasPhi;

  const serviceDescription = [v.serviceType, v.sector, v.location].filter(Boolean).join(' · ') || undefined;

  const businessImpact: 'mission-critical' | 'important' | 'supporting' =
    v.category === 'critical' ? 'mission-critical' : v.category === 'strategic' ? 'important' : 'supporting';

  return {
    id: v.id,
    vendorName: v.name,
    vendorType: CATEGORY_VENDOR_TYPE[v.category] ?? 'Vendor',
    score,
    tier,
    assessed_at: v.updatedAt || v.createdAt,
    assessedBy: 'Vendor Risk Radar',
    residual_assessed,
    serviceDescription,
    dataSensitivity: categories.length ? { categories } : undefined,
    regulatorySurface: {
      frameworks: [...frameworks],
      baaRequired,
      dpaRequired,
      exportControl: false,
    },
    baaExecuted: !baaRequired,
    dpaExecuted: !dpaRequired,
    operationalCriticality: {
      businessImpact,
      rto: '—',
      alternatives: v.category === 'commodity' ? 'available' : 'difficult',
      userCount: '—',
    },
    concentration: {
      isSoleProvider: v.category === 'critical' || v.category === 'strategic',
      subprocessorCount: v.sbomProfile?.providesSoftware ? 'few' : 'unknown',
      geographicRisk: 'unknown',
      vendorMaturity: 'unknown',
    },
    subprocessors: [] as { name: string; role: string }[],
    domainScores: {},
    overrides: [] as string[],
    _source: 'radar',
  };
}

/** Stages mapped portfolio rows for the static report page (same browser origin as the app). */
export function stagePortfolioReportImport(vendors: VendorRadar[]): void {
  if (typeof sessionStorage === 'undefined') return;
  const rows = vendors.map(mapVendorRadarToPortfolioEntry);
  sessionStorage.setItem(VS_PORTFOLIO_SESSION_KEY, JSON.stringify(rows));
}

export function openVendorPortfolioReportWithVendors(vendors: VendorRadar[]): void {
  stagePortfolioReportImport(vendors);
  window.open('/vendor-portfolio-report.html', '_blank', 'noopener,noreferrer');
}
