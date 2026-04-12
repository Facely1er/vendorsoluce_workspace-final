// Risk calculation utilities for Vendor Risk Radar
import type { VendorRadar, VendorBase } from '../types/vendorRadar';

const DATA_RISK_WEIGHTS: Record<string, number> = {
  PII: 15,
  PHI: 20,
  Financial: 18,
  IP: 16,
  Confidential: 12,
  Public: 0,
};

const CATEGORY_RISK_BASE: Record<string, number> = {
  critical: 70,
  strategic: 50,
  tactical: 30,
  commodity: 10,
};

/** Max extra points from sector + geography + service type + population (keeps scores bounded). */
const CONTEXTUAL_RISK_CAP = 18;

export interface InherentRiskFactor {
  id: string;
  label: string;
  points: number;
  detail: string;
}

export interface InherentRiskAssessment {
  inherentRisk: number;
  factors: InherentRiskFactor[];
  contextualPointsRaw: number;
  contextualPointsApplied: number;
}

function sectorContext(sector: string): { pts: number; detail: string } {
  const s = sector.trim().toLowerCase();
  if (!s) return { pts: 0, detail: '' };
  if (s.includes('health'))
    return { pts: 8, detail: 'Healthcare sector — regulatory and PHI-related exposure' };
  if (s.includes('financ') || s.includes('bank') || s.includes('payment'))
    return { pts: 9, detail: 'Financial services — payments, fraud, and compliance pressure' };
  if (s.includes('technolog') || s.includes('software') || s.includes('cloud') || s.includes('saas'))
    return { pts: 7, detail: 'Technology / software supply chain — dependency and IP risk' };
  if (s.includes('government') || s.includes('public sector'))
    return { pts: 8, detail: 'Public sector — sovereignty and targeted-threat considerations' };
  return { pts: 4, detail: 'Named sector — general third-party supply chain exposure' };
}

function locationContext(location: string): { pts: number; detail: string } {
  const s = location.trim().toLowerCase();
  if (!s) return { pts: 0, detail: '' };
  if (s.includes('eu') || s.includes('europe') || s.includes('gdpr') || s.includes('european union'))
    return { pts: 7, detail: 'EU / GDPR jurisdiction — cross-border and privacy obligations' };
  if (s.includes('united kingdom') || s.includes(' uk') || /\buk\b/.test(s))
    return { pts: 6, detail: 'United Kingdom — UK GDPR / ICO expectations' };
  if (
    s.includes('united states') ||
    s.includes('u.s.') ||
    s.includes('u.s') ||
    /\busa\b/.test(s) ||
    s.includes('america')
  )
    return { pts: 5, detail: 'United States — domestic processing baseline' };
  if (s.includes('canada')) return { pts: 5, detail: 'Canada — PIPEDA / provincial privacy context' };
  if (s.includes('asia') || s.includes('apac') || s.includes('india') || s.includes('china'))
    return { pts: 6, detail: 'APAC / international footprint — transfer and residency considerations' };
  return { pts: 4, detail: 'Named geography — jurisdictional complexity' };
}

function serviceTypeContext(serviceType?: string): { pts: number; detail: string } {
  const s = (serviceType || '').trim().toLowerCase();
  if (!s) return { pts: 0, detail: '' };
  if (s.includes('cloud') || s.includes('infrastructure') || s.includes('identity') || s.includes('sso'))
    return { pts: 4, detail: 'Foundational IT / identity — broad blast radius' };
  if (s.includes('payment') || s.includes('billing'))
    return { pts: 4, detail: 'Payments / billing — direct financial impact' };
  if (s.includes('data') || s.includes('analytic') || s.includes('warehouse'))
    return { pts: 3, detail: 'Data / analytics — aggregation and sensitivity' };
  return { pts: 2, detail: 'Service type — operational dependency context' };
}

