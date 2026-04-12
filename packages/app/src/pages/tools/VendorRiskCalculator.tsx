/**
 * Standalone Vendor Risk Calculator. Same VIRA weighted-intake + tier scale as Vendor Risk Radar.
 * Bulk CSV/portfolio import uses the same scoring as Radar when signed in.
 */

import React, { useRef, useState } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useVendors } from '../../hooks/useVendors';
import { logger } from '../../utils/logger';
import InherentRiskCalculator, { type InherentRiskResult } from '../../components/vendor/InherentRiskCalculator';
import { vendorRiskFieldsFromResidual } from '../../utils/riskCalculations';
import { parseCSV } from '../../utils/csvImportExport';
import { tryParseRadarPortfolioExchange } from '../../utils/vendorRadarPortfolioExchange';
import { mergeRadarMetaIntoNotes } from '../../utils/vendorRadarMeta';
import { Button } from '../../components/ui/Button';

const VendorRiskCalculator: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { createVendor } = useVendors();
  const bulkInputRef = useRef<HTMLInputElement>(null);
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  const handleSave = async (result: InherentRiskResult) => {
    if (!isAuthenticated) return;
    try {
      await createVendor({
        name: result.vendorName,
        ...vendorRiskFieldsFromResidual(result.riskScore),
        notes: result.notes,
      });
    } catch (err) {
      logger.error('Error saving vendor from calculator:', err);
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
      logger.error('Bulk import from calculator:', err);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-gray-700 dark:text-gray-300 hover:text-vendorsoluce-navy dark:hover:text-vendorsoluce-blue transition-colors mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('navigation.home')}
        </Link>
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          {t('quickTools.riskCalculator.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          {t('quickTools.riskCalculator.description')}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('quickTools.riskCalculator.alsoInDashboard', 'Also available from')}{' '}
          <Link to="/vendors" className="text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline">
            {t('navigation.vendorRiskAndManagement', 'Vendor Risk & Management')}
          </Link>{' '}
          {t('quickTools.riskCalculator.alsoInDashboardSuffix', 'dashboard.')}
        </p>

        <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50/80 dark:bg-gray-800/50 p-4">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            {t('quickTools.riskCalculator.bulkTitle', 'Bulk add (same format as Vendor Risk Radar)')}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            {t(
              'quickTools.riskCalculator.bulkHint',
              'Upload CSV or portfolio JSON. Scoring matches Radar import. Download the template from the Radar page.'
            )}{' '}
            <Link to="/vendor-risk-radar" className="text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline">
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

      <InherentRiskCalculator
        compact={false}
        showResultInline={true}
        onSave={isAuthenticated ? handleSave : undefined}
      />

      <div className="mt-6 text-center">
        <Link to="/vendors">
          <span className="text-sm text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline">
            {t('quickTools.riskCalculator.viewDashboard')}
          </span>
        </Link>
      </div>
    </div>
  );
};

export default VendorRiskCalculator;
