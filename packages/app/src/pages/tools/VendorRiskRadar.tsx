import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, RefreshCw, AlertCircle, ArrowRight, ExternalLink, X, Info, Check, Gauge, BookOpen } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import JourneyProgress from '../../components/journey/JourneyProgress';
import { useVendorPortfolio } from './VendorRiskRadar/hooks/useVendorPortfolio';
import VendorDashboard from './VendorRiskRadar/components/VendorDashboard';
import VendorCatalog from './VendorRiskRadar/components/VendorCatalog';
import OnboardingWizard from './VendorRiskRadar/components/OnboardingWizard';
import ImportExport from './VendorRiskRadar/components/ImportExport';
import StatsOverview from './VendorRiskRadar/components/StatsOverview';
import RadarVisualization from './VendorRiskRadar/components/RadarVisualization';
import VendorInherentRiskReport from './VendorRiskRadar/components/VendorInherentRiskReport';
import RadarWorkflowGuide from './VendorRiskRadar/components/RadarWorkflowGuide';
import RadarDeliverablesSection from './VendorRiskRadar/components/RadarDeliverablesSection';
import type { VendorRadar, VendorBase } from '../../types/vendorRadar';
import { openVendorPortfolioReportWithVendors } from '../../utils/vendorPortfolioReportSync';
import { config } from '../../utils/config';
import WorkspacePage from '../../components/workspace/WorkspacePage';
import WorkspacePageBody from '../../components/workspace/WorkspacePageBody';

const RADAR_IMPORT_HANDOFF_TS_KEY = 'vs_radar_import_handoff_ts';
const RADAR_IMPORT_HANDOFF_MAX_AGE_MS = 15_000;

type RadarPagePanel = 'analyze' | 'guide';