function populationContext(pop?: string): { pts: number; detail: string } {
  const s = (pop || '').trim().toLowerCase();
  if (!s) return { pts: 0, detail: '' };
  if (s.includes('all employee') || s.includes('enterprise-wide') || s.includes('company-wide'))
    return { pts: 4, detail: 'Population — organization-wide' };
  if (s.includes('customer') || s.includes('public') || s.includes('citizen'))
    return { pts: 5, detail: 'Population — customer- or public-facing' };
  if (s.includes('department') || s.includes('function'))
    return { pts: 2, detail: 'Population — department / function scope' };
  return { pts: 2, detail: 'Population scope noted' };
}

/**
 * Full inherent-risk assessment with explainable factors (for reports and QA).
 * Contextual points (sector/geo/service/population) only apply when those fields are set — leaving them empty preserves legacy behavior.
 */
export const buildInherentRiskAssessment = (
  vendor: Partial<VendorBase | VendorRadar>
): InherentRiskAssessment => {
  const category = vendor.category || 'tactical';
  let risk = CATEGORY_RISK_BASE[category] || 30;
  const factors: InherentRiskFactor[] = [
    {
      id: 'category',
      label: 'Vendor criticality (category)',
      points: CATEGORY_RISK_BASE[category] || 30,
      detail: `Category "${category}" — base exposure weight`,
    },
  ];

  const dataTypes = vendor.dataTypes || [];
  const dataRisk = dataTypes.reduce((sum, dt) => sum + (DATA_RISK_WEIGHTS[dt] || 0), 0);
  const dataApplied = Math.min(dataRisk, 30);
  if (dataApplied > 0) {
    factors.push({
      id: 'data',
      label: 'Data sensitivity',
      points: dataApplied,
      detail: `Data types: ${dataTypes.join(', ')} (contributions capped at +30)`,
    });
  }
  risk += dataApplied;

  if (vendor.sbomProfile?.providesSoftware && !vendor.sbomProfile?.sbomAvailable) {
    factors.push({
      id: 'sbom',
      label: 'SBOM gap (EO 14028 signal)',
      points: 10,
      detail: 'Software-providing vendor without SBOM on file',
    });
    risk += 10;
  }

  const sec = sectorContext(vendor.sector || '');
  const loc = locationContext(vendor.location || '');
  const svc = serviceTypeContext(vendor.serviceType);
  const pop = populationContext(vendor.populationImpacted);

  const contextualRaw = sec.pts + loc.pts + svc.pts + pop.pts;
  const contextualApplied = Math.min(contextualRaw, CONTEXTUAL_RISK_CAP);
  const ctxParts: string[] = [];
  if (sec.pts) ctxParts.push(`${sec.detail} (+${sec.pts})`);
  if (loc.pts) ctxParts.push(`${loc.detail} (+${loc.pts})`);
  if (svc.pts) ctxParts.push(`${svc.detail} (+${svc.pts})`);
  if (pop.pts) ctxParts.push(`${pop.detail} (+${pop.pts})`);

  if (contextualApplied > 0) {
    factors.push({
      id: 'contextual',
      label: 'Sector, geography, service & population scope',
      points: contextualApplied,
      detail:
        ctxParts.join(' · ') +
        (contextualRaw > CONTEXTUAL_RISK_CAP
          ? ` — contextual drivers capped at +${CONTEXTUAL_RISK_CAP} for portfolio comparability`
          : ''),
    });
  }
  risk += contextualApplied;

  return {
    inherentRisk: Math.min(Math.round(risk), 100),
    factors,
    contextualPointsRaw: contextualRaw,
    contextualPointsApplied: contextualApplied,
  };
};

/**
 * Calculate inherent risk score (0-100) based on vendor characteristics
 */
/** Slider ids aligned with Vendor Risk Calculator / VIRA quick intake (weights sum to 15). */
export const INTAKE_SLIDER_IDS = [
  'data_access',
  'criticality',
  'security_controls',
  'compliance',
  'system_exposure',
] as const;

