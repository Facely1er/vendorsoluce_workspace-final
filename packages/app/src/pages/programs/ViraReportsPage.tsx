import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  FileBarChart,
  Radar,
  AlertTriangle,
  TrendingUp,
  Database,
  Shield,
  Search,
  ExternalLink,
  Printer,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import WorkspacePage from '../../components/workspace/WorkspacePage';
import WorkspaceHero from '../../components/workspace/WorkspaceHero';
import WorkspaceContextBar from '../../components/workspace/WorkspaceContextBar';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useVendorPortfolio } from '../tools/VendorRiskRadar/hooks/useVendorPortfolio';
import VendorInherentRiskReport from '../tools/VendorRiskRadar/components/VendorInherentRiskReport';
import {
  getRiskLevel,
  suggestedNextReviewIsoDate,
  complianceGapHints,
  buildPortfolioRecommendations,
} from '../../utils/riskCalculations';
import type { VendorRadar } from '../../types/vendorRadar';
import { ProgressBarFill } from '../../components/ui/ProgressBarFill';

function inherentRiskBarFill(risk: number): string {
  if (risk >= 90) return 'fill-red-600';
  if (risk >= 70) return 'fill-amber-500';
  if (risk >= 40) return 'fill-orange-500';
  return 'fill-green-500';
}

type SortKey = 'name' | 'inherentRisk' | 'residualRisk' | 'nextReview';
type SortDir = 'asc' | 'desc';
type TierFilter = 'all' | 'critical' | 'high' | 'medium' | 'low';

const TIER_META: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  Critical: { label: 'Critical', dot: 'bg-red-500', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300' },
  High:     { label: 'High',     dot: 'bg-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-300' },
  Medium:   { label: 'Medium',   dot: 'bg-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-300' },
  Low:      { label: 'Low',      dot: 'bg-green-500',  bg: 'bg-green-50 dark:bg-green-900/20',   text: 'text-green-700 dark:text-green-300' },
};

const TIER_FILTER_LABELS: { id: TierFilter; label: string }[] = [
  { id: 'all',      label: 'All tiers' },
  { id: 'critical', label: 'Critical (90+)' },
  { id: 'high',     label: 'High (70–89)' },
  { id: 'medium',   label: 'Medium (40–69)' },
  { id: 'low',      label: 'Low (< 40)' },
];

function tierMatchesFilter(score: number, filter: TierFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'critical') return score >= 90;
  if (filter === 'high') return score >= 70 && score < 90;
  if (filter === 'medium') return score >= 40 && score < 70;
  return score < 40;
}

const VendorRowDetail: React.FC<{ vendor: VendorRadar }> = ({ vendor }) => {
  const hints = complianceGapHints(vendor);
  return (
    <tr className="bg-gray-50/70 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-700">
      <td colSpan={7} className="px-6 py-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
          {vendor.sector && <span><span className="font-medium text-gray-700 dark:text-gray-300">Sector:</span> {vendor.sector}</span>}
          {vendor.location && <span><span className="font-medium text-gray-700 dark:text-gray-300">Location:</span> {vendor.location}</span>}
          {vendor.serviceType && <span><span className="font-medium text-gray-700 dark:text-gray-300">Service:</span> {vendor.serviceType}</span>}
          {vendor.populationImpacted && <span><span className="font-medium text-gray-700 dark:text-gray-300">Population:</span> {vendor.populationImpacted}</span>}
          {vendor.dataTypes && vendor.dataTypes.length > 0 && (
            <span><span className="font-medium text-gray-700 dark:text-gray-300">Data:</span> {vendor.dataTypes.join(', ')}</span>
          )}
          {vendor.contact && (
            <span><span className="font-medium text-gray-700 dark:text-gray-300">Contact:</span> {vendor.contact}</span>
          )}
          {hints.length > 0 && (
            <span className="sm:col-span-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">Diligence hints:</span> {hints.join(' · ')}
            </span>
          )}
        </div>
      </td>
    </tr>
  );
};

