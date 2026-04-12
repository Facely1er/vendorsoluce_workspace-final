/**
 * Modal that wraps InherentRiskCalculator for "Score & add vendor" from the dashboard.
 * Saves the calculated vendor to the backend so it appears in the radar.
 */

import React from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useVendors } from '../../hooks/useVendors';
import { useAppStore } from '../../stores/appStore';
import { logger } from '../../utils/logger';
import InherentRiskCalculator, { type InherentRiskResult } from './InherentRiskCalculator';
import { vendorRiskFieldsFromResidual } from '../../utils/riskCalculations';

interface ScoreVendorModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ScoreVendorModal: React.FC<ScoreVendorModalProps> = ({ onClose, onSuccess }) => {
  const { t } = useTranslation();
  const createVendor = useVendors().createVendor;
  const addNotification = useAppStore((state) => state.addNotification);

  const handleSave = async (result: InherentRiskResult) => {
    try {
      await createVendor({
        name: result.vendorName,
        ...vendorRiskFieldsFromResidual(result.riskScore),
        notes: result.notes,
      });
      addNotification({
        title: t('vendorRisk.dashboard.inherentRisk.addToRadarSuccess', 'Vendor added'),
        message: t('vendorRisk.dashboard.inherentRisk.addToRadarSuccessMessage', '{{name}} has been added and appears in the radar.', {
          name: result.vendorName,
        }),
        type: 'success',
      });
      onSuccess();
    } catch (err) {
      logger.error('ScoreVendorModal save error:', err);
      throw err;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="score-vendor-modal-title">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 id="score-vendor-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">
            {t('vendorRisk.dashboard.inherentRisk.scoreAndAddVendor', 'Score & add vendor')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
            aria-label={t('common.close', 'Close')}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4">
          <InherentRiskCalculator
            compact
            showResultInline
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  );
};

export default ScoreVendorModal;
