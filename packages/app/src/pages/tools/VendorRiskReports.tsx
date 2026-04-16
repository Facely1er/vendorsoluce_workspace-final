import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Radar as RadarIcon, Settings2, Radar } from 'lucide-react';
import { MR } from 'shared/constants/routes';
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
import PortfolioViraRegister from './PortfolioViraRegister';

const VendorRiskReports: React.FC = () => {
  const workflowHelpRef = useRef<HTMLDivElement>(null);
  const [showReport, setShowReport] = useState(false);
  const { vendors, stats, importVendors, exportVendors, exportPortfolioExchange } = useVendorPortfolio();

  const generatedAt = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const scrollToImportTips = () => {
    workflowHelpRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleImport = async (fileText: string) => {
    await importVendors(fileText);
  };

  const headerStats =
    vendors.length > 0
      ? [
          { label: 'Total vendors', value: stats.total },
          { label: 'Avg inherent', value: `${stats.avgInherentRisk}/100` },
          { label: 'Critical (90+)', value: stats.criticalRisk },
          {
            label: 'PII / PHI vendors',
            value: stats.sensitiveData,
            hint: `${generatedAt} · ${stats.total} vendor${stats.total !== 1 ? 's' : ''}`,
          },
        ]
      : [
          { label: 'Total vendors', value: stats.total },
          { label: 'Average inherent', value: `${stats.avgInherentRisk}/100` },
          { label: 'High risk', value: stats.highRisk },
          { label: 'Generated', value: generatedAt },
        ];

  return (
    <WorkspacePage
      title="Risk reports"
      subtitle="VIRA portfolio register, inherent-risk summary, and C-SCRM deliverables from your current vendor list."
      descriptionExtra={
        <p className="min-w-0 max-w-none text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-base">
          Use Reports &amp; exports for summary and C-SCRM dossier; use the register for sortable VIRA posture and
          recommendations.
        </p>
      }
      stats={headerStats}
    >
      <WorkspacePageBody>
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <Link to={MR.VENDOR_RISK_RADAR} className="inline-flex">
              <Button variant="outline" className="flex items-center gap-2">
                <RadarIcon className="h-4 w-4" aria-hidden />
                Radar workspace
              </Button>
            </Link>
            <div className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FileText className="h-4 w-4" aria-hidden />
              Risk reports
            </div>
            <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
              {vendors.length} vendor{vendors.length === 1 ? '' : 's'} in portfolio
            </span>
          </div>
        </div>

        {vendors.length === 0 ? (
          <div className="rounded-2xl border border-gray-200/70 bg-white p-12 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Radar className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
            <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">No vendors in your portfolio yet</h2>
            <p className="mx-auto mb-6 max-w-md text-sm text-gray-500 dark:text-gray-400">
              Add vendors in the Vendor Risk Radar to start generating VIRA risk reports and portfolio outputs.
            </p>
            <Link to={MR.VENDOR_RISK_RADAR}>
              <Button variant="primary">Go to Vendor Risk Radar</Button>
            </Link>
          </div>
        ) : (
          <>
            <RadarDeliverablesSection
              vendorsCount={vendors.length}
              onOpenSummaryReport={() => setShowReport(true)}
              onOpenPortfolioReport={() => openVendorPortfolioReportWithVendors(vendors)}
              onScrollToHelp={scrollToImportTips}
            />

            <div className="mb-6">
              <RadarVisualization vendors={vendors} />
            </div>

            <div className="mb-6 space-y-6">
              <PortfolioViraRegister vendors={vendors} stats={stats} />
            </div>

            <Card className="mb-6">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Settings2 className="h-4 w-4 text-gray-400" aria-hidden />
                      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Portfolio inputs</h2>
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
              <VendorInherentRiskReport vendors={vendors} stats={stats} onClose={() => setShowReport(false)} />
            )}
          </>
        )}
      </WorkspacePageBody>
    </WorkspacePage>
  );
};

export default VendorRiskReports;
