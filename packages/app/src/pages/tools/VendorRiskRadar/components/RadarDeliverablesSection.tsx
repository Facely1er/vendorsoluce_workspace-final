import React from 'react';
import { FileText, FileBarChart, Printer, ExternalLink } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';

interface RadarDeliverablesSectionProps {
  vendorsCount: number;
  onOpenSummaryReport: () => void;
  onOpenPortfolioReport: () => void;
  onScrollToHelp: () => void;
}

const RadarDeliverablesSection: React.FC<RadarDeliverablesSectionProps> = ({
  vendorsCount,
  onOpenSummaryReport,
  onOpenPortfolioReport,
  onScrollToHelp,
}) => {
  const hasVendors = vendorsCount > 0;

  return (
    <section
      id="vendor-risk-radar-deliverables"
      className="mb-6 scroll-mt-24"
      aria-labelledby="radar-deliverables-heading"
    >
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 overflow-hidden shadow-sm">
        <div className="px-4 py-3 sm:px-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/50">
          <h2 id="radar-deliverables-heading" className="text-base font-semibold text-gray-900 dark:text-white">
            Reports &amp; exports
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            Two outputs from the same vendor list — pick the one that matches your audience. Both support print-to-PDF from the browser.
          </p>
        </div>
        <div className="p-4 sm:p-5 grid gap-4 md:grid-cols-2">
          <div className="flex flex-col rounded-xl border-2 border-vendorsoluce-green/35 dark:border-vendorsoluce-light-green/30 bg-vendorsoluce-pale-green/30 dark:bg-vendorsoluce-green/10 p-4 sm:p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="rounded-lg bg-vendorsoluce-green text-white p-2.5 shrink-0">
                <FileText className="w-5 h-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-vendorsoluce-green dark:text-vendorsoluce-light-green">
                  In-app · all vendors
                </p>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                  Inherent risk summary
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                  Structured assessment view with executive summary, top vendors, and rollups. Stays in this app — ideal for working sessions and quick leadership readouts.
                </p>
              </div>
            </div>
            <div className="mt-auto flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
              <Button
                variant="primary"
                size="lg"
                disabled={!hasVendors}
                onClick={onOpenSummaryReport}
                className="w-full sm:w-auto justify-center"
                title={
                  hasVendors
                    ? 'Opens the full-screen inherent risk summary for your current list'
                    : 'Add vendors first'
                }
              >
                Open summary report
              </Button>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 sm:ml-1">
                <Printer className="w-3.5 h-3.5 shrink-0" aria-hidden />
                Then use <strong className="font-medium text-gray-700 dark:text-gray-300">Print / Save PDF</strong> in the report header
              </span>
            </div>
          </div>

          <div className="flex flex-col rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-900/30 p-4 sm:p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="rounded-lg bg-gray-800 dark:bg-gray-700 text-white p-2.5 shrink-0">
                <FileBarChart className="w-5 h-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  New tab · portfolio document
                </p>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                  Portfolio C-SCRM report
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                  Full HTML dossier (NIST-aligned sections, register, dependencies). Opens in a new tab so you can archive, print, or share the file.
                </p>
              </div>
            </div>
            <div className="mt-auto flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
              <Button
                variant="outline"
                size="lg"
                disabled={!hasVendors}
                onClick={onOpenPortfolioReport}
                className="w-full sm:w-auto justify-center border-2 border-gray-800 dark:border-gray-500 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                title={
                  hasVendors
                    ? 'Opens the portfolio HTML report in a new browser tab'
                    : 'Add vendors first'
                }
              >
                <ExternalLink className="w-4 h-4" aria-hidden />
                Open portfolio report
              </Button>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Syncs from your list above · use the tab&apos;s print dialog for PDF
              </span>
            </div>
          </div>
        </div>
        {!hasVendors && (
          <p className="px-4 sm:px-5 pb-4 text-sm text-amber-800 dark:text-amber-200/90 bg-amber-50/80 dark:bg-amber-900/20 border-t border-amber-200/60 dark:border-amber-800/40 pt-3 -mt-1">
            Add or import at least one vendor to enable both report actions.
          </p>
        )}
        <div className="px-4 sm:px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40">
          <button
            type="button"
            onClick={onScrollToHelp}
            className="text-sm font-medium text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline"
          >
            CSV, JSON, and template tips
          </button>
          <span className="text-gray-400 dark:text-gray-500 mx-2">·</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Catalog, wizard, and bulk export live in the toolbar above.
          </span>
        </div>
      </div>
    </section>
  );
};

export default RadarDeliverablesSection;
