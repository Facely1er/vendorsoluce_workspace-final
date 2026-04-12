import React, { useRef } from 'react';
import { Download, Upload, FileText } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { downloadCSVTemplate } from '../../../../utils/csvImportExport';

interface ImportExportProps {
  onImport: (fileText: string) => Promise<void>;
  onExport: () => void;
  /** Optional: download portable JSON (same format as static vendor-threat-radar page). */
  onExportPortfolio?: () => void;
  vendorsCount?: number;
}

const ImportExport: React.FC<ImportExportProps> = ({
  onImport,
  onExport,
  onExportPortfolio,
  vendorsCount = 0,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await onImport(text);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert(
        'Failed to import vendors. Use CSV (template) or a vendorsoluce-radar-portfolio JSON file from Export portfolio.'
      );
    }
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <label htmlFor="vendor-risk-radar-import-file" className="sr-only">
          Import vendors from CSV, Excel, or portable JSON portfolio
        </label>
        <input
          id="vendor-risk-radar-import-file"
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.json"
          onChange={handleImport}
          className="hidden"
          title="Spreadsheet (.csv, .xlsx) or portable JSON from Export portfolio"
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2"
          title="Upload a spreadsheet or a portfolio JSON file"
        >
          <Upload className="w-4 h-4" />
          Import
        </Button>
        <Button
          variant="outline"
          onClick={onExport}
          disabled={vendorsCount === 0}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
        {onExportPortfolio && (
          <Button
            variant="outline"
            onClick={onExportPortfolio}
            disabled={vendorsCount === 0}
            className="flex items-center gap-2"
            title="Portable JSON for the public Vendor Threat Radar page or backup"
          >
            <Download className="w-4 h-4" />
            Export portfolio
          </Button>
        )}
        <Button
          variant="outline"
          onClick={downloadCSVTemplate}
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Template
        </Button>
      </div>
      <details className="max-w-xl rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-1 text-sm dark:border-gray-600 dark:bg-gray-800/50">
        <summary className="cursor-pointer select-none font-semibold text-emerald-800 dark:text-emerald-400">
          Spreadsheet import tips
        </summary>
        <div className="mt-2 space-y-2 pb-2 text-gray-600 dark:text-gray-300">
          <p>
            <span className="font-medium text-gray-800 dark:text-gray-100">Easiest path:</span>{' '}
            use <span className="font-medium">Template</span>, add one row per vendor, then{' '}
            <span className="font-medium">Import</span>. The first row can be plain headers—we match
            common column titles automatically.
          </p>
          <ul className="list-disc space-y-1 pl-5 text-[13px] leading-relaxed">
            <li>
              <span className="font-medium text-gray-800 dark:text-gray-100">Name</span> — vendor or
              service name
            </li>
            <li>
              <span className="font-medium text-gray-800 dark:text-gray-100">Category</span> — how
              important they are (for example strategic vs. commodity)
            </li>
            <li>
              <span className="font-medium text-gray-800 dark:text-gray-100">Data types</span> —
              kinds of data they touch; separate several values with a semicolon
            </li>
            <li>
              <span className="font-medium text-gray-800 dark:text-gray-100">Sector, location,
              contact, notes</span> — optional context
            </li>
          </ul>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Risk score columns are optional—we fill them in when you run a scan if you leave them
            blank.
          </p>
          <details className="rounded-md border border-dashed border-gray-300 bg-white/60 px-2 py-1 dark:border-gray-500 dark:bg-gray-900/40">
            <summary className="cursor-pointer text-xs font-semibold text-gray-600 dark:text-gray-400">
              Exact column titles (power users)
            </summary>
            <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
              Headers can appear in any order: Name, Category, Data Types (semicolon-separated),
              Sector, Location, Contact, Notes, Service Type, Population Impacted, Inherent Risk,
              Residual Risk, Risk Level. Service type, population, and risk fields stay optional.
            </p>
          </details>
          {onExportPortfolio && (
            <p className="border-t border-gray-200 pt-2 text-xs text-gray-600 dark:border-gray-600 dark:text-gray-300">
              <span className="font-medium text-gray-800 dark:text-gray-100">Same list on the web
              radar?</span>{' '}
              Use <span className="font-medium">Export portfolio</span> /{' '}
              <span className="font-medium">Import</span> here to move the full list as one file. On
              vendorsoluce.com, <span className="font-medium">Continue in app</span> opens this page with
              import guidance.
            </p>
          )}
        </div>
      </details>
    </div>
  );
};

export default ImportExport;
