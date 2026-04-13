import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Radar as RadarIcon, Settings2 } from 'lucide-react';
import WorkspacePage from '../../components/workspace/WorkspacePage';
import WorkspacePageBody from '../../components/workspace/WorkspacePageBody';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { useVendorPortfolio } from './VendorRiskRadar/hooks/useVendorPortfolio';
import RadarDeliverablesSection from './VendorRiskRadar/components/RadarDeliverablesSection';
import VendorInherentRiskReport from './VendorRiskRadar/components/VendorInherentRiskReport';
import RadarVisualization from './VendorRiskRadar/components/RadarVisualization';
import ImportExport from './VendorRiskRadar/components/ImportExport';
import { openVendorPortfolioReportWithVendors } from '../../utils/vendorPortfolioReportSync';

const VendorRiskReports: React.FC = () => {
  const workflowHelpRef = useRef<HTMLDivElement>(null);
  const [showReport, setShowReport] = useState(false);
  const {
    vendors,
    stats,
    importVendors,
    exportVendors,
    exportPortfolioExchange,
  } = useVendorPortfolio();

  const scrollToImportTips = () => {
    workflowHelpRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleImport = async (fileText: string) => {
    await importVendors(fileText);
  };

  return (
    <WorkspacePage
      title="Vendor Risk Reports"
      subtitle="Generate leadership-ready outputs from your current vendor portfolio."
    >
      <WorkspacePageBody>
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/vendor-risk-radar" className="inline-flex">
              <Button variant="outline" className="flex items-center gap-2">
                <RadarIcon className="h-4 w-4" aria-hidden />
                Radar workspace
              </Button>
            </Link>
            <div className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FileText className="h-4 w-4" aria-hidden />
              Reports
            </div>
            <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
              {vendors.length} vendor{vendors.length === 1 ? '' : 's'} in portfolio
            </span>
          </div>
        </div>

        <RadarDeliverablesSection
          vendorsCount={vendors.length}
          onOpenSummaryReport={() => setShowReport(true)}
          onOpenPortfolioReport={() => openVendorPortfolioReportWithVendors(vendors)}
          onScrollToHelp={scrollToImportTips}
        />

        <div className="mb-6">
          <RadarVisualization vendors={vendors} />
        </div>

        <Card className="mb-6">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-gray-400" aria-hidden />
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Portfolio inputs
                  </h2>
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Import or export the vendor list used by the reports above.
                </p>
              </div>
            </div>
            <div ref={workflowHelpRef} className="mt-4">
              <ImportExport
                onImport={handleImport}
                onExport={exportVendors}
                onExportPortfolio={exportPortfolioExchange}
                vendorsCount={vendors.length}
              />
            </div>
          </CardContent>
        </Card>

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

export default VendorRiskReports;

