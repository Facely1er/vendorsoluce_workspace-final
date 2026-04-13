/**
 * Bridges dependency-graph CSV import → onboarding prefill + compliance roadmap milestones.
 * All browser-local until org-backed tasks exist.
 */

import { addDays, format } from 'date-fns';
import { parseCsv, rowsToObjects } from '@ermits/dependency-graph/src/import/csvParser';
import type { VendorCsvRow } from '@ermits/dependency-graph/src/import/csvSchemas';

const ONBOARDING_HINTS_KEY = 'vendorsoluce_import_onboarding_hints_v1';
const MILESTONE_STORAGE_KEY = 'vendorsoluce_compliance_milestones_v1';

export type ImportOnboardingHints = {
  source: 'graph-csv-import';
  importedAt: string;
  vendorCount: number;
  insertedNodes: number;
  insertedEdges: number;
  primaryVendorName?: string;
  primaryVendorKey?: string;
  vendorTypeHint?: string;
  hasHighCriticality?: boolean;
};

export type Milestone = { id: string; title: string; date: string };

export function parseVendorCsvRows(vendorsCsv: string): VendorCsvRow[] {
  const trimmed = vendorsCsv.trim();
  if (!trimmed) return [];
  const grid = parseCsv(trimmed);
  if (grid.length < 2) return [];
  return rowsToObjects<VendorCsvRow>(grid);
}

function loadMilestones(): Milestone[] {
  try {
    const raw = localStorage.getItem(MILESTONE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m): m is Milestone =>
        typeof m === 'object' &&
        m !== null &&
        typeof (m as Milestone).id === 'string' &&
        typeof (m as Milestone).title === 'string' &&
        typeof (m as Milestone).date === 'string',
    );
  } catch {
    return [];
  }
}

function saveMilestones(next: Milestone[]) {
  try {
    localStorage.setItem(MILESTONE_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
}

/**
 * After a successful graph import: store hints for vendor onboarding prefill and
 * replace prior `graph-import-*` roadmap milestones with a fresh review backlog.
 */
export function persistImportIntegrationArtifacts(
  vendorsCsv: string,
  result: { insertedNodes: number; insertedEdges: number },
): ImportOnboardingHints {
  const vendors = parseVendorCsvRows(vendorsCsv);
  const first = vendors[0];
  const hints: ImportOnboardingHints = {
    source: 'graph-csv-import',
    importedAt: new Date().toISOString(),
    vendorCount: vendors.length,
    insertedNodes: result.insertedNodes,
    insertedEdges: result.insertedEdges,
    primaryVendorName: first?.vendor_name?.trim() || undefined,
    primaryVendorKey: first?.external_key?.trim() || undefined,
    vendorTypeHint: first?.vendor_type?.trim() || undefined,
    hasHighCriticality: vendors.some((v) => Number(v.criticality) >= 0.75),
  };

  try {
    localStorage.setItem(ONBOARDING_HINTS_KEY, JSON.stringify(hints));
  } catch {
    /* ignore */
  }

  seedGraphImportRoadmapMilestones(vendors.length);
  return hints;
}

export function loadImportOnboardingHints(): ImportOnboardingHints | null {
  try {
    const raw = localStorage.getItem(ONBOARDING_HINTS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ImportOnboardingHints;
    if (parsed?.source !== 'graph-csv-import') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearImportOnboardingHints() {
  try {
    localStorage.removeItem(ONBOARDING_HINTS_KEY);
  } catch {
    /* ignore */
  }
}

/** Review activities aligned to VIRA, requirements, evidence, and assessments. */
function seedGraphImportRoadmapMilestones(vendorCount: number) {
  const base = new Date();
  const seeds: Milestone[] = [
    {
      id: 'graph-import-review-vira',
      title: `VIRA reports — portfolio pass (${vendorCount} imported vendor nodes)`,
      date: format(addDays(base, 7), 'yyyy-MM-dd'),
    },
    {
      id: 'graph-import-requirements',
      title: 'Security definitions — align vendor requirements to imported graph',
      date: format(addDays(base, 14), 'yyyy-MM-dd'),
    },
    {
      id: 'graph-import-evidence',
      title: 'Evidence collection — tier-1 vendors from latest import',
      date: format(addDays(base, 21), 'yyyy-MM-dd'),
    },
    {
      id: 'graph-import-assessments',
      title: 'Vendor security assessments — schedule critical / high-criticality paths',
      date: format(addDays(base, 30), 'yyyy-MM-dd'),
    },
  ];

  const existing = loadMilestones().filter((m) => !m.id.startsWith('graph-import-'));
  saveMilestones([...existing, ...seeds]);
}
