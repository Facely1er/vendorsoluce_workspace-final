import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, RefreshCw, AlertCircle, ArrowRight, X, Info, Radar } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import LoadingState from '../../components/ui/LoadingState';
import { PageNavTabs } from '../../components/ui/PageNavTabs';
import { useVendorPortfolio } from './VendorRiskRadar/hooks/useVendorPortfolio';
import VendorDashboard from './VendorRiskRadar/components/VendorDashboard';
import VendorCatalog from './VendorRiskRadar/components/VendorCatalog';
import OnboardingWizard from './VendorRiskRadar/components/OnboardingWizard';
import ImportExport from './VendorRiskRadar/components/ImportExport';
import StatsOverview from './VendorRiskRadar/components/StatsOverview';
import RadarVisualization from './VendorRiskRadar/components/RadarVisualization';
import VendorInherentRiskReport from './VendorRiskRadar/components/VendorInherentRiskReport';
import type { VendorRadar, VendorBase } from '../../types/vendorRadar';
import WorkspacePage from '../../components/workspace/WorkspacePage';
import WorkspacePageBody from '../../components/workspace/WorkspacePageBody';
import WorkspaceEmptyState from '../../components/common/WorkspaceEmptyState';
import { WR } from 'shared/constants/routes';

const RADAR_IMPORT_HANDOFF_TS_KEY = 'vs_radar_import_handoff_ts';
const RADAR_IMPORT_HANDOFF_MAX_AGE_MS = 15_000;

const VendorRiskRadar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
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

  // Deep-link from dashboard: ?vendor=<id> pre-opens the vendor detail modal.
  useEffect(() => {
    const vendorId = searchParams.get('vendor');
    if (!vendorId || loading || vendors.length === 0) return;
    const match = vendors.find((v) => v.id === vendorId);
    if (match) {
      setSelectedVendor(match);
      setSearchParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          p.delete('vendor');
          return p;
        },
        { replace: true }
      );
    }
  }, [searchParams, vendors, loading, setSearchParams]);

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

  // `panel` and journey guidance moved to dedicated pages to reduce cognitive load.

  return (
    <WorkspacePage
      title="Vendor Risk Radar"
      subtitle="Portfolio visibility, inherent risk signals, and import-to-report continuity in one workspace surface."
    >
      <WorkspacePageBody>
        {!loading && vendors.length === 0 ? (
          <WorkspaceEmptyState
            icon={<Radar className="h-6 w-6" />}
            title="Risk radar needs vendor data"
            description="Add vendors to your portfolio first — the radar scores and visualizes them automatically."
            primaryAction={{ label: 'Add vendors', href: WR.VENDOR_GRAPH_IMPORT }}
          />
        ) : (
          <>
        {/* Related flows: keep the radar focused; link out to reports + intake + assessments. */}
        <PageNavTabs
          aria-label="Vendor Risk related pages"
          tabs={[
            { label: 'Radar', to: '/vendor-risk-radar' },
            { label: 'Reports', to: '/vendor-risk-reports' },
            { label: 'Intake', to: '/vendor-onboarding' },
            { label: 'Assessments', to: '/vendor-assessments' }
          ]}
        />

        {/* Error Display — always visible regardless of panel */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 shadow-sm dark:border-red-800 dark:bg-red-900/20">
            <div className="p-4">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          </div>
        )}

        <div id="radar-panel-analyze-panel">

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
                  loads here. Import to continue with your portfolio.
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
          <LoadingState message="Loading vendor portfolio…" className="mb-4" />
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
              className="flex items-center gap-2"
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
                <Info className="h-3.5 w-3.5 text-gray-400 shrink-0" aria-hidden />
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
                <Info className="h-3.5 w-3.5 text-gray-400 shrink-0" aria-hidden />
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
              onClick={() => navigate('/vendor-risk-reports#portfolio-inputs')}
              className="text-gray-700 dark:text-gray-300"
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

        {vendors.length > 0 && (
          <div className="mb-6">
            <Link to="/vendor-requirements">
              <Button variant="primary" className="flex items-center gap-2">
                Continue to requirements
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}

        {/* Vendor Detail Modal (simplified - can be expanded) */}
        {selectedVendor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="rounded-xl border border-gray-200/70 bg-white max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex flex-row items-start justify-between gap-2 p-4 pb-2">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{selectedVendor.name}</div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>{selectedVendor.sector}</span>
                    {selectedVendor.location && (
                      <>
                        <span aria-hidden>•</span>
                        <span>{selectedVendor.location}</span>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedVendor(null)}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="pt-0 px-4 pb-4">
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
              </div>
            </div>
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
        </div>
          </>
        )}
      </WorkspacePageBody>
    </WorkspacePage>
  );
};

export default VendorRiskRadar;
