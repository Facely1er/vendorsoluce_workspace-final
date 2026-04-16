/**
 * VIRA weighted intake completion: pick vendors from the portfolio that are missing full intake,
 * or refine scores for any vendor. Same scoring model as Vendor Risk Radar.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, AlertCircle, CheckCircle2, Filter, BookOpen, FileDown, FileText, Library } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useVendors } from '../../hooks/useVendors';
import { logger } from '../../utils/logger';
import InherentRiskCalculator, { type InherentRiskResult } from '../../components/vendor/InherentRiskCalculator';
import { vendorRiskFieldsFromResidual, hasCompleteIntakeFactors } from '../../utils/riskCalculations';
import { parseCSV } from '../../utils/csvImportExport';
import { tryParseRadarPortfolioExchange } from '../../utils/vendorRadarPortfolioExchange';
import { mergeRadarMetaIntoNotes } from '../../utils/vendorRadarMeta';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import WorkspacePageShell from '../../components/vendorsoluce-intelligence/WorkspacePageShell';
import { useVendorPortfolio } from './VendorRiskRadar/hooks/useVendorPortfolio';
import type { VendorRadar } from '../../types/vendorRadar';
import { MR } from 'shared/constants/routes';
import {
  buildPortfolioViraComplianceIndexMarkdown,
  buildVendorViraComplianceMarkdown,
  generateViraIntakePdf,
  normalizeIntakeFactorsForExport,
  triggerTextDownload,
  type ViraIntakeExportInput,
} from '../../utils/viraComplianceDocuments';

type PortfolioFilter = 'all' | 'missing' | 'complete';

type LastComputedPayload = {
  vendorName: string;
  riskScore: number;
  intakeFactors: Record<string, number>;
};

function safeFilenamePart(name: string): string {
  const s = name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
  return s.slice(0, 48) || 'vendor';
}

const VendorRiskCalculator: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { createVendor } = useVendors();
  const { vendors, updateVendor, loading: portfolioLoading } = useVendorPortfolio();
  const bulkInputRef = useRef<HTMLInputElement>(null);
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [portfolioFilter, setPortfolioFilter] = useState<PortfolioFilter>('missing');
  const [lastComputed, setLastComputed] = useState<LastComputedPayload | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);

  const selectedVendor = useMemo(
    () => (selectedVendorId ? vendors.find((v) => v.id === selectedVendorId) ?? null : null),
    [vendors, selectedVendorId]
  );

  const missingCount = useMemo(
    () => vendors.filter((v) => !hasCompleteIntakeFactors(v.intakeFactors)).length,
    [vendors]
  );
  const completeCount = useMemo(
    () => vendors.filter((v) => hasCompleteIntakeFactors(v.intakeFactors)).length,
    [vendors]
  );

  const filteredVendors = useMemo(() => {
    if (portfolioFilter === 'missing')
      return vendors.filter((v) => !hasCompleteIntakeFactors(v.intakeFactors));
    if (portfolioFilter === 'complete')
      return vendors.filter((v) => hasCompleteIntakeFactors(v.intakeFactors));
    return vendors;
  }, [vendors, portfolioFilter]);

  useEffect(() => {
    setLastComputed(null);
  }, [selectedVendorId]);

  const intakeExportPayload = useMemo((): ViraIntakeExportInput | null => {
    if (lastComputed) {
      return {
        vendorName: lastComputed.vendorName,
        riskScore: lastComputed.riskScore,
        intakeFactors: lastComputed.intakeFactors,
        sector: selectedVendor?.sector,
        sourceNote: t(
          'quickTools.riskCalculator.exportSourceCalculated',
          'From the latest VIRA calculation on this page (weighted intake).'
        ),
      };
    }
    if (selectedVendor) {
      const factors = normalizeIntakeFactorsForExport(selectedVendor.intakeFactors);
      return {
        vendorName: selectedVendor.name,
        riskScore: typeof selectedVendor.residualRisk === 'number' ? selectedVendor.residualRisk : 0,
        intakeFactors: factors,
        sector: selectedVendor.sector,
        sourceNote: t(
          'quickTools.riskCalculator.exportSourcePortfolio',
          'From saved portfolio data. Run Calculate to refresh scores from current sliders.'
        ),
      };
    }
    return null;
  }, [lastComputed, selectedVendor, t]);

  const portfolioIndexRows = useMemo(
    () =>
      vendors.map((v) => ({
        id: v.id,
        name: v.name,
        riskScore: typeof v.residualRisk === 'number' ? v.residualRisk : 0,
        intakeComplete: hasCompleteIntakeFactors(v.intakeFactors),
      })),
    [vendors]
  );

  const downloadVendorMarkdown = () => {
    if (!intakeExportPayload) return;
    const md = buildVendorViraComplianceMarkdown({
      ...intakeExportPayload,
      generatedAtIso: new Date().toISOString(),
    });
    const fn = `vira-intake-record-${safeFilenamePart(intakeExportPayload.vendorName)}-${new Date().toISOString().slice(0, 10)}.md`;
    triggerTextDownload(fn, md);
  };

  const downloadPortfolioIndex = () => {
    const md = buildPortfolioViraComplianceIndexMarkdown(portfolioIndexRows);
    const fn = `vira-portfolio-compliance-index-${new Date().toISOString().slice(0, 10)}.md`;
    triggerTextDownload(fn, md);
  };

  const downloadVendorPdf = async () => {
    if (!intakeExportPayload) return;
    setPdfBusy(true);
    try {
      const fn = `vira-intake-${safeFilenamePart(intakeExportPayload.vendorName)}-${new Date().toISOString().slice(0, 10)}.pdf`;
      await generateViraIntakePdf(
        { ...intakeExportPayload, generatedAtIso: new Date().toISOString() },
        fn
      );
    } catch (e) {
      logger.error('VIRA intake PDF export:', e);
    } finally {
      setPdfBusy(false);
    }
  };

  const handleSave = async (result: InherentRiskResult) => {
    if (!isAuthenticated) return;
    try {
      if (selectedVendorId) {
        await updateVendor(selectedVendorId, {
          name: result.vendorName,
          notes: result.notes,
          intakeFactors: result.intakeFactors,
        });
      } else {
        await createVendor({
          name: result.vendorName,
          ...vendorRiskFieldsFromResidual(result.riskScore),
          notes: result.notes,
        });
      }
    } catch (err) {
      logger.error('Error saving VIRA intake:', err);
      throw err;
    }
  };

  const handleBulkFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!isAuthenticated) {
      setBulkMessage(t('quickTools.riskCalculator.bulkSignIn', 'Sign in to import vendors to your account.'));
      event.target.value = '';
      return;
    }
    setBulkBusy(true);
    setBulkMessage(null);
    try {
      const text = await file.text();
      const fromPortfolio = tryParseRadarPortfolioExchange(text);
      const imported = fromPortfolio ?? parseCSV(text);
      if (imported.length === 0) {
        setBulkMessage(t('quickTools.riskCalculator.bulkEmpty', 'No vendors found in file.'));
        return;
      }
      for (const v of imported) {
        await createVendor({
          name: v.name,
          ...vendorRiskFieldsFromResidual(v.residualRisk),
          notes: mergeRadarMetaIntoNotes(v.notes, {
            serviceType: v.serviceType,
            populationImpacted: v.populationImpacted,
          }),
          industry: v.sector,
          contact_email: v.contact,
        });
      }
      setBulkMessage(
        t('quickTools.riskCalculator.bulkSuccess', 'Imported {{count}} vendor(s). Open Vendor Risk Radar or your dashboard to review.', {
          count: imported.length,
        })
      );
    } catch (err) {
      logger.error('Bulk import from VIRA intake:', err);
      setBulkMessage(
        t(
          'quickTools.riskCalculator.bulkError',
          'Import failed. Use the CSV template from Vendor Risk Radar or a portfolio JSON export.'
        )
      );
    } finally {
      setBulkBusy(false);
      if (bulkInputRef.current) bulkInputRef.current.value = '';
    }
  };

  const filterBtn = (id: PortfolioFilter, label: string) => (
    <button
      key={id}
      type="button"
      onClick={() => setPortfolioFilter(id)}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        portfolioFilter === id
          ? 'bg-vendorsoluce-green text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <WorkspacePageShell
      title={t('quickTools.riskCalculator.viraPageTitle', 'Complete VIRA intake')}
      description={t(
        'quickTools.riskCalculator.viraPageDescription',
        'Finish the five-factor weighted intake for each vendor so VIRA scores align with Vendor Risk Radar and portfolio reports. Select a vendor missing intake, or choose “New vendor” to score before adding to the portfolio.'
      )}
      stats={[
        { label: 'Portfolio vendors', value: vendors.length, hint: 'In radar + workspace' },
        { label: 'Missing VIRA intake', value: missingCount, hint: 'Incomplete sliders' },
        { label: 'Intake complete', value: completeCount, hint: 'Ready for reports' },
        {
          label: 'Program',
          value: 'VIRA',
          hint: 'Vendor Intelligence & Risk Assessment',
        },
      ]}
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Library className="h-4 w-4 opacity-70" aria-hidden />
                {t('quickTools.riskCalculator.docsHubTitle', 'Documentation hub')}
              </CardTitle>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t(
                  'quickTools.riskCalculator.docsHubHint',
                  'Central access to product guides, APIs, and assessment workflows.'
                )}
              </p>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 text-sm">
              <div className="space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {t('quickTools.riskCalculator.docsSectionPrograms', 'Programs & tools')}
                </div>
                <ul className="space-y-1.5">
                  {[
                    { to: MR.VENDOR_RISK_REPORTS, label: t('quickTools.riskCalculator.linkViraReports', 'Risk reports') },
                    { to: MR.PROGRAM_VIRA_DUE_DILIGENCE, label: t('quickTools.riskCalculator.linkViraProgram', 'VIRA program workflow') },
                    { to: MR.VENDOR_RISK_RADAR, label: t('quickTools.riskCalculator.linkRadar', 'Vendor Risk Radar') },
                    { to: MR.VENDOR_ASSESSMENTS, label: t('navigation.vendorAssessments', 'Vendor Security Assessments') },
                    { to: MR.SUPPLY_CHAIN_ASSESSMENT, label: t('navigation.supplyChainAssessment', 'Supply Chain Assessment') },
                    { to: MR.NIST_CHECKLIST, label: t('navigation.nistChecklist', 'NIST checklist') },
                  ].map((item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className="flex items-center gap-2 rounded-md px-1 py-0.5 text-vendorsoluce-navy hover:bg-emerald-50 hover:underline dark:text-vendorsoluce-light-green dark:hover:bg-emerald-950/40"
                      >
                        <FileText className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2 border-t border-gray-200 pt-3 dark:border-gray-700">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {t('quickTools.riskCalculator.docsSectionTechnical', 'Technical & resources')}
                </div>
                <ul className="space-y-1.5">
                  {[
                    { to: MR.API_DOCS, label: t('quickTools.riskCalculator.docsApi', 'API documentation') },
                    { to: MR.INTEGRATION_GUIDES, label: t('quickTools.riskCalculator.docsIntegration', 'Integration guides') },
                    { to: MR.HOW_IT_WORKS, label: t('quickTools.riskCalculator.docsHowItWorks', 'How it works') },
                    { to: MR.TEMPLATES, label: t('navigation.templates', 'Templates') },
                    { to: MR.VENDOR_REQUIREMENTS, label: t('navigation.vendorRequirements', 'Vendor requirements') },
                  ].map((item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className="flex items-center gap-2 rounded-md px-1 py-0.5 text-gray-700 hover:bg-gray-100 hover:underline dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        <BookOpen className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileDown className="h-4 w-4 opacity-70" aria-hidden />
                {t('quickTools.riskCalculator.complianceExportsTitle', 'Compliance exports')}
              </CardTitle>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t(
                  'quickTools.riskCalculator.complianceExportsHint',
                  'Autogenerated intake records and portfolio index for evidence packs, audits, and vendor files. Prefer Markdown for version control; PDF for sharing.'
                )}
              </p>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {intakeExportPayload
                  ? t('quickTools.riskCalculator.exportReady', 'Ready for: {{name}}', {
                      name: intakeExportPayload.vendorName,
                    })
                  : t(
                      'quickTools.riskCalculator.exportNeedContext',
                      'Select a portfolio vendor or run Calculate on a new vendor to generate a single-vendor record.'
                    )}
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full justify-center"
                  disabled={!intakeExportPayload}
                  onClick={downloadVendorMarkdown}
                >
                  {t('quickTools.riskCalculator.downloadIntakeMd', 'VIRA intake record (.md)')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full justify-center"
                  disabled={!intakeExportPayload || pdfBusy}
                  onClick={() => void downloadVendorPdf()}
                >
                  {pdfBusy
                    ? t('common.loading', 'Loading…')
                    : t('quickTools.riskCalculator.downloadIntakePdf', 'VIRA intake summary (PDF)')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full justify-center"
                  disabled={vendors.length === 0}
                  onClick={downloadPortfolioIndex}
                >
                  {t('quickTools.riskCalculator.downloadPortfolioIndex', 'Portfolio compliance index (.md)')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Filter className="h-4 w-4 opacity-70" aria-hidden />
                {t('quickTools.riskCalculator.portfolioTitle', 'Vendor portfolio')}
              </CardTitle>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t(
                  'quickTools.riskCalculator.portfolioHint',
                  'Prioritize vendors without full VIRA intake, then save scores from the calculator.'
                )}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {filterBtn('missing', t('quickTools.riskCalculator.filterMissing', 'Missing intake'))}
                {filterBtn('complete', t('quickTools.riskCalculator.filterComplete', 'Complete'))}
                {filterBtn('all', t('quickTools.riskCalculator.filterAll', 'All'))}
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <Button
                type="button"
                variant={selectedVendorId === null ? 'primary' : 'outline'}
                size="sm"
                className="w-full justify-center"
                onClick={() => setSelectedVendorId(null)}
              >
                {t('quickTools.riskCalculator.newVendor', 'New vendor (not in portfolio yet)')}
              </Button>

              {portfolioLoading ? (
                <p className="py-6 text-center text-sm text-gray-500">{t('common.loading', 'Loading…')}</p>
              ) : vendors.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center dark:border-gray-600">
                  <AlertCircle className="mx-auto mb-2 h-8 w-8 text-amber-500" aria-hidden />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t(
                      'quickTools.riskCalculator.emptyPortfolio',
                      'No vendors yet. Import below, add from Vendor Risk Radar, or use “New vendor” to run intake first.'
                    )}
                  </p>
                  <Link
                    to={MR.VENDOR_RISK_RADAR}
                    className="mt-2 inline-block text-sm font-medium text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline"
                  >
                    {t('quickTools.riskCalculator.openRadar', 'Open Vendor Risk Radar')}
                  </Link>
                </div>
              ) : (
                <ul className="max-h-[min(420px,50vh)] space-y-1 overflow-y-auto pr-1" role="list">
                  {filteredVendors.map((v: VendorRadar) => {
                    const complete = hasCompleteIntakeFactors(v.intakeFactors);
                    const active = selectedVendorId === v.id;
                    return (
                      <li key={v.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedVendorId(v.id)}
                          className={`flex w-full items-start gap-2 rounded-lg border px-2 py-2 text-left text-sm transition-colors ${
                            active
                              ? 'border-vendorsoluce-green bg-vendorsoluce-green/10 dark:bg-vendorsoluce-green/20'
                              : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/80'
                          }`}
                        >
                          <span className="mt-0.5 shrink-0">
                            {complete ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-amber-500" aria-hidden />
                            )}
                          </span>
                          <span className="min-w-0 flex-1 break-words leading-snug">
                            <span className="font-medium text-gray-900 dark:text-white">{v.name}</span>
                            <span className="mt-0.5 block text-[11px] text-gray-500 dark:text-gray-400">
                              {complete
                                ? t('quickTools.riskCalculator.statusComplete', 'VIRA intake complete')
                                : t('quickTools.riskCalculator.statusMissing', 'VIRA intake needed')}
                              {typeof v.residualRisk === 'number' ? ` · ${v.residualRisk}` : ''}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-600 dark:bg-gray-800/50">
            <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
              {t('quickTools.riskCalculator.bulkTitle', 'Bulk add (same format as Vendor Risk Radar)')}
            </p>
            <p className="mb-3 text-xs text-gray-600 dark:text-gray-400">
              {t(
                'quickTools.riskCalculator.bulkHint',
                'Upload CSV or portfolio JSON. Scoring matches Radar import. Download the template from the Radar page.'
              )}{' '}
              <Link to={MR.VENDOR_RISK_RADAR} className="text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline">
                {t('quickTools.riskCalculator.bulkRadarLink', 'Open Vendor Risk Radar')}
              </Link>
            </p>
            <input
              ref={bulkInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.json"
              className="hidden"
              onChange={handleBulkFile}
              aria-label={t('quickTools.riskCalculator.bulkAria', 'Import vendor list')}
            />
            <Button
              type="button"
              variant="outline"
              disabled={bulkBusy}
              onClick={() => bulkInputRef.current?.click()}
              className="inline-flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {bulkBusy
                ? t('common.loading', 'Loading…')
                : t('quickTools.riskCalculator.bulkButton', 'Import CSV / portfolio')}
            </Button>
            {bulkMessage && (
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300" role="status">
                {bulkMessage}
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-8">
          <InherentRiskCalculator
            key={selectedVendorId ?? '__new__'}
            compact={false}
            showResultInline={true}
            initialVendorName={selectedVendor?.name ?? ''}
            initialIntakeFactors={selectedVendor?.intakeFactors}
            onSave={isAuthenticated ? handleSave : undefined}
            onIntakeComputed={setLastComputed}
            saveActionLabel={
              selectedVendorId
                ? t('quickTools.riskCalculator.saveViraToVendor', 'Save VIRA intake to vendor')
                : undefined
            }
          />
          {!isAuthenticated && (
            <p className="mt-4 text-center text-sm text-amber-800 dark:text-amber-200">
              {t('quickTools.riskCalculator.signInToSave', 'Sign in to save intake to your portfolio.')}
            </p>
          )}
        </div>
      </div>
    </WorkspacePageShell>
  );
};

export default VendorRiskCalculator;
