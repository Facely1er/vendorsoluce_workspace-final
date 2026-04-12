import React from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import type {
  NistScrm10Control,
  GovernanceGap,
  RoadmapMilestone,
  NistScrm10ControlId,
  NistScrm10ControlStatus,
} from '../../types/workspace';
import { SUPPLIER_CRITICALITY_MATRIX } from '../../catalog/nistScrm800161Controls';
import { CheckCircle, Clock, Circle, AlertTriangle, Flag } from 'lucide-react';
import { ProgressBarFill } from '../ui/ProgressBarFill';

interface GovernancePanelProps {
  controls: NistScrm10Control[];
  gaps: GovernanceGap[];
  milestones: RoadmapMilestone[];
  frameworkCompletion: {
    total: number;
    complete: number;
    in_progress: number;
    not_started: number;
    percent: number;
  };
  gapSummary: {
    critical_gaps: number;
    high_gaps: number;
    medium_gaps: number;
    low_gaps: number;
  };
  onUpdateControlStatus: (id: NistScrm10ControlId, status: NistScrm10ControlStatus) => void;
  onResolveGap: (control: NistScrm10ControlId) => void;
  onUpdateMilestoneStatus: (name: string, status: RoadmapMilestone['status']) => void;
}

const CONTROL_STATUS_ICON: Record<NistScrm10ControlStatus, React.ReactNode> = {
  complete: <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />,
  in_progress: <Clock className="h-4 w-4 text-yellow-500" aria-hidden="true" />,
  not_started: <Circle className="h-4 w-4 text-gray-400" aria-hidden="true" />,
};

const CONTROL_STATUS_BADGE: Record<NistScrm10ControlStatus, string> = {
  complete: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  not_started: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

const GAP_SEVERITY_COLORS: Record<string, string> = {
  critical: 'border-l-red-600 bg-red-50 dark:bg-red-900/10',
  high: 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10',
  medium: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10',
  low: 'border-l-blue-400 bg-blue-50 dark:bg-blue-900/10',
};

const MILESTONE_COLORS: Record<string, string> = {
  on_track: 'text-green-600 dark:text-green-400',
  at_risk: 'text-yellow-600 dark:text-yellow-400',
  planned: 'text-gray-500 dark:text-gray-400',
  complete: 'text-green-700 dark:text-green-300',
  delayed: 'text-red-600 dark:text-red-400',
};

const GovernancePanel: React.FC<GovernancePanelProps> = ({
  controls,
  gaps,
  milestones,
  frameworkCompletion,
  gapSummary,
  onResolveGap,
}) => {
  return (
    <div className="space-y-6">
      {/* Framework Completion */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>NIST SP 800-161 C-SCRM Framework</CardTitle>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {frameworkCompletion.percent}% complete
            </span>
          </div>
          <ProgressBarFill
            className="mt-2"
            percent={frameworkCompletion.percent}
            fillClassName="fill-vendorsoluce-green"
            role="progressbar"
            aria-valuenow={frameworkCompletion.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Framework completion: ${frameworkCompletion.percent}%`}
          />
          <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>✅ {frameworkCompletion.complete} complete</span>
            <span>🔄 {frameworkCompletion.in_progress} in progress</span>
            <span>⏳ {frameworkCompletion.not_started} not started</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table" aria-label="NIST C-SCRM controls">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Control</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phase</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {controls.map((control) => (
                  <tr key={control.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {control.id}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{control.title}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{control.phase}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${CONTROL_STATUS_BADGE[control.status]}`}
                      >
                        {CONTROL_STATUS_ICON[control.status]}
                        {control.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                      {control.recommended_action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Gap Analyzer */}
      {gaps.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Gap Analyzer</CardTitle>
              <div className="flex gap-2 text-xs">
                {gapSummary.critical_gaps > 0 && (
                  <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-2 py-0.5 rounded-full">
                    {gapSummary.critical_gaps} critical
                  </span>
                )}
                {gapSummary.high_gaps > 0 && (
                  <span className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 px-2 py-0.5 rounded-full">
                    {gapSummary.high_gaps} high
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {gaps.map((gap) => (
              <div
                key={gap.control}
                className={`p-3 rounded-md border-l-4 ${GAP_SEVERITY_COLORS[gap.severity] ?? ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-current opacity-70" aria-hidden="true" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {gap.control}: {gap.description}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{gap.recommended_action}</p>
                    {gap.assigned_to && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Assigned: {gap.assigned_to}</p>
                    )}
                  </div>
                  <button
                    onClick={() => onResolveGap(gap.control)}
                    className="text-xs text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 whitespace-nowrap underline focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
                    aria-label={`Resolve gap: ${gap.control}`}
                  >
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Supplier Criticality Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Supplier Criticality Matrix</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table" aria-label="Supplier criticality matrix">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tier</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assessment Frequency</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Evidence Requirements</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {SUPPLIER_CRITICALITY_MATRIX.map((row) => (
                  <tr key={row.tier} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 font-medium capitalize text-gray-900 dark:text-white">
                      {row.tier}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {row.assessment_frequency_days != null
                        ? `Every ${row.assessment_frequency_days} days`
                        : 'As needed'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {row.evidence_requirements.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Roadmap Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Roadmap Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3" role="list" aria-label="Roadmap milestones">
            {milestones.map((m) => (
              <li key={m.name} className="flex items-center gap-3">
                <Flag
                  className={`h-4 w-4 flex-shrink-0 ${MILESTONE_COLORS[m.status] ?? 'text-gray-400'}`}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{m.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Target: {m.target_date}</p>
                </div>
                <span
                  className={`text-xs font-medium ${MILESTONE_COLORS[m.status] ?? 'text-gray-400'}`}
                >
                  {m.status.replace('_', ' ')}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default GovernancePanel;