export type IntakeSliderId = (typeof INTAKE_SLIDER_IDS)[number];

export const INTAKE_SLIDER_WEIGHTS: Record<IntakeSliderId, number> = {
  data_access: 4,
  criticality: 3,
  security_controls: 3,
  compliance: 2,
  system_exposure: 3,
};

const INTAKE_WEIGHTED_MIN = 15; // all 1s
const INTAKE_WEIGHTED_MAX = 75; // all 5s

export function hasCompleteIntakeFactors(factors: Record<string, number> | undefined): boolean {
  if (!factors || typeof factors !== 'object') return false;
  return INTAKE_SLIDER_IDS.every((id) => {
    const v = factors[id];
    return typeof v === 'number' && v >= 1 && v <= 5;
  });
}

/**
 * Inherent risk 0–100 from VIRA weighted sliders: 1 = stronger posture (lower risk), 5 = weaker (higher risk).
 * Aligned with portfolio tiers in `getRiskLevel` / Vendor Risk Radar.
 */
export function inherentRiskFromIntakeSliders(factors: Record<string, number>): number {
  let weightedSum = 0;
  for (const id of INTAKE_SLIDER_IDS) {
    const raw = factors[id];
    const v = Math.min(5, Math.max(1, Math.round(Number(raw) || 1)));
    weightedSum += INTAKE_SLIDER_WEIGHTS[id] * v;
  }
  const span = INTAKE_WEIGHTED_MAX - INTAKE_WEIGHTED_MIN;
  return Math.min(100, Math.max(0, Math.round(((weightedSum - INTAKE_WEIGHTED_MIN) / span) * 100)));
}

export const calculateInherentRisk = (vendor: Partial<VendorBase | VendorRadar>): number => {
  if (hasCompleteIntakeFactors(vendor.intakeFactors)) {
    return inherentRiskFromIntakeSliders(vendor.intakeFactors!);
  }
  return buildInherentRiskAssessment(vendor).inherentRisk;
};

/**
 * Calculate residual risk score (0-100) after considering mitigation factors
 */
export const calculateResidualRisk = (
  vendor: Partial<VendorBase | VendorRadar>,
  inherentRisk: number
): number => {
  let residual = inherentRisk;

  if (vendor.sbomProfile?.sbomAvailable) {
    residual -= 5;
  }

  return Math.max(Math.round(residual), 0);
};

/** Tier ids for inherent risk (0–100). Aligned across Radar, inherent-risk report, portfolio HTML sync, and getRiskLevel labels. */
export type InherentRiskTierId = 'critical' | 'high' | 'medium' | 'low';

/** Critical 90+, High 70–89, Medium 40–69, Low 0–39 — same bands as Vendor Inherent Risk report and portfolio report handoff. */
export function inherentRiskTierFromScore(score: number): InherentRiskTierId {
  const s = Math.round(Number.isFinite(score) ? score : 0);
  if (s >= 90) return 'critical';
  if (s >= 70) return 'high';
  if (s >= 40) return 'medium';
  return 'low';
}

const TIER_TO_RISK_LABEL: Record<InherentRiskTierId, 'Low' | 'Medium' | 'High' | 'Critical'> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const getRiskLevel = (score: number): 'Low' | 'Medium' | 'High' | 'Critical' => {
  return TIER_TO_RISK_LABEL[inherentRiskTierFromScore(score)];
};

export const getComplianceStatus = (score: number): 'Compliant' | 'Partial' | 'Non-Compliant' => {
  if (score < 40) return 'Compliant';
  if (score < 70) return 'Partial';
  return 'Non-Compliant';
};