const ViraReportsPage: React.FC = () => {
  const { vendors, stats } = useVendorPortfolio();

  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('inherentRisk');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showSummaryReport, setShowSummaryReport] = useState(false);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  };

  const filtered = useMemo(() => {
    return vendors
      .filter((v) => {
        const matchesSearch =
          !search ||
          v.name.toLowerCase().includes(search.toLowerCase()) ||
          (v.sector ?? '').toLowerCase().includes(search.toLowerCase()) ||
          (v.location ?? '').toLowerCase().includes(search.toLowerCase());
        return matchesSearch && tierMatchesFilter(v.inherentRisk, tierFilter);
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
        else if (sortKey === 'inherentRisk') cmp = a.inherentRisk - b.inherentRisk;
        else if (sortKey === 'residualRisk') cmp = a.residualRisk - b.residualRisk;
        else if (sortKey === 'nextReview') {
          cmp = suggestedNextReviewIsoDate(a.inherentRisk).localeCompare(
            suggestedNextReviewIsoDate(b.inherentRisk)
          );
        }
        return sortDir === 'asc' ? cmp : -cmp;
      });
  }, [vendors, search, tierFilter, sortKey, sortDir]);

  const recommendations = useMemo(
    () => buildPortfolioRecommendations(vendors, stats),
    [vendors, stats]
  );

  const generatedAt = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const SortIcon: React.FC<{ col: SortKey }> = ({ col }) => {
    if (col !== sortKey) return <ChevronDown className="h-3 w-3 opacity-30 ml-0.5" />;
    return sortDir === 'asc'
      ? <ChevronUp className="h-3 w-3 ml-0.5 text-vendorsoluce-green" />
      : <ChevronDown className="h-3 w-3 ml-0.5 text-vendorsoluce-green" />;
  };

  const TH: React.FC<{ col: SortKey; children: React.ReactNode; className?: string }> = ({ col, children, className = '' }) => (
    <th
      className={`px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer select-none whitespace-nowrap hover:text-vendorsoluce-green dark:hover:text-vendorsoluce-light-green transition-colors ${className}`}
      onClick={() => handleSort(col)}
    >
      <span className="inline-flex items-center gap-0.5">
        {children}
        <SortIcon col={col} />
      </span>
    </th>
  );

  if (vendors.length === 0) {
    return (
      <WorkspacePage title="VIRA Portfolio Reports" subtitle="Aggregated VIRA inherent-risk summaries, review schedules, and recommendations across your vendor portfolio.">
        <WorkspaceHero>
          <WorkspaceContextBar items={[
            { label: 'Total vendors', value: `${stats.total}` },
            { label: 'Average inherent', value: `${stats.avgInherentRisk}/100` },
            { label: 'High risk', value: `${stats.highRisk}` },
            { label: 'Generated', value: generatedAt },
          ]} />
        </WorkspaceHero>
        <Link
          to="/vendor-risk-radar"
          className="inline-flex items-center gap-2 text-sm text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Vendor Risk Radar
        </Link>

        <div className="flex items-start gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-vendorsoluce-green/10 dark:bg-vendorsoluce-green/20 flex items-center justify-center text-vendorsoluce-green dark:text-vendorsoluce-light-green flex-shrink-0">
            <Radar className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">VIRA Portfolio Reports</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Aggregated inherent-risk summaries, review schedules, and recommendations across your vendor portfolio.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-12 text-center">
          <Radar className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No vendors in your portfolio yet</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto text-sm">
            Add vendors in the Vendor Risk Radar to start generating VIRA risk reports and track your portfolio posture.
          </p>
          <Link to="/vendor-risk-radar">
            <Button variant="primary">
              Go to Vendor Risk Radar
            </Button>
          </Link>
        </div>
      </WorkspacePage>
    );
  }

  return (
    <>
      <WorkspacePage title="VIRA Portfolio Reports" subtitle="Aggregated VIRA inherent-risk summaries, review schedules, and recommendations across your vendor portfolio.">
        <WorkspaceHero>
          <WorkspaceContextBar items={[
            { label: 'Total vendors', value: `${stats.total}` },
            { label: 'Average inherent', value: `${stats.avgInherentRisk}/100` },
            { label: 'High risk', value: `${stats.highRisk}` },
            { label: 'Generated', value: generatedAt },
          ]} />
        </WorkspaceHero>
        <Link
          to="/vendor-risk-radar"
          className="inline-flex items-center gap-2 text-sm text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Vendor Risk Radar
        </Link>

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-vendorsoluce-green/10 dark:bg-vendorsoluce-green/20 flex items-center justify-center text-vendorsoluce-green dark:text-vendorsoluce-light-green flex-shrink-0">
              <Radar className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">VIRA Portfolio Reports</h1>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl text-sm">
                Aggregated VIRA inherent-risk summaries across your vendor portfolio. Use the in-app summary report
                or the full portfolio C-SCRM report for management readouts and audit evidence.
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Generated {generatedAt} · {stats.total} vendor{stats.total !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowSummaryReport(true)}
              className="flex items-center gap-2 justify-center"
            >
              <FileText className="h-4 w-4" />
              Open summary report
            </Button>
            <a
              href="/vendor-risk-radar#vendor-risk-radar-deliverables"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                size="md"
                className="flex items-center gap-2 justify-center w-full"
              >
                <FileBarChart className="h-4 w-4" />
                Portfolio C-SCRM report
                <ExternalLink className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </a>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {[
            { label: 'Total vendors', value: stats.total, icon: Database, color: 'text-blue-600 dark:text-blue-400' },
            { label: 'Avg inherent', value: `${stats.avgInherentRisk}/100`, icon: TrendingUp, color: 'text-gray-600 dark:text-gray-300' },
            { label: 'Critical (90+)', value: stats.criticalRisk, icon: AlertTriangle, color: 'text-red-600 dark:text-red-400' },
            { label: 'High (70–89)', value: stats.highRisk, icon: AlertTriangle, color: 'text-orange-500 dark:text-orange-400' },
            { label: 'PII / PHI vendors', value: stats.sensitiveData, icon: Shield, color: 'text-purple-600 dark:text-purple-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="p-4">
                <Icon className={`h-4 w-4 mb-2 ${color}`} />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Vendor register */}
        <Card className="mb-8">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-base">
                Vendor Risk Register
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({filtered.length} of {vendors.length})
                </span>
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search vendors…"
                    className="pl-9 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full sm:w-48 focus:outline-none focus:ring-1 focus:ring-vendorsoluce-green"
                  />
                </div>
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value as TierFilter)}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-vendorsoluce-green"
                  aria-label="Filter by risk tier"
                >
                  {TIER_FILTER_LABELS.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-gray-400 dark:text-gray-600 text-sm">
                No vendors match the current filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/70 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <TH col="name">Vendor</TH>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Category
                      </th>
                      <TH col="inherentRisk">Inherent</TH>
                      <TH col="residualRisk">Residual</TH>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Tier
                      </th>
                      <TH col="nextReview">Next review</TH>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-8">
                        <span className="sr-only">Details</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                    {filtered.map((vendor) => {
                      const level = getRiskLevel(vendor.inherentRisk);
                      const meta = TIER_META[level];
                      const expanded = expandedId === vendor.id;
                      return (
                        <React.Fragment key={vendor.id}>
                          <tr
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer transition-colors"
                            onClick={() => setExpandedId(expanded ? null : vendor.id)}
                          >
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900 dark:text-white">{vendor.name}</div>
                              {vendor.sector && (
                                <div className="text-xs text-gray-400">{vendor.sector}</div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300 capitalize">
                              {vendor.category}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <ProgressBarFill
                                  className="w-16 shrink-0"
                                  heightClassName="h-1.5"
                                  percent={vendor.inherentRisk}
                                  fillClassName={inherentRiskBarFill(vendor.inherentRisk)}
                                  trackClassName="bg-gray-100 dark:bg-gray-700"
                                />
                                <span className="font-semibold tabular-nums text-gray-900 dark:text-white">
                                  {vendor.inherentRisk}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 tabular-nums text-gray-700 dark:text-gray-300 font-medium">
                              {vendor.residualRisk}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${meta.bg} ${meta.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${meta.dot}`} />
                                {meta.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              {suggestedNextReviewIsoDate(vendor.inherentRisk)}
                            </td>
                            <td className="px-4 py-3 text-gray-400">
                              {expanded
                                ? <ChevronUp className="h-4 w-4" />
                                : <ChevronDown className="h-4 w-4" />}
                            </td>
                          </tr>
                          {expanded && <VendorRowDetail vendor={vendor} />}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Portfolio recommendations */}
        {recommendations.length > 0 && (
          <Card className="mb-8">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="text-base">Recommended Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ol className="space-y-2">
                {recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-vendorsoluce-green font-bold shrink-0">{i + 1}.</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Export hint */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500 dark:text-gray-400">
          <span>
            Use <strong className="text-gray-700 dark:text-gray-300">Open summary report</strong> above, then
            choose <strong className="text-gray-700 dark:text-gray-300">Print / Save as PDF</strong> for a
            print-ready VIRA assessment document.
          </span>
          <div className="flex items-center gap-2 text-xs">
            <Printer className="h-3.5 w-3.5 shrink-0" />
            Browser print dialog · no server required
          </div>
        </div>
      </WorkspacePage>

      {/* Full-screen report modal */}
      {showSummaryReport && (
        <VendorInherentRiskReport
          vendors={vendors}
          stats={stats}
          onClose={() => setShowSummaryReport(false)}
        />
      )}
    </>
  );
};

export default ViraReportsPage;
