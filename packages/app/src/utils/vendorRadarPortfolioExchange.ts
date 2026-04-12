/**
 * Portable JSON exchange between Vendor Risk Radar (app) and static vendor-threat-radar (website).
 * Optional feature: import/export a single file; scores are recalculated on import in the app.
 *
 * Deep link from the static radar to this tool (app):
 * `/vendor-risk-radar?from=website&handoff=import` — shows an import hint, scrolls to the toolbar,
 * then strips those query params (replace) so the URL stays clean.
 */
import type { VendorRadar, VendorBase, SBOMProfile } from '../types/vendorRadar';
import { calculateInherentRisk, calculateResidualRisk } from './riskCalculations';

export const RADAR_PORTFOLIO_FORMAT = 'vendorsoluce-radar-portfolio' as const;
export const RADAR_PORTFOLIO_VERSION = 1;

export interface RadarPortfolioEnvelope {
  format: typeof RADAR_PORTFOLIO_FORMAT;
  version: number;
  exportedAt: string;
  vendors: unknown[];
}

function normalizeCategory(raw: unknown): VendorRadar['category'] {
  const x = String(raw ?? 'tactical').toLowerCase();
  if (x === 'critical' || x === 'strategic' || x === 'tactical' || x === 'commodity') {
    return x;
  }
  return 'tactical';
}

function parseSbomProfile(raw: unknown): SBOMProfile | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  if (typeof o.providesSoftware !== 'boolean' || typeof o.sbomAvailable !== 'boolean') {
    return undefined;
  }
  return {
    providesSoftware: o.providesSoftware,
    sbomAvailable: o.sbomAvailable,
    sbomFormat: o.sbomFormat != null ? String(o.sbomFormat) : undefined,
    openSourceExposure: o.openSourceExposure != null ? String(o.openSourceExposure) : undefined,
  };
}

function parsePortfolioVendor(raw: unknown, index: number): VendorRadar {
  if (!raw || typeof raw !== 'object') {
    throw new Error(`Vendor at index ${index} must be an object`);
  }
  const o = raw as Record<string, unknown>;
  const name = String(o.name ?? '').trim();
  if (!name) {
    throw new Error(`Vendor at index ${index} is missing a name`);
  }

  const dataTypes = Array.isArray(o.dataTypes) ? o.dataTypes.map((d) => String(d)) : [];

  const base: Partial<VendorBase> = {
    name,
    category: normalizeCategory(o.category),
    sector: o.sector != null ? String(o.sector) : '',
    location: o.location != null ? String(o.location) : '',
    contact: o.contact != null ? String(o.contact) : undefined,
    notes: o.notes != null ? String(o.notes) : undefined,
    dataTypes,
    serviceType: o.serviceType != null ? String(o.serviceType) : undefined,
    populationImpacted: o.populationImpacted != null ? String(o.populationImpacted) : undefined,
    sbomProfile: parseSbomProfile(o.sbomProfile),
  };

  const inherentRisk = calculateInherentRisk(base);
  const residualRisk = calculateResidualRisk(base, inherentRisk);

  const id =
    typeof o.id === 'string' && o.id.length > 0 ? o.id : crypto.randomUUID();
  const createdAt =
    typeof o.createdAt === 'string' && o.createdAt ? o.createdAt : new Date().toISOString();
  const updatedAt =
    typeof o.updatedAt === 'string' && o.updatedAt ? o.updatedAt : new Date().toISOString();

  return {
    ...(base as VendorBase),
    id,
    inherentRisk,
    residualRisk,
    createdAt,
    updatedAt,
  };
}

/**
 * Returns parsed vendors if `text` is a valid v1 portfolio envelope; otherwise null (caller may treat as CSV).
 */
export function tryParseRadarPortfolioExchange(text: string): VendorRadar[] | null {
  const t = text.trim();
  if (!t.startsWith('{')) return null;

  let data: unknown;
  try {
    data = JSON.parse(t);
  } catch {
    return null;
  }

  if (!data || typeof data !== 'object') return null;
  const envelope = data as Record<string, unknown>;
  if (envelope.format !== RADAR_PORTFOLIO_FORMAT) return null;
  if (envelope.version !== RADAR_PORTFOLIO_VERSION) return null;
  if (!Array.isArray(envelope.vendors)) return null;

  return envelope.vendors.map((v, i) => parsePortfolioVendor(v, i));
}

export function serializeRadarPortfolioExchange(vendors: VendorRadar[]): string {
  const exportedAt = new Date().toISOString();
  const body: RadarPortfolioEnvelope = {
    format: RADAR_PORTFOLIO_FORMAT,
    version: RADAR_PORTFOLIO_VERSION,
    exportedAt,
    vendors: vendors.map((v) => ({
      id: v.id,
      name: v.name,
      category: v.category,
      sector: v.sector,
      location: v.location,
      contact: v.contact,
      notes: v.notes,
      dataTypes: v.dataTypes,
      serviceType: v.serviceType,
      populationImpacted: v.populationImpacted,
      sbomProfile: v.sbomProfile,
      inherentRisk: v.inherentRisk,
      residualRisk: v.residualRisk,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    })),
  };
  return JSON.stringify(body, null, 2);
}