/** Maps residual/inherent score to DB row fields (single source for Radar, import, calculator). */
export function vendorRiskFieldsFromResidual(residual: number): {
  risk_score: number;
  risk_level: ReturnType<typeof getRiskLevel>;
  compliance_status: ReturnType<typeof getComplianceStatus>;
} {
  const r = Math.min(100, Math.max(0, Math.round(Number.isFinite(residual) ? residual : 0)));
  return {
    risk_score: r,
    risk_level: getRiskLevel(r),
    compliance_status: getComplianceStatus(r),
  };
}

/** Suggested next review (ISO date) from inherent risk tier. */
export const suggestedNextReviewIsoDate = (
  inherentRisk: number,
  from: Date = new Date()
): string => {
  const d = new Date(from);
  const months = inherentRisk >= 90 ? 3 : inherentRisk >= 70 ? 4 : inherentRisk >= 40 ? 6 : 12;
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
};

/**
 * Relative threat exposure index (0–100) for reporting — aligned with inherent score plus SBOM gap emphasis.
 */
export const threatExposurePercent = (
  inherentRisk: number,
  vendor: Partial<VendorBase | VendorRadar>
): number => {
  let p = inherentRisk;
  if (vendor.sbomProfile?.providesSoftware && !vendor.sbomProfile?.sbomAvailable) {
    p = Math.min(100, p + 5);
  }
  return Math.min(100, Math.round(p));
};

/** Auto label when service type not captured (display-only). */
export const inferredServiceTypeLabel = (vendor: Partial<VendorBase | VendorRadar>): string | undefined => {
  if (vendor.serviceType?.trim()) return undefined;
  const c = vendor.category || 'tactical';
  if (c === 'critical') return 'Mission-critical dependency (inferred)';
  if (c === 'strategic') return 'Strategic service (inferred)';
  if (c === 'tactical') return 'Operational service (inferred)';
  return 'Commodity service (inferred)';
};

/** Auto label when population not captured (display-only). */
export const inferredPopulationLabel = (vendor: Partial<VendorBase | VendorRadar>): string | undefined => {
  if (vendor.populationImpacted?.trim()) return undefined;
  return 'Not specified — capture in intake for scope analysis';
};

/** Compliance / diligence hints from attributes (not a certification check). */
export const complianceGapHints = (vendor: Partial<VendorBase | VendorRadar>): string[] => {
  const hints: string[] = [];
  const loc = (vendor.location || '').toLowerCase();
  const types = (vendor.dataTypes || []).map(t => t.toUpperCase());
  if (loc.includes('eu') || loc.includes('europe') || loc.includes('gdpr'))
    hints.push('EU GDPR — processor DPA, SCCs, and breach timelines');
  if (types.some(t => t.includes('PHI') || t.includes('HEALTH')))
    hints.push('Health data — HIPAA / BAA and PHI safeguards if applicable');
  if (types.some(t => t.includes('FINAN') || t.includes('PCI')))
    hints.push('Financial data — PCI DSS expectations for cardholder environments');
  if (types.includes('PII')) hints.push('PII — privacy notice, retention, and DSAR handling');
  if (vendor.sbomProfile?.providesSoftware && !vendor.sbomProfile?.sbomAvailable)
    hints.push('EO 14028 / NTIA — SBOM minimum elements gap');
  return hints;
};

export interface SectorRollupRow {
  sector: string;
  count: number;
  avgInherent: number;
  keyVendors: string;
}

export interface LocationRollupRow {
  location: string;
  count: number;
  avgInherent: number;
  keyVendors: string;
}

export const sectorRollup = (vendors: VendorRadar[]): SectorRollupRow[] => {
  const map = new Map<string, { sum: number; count: number; names: string[] }>();
  for (const v of vendors) {
    const key = (v.sector || 'Unspecified').trim() || 'Unspecified';
    const cur = map.get(key) || { sum: 0, count: 0, names: [] };
    cur.sum += v.inherentRisk || 0;
    cur.count += 1;
    if (cur.names.length < 3) cur.names.push(v.name);
    map.set(key, cur);
  }
  return [...map.entries()]
    .map(([sector, { sum, count, names }]) => ({
      sector,
      count,
      avgInherent: count ? Math.round(sum / count) : 0,
      keyVendors: names.join(', '),
    }))
    .sort((a, b) => b.avgInherent - a.avgInherent);
};

