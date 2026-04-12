import React from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import type { IntegrationHealthStatus } from '../../types/workspace';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface DiagnosticsPanelProps {
  integrationHealth: IntegrationHealthStatus;
  dataQuality: {
    missing_inherent_risk: number;
    incomplete_assessments: number;
    orphaned_remediation_items: number;
  };
  coverageGaps: Array<{
    area: string;
    vendor_count: number;
    vendors: string[];
    missing_evidence_types: string[];
  }>;
  staleEvidence: Array<{
    evidence_id: string;
    vendor_name: string;
    days_since_update: number;
    evidence_type: string;
    recommendation: string;
  }>;
}

type HealthValue = 'healthy' | 'degraded' | 'down';

const HEALTH_ICON: Record<HealthValue, React.ReactNode> = {
  healthy: <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />,
  degraded: <AlertCircle className="h-5 w-5 text-orange-400" aria-hidden="true" />,
  down: <XCircle className="h-5 w-5 text-red-500" aria-hidden="true" />,
};

const HEALTH_LABEL_COLOR: Record<HealthValue, string> = {
  healthy: 'text-green-600 dark:text-green-400',
  degraded: 'text-orange-500 dark:text-orange-400',
  down: 'text-red-600 dark:text-red-400',
};

const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = ({
  integrationHealth,
  dataQuality,
  coverageGaps,
  staleEvidence,
}) => {
  const integrations: Array<{ key: keyof IntegrationHealthStatus; label: string }> = [
    { key: 'vendor_portal', label: 'Vendor Portal' },
    { key: 'questionnaire_tool', label: 'Questionnaire Tool' },
    { key: 'risk_calculator_api', label: 'Risk Calculator API' },
  ];

  return (
    <div className="space-y-6">
      {/* Integration Health */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Health</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3" role="list" aria-label="Integration health status">
            {integrations.map(({ key, label }) => {
              const status = integrationHealth[key] as HealthValue;
              return (
                <li key={key} className="flex items-center gap-3">
                  {HEALTH_ICON[status]}
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{label}</span>
                  <span
                    className={`text-xs font-medium capitalize ${HEALTH_LABEL_COLOR[status]}`}
                    role="status"
                    aria-label={`${label}: ${status}`}
                  >
                    {status}
                  </span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      {/* Data Quality */}
      <Card>
        <CardHeader>
          <CardTitle>Data Quality</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: 'Missing Inherent Risk',
                value: dataQuality.missing_inherent_risk,
                warn: dataQuality.missing_inherent_risk > 0,
              },
              {
                label: 'Incomplete Assessments',
                value: dataQuality.incomplete_assessments,
                warn: dataQuality.incomplete_assessments > 0,
              },
              {
                label: 'Orphaned Remediations',
                value: dataQuality.orphaned_remediation_items,
                warn: dataQuality.orphaned_remediation_items > 0,
              },
            ].map(({ label, value, warn }) => (
              <div
                key={label}
                className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3 text-center"
              >
                <p
                  className={`text-2xl font-bold ${warn ? 'text-orange-500 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}
                >
                  {value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Coverage Gaps */}
      {coverageGaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Coverage Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2" role="list" aria-label="Coverage gaps">
              {coverageGaps.map((gap) => (
                <li
                  key={gap.area}
                  className="flex items-start gap-2 p-2 rounded bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800"
                >
                  <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{gap.area}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {gap.vendor_count} vendor{gap.vendor_count !== 1 ? 's' : ''} · Missing:{' '}
                      {gap.missing_evidence_types.join(', ')}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Stale Evidence */}
      {staleEvidence.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Stale Evidence</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2" role="list" aria-label="Stale evidence items">
              {staleEvidence.map((item) => (
                <li
                  key={item.evidence_id}
                  className="flex items-start gap-2 p-2 rounded bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800"
                >
                  <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.vendor_name} — {item.evidence_type}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.days_since_update}d since update · {item.recommendation}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DiagnosticsPanel;
