import React, { useMemo, useRef } from 'react';
import { X, Printer, AlertTriangle, Shield, TrendingUp, Database, FileText, MapPin, Building2, Check } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import {
  getRiskLevel,
  buildInherentRiskAssessment,
  sectorRollup,
  locationRollup,
  buildPortfolioRecommendations,
  suggestedNextReviewIsoDate,
  threatExposurePercent,
  complianceGapHints,
  inferredServiceTypeLabel,
  inferredPopulationLabel,
} from '../../../../utils/riskCalculations';
import type { VendorRadar, PortfolioStats } from '../../../../types/vendorRadar';
import styles from './VendorInherentRiskReport.module.css';
import { vendorInherentRiskBands, vendorInherentRiskIconCss } from '../../../../theme/inlineUiTokens';

interface VendorInherentRiskReportProps {
  vendors: VendorRadar[];
  stats: PortfolioStats;
  onClose: () => void;
}

const CATEGORY_LABEL: Record<string, string> = {
  critical: 'Critical',
  strategic: 'Strategic',
  tactical: 'Tactical',
  commodity: 'Commodity',
};

const VendorInherentRiskReport: React.FC<VendorInherentRiskReportProps> = ({
  vendors,
  stats,
  onClose,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const reportId = useMemo(
    () => `VSR-${Date.now().toString(36).toUpperCase().slice(-8)}`,
    []
  );

  const sortedVendors = [...vendors].sort((a, b) => b.inherentRisk - a.inherentRisk);
  const generatedAt = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const elevatedCount = vendors.filter(v => (v.inherentRisk || 0) >= 70).length;
  const sectors = useMemo(() => sectorRollup(vendors), [vendors]);
  const locations = useMemo(() => locationRollup(vendors), [vendors]);
  const recommendations = useMemo(() => buildPortfolioRecommendations(vendors, stats), [vendors, stats]);

  const topForBreakdown = sortedVendors.slice(0, 5);
  const portfolioComplianceHints = useMemo(() => {
    const set = new Set<string>();
    vendors.forEach(v => complianceGapHints(v).forEach(h => set.add(h)));
    return [...set].slice(0, 12);
  }, [vendors]);

  const riskDistribution: { label: string; count: number; level: 'critical' | 'high' | 'medium' | 'low' }[] = [
    { label: 'Critical (90–100)', count: vendors.filter(v => v.inherentRisk >= 90).length, level: 'critical' },
    { label: 'High (70–89)', count: vendors.filter(v => v.inherentRisk >= 70 && v.inherentRisk < 90).length, level: 'high' },
    { label: 'Medium (40–69)', count: vendors.filter(v => v.inherentRisk >= 40 && v.inherentRisk < 70).length, level: 'medium' },
    { label: 'Low (0–39)', count: vendors.filter(v => v.inherentRisk < 40).length, level: 'low' },
  ];

  const dynamicStyles = [
    vendorInherentRiskIconCss,
    ...sortedVendors.map((v, i) => {
      const c = vendorInherentRiskBands(v.inherentRisk);
      return `.vir-bar-v-${i}{width:${v.inherentRisk}%;background:${c.bar}}.vir-score-v-${i}{color:${c.text}}.vir-badge-v-${i}{background:${c.bg};color:${c.text}}`;
    }),
  ].join('');

  const displayService = (v: VendorRadar) =>
    v.serviceType?.trim() || inferredServiceTypeLabel(v) || '—';
  const displayPopulation = (v: VendorRadar) =>
    v.populationImpacted?.trim() || inferredPopulationLabel(v) || '—';

  return (
    <>
      <style>{`
        @media print {
          body > *:not(#vendor-risk-report-root) { display: none !important; }
          #vendor-risk-report-root { display: block !important; position: static !important; }
          .report-no-print { display: none !important; }
          .report-sheet { box-shadow: none !important; border-radius: 0 !important; margin: 0 !important; max-height: none !important; overflow: visible !important; }
          @page { margin: 1.2cm; size: A4 portrait; }
        }
        ${dynamicStyles}
      `}</style>

      <div
        id="vendor-risk-report-root"
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8 px-4"
      >
        <div
          ref={reportRef}
          className="report-sheet bg-white dark:bg-gray-900 w-full max-w-4xl rounded-2xl shadow-2xl min-h-[60vh] print:max-w-none"
        >
          <div className="report-no-print flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10 rounded-t-2xl">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Vendor Inherent Risk Assessment Report
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Generated {generatedAt} · {reportId}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 max-w-xl">
                Use your browser&apos;s print dialog — choose <strong className="font-medium text-gray-800 dark:text-gray-200">Save as PDF</strong> to download.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
              <Button
                variant="primary"
                size="md"
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 min-h-[2.5rem] px-5"
              >
                <Printer className="w-4 h-4" />
                Print / Save as PDF
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={onClose}
                className="flex items-center justify-center gap-2 min-h-[2.5rem]"
                aria-label="Close report"
              >
                <X className="w-4 h-4" />
                Close
              </Button>
            </div>
          </div>

          <div className="px-8 py-8 print:px-4 print:py-4 space-y-10">
            {/* Title block */}
            <div className="flex items-start justify-between pb-6 border-b-2 border-gray-900 dark:border-gray-200">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-6 h-6 text-green-600" />
                  <span className="text-xs font-bold uppercase tracking-widest text-green-700 dark:text-green-400">
                    VendorSoluce · Vendor Risk Radar
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Vendor Inherent Risk Assessment Report
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  NIST SP 800-161 aligned supply chain risk identification and prioritization
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Vendors assessed</div>
              </div>
            </div>

            {/* Executive summary */}
            <section className="print:break-inside-avoid">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Executive summary
              </h2>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-5 text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-3">
                <p>
                  This portfolio assessment summarizes inherent and residual risk scores derived from vendor
                  criticality, data sensitivity, SBOM posture signals, and—when captured—sector, geography,
                  service type, and population scope. It supports Cybersecurity Supply Chain Risk Management
                  (C-SCRM) activities under <strong>NIST SP 800-161 Rev. 1</strong>.
                </p>
                <p>
                  As of <strong>{generatedAt}</strong>, the portfolio contains <strong>{stats.total}</strong>{' '}
                  vendor(s). Average inherent risk is <strong>{stats.avgInherentRisk}</strong>/100; average
                  residual risk is <strong>{stats.avgResidualRisk}</strong>/100.
                  {elevatedCount > 0 ? (
                    <>
                      {' '}
                      <strong>{elevatedCount}</strong> vendor(s) are in an elevated tier (inherent ≥ 70) and
                      should be scheduled for enhanced review.
                    </>
                  ) : (
                    <> No vendors are currently in the elevated inherent-risk band (70+).</>
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Auto-enrichment: when service type or population is blank, the report shows inferred labels
                  from category for readability—capture both fields in intake or CSV for accurate scope scoring.
                </p>
              </div>
            </section>

            {/* KPI row */}
            <section className="print:break-inside-avoid">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">
                Portfolio overview
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  {
                    label: 'Avg inherent',
                    value: stats.avgInherentRisk,
                    suffix: '/100',
                    icon: TrendingUp,
                    idx: 0,
                  },
                  {
                    label: 'Avg residual',
                    value: stats.avgResidualRisk,
                    suffix: '/100',
                    icon: TrendingUp,
                    idx: 1,
                  },
                  {
                    label: 'Critical (90+)',
                    value: stats.criticalRisk,
                    suffix: ' vendors',
                    icon: AlertTriangle,
                    idx: 2,
                  },
                  {
                    label: 'High (70–89)',
                    value: stats.highRisk,
                    suffix: ' vendors',
                    icon: AlertTriangle,
                    idx: 3,
                  },
                  {
                    label: 'PII / PHI',
                    value: stats.sensitiveData,
                    suffix: ' vendors',
                    icon: Database,
                    idx: 4,
                  },
                ].map(({ label, value, suffix, icon: Icon, idx }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4"
                  >
                    <Icon className={`w-4 h-4 mb-2 vir-icon-${idx}`} />
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {value}
                      <span className="text-xs font-normal text-gray-500">{suffix}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Risk distribution */}
            <section className="print:break-inside-avoid">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">
                Risk distribution
              </h2>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {riskDistribution.map(({ label, count, level }) => {
                  const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  const levelClass = level.charAt(0).toUpperCase() + level.slice(1);
                  return (
                    <div
                      key={label}
                      className="flex items-center gap-4 px-5 py-3 border-b last:border-b-0 border-gray-100 dark:border-gray-700"
                    >
                      <div
                        className={`w-3 h-3 rounded-full flex-shrink-0 ${styles[`distributionDot${levelClass}`]}`}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 w-40 flex-shrink-0">
                        {label}
                      </span>
                      <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all ${styles.distributionBarInner} ${styles[`distributionBarPct${pct}`]} ${styles[`distributionBar${levelClass}`]}`}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white w-16 text-right flex-shrink-0">
                        {count} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {stats.sbomGaps > 0 && (
              <section className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 px-5 py-4 flex gap-3 print:break-inside-avoid">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                    EO 14028 SBOM gap — {stats.sbomGaps} vendor{stats.sbomGaps > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                    Software-providing vendors without SBOM on file receive a +10 inherent-risk signal. Prioritize
                    procurement follow-up.
                  </p>
                </div>
              </section>
            )}

            {/* Sector & geography */}
            <section className="grid md:grid-cols-2 gap-6 print:break-inside-avoid">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Sector analysis
                </h2>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden text-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800 text-left">
                        <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">Sector</th>
                        <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 text-center">#</th>
                        <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 text-right">
                          Avg inh.
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sectors.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-3 py-4 text-gray-400 text-center">
                            No sector data
                          </td>
                        </tr>
                      ) : (
                        sectors.map(row => (
                          <tr
                            key={row.sector}
                            className="border-t border-gray-100 dark:border-gray-700"
                          >
                            <td className="px-3 py-2 text-gray-800 dark:text-gray-200">{row.sector}</td>
                            <td className="px-3 py-2 text-center tabular-nums">{row.count}</td>
                            <td className="px-3 py-2 text-right font-semibold tabular-nums">
                              {row.avgInherent}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Geographic analysis
                </h2>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden text-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800 text-left">
                        <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">Location</th>
                        <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 text-center">#</th>
                        <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 text-right">
                          Avg inh.
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {locations.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-3 py-4 text-gray-400 text-center">
                            No location data — capture in intake for geo rollups
                          </td>
                        </tr>
                      ) : (
                        locations.map(row => (
                          <tr
                            key={row.location}
                            className="border-t border-gray-100 dark:border-gray-700"
                          >
                            <td className="px-3 py-2 text-gray-800 dark:text-gray-200">{row.location}</td>
                            <td className="px-3 py-2 text-center tabular-nums">{row.count}</td>
                            <td className="px-3 py-2 text-right font-semibold tabular-nums">
                              {row.avgInherent}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Vendor register */}
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">
                Vendor risk register
              </h2>
              {vendors.length === 0 ? (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-400">
                  No vendors in portfolio. Add vendors in the Radar to generate this report.
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm min-w-[880px]">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800 text-left border-b border-gray-200 dark:border-gray-700">
                        <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 w-6">#</th>
                        <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">Vendor</th>
                        <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">Category</th>
                        <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">Sector</th>
                        <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">Service</th>
                        <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">Population</th>
                        <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">Data</th>
                        <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 text-center">
                          SBOM
                        </th>
                        <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 text-right">
                          Inh.
                        </th>
                        <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 text-right">
                          Res.
                        </th>
                        <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 text-center">
                          Threat
                        </th>
                        <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">Review</th>
                        <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 text-center">
                          Tier
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedVendors.map((v, i) => {
                        const sbomGap = v.sbomProfile?.providesSoftware && !v.sbomProfile?.sbomAvailable;
                        const sbomOk = v.sbomProfile?.sbomAvailable;
                        const threat = threatExposurePercent(v.inherentRisk, v);
                        const nextReview = suggestedNextReviewIsoDate(v.inherentRisk);
                        const svcLabel = displayService(v);
                        const popLabel = displayPopulation(v);
                        const inferredSvc = !v.serviceType?.trim() && inferredServiceTypeLabel(v);
                        const inferredPop = !v.populationImpacted?.trim() && inferredPopulationLabel(v);
                        return (
                          <tr
                            key={v.id}
                            className="border-b last:border-b-0 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <td className="px-3 py-2 text-gray-400 tabular-nums">{i + 1}</td>
                            <td className="px-3 py-2">
                              <div className="font-semibold text-gray-900 dark:text-white">{v.name}</div>
                              {v.contact && (
                                <div className="text-[10px] text-gray-400 truncate max-w-[140px]">{v.contact}</div>
                              )}
                              {v.location && (
                                <div className="text-[10px] text-gray-500">{v.location}</div>
                              )}
                            </td>
                            <td className="px-3 py-2 text-gray-600 dark:text-gray-300">
                              {CATEGORY_LABEL[v.category] ?? v.category}
                            </td>
                            <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{v.sector || '—'}</td>
                            <td className="px-3 py-2 text-gray-600 dark:text-gray-300 max-w-[120px]">
                              <span className={inferredSvc ? 'italic text-gray-500' : ''}>{svcLabel}</span>
                            </td>
                            <td className="px-3 py-2 text-gray-600 dark:text-gray-300 max-w-[120px]">
                              <span className={inferredPop ? 'italic text-gray-500' : ''}>{popLabel}</span>
                            </td>
                            <td className="px-3 py-2">
                              {v.dataTypes?.length ? (
                                <span className="text-[10px] text-gray-500">{v.dataTypes.join(', ')}</span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {sbomGap ? (
                                <span
                                  className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-amber-100 text-amber-700"
                                  title="SBOM gap"
                                >
                                  <AlertTriangle className="h-3 w-3" aria-hidden />
                                </span>
                              ) : sbomOk ? (
                                <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-green-100 text-green-700">
                                  <Check className="h-3 w-3" aria-hidden />
                                </span>
                              ) : (
                                <span className="text-gray-300">—</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <div className="w-12 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                  <div className={`h-1.5 rounded-full vir-bar-v-${i}`} />
                                </div>
                                <span className={`font-bold tabular-nums vir-score-v-${i}`}>{v.inherentRisk}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-right font-semibold tabular-nums text-gray-700 dark:text-gray-300">
                              {v.residualRisk}
                            </td>
                            <td className="px-3 py-2 text-center tabular-nums text-gray-600 dark:text-gray-300">
                              {threat}
                            </td>
                            <td className="px-3 py-2 text-[10px] sm:text-xs text-gray-500 tabular-nums whitespace-nowrap">
                              {nextReview}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold vir-badge-v-${i}`}
                              >
                                {getRiskLevel(v.inherentRisk)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Factor breakdown — top vendors */}
            {topForBreakdown.length > 0 && (
              <section className="print:break-before-page">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                  Risk factor breakdown (top {topForBreakdown.length} by inherent risk)
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Lines below use the Radar model weights from captured attributes. If a vendor’s stored score
                  differs from the model (e.g. manual override), both are shown when the gap exceeds 5 points.
                </p>
                <div className="space-y-4">
                  {topForBreakdown.map((v, idx) => {
                    const a = buildInherentRiskAssessment(v);
                    const gap = Math.abs(a.inherentRisk - v.inherentRisk);
                    return (
                      <div
                        key={v.id}
                        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/50 p-4"
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {idx + 1}. {v.name}
                          </span>
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                            Stored {v.inherentRisk}/100 inherent · {v.residualRisk}/100 residual
                            {gap > 5 ? (
                              <span className="text-amber-700 dark:text-amber-400 ml-2">
                                · Model estimate {a.inherentRisk}/100
                              </span>
                            ) : null}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          {displayService(v)} · {displayPopulation(v)} · {v.sector || 'Sector not set'} ·{' '}
                          {v.location || 'Location not set'}
                        </p>
                        <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1 list-disc list-inside">
                          {a.factors.map(f => (
                            <li key={f.id}>
                              <strong className="font-medium text-gray-800 dark:text-gray-200">{f.label}</strong>{' '}
                              (+{f.points}): {f.detail}
                            </li>
                          ))}
                        </ul>
                        {complianceGapHints(v).length > 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            <span className="font-semibold">Diligence hints:</span>{' '}
                            {complianceGapHints(v).join(' · ')}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Portfolio compliance hints */}
            {portfolioComplianceHints.length > 0 && (
              <section className="print:break-inside-avoid">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
                  Compliance & diligence themes
                </h2>
                <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  {portfolioComplianceHints.map(h => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Recommendations */}
            <section className="print:break-inside-avoid">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
                Recommended actions
              </h2>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                {recommendations.map((r, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-vendorsoluce-green font-bold">{i + 1}.</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Methodology */}
            <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-5 py-4 print:break-inside-avoid">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Methodology (inherent risk 0–100)
              </p>
              <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1 list-disc list-inside">
                <li>
                  <strong>Category base:</strong> Critical = 70, Strategic = 50, Tactical = 30, Commodity = 10
                </li>
                <li>
                  <strong>Data types</strong> (capped +30): PII +15, PHI +20, Financial +18, IP +16, Confidential
                  +12
                </li>
                <li>
                  <strong>SBOM gap:</strong> +10 when software is provided and no SBOM is on file
                </li>
                <li>
                  <strong>Contextual drivers</strong> (sector, geography, service type, population scope): combined
                  cap +18 when those fields are populated
                </li>
                <li>
                  <strong>Residual:</strong> inherent −5 when SBOM is available; further control discounts can be
                  applied in full assessments
                </li>
              </ul>
            </section>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap justify-between gap-2 text-xs text-gray-400">
              <span>VendorSoluce — Vendor Risk Radar</span>
              <span>Confidential — Internal use only · {reportId}</span>
              <span>{generatedAt}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VendorInherentRiskReport;
