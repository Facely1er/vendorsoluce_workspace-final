import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '../../components/ui/Card';
import { ProgressBarFill } from '../../components/ui/ProgressBarFill';
import { ListTree, ArrowLeft, Search, X, CheckCircle2, Circle, Users } from 'lucide-react';
import {
  allVendorSupplyPhaseIds,
  VENDOR_SUPPLY_ACTIVITIES_BY_PHASE,
  VENDOR_SUPPLY_PHASE_DESCRIPTIONS,
  VENDOR_SUPPLY_PHASE_LABELS,
  VENDOR_SUPPLY_PHASE_PROGRAM_TRACKS,
  type VendorSupplyPhaseId,
  type VendorSupplyProgramTrack,
  type VendorSupplySipocRow,
} from '../../catalog/vendorSupplyChainSipocCatalog';

// ── Persistence ────────────────────────────────────────────────────────────────

const DONE_KEY = 'sipoc-vendor-activity-done';

function loadDone(): Set<string> {
  try {
    const raw = localStorage.getItem(DONE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveDone(done: Set<string>): void {
  try {
    localStorage.setItem(DONE_KEY, JSON.stringify([...done]));
  } catch {
    // ignore
  }
}

function useDone() {
  const [done, setDone] = useState<Set<string>>(() =>
    typeof window !== 'undefined' ? loadDone() : new Set()
  );
  const toggle = useCallback((id: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveDone(next);
      return next;
    });
  }, []);
  const reset = useCallback(() => {
    const empty = new Set<string>();
    setDone(empty);
    saveDone(empty);
  }, []);
  return { done, toggle, reset };
}

// ── Role filter definitions ────────────────────────────────────────────────────

const ROLE_FILTERS = [
  {
    id: 'grc',
    label: 'GRC / Program Lead',
    keywords: ['grc', 'program lead', 'program sponsor', 'program management', 'program manager'],
  },
  {
    id: 'risk',
    label: 'Risk / Assessment',
    keywords: ['risk', 'assessment', 'analyst', 'compliance analyst', 'third-party risk'],
  },
  {
    id: 'vendor',
    label: 'Vendor Manager',
    keywords: ['vendor manager', 'procurement', 'buyer'],
  },
  {
    id: 'privacy',
    label: 'Privacy / Legal',
    keywords: ['privacy', 'legal', 'dpo'],
  },
  {
    id: 'engineering',
    label: 'Engineering / IT',
    keywords: ['engineering', 'it /', 'integration engineer', 'solutions architect', 'it asset', 'it release'],
  },
] as const;

type RoleId = (typeof ROLE_FILTERS)[number]['id'];

function matchesRole(supplier: string, roleId: RoleId | null): boolean {
  if (!roleId) return true;
  const role = ROLE_FILTERS.find((r) => r.id === roleId);
  if (!role) return true;
  const s = supplier.toLowerCase();
  return role.keywords.some((kw) => s.includes(kw));
}

// ── Activity card ──────────────────────────────────────────────────────────────

function SipocActivityCard({
  row,
  done,
  onToggle,
}: {
  row: VendorSupplySipocRow;
  done: Set<string>;
  onToggle: (id: string) => void;
}) {
  const checked = done.has(row.id);
  return (
    <div
      className={`rounded-lg border p-4 mb-4 last:mb-0 transition-colors ${
        checked
          ? 'border-green-400/40 bg-green-50/30 dark:bg-green-900/10'
          : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/40'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className={`text-sm font-semibold flex-1 min-w-0 ${
          checked ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'
        }`}>
          {row.process}
        </p>
        <button
          type="button"
          onClick={() => onToggle(row.id)}
          aria-label={checked ? `Unmark "${row.process}" as done` : `Mark "${row.process}" as done`}
          aria-pressed={checked ? "true" : "false"}
          className="shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vendorsoluce-green rounded"
        >
          {checked
            ? <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            : <Circle className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-vendorsoluce-green dark:hover:text-vendorsoluce-light-green" />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-vendorsoluce-green dark:text-vendorsoluce-light-green mb-1">
            Supplier
          </div>
          <p className="text-gray-700 dark:text-gray-300">{row.supplier}</p>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-vendorsoluce-green dark:text-vendorsoluce-light-green mb-1">
            Customer
          </div>
          <p className="text-gray-700 dark:text-gray-300">{row.customer}</p>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-vendorsoluce-green dark:text-vendorsoluce-light-green mb-1">
            Inputs
          </div>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-0.5">
            {row.inputs.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-vendorsoluce-green dark:text-vendorsoluce-light-green mb-1">
            Outputs
          </div>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-0.5">
            {row.outputs.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">In-product scope</div>
        <p className="text-xs text-gray-600 dark:text-gray-400">{row.inProductScope.join(' · ')}</p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const VendorActivityCatalogPage: React.FC = () => {
  const { t } = useTranslation();
  const { done, toggle, reset } = useDone();
  const [query, setQuery] = useState('');
  const [activeRole, setActiveRole] = useState<RoleId | null>(null);
  const [programTrack, setProgramTrack] = useState<'all' | VendorSupplyProgramTrack>('all');

  const phases = useMemo(() => {
    const all = allVendorSupplyPhaseIds();
    if (programTrack === 'all') return all;
    return all.filter((id) => VENDOR_SUPPLY_PHASE_PROGRAM_TRACKS[id].includes(programTrack));
  }, [programTrack]);

  const total = useMemo(
    () => phases.reduce((s, id) => s + VENDOR_SUPPLY_ACTIVITIES_BY_PHASE[id].length, 0),
    [phases]
  );

  const q = query.toLowerCase().trim();

  const filtered = phases.map((phaseId: VendorSupplyPhaseId) => ({
    phaseId,
    allRows: VENDOR_SUPPLY_ACTIVITIES_BY_PHASE[phaseId],
    rows: VENDOR_SUPPLY_ACTIVITIES_BY_PHASE[phaseId].filter(
      (r) =>
        matchesRole(r.supplier, activeRole) &&
        (q === '' ||
          r.process.toLowerCase().includes(q) ||
          r.supplier.toLowerCase().includes(q) ||
          r.customer.toLowerCase().includes(q) ||
          r.inputs.some((x) => x.toLowerCase().includes(q)) ||
          r.outputs.some((x) => x.toLowerCase().includes(q)) ||
          r.inProductScope.some((x) => x.toLowerCase().includes(q)))
    ),
  })).filter((p) => p.rows.length > 0);

  const totalDone = phases.reduce(
    (s, id) => s + VENDOR_SUPPLY_ACTIVITIES_BY_PHASE[id].filter((r) => done.has(r.id)).length,
    0
  );

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-vendorsoluce-green/10 dark:bg-vendorsoluce-green/20 flex items-center justify-center text-vendorsoluce-green dark:text-vendorsoluce-light-green flex-shrink-0">
          <ListTree className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Vendor Program Activity Catalog
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {phases.length} phases · {total} predefined activities ·{' '}
            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">src/catalog/vendorSupplyChainSipocCatalog.ts</code>
          </p>
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-300 max-w-3xl mb-6">
        Full platform process catalog with phase-by-phase traceability.
        Phases are tagged for NIST Vendor Risk Program and Vendor Intelligence &amp; Risk Assessment (VIRA) workflows.
      </p>

      <div className="rounded-xl border border-vendorsoluce-green/25 bg-vendorsoluce-green/5 dark:bg-vendorsoluce-green/10 p-4 mb-6">
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          {t('vendorProgramWorkflow.common.programBanner')}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          {t('vendorProgramWorkflow.common.programBannerBody')}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/program/nist-implementation"
            className="inline-flex items-center rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm font-medium text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {t('navigation.nistImplementationWorkflow')} →
          </Link>
          <Link
            to="/program/vira-due-diligence"
            className="inline-flex items-center rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm font-medium text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {t('navigation.viraDueDiligenceWorkflow')} →
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mb-4" role="group" aria-label="Filter by program">
        <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">Program:</span>
        <button
          type="button"
          onClick={() => setProgramTrack('all')}
          aria-pressed={programTrack === 'all' ? "true" : "false"}
          className={`text-xs px-2.5 py-0.5 rounded-full border transition-colors ${
            programTrack === 'all'
              ? 'bg-vendorsoluce-green text-white border-vendorsoluce-green'
              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          {t('vendorProgramWorkflow.common.filterAll')}
        </button>
        <button
          type="button"
          onClick={() => setProgramTrack('nist')}
          aria-pressed={programTrack === 'nist' ? "true" : "false"}
          className={`text-xs px-2.5 py-0.5 rounded-full border transition-colors ${
            programTrack === 'nist'
              ? 'bg-vendorsoluce-green text-white border-vendorsoluce-green'
              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          {t('vendorProgramWorkflow.common.filterNist')}
        </button>
        <button
          type="button"
          onClick={() => setProgramTrack('vira')}
          aria-pressed={programTrack === 'vira' ? "true" : "false"}
          className={`text-xs px-2.5 py-0.5 rounded-full border transition-colors ${
            programTrack === 'vira'
              ? 'bg-vendorsoluce-green text-white border-vendorsoluce-green'
              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          {t('vendorProgramWorkflow.common.filterVira')}
        </button>
      </div>

      {/* Overall progress bar */}
      <div className="flex items-center gap-3 mb-5">
        <ProgressBarFill
          percent={total > 0 ? (totalDone / total) * 100 : 0}
          fillClassName="fill-green-500"
          trackClassName="bg-gray-200 dark:bg-gray-700"
          className="flex-1"
        />
        <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums shrink-0">
          {totalDone}/{total} done
        </span>
        {totalDone > 0 && (
          <button
            type="button"
            onClick={reset}
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline underline-offset-2 shrink-0"
          >
            Reset
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search activities, suppliers, scope…"
          aria-label="Search vendor activities"
          className="h-9 w-full max-w-md rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-9 pr-8 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-vendorsoluce-green/50"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute left-[calc(min(100%,28rem)-2rem)] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Role filter chips */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4" role="group" aria-label="Filter by role">
        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 shrink-0">
          <Users className="h-3.5 w-3.5" aria-hidden /> Role:
        </span>
        <button
          type="button"
          onClick={() => setActiveRole(null)}
          aria-pressed={!activeRole ? "true" : "false"}
          className={`text-xs px-2.5 py-0.5 rounded-full border transition-colors ${
            !activeRole
              ? 'bg-vendorsoluce-green text-white border-vendorsoluce-green'
              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          All roles
        </button>
        {ROLE_FILTERS.map((role) => {
          const count = phases.reduce(
            (s, id) => s + VENDOR_SUPPLY_ACTIVITIES_BY_PHASE[id].filter((r) => matchesRole(r.supplier, role.id)).length,
            0
          );
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => setActiveRole(activeRole === role.id ? null : role.id)}
              aria-pressed={activeRole === role.id ? "true" : "false"}
              className={`text-xs px-2.5 py-0.5 rounded-full border transition-colors ${
                activeRole === role.id
                  ? 'bg-vendorsoluce-green text-white border-vendorsoluce-green'
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {role.label}
              <span className="ml-1 opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Phase jump pills — hidden during search or role filtering */}
      {!q && !activeRole && (
        <nav className="flex flex-wrap gap-1.5 mb-6" aria-label="Jump to phase">
          {phases.map((phaseId: VendorSupplyPhaseId) => {
            const allRows = VENDOR_SUPPLY_ACTIVITIES_BY_PHASE[phaseId];
            const phaseDone = allRows.filter((r) => done.has(r.id)).length;
            const allDone = phaseDone === allRows.length;
            return (
              <a
                key={phaseId}
                href={`#phase-${phaseId}`}
                className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  allDone
                    ? 'border-green-400/50 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {VENDOR_SUPPLY_PHASE_LABELS[phaseId]}
                {phaseDone > 0 && (
                  <span className={`tabular-nums font-semibold text-[10px] ${allDone ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                    {phaseDone}/{allRows.length}
                  </span>
                )}
              </a>
            );
          })}
        </nav>
      )}

      {/* No results */}
      {filtered.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
          No activities match your current filters.{' '}
          <button
            type="button"
            onClick={() => { setQuery(''); setActiveRole(null); }}
            className="underline hover:no-underline"
          >
            Clear filters
          </button>
        </p>
      )}

      {/* Phase sections */}
      <div className="space-y-8">
        {filtered.map(({ phaseId, allRows, rows }) => {
          const phaseDone = allRows.filter((r) => done.has(r.id)).length;
          const pct = allRows.length > 0 ? (phaseDone / allRows.length) * 100 : 0;

          return (
            <section key={phaseId} id={`phase-${phaseId}`}>
              <Card className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  {/* Phase header */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      {phaseDone === allRows.length && allRows.length > 0 && (
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" aria-hidden />
                      )}
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {VENDOR_SUPPLY_PHASE_LABELS[phaseId]}
                      </h2>
                    </div>
                    <span className={`text-xs font-semibold tabular-nums px-2 py-0.5 rounded-full shrink-0 ${
                      phaseDone === allRows.length && allRows.length > 0
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : phaseDone > 0
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    }`}>
                      {phaseDone > 0 ? `${phaseDone}/${allRows.length} done` : `${rows.length} activities`}
                    </span>
                  </div>

                  {/* Phase progress bar */}
                  <div className="mb-4">
                    <ProgressBarFill
                      percent={pct}
                      heightClassName="h-1"
                      fillClassName="fill-green-500"
                      trackClassName="bg-gray-100 dark:bg-gray-800"
                    />
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {VENDOR_SUPPLY_PHASE_DESCRIPTIONS[phaseId]}
                  </p>
                  {VENDOR_SUPPLY_PHASE_PROGRAM_TRACKS[phaseId].length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mb-4">
                      <span className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
                        Programs:
                      </span>
                      {VENDOR_SUPPLY_PHASE_PROGRAM_TRACKS[phaseId].map((track) => (
                        <span
                          key={track}
                          className="text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                        >
                          {track === 'nist' ? 'NIST' : 'VIRA'}
                        </span>
                      ))}
                    </div>
                  )}

                  {rows.map((row) => (
                    <SipocActivityCard key={row.id} row={row} done={done} onToggle={toggle} />
                  ))}
                </CardContent>
              </Card>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default VendorActivityCatalogPage;