export const locationRollup = (vendors: VendorRadar[]): LocationRollupRow[] => {
  const map = new Map<string, { sum: number; count: number; names: string[] }>();
  for (const v of vendors) {
    const key = (v.location || 'Unspecified').trim() || 'Unspecified';
    const cur = map.get(key) || { sum: 0, count: 0, names: [] };
    cur.sum += v.inherentRisk || 0;
    cur.count += 1;
    if (cur.names.length < 3) cur.names.push(v.name);
    map.set(key, cur);
  }
  return [...map.entries()]
    .map(([location, { sum, count, names }]) => ({
      location,
      count,
      avgInherent: count ? Math.round(sum / count) : 0,
      keyVendors: names.join(', '),
    }))
    .sort((a, b) => b.avgInherent - a.avgInherent);
};

export const buildPortfolioRecommendations = (
  vendors: VendorRadar[],
  stats: ReturnType<typeof calculatePortfolioStats>
): string[] => {
  const recs: string[] = [];
  const elevated = vendors.filter(v => (v.inherentRisk || 0) >= 70);
  if (elevated.length > 0) {
    recs.push(
      `Prioritize ${elevated.length} elevated-risk vendor(s) for enhanced monitoring and contract controls (monthly or quarterly reviews).`
    );
  }
  if (stats.sbomGaps > 0) {
    recs.push(
      `Close SBOM gaps for ${stats.sbomGaps} software-providing vendor(s) — align procurement with EO 14028 / NTIA minimum elements.`
    );
  }
  if (stats.sensitiveData > 0) {
    recs.push(
      `Maintain data-processing agreements and transfer assessments for ${stats.sensitiveData} vendor(s) handling PII/PHI-class data.`
    );
  }
  if (stats.avgInherentRisk >= 60) {
    recs.push(
      'Portfolio average inherent risk is elevated — consider enterprise-wide third-party governance playbooks and tiered due diligence.'
    );
  }
  if (recs.length === 0) {
    recs.push('Continue periodic reviews; capture sector, geography, and service scope in intake to refine scoring.');
  }
  return recs;
};

/**
 * Calculate portfolio statistics
 */
export const calculatePortfolioStats = (vendors: VendorRadar[]) => {
  const total = vendors.length;
  const criticalCategory = vendors.filter(v => v.category === 'critical').length;
  const criticalRisk = vendors.filter(v => (v.residualRisk || 0) >= 90).length;
  const highRisk = vendors.filter(v => {
    const risk = v.residualRisk || v.inherentRisk || 0;
    return risk >= 70 && risk < 90;
  }).length;
  const sensitiveData = vendors.filter(v => v.dataTypes?.some(dt => ['PII', 'PHI'].includes(dt))).length;
  const avgInherentRisk =
    vendors.length > 0
      ? Math.round(vendors.reduce((sum, v) => sum + (v.inherentRisk || 0), 0) / vendors.length)
      : 0;
  const avgResidualRisk =
    vendors.length > 0
      ? Math.round(vendors.reduce((sum, v) => sum + (v.residualRisk || 0), 0) / vendors.length)
      : 0;
  const sbomGaps = vendors.filter(
    v => v.sbomProfile?.providesSoftware && !v.sbomProfile?.sbomAvailable
  ).length;
  const maxRisk = vendors.reduce((max, v) => Math.max(max, v.residualRisk || v.inherentRisk || 0), 0);

  return {
    total,
    criticalCategory,
    criticalRisk,
    highRisk,
    sensitiveData,
    avgInherentRisk,
    avgResidualRisk,
    sbomGaps,
    maxRisk,
  };
};