const VendorRiskRadar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const panel: RadarPagePanel = searchParams.get('panel') === 'guide' ? 'guide' : 'analyze';
  const workflowHelpRef = useRef<HTMLDivElement>(null);
  const importHandoffHandledRef = useRef(false);
  const [showWebsiteImportHandoff, setShowWebsiteImportHandoff] = useState(false);
  const {
    vendors,
    stats,
    addVendor,
    updateVendor: _updateVendor,
    deleteVendor: _deleteVendor,
    importVendors,
    exportVendors,
    exportPortfolioExchange,
    scanVendors,
    loading,
    error
  } = useVendorPortfolio();

  const [selectedVendor, setSelectedVendor] = useState<VendorRadar | null>(null);
  const [showCatalog, setShowCatalog] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    riskLevel: 'all'
  });

  // Auto-scan every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      scanVendors();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [scanVendors]);

  // Static web radar → app: ?handoff=import (optionally with from=website) opens import guidance and cleans the URL.
  // Short-lived sessionStorage bridges React Strict Mode remounts (URL is stripped on first pass).
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const handoff = params.get('handoff');
    const fromUrl = handoff === 'import' || handoff === 'portfolio';
    const rawTs = sessionStorage.getItem(RADAR_IMPORT_HANDOFF_TS_KEY);
    const ts = rawTs ? parseInt(rawTs, 10) : NaN;
    const recovering =
      !fromUrl &&
      Number.isFinite(ts) &&
      Date.now() - ts < RADAR_IMPORT_HANDOFF_MAX_AGE_MS;
    if (!fromUrl && !recovering) return;
    if (importHandoffHandledRef.current) return;
    importHandoffHandledRef.current = true;

    if (fromUrl) {
      sessionStorage.setItem(RADAR_IMPORT_HANDOFF_TS_KEY, String(Date.now()));
      params.delete('handoff');
      params.delete('from');
      params.delete('ref');
      params.delete('panel');
      const q = params.toString();
      navigate(`${location.pathname}${q ? `?${q}` : ''}`, { replace: true });
    } else {
      sessionStorage.removeItem(RADAR_IMPORT_HANDOFF_TS_KEY);
    }

    setShowWebsiteImportHandoff(true);
    const raf = window.requestAnimationFrame(() => {
      document.getElementById('vendor-risk-radar-toolbar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => window.cancelAnimationFrame(raf);
  }, [location.search, location.pathname, navigate]);

  // Deep links to deliverables (e.g. workflow catalog) need the Analyze tab where that section mounts.
  useEffect(() => {
    if (location.hash !== '#vendor-risk-radar-deliverables') return;
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        p.delete('panel');
        return p;
      },
      { replace: true }
    );
    const t = window.setTimeout(() => {
      document.getElementById('vendor-risk-radar-deliverables')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    return () => window.clearTimeout(t);
  }, [location.hash, setSearchParams]);

  const handleAddFromCatalog = async (vendor: Partial<VendorBase>) => {
    try {
      await addVendor(vendor);
      setShowCatalog(false);
    } catch (err) {
      console.error('Failed to add vendor:', err);
    }
  };

  const handleWizardComplete = async (wizardVendors: VendorBase[]) => {
    try {
      for (const vendor of wizardVendors) {
        await addVendor(vendor);
      }
      setShowWizard(false);
    } catch (err) {
      console.error('Failed to add vendors from wizard:', err);
    }
  };

  const handleImport = async (csvText: string) => {
    try {
      await importVendors(csvText);
      sessionStorage.removeItem(RADAR_IMPORT_HANDOFF_TS_KEY);
      setShowWebsiteImportHandoff(false);
    } catch (err) {
      console.error('Import failed:', err);
      alert('Failed to import vendors. Please check the file format.');
    }
  };

  const triggerPortfolioFilePicker = () => {
    document.getElementById('vendor-risk-radar-import-file')?.click();
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const setPanel = (next: RadarPagePanel) => {
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        if (next === 'analyze') {
          p.delete('panel');
        } else {
          p.set('panel', 'guide');
        }
        return p;
      },
      { replace: true }
    );
  };

  const scrollToWorkflowHelp = () => {
    setPanel('guide');
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        workflowHelpRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  };

  return (
    <WorkspacePage
      title="Vendor Risk Radar"
      subtitle="Portfolio visibility, inherent risk signals, and import-to-report continuity in one workspace surface."
    >
      <WorkspacePageBody>
        {/* Related flows: sidebar covers portfolio; keep shortcuts to intake + assessments only. */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex flex-wrap gap-4 sm:gap-6" aria-label="Vendor Risk related pages">
              <Link
                to="/vendor-risk-radar"
                className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                  isActiveRoute('/vendor-risk-radar')
                    ? 'border-vendorsoluce-green text-vendorsoluce-green'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Radar
              </Link>
              <Link
                to="/vendor-onboarding"
                className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                  isActiveRoute('/vendor-onboarding')
                    ? 'border-vendorsoluce-green text-vendorsoluce-green'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Intake
              </Link>
              <Link
                to="/vendor-assessments"
                className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                  isActiveRoute('/vendor-assessments')
                    ? 'border-vendorsoluce-green text-vendorsoluce-green'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Assessments
              </Link>
            </nav>
          </div>
        </div>

        {/* Error Display — always visible regardless of panel */}
        {error && (
          <Card className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-6" role="tablist" aria-label="Vendor Risk Radar page sections">
          <div className="flex flex-wrap gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/40 p-1">
            <button
              type="button"
              role="tab"
              id="radar-panel-analyze"
              aria-selected={panel === 'analyze'}
              aria-controls="radar-panel-analyze-panel"
              className={`inline-flex flex-1 min-w-[10rem] items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors sm:flex-none ${
                panel === 'analyze'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white'
                  : 'text-gray-600 hover:bg-white/60 dark:text-gray-400 dark:hover:bg-gray-800/60'
              }`}
              onClick={() => setPanel('analyze')}
            >
              <Gauge className="h-4 w-4 shrink-0" aria-hidden />
              Analyze workspace
            </button>
            <button
              type="button"
              role="tab"
              id="radar-panel-guide"
              aria-selected={panel === 'guide'}
              aria-controls="radar-panel-guide-panel"
              className={`inline-flex flex-1 min-w-[10rem] items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors sm:flex-none ${
                panel === 'guide'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white'
                  : 'text-gray-600 hover:bg-white/60 dark:text-gray-400 dark:hover:bg-gray-800/60'
              }`}
              onClick={() => setPanel('guide')}
            >
              <BookOpen className="h-4 w-4 shrink-0" aria-hidden />
              Journey &amp; guidance
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {panel === 'analyze'
              ? 'Scan, filter, charts, and the vendor table. Switch to the other tab for staged journey content and import help.'
              : 'Stage progress, workflow context, and learning links—kept separate from the analysis tools.'}
          </p>
        </div>

        {panel === 'analyze' && (
        <div id="radar-panel-analyze-panel" role="tabpanel" aria-labelledby="radar-panel-analyze">

        {showWebsiteImportHandoff && (
          <div
            className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50/95 p-4 shadow-sm dark:border-emerald-800/80 dark:bg-emerald-950/40"
            role="status"
            aria-live="polite"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-100">
                  Continue from the free web radar
                </p>
                <p className="mt-1 text-sm leading-relaxed text-emerald-900/90 dark:text-emerald-100/85">
                  On the public Vendor Threat Radar you exported a{' '}
                  <span className="font-medium">portfolio JSON</span>. Choose{' '}
                  <span className="font-medium">Import</span> below (or use the button) and select that
                  file—the same <span className="font-medium">vendorsoluce-radar-portfolio</span> format
                  loads here. Subscribe when you are ready for saved vendors, dashboards, and
                  assessments.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    className="bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                    onClick={triggerPortfolioFilePicker}
                  >
                    Choose file to import
                  </Button>
                  <Link
                    to="/pricing?from=website"
                    className="inline-flex items-center justify-center rounded-lg border border-emerald-700/30 bg-white px-3 py-2 text-sm font-medium text-emerald-900 shadow-sm hover:bg-emerald-50 dark:border-emerald-600/50 dark:bg-emerald-950/60 dark:text-emerald-100 dark:hover:bg-emerald-900/50"
                  >
                    View plans
                  </Link>
                </div>
              </div>
              <button
                type="button"
                className="self-end rounded-md p-1.5 text-emerald-800/70 hover:bg-emerald-100/80 hover:text-emerald-950 dark:text-emerald-200/80 dark:hover:bg-emerald-900/50 dark:hover:text-emerald-50 sm:self-start"
                aria-label="Dismiss"
                onClick={() => {
                  sessionStorage.removeItem(RADAR_IMPORT_HANDOFF_TS_KEY);
                  setShowWebsiteImportHandoff(false);
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Initialization Status */}
        {loading && (
          <div className="mb-4 text-center text-gray-600 dark:text-gray-400">
            INITIALIZING TPRM SYSTEM...
          </div>
        )}

        {/* Toolbar */}
        <div id="vendor-risk-radar-toolbar" className="mb-6 space-y-3 scroll-mt-24">
          <div className="flex flex-wrap gap-3 items-center">
            <Button
              variant="primary"
              onClick={scanVendors}
              disabled={loading || vendors.length === 0}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Scan Vendors
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowCatalog(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              Add Vendor
            </Button>
            <ImportExport
              onImport={handleImport}
              onExport={exportVendors}
              onExportPortfolio={exportPortfolioExchange}
              vendorsCount={vendors.length}
            />
            <div className="flex items-center gap-2 ml-auto">
              <div className="flex items-center gap-1">
                <Info className="h-3.5 w-3.5 text-gray-400 shrink-0" aria-hidden title="Filter vendors" />
                <select 
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                  aria-label="Filter by category"
                >
                  <option value="all">All Categories</option>
                  <option value="critical">Critical</option>
                  <option value="strategic">Strategic</option>
                  <option value="tactical">Tactical</option>
                  <option value="commodity">Commodity</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <Info className="h-3.5 w-3.5 text-gray-400 shrink-0" aria-hidden title="Filter by risk" />
                <select 
                  value={filters.riskLevel}
                  onChange={(e) => setFilters({ ...filters, riskLevel: e.target.value })}
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                  aria-label="Filter by risk level"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="critical">Critical Risk (90+)</option>
                  <option value="high">High Risk (70+)</option>
                  <option value="medium">Medium Risk (40+)</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center pt-1 border-t border-dashed border-gray-200 dark:border-gray-700">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-1">More tools</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCatalog(true)}
              className="text-gray-700 dark:text-gray-300"
            >
              Catalog
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowWizard(true)}
              className="text-gray-700 dark:text-gray-300"
            >
              Intake wizard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={scrollToWorkflowHelp}
              className="text-gray-700 dark:text-gray-300"
              aria-controls="vendor-risk-radar-workflow"
            >
              Import &amp; export tips
            </Button>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <StatsOverview stats={stats} />

        {/* Radar Visualization */}
        <div id="vendor-risk-radar-visualization" className="mb-6 scroll-mt-24">
          <RadarVisualization vendors={vendors} />
        </div>

        {/* Vendor Dashboard */}
        <div id="vendor-risk-radar-table" className="scroll-mt-24">
          <VendorDashboard
            vendors={vendors}
            filters={filters}
            onFilterChange={setFilters}
            onVendorSelect={setSelectedVendor}
          />
        </div>

        <RadarDeliverablesSection
          vendorsCount={vendors.length}
          onOpenSummaryReport={() => setShowReport(true)}
          onOpenPortfolioReport={() => openVendorPortfolioReportWithVendors(vendors)}
          onScrollToHelp={scrollToWorkflowHelp}
        />

        {/* Stage 1 Complete - Continue to Stage 2 */}
        {vendors.length > 0 && (
          <Card className="mb-6 border-vendorsoluce-green/30 bg-vendorsoluce-pale-green dark:bg-vendorsoluce-green/10">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-vendorsoluce-green flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" aria-hidden />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Stage 1 Complete: You've Discovered Your Exposure
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-10">
                    You know which vendors pose the greatest risk. Now define vendor-specific requirements based on their risk level.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/vendor-requirements">
                    <Button variant="primary" className="flex items-center gap-2">
                      Continue to Stage 2: Vendor Requirements
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        </div>
        )}

        {panel === 'guide' && (
        <div id="radar-panel-guide-panel" role="tabpanel" aria-labelledby="radar-panel-guide" className="space-y-6">

        <JourneyProgress
          currentStage={1}
          stage1Complete={vendors.length > 0}
          showNavigation={true}
        />

        <RadarWorkflowGuide onBeforeJump={() => setPanel('analyze')} />

        {/* Insights & Guidance Section */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">Insights &amp; guidance</h2>
            <Info className="h-4 w-4 text-gray-400 shrink-0" aria-hidden title="Actionable insights and guidance" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
              <CardContent className="p-5">
                <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  EO 14028 signal:
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Vendors that provide software and cannot produce an SBOM are flagged and prioritized for procurement follow-up. This demo shows signal detection; full SBOM ingestion & component risk scoring is a Professional feature.
                </p>
              </CardContent>
            </Card>
            <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
              <CardContent className="p-5">
                <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  What you get in 3 minutes:
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Identify the vendors that can break execution, see the SBOM gaps, and export a defensible narrative for leadership (PDF locked in demo).
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div
          ref={workflowHelpRef}
          id="vendor-risk-radar-workflow"
          className="scroll-mt-24"
        >
          <Card className="border-vendorsoluce-green/25 dark:border-vendorsoluce-green/30">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Import, CSV template, and JSON exchange
              </h2>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-3 list-disc list-inside">
                <li>
                  Use <strong className="text-gray-900 dark:text-white">Template</strong> then{' '}
                  <strong className="text-gray-900 dark:text-white">Import</strong> in the <strong className="text-gray-900 dark:text-white">Analyze workspace</strong> tab toolbar for CSV. The same
                  control accepts <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">.json</code>{' '}
                  portfolio files (website or app).
                </li>
                <li>
                  <strong className="text-gray-900 dark:text-white">Export CSV</strong> is a flat vendor list;{' '}
                  <strong className="text-gray-900 dark:text-white">Export portfolio</strong> is the portable JSON used
                  with the static Vendor Threat Radar page.
                </li>
                <li>
                  On the <strong className="text-gray-900 dark:text-white">Analyze workspace</strong> tab, the{' '}
                  <strong className="text-gray-900 dark:text-white">Reports &amp; exports</strong> section is where you open the inherent risk summary and the full portfolio HTML report.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Cross-Project Links */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <span className="text-gray-500 dark:text-gray-400">Also try:</span>
              <Link to="/demo" className="text-vendorsoluce-green hover:text-vendorsoluce-dark-green font-medium flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                Interactive Demo
              </Link>
              <Link to="/trial" className="text-vendorsoluce-green hover:text-vendorsoluce-dark-green font-medium flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                Free Trial
              </Link>
              <a 
                href="https://www.vendorsoluce.com/demo.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-vendorsoluce-green hover:text-vendorsoluce-dark-green font-medium flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Website Demo
              </a>
              <a 
                href={`${String(config.app.websiteUrl).replace(/\/$/, '')}/radar/vendor-threat-radar.html`}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-vendorsoluce-green hover:text-vendorsoluce-dark-green font-medium flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                HTML Radar Version
              </a>
            </div>
          </CardContent>
        </Card>

        </div>
        )}

        {/* Vendor Detail Modal (simplified - can be expanded) */}
        {selectedVendor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedVendor.name}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>{selectedVendor.sector}</span>
                      <span>•</span>
                      <span>{selectedVendor.location}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedVendor(null)}
                  >
                    ×
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Risk Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Inherent Risk</div>
                        <div className="text-2xl font-bold">{selectedVendor.inherentRisk}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Residual Risk</div>
                        <div className="text-2xl font-bold">{selectedVendor.residualRisk}</div>
                      </div>
                    </div>
                  </div>

                  {selectedVendor.dataTypes && selectedVendor.dataTypes.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Data Types</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedVendor.dataTypes.map((dt, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm"
                          >
                            {dt}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedVendor.sbomProfile && (
                    <div>
                      <h3 className="font-semibold mb-2">SBOM Profile</h3>
                      <div className="space-y-1 text-sm">
                        <div>Provides Software: {selectedVendor.sbomProfile.providesSoftware ? 'Yes' : 'No'}</div>
                        <div>SBOM Available: {selectedVendor.sbomProfile.sbomAvailable ? 'Yes' : 'No'}</div>
                        {selectedVendor.sbomProfile.sbomFormat && (
                          <div>Format: {selectedVendor.sbomProfile.sbomFormat}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedVendor.notes && (
                    <div>
                      <h3 className="font-semibold mb-2">Notes</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedVendor.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modals */}
        {showCatalog && (
          <VendorCatalog
            onClose={() => setShowCatalog(false)}
            onAddVendor={handleAddFromCatalog}
          />
        )}
        {showWizard && (
          <OnboardingWizard
            onClose={() => setShowWizard(false)}
            onComplete={handleWizardComplete}
          />
        )}
        {showReport && (
          <VendorInherentRiskReport
            vendors={vendors}
            stats={stats}
            onClose={() => setShowReport(false)}
          />
        )}
      </WorkspacePageBody>
    </WorkspacePage>
  );
};

export default VendorRiskRadar;
