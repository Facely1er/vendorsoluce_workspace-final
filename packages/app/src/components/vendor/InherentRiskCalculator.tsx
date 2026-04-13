/**
 * Shared VIRA weighted intake: same 0–100 inherent-risk scale and tiers as Vendor Risk Radar
 * (`riskCalculations` + `getRiskLevel`). Slider values persist in notes meta for rescoring.
 */

import React, { useState, useMemo } from 'react';
import { Send, Lock, Briefcase, Shield, Building, Server, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import RiskBadge from '../ui/RiskBadge';
import { useTranslation } from 'react-i18next';
import { logger } from '../../utils/logger';
import {
  INTAKE_SLIDER_WEIGHTS,
  inherentRiskFromIntakeSliders,
  calculateResidualRisk,
  getRiskLevel,
} from '../../utils/riskCalculations';
import { mergeRadarMetaIntoNotes } from '../../utils/vendorRadarMeta';

const FACTOR_IDS = [
  { id: 'data_access' as const, weight: INTAKE_SLIDER_WEIGHTS.data_access, Icon: Lock },
  { id: 'criticality' as const, weight: INTAKE_SLIDER_WEIGHTS.criticality, Icon: Briefcase },
  { id: 'security_controls' as const, weight: INTAKE_SLIDER_WEIGHTS.security_controls, Icon: Shield },
  { id: 'compliance' as const, weight: INTAKE_SLIDER_WEIGHTS.compliance, Icon: Building },
  { id: 'system_exposure' as const, weight: INTAKE_SLIDER_WEIGHTS.system_exposure, Icon: Server },
] as const;

function buildDefaultFactorValues(): Record<string, number> {
  return FACTOR_IDS.reduce((acc, { id }) => ({ ...acc, [id]: 1 }), {} as Record<string, number>);
}

function normalizeInitialIntakeFactors(partial?: Record<string, number>): Record<string, number> {
  const base = buildDefaultFactorValues();
  if (!partial) return base;
  for (const { id } of FACTOR_IDS) {
    const v = partial[id];
    if (typeof v === 'number' && v >= 1 && v <= 5) base[id] = Math.round(v);
  }
  return base;
}

export type RiskLevel = ReturnType<typeof getRiskLevel>;

export interface InherentRiskResult {
  vendorName: string;
  /** Residual risk 0–100 stored in `vs_vendors.risk_score` (matches Radar; higher = more risk). */
  riskScore: number;
  riskLevel: RiskLevel;
  notes: string;
  intakeFactors: Record<string, number>;
}

export interface InherentRiskCalculatorProps {
  /** After calculation, called with result. When provided, "Add to radar" is shown and uses this to create vendor. */
  onSave?: (result: InherentRiskResult) => Promise<void>;
  /** Compact layout for modal/side panel */
  compact?: boolean;
  /** Hide the result card until calculated (e.g. in modal) */
  showResultInline?: boolean;
  /** Optional initial vendor name */
  initialVendorName?: string;
  /** Pre-fill VIRA weighted sliders (1–5 per factor) when continuing intake for an existing vendor */
  initialIntakeFactors?: Record<string, number>;
  /** Override primary save button label (e.g. "Save VIRA intake") */
  saveActionLabel?: string;
  /** Fires after a successful calculation so parents can export compliance artifacts. */
  onIntakeComputed?: (payload: {
    vendorName: string;
    riskScore: number;
    intakeFactors: Record<string, number>;
  }) => void;
}

const InherentRiskCalculator: React.FC<InherentRiskCalculatorProps> = ({
  onSave,
  compact = false,
  showResultInline = true,
  initialVendorName = '',
  initialIntakeFactors,
  saveActionLabel,
  onIntakeComputed,
}) => {
  const { t } = useTranslation();
  const [vendorName, setVendorName] = useState(initialVendorName);
  const [factorValues, setFactorValues] = useState<Record<string, number>>(() =>
    normalizeInitialIntakeFactors(initialIntakeFactors)
  );
  const [calculationComplete, setCalculationComplete] = useState(false);
  const [riskScore, setRiskScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const factorKey: Record<string, string> = {
    data_access: 'dataAccess',
    criticality: 'criticality',
    security_controls: 'securityControls',
    compliance: 'compliance',
    system_exposure: 'systemExposure',
  };

  const riskFactors = useMemo(
    () =>
      FACTOR_IDS.map(({ id, weight, Icon }) => {
        const key = factorKey[id] || id;
        return {
          id,
          weight,
          value: factorValues[id] ?? 1,
          name: t(`quickTools.riskCalculator.factors.${key}.name`),
          description: t(`quickTools.riskCalculator.factors.${key}.description`),
          icon: <Icon className="h-5 w-5 text-vendorsoluce-navy" />,
        };
      }),
    [factorValues, t]
  );

  const handleFactorChange = (id: string, value: number) => {
    setFactorValues((prev) => ({ ...prev, [id]: value }));
  };

  const calculateRiskScore = () => {
    if (!vendorName.trim()) {
      setError(t('quickTools.riskCalculator.vendorNameRequired', 'Please enter a vendor name'));
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const factors = FACTOR_IDS.reduce(
        (acc, { id }) => ({ ...acc, [id]: factorValues[id] ?? 1 }),
        {} as Record<string, number>
      );
      const inherent = inherentRiskFromIntakeSliders(factors);
      const residual = calculateResidualRisk({ intakeFactors: factors }, inherent);
      setRiskScore(residual);
      setCalculationComplete(true);
      onIntakeComputed?.({
        vendorName: vendorName.trim(),
        riskScore: residual,
        intakeFactors: factors,
      });
    } catch (err) {
      logger.error('Error calculating risk:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate risk score');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToRadar = async () => {
    if (!onSave || !calculationComplete) return;
    setIsSaving(true);
    setError(null);
    try {
      const factors = FACTOR_IDS.reduce(
        (acc, { id }) => ({ ...acc, [id]: factorValues[id] ?? 1 }),
        {} as Record<string, number>
      );
      const level = getRiskLevel(riskScore);
      const summary = riskFactors.map((f) => `${f.name} ${f.value}/5`).join('; ');
      const body = `VIRA weighted intake — ${summary}`;
      const notes = mergeRadarMetaIntoNotes(body, { intakeFactors: factors });
      await onSave({
        vendorName: vendorName.trim(),
        riskScore,
        riskLevel: level,
        notes,
        intakeFactors: factors,
      });
      setCalculationComplete(false);
      setVendorName('');
      setFactorValues(FACTOR_IDS.reduce((acc, { id }) => ({ ...acc, [id]: 1 }), {}));
    } catch (err) {
      logger.error('Error saving vendor:', err);
      setError(err instanceof Error ? err.message : 'Failed to add vendor');
    } finally {
      setIsSaving(false);
    }
  };

  const getRiskDescription = (level: RiskLevel): string => {
    const key = level.toLowerCase() as 'low' | 'medium' | 'high' | 'critical';
    return t(`quickTools.riskCalculator.results.${key}`);
  };

  const level = calculationComplete ? getRiskLevel(riskScore) : null;

  const formContent = (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md flex items-start text-sm">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      <div className={compact ? 'mb-4' : 'mb-6'}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('quickTools.riskCalculator.vendorName')}
        </label>
        <input
          type="text"
          value={vendorName}
          onChange={(e) => setVendorName(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder={t('quickTools.riskCalculator.vendorNamePlaceholder')}
        />
      </div>
      <h3 className="font-medium text-lg mb-4 text-gray-900 dark:text-white">
        {t('quickTools.riskCalculator.riskFactors')}
      </h3>
      <div className={compact ? 'space-y-3' : 'space-y-6'}>
        {riskFactors.map((factor) => (
          <div
            key={factor.id}
            className={`pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 ${compact ? 'pb-3' : ''}`}
          >
            <div className="flex items-start mb-2">
              <div className="mr-3 mt-1">{factor.icon}</div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{factor.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{factor.description}</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>{t('quickTools.riskCalculator.lowRisk')}</span>
                <span>{t('quickTools.riskCalculator.highRisk')}</span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`flex-1 py-2 rounded-md transition ${
                      factor.value === value
                        ? 'bg-vendorsoluce-navy text-white dark:bg-vendorsoluce-blue'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => handleFactorChange(factor.id, value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Button
        variant="primary"
        className="w-full mt-4"
        disabled={!vendorName.trim() || isLoading}
        onClick={calculateRiskScore}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
        ) : (
          <Send className="h-4 w-4 mr-2" />
        )}
        {t('quickTools.riskCalculator.calculate')}
      </Button>
    </>
  );

  const resultContent = calculationComplete && showResultInline && (
    <Card className={compact ? 'mt-4' : 'mt-6'}>
      <CardHeader>
        <CardTitle>{t('quickTools.riskCalculator.resultsTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {t('quickTools.riskCalculator.vendorRiskScore')}
          </p>
          <div className="text-5xl font-bold mb-2 text-gray-900 dark:text-white">{riskScore}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {t(
              'quickTools.riskCalculator.riskScoreScale',
              '0–100 risk score (higher = more exposure). Same tiers as Vendor Risk Radar.'
            )}
          </p>
          {level && <RiskBadge level={level} />}
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md mb-4">
          <h4 className="font-medium mb-2 text-gray-900 dark:text-white">
            {t('quickTools.riskCalculator.recommendation')}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {level ? getRiskDescription(level) : ''}
          </p>
        </div>
        {onSave && (
          <Button
            variant="primary"
            className="w-full"
            disabled={isSaving}
            onClick={handleAddToRadar}
          >
            {isSaving
              ? t('common.saving', 'Saving...')
              : saveActionLabel ?? t('vendorRisk.dashboard.inherentRisk.addToRadar', 'Add to radar')}
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (compact) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('vendorRisk.dashboard.inherentRisk.title', 'Score vendor (inherent risk)')}</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('vendorRisk.dashboard.inherentRisk.subtitle', 'Weighted inherent-risk factors. Result appears in the radar.')}
            </p>
          </CardHeader>
          <CardContent>{formContent}</CardContent>
        </Card>
        {resultContent}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('quickTools.riskCalculator.inputTitle')}</CardTitle>
          </CardHeader>
          <CardContent>{formContent}</CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1">
        {resultContent ||
          (!calculationComplete && (
            <Card>
              <CardHeader>
                <CardTitle>{t('quickTools.riskCalculator.howToUse')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                  <p>{t('quickTools.riskCalculator.step1')}</p>
                  <p>{t('quickTools.riskCalculator.step2')}</p>
                  <p>{t('quickTools.riskCalculator.step3')}</p>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('quickTools.riskCalculator.disclaimer')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default InherentRiskCalculator;
