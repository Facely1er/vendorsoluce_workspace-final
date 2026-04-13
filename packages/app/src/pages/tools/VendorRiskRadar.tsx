import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, RefreshCw, AlertCircle, ArrowRight, X, Info, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { useVendorPortfolio } from './VendorRiskRadar/hooks/useVendorPortfolio';
import VendorDashboard from './VendorRiskRadar/components/VendorDashboard';
import VendorCatalog from './VendorRiskRadar/components/VendorCatalog';
import OnboardingWizard from './VendorRiskRadar/components/OnboardingWizard';
import ImportExport from './VendorRiskRadar/components/ImportExport';
import StatsOverview from './VendorRiskRadar/components/StatsOverview';
import RadarVisualization from './VendorRiskRadar/components/RadarVisualization';
import VendorInherentRiskReport from './VendorRiskRadar/components/VendorInherentRiskReport';
import type { VendorRadar, VendorBase } from '../../types/vendorRadar';
import { config } from '../../utils/config';
import WorkspacePage from '../../components/workspace/WorkspacePage';
import WorkspacePageBody from '../../components/workspace/WorkspacePageBody';
import WorkspaceEmptyState from '../../components/common/WorkspaceEmptyState';
import { WR } from 'shared/constants/routes';
import { Radar } from 'lucide-react';

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
        {/* Related flows: keep the radar focused; link out to reports + intake + assessments. */}
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
                to="/vendor-risk-reports"
                className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                  isActiveRoute('/vendor-risk-reports')
                    ? 'border-vendorsoluce-green text-vendorsoluce-green'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Reports
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
        )}
      </WorkspacePageBody>
    </WorkspacePage>
  );
};

export default VendorRiskRadar;
