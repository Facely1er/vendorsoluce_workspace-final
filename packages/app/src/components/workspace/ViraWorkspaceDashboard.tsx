import React, { useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { useWorkspace } from '../../hooks/useWorkspace';
import WorkspaceHealthBadge from './WorkspaceHealthBadge';
import RemediationPanel from './RemediationPanel';
import EvidenceVaultPanel from './EvidenceVaultPanel';
import GovernancePanel from './GovernancePanel';
import DiagnosticsPanel from './DiagnosticsPanel';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  ChevronDown,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';
import type { PhaseHealth, PhaseStatus } from '../../types/workspace';

type TabKey = 'portfolio' | 'evidence' | 'governance' | 'tasks';

const PHASE_STATUS_BADGE: Record<PhaseStatus, string> = {
  not_started: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  pending: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  complete: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  blocked: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const PHASE_HEALTH_DOT: Record<PhaseHealth, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  not_started: 'bg-gray-400',
};

const TASK_PRIORITY_COLORS: Record<string, string> = {
  critical: 'text-red-600 dark:text-red-400',
  high: 'text-orange-500 dark:text-orange-400',
  medium: 'text-yellow-600 dark:text-yellow-400',
  low: 'text-gray-500 dark:text-gray-400',
};

const ViraWorkspaceDashboard: React.FC = () => {
  const {
    metadata,
    overallProgress,
    phases,
    blockers,
    healthIndicators,
    resolveBlocker,
    resolvePhaseBlocker,
    addPhaseComment,
    remediationItems,
    resolveRemediationItem,
    evidenceItems,
    expirySummary,
    approveEvidenceItem,
    controls,
    gaps,
    milestones,
    frameworkCompletion,
    gapSummary,
    updateControlStatus,
    resolveGap,
    updateMilestoneStatus,
    tasks,
    taskSummary,
    completeTask,
    notifications,
    diagnostics,
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<TabKey>('portfolio');
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});

  const togglePhase = (id: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddComment = (phaseId: string) => {
    const text = commentInput[phaseId]?.trim();
    if (!text) return;
    addPhaseComment(phaseId, { author: 'You', text, timestamp: new Date().toISOString() });
    setCommentInput((prev) => ({ ...prev, [phaseId]: '' }));
  };

  const openBlockers = blockers.filter((b) => b.status === 'open');

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'portfolio', label: 'Portfolio' },
    { key: 'evidence', label: 'Evidence & Assessments' },
    { key: 'governance', label: 'Governance' },
    { key: 'tasks', label: 'Tasks & Notifications' },
  ];

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Shield className="h-6 w-6 text-vendorsoluce-green flex-shrink-0" aria-hidden="true" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              VIRA™ Vendor Risk Assessment
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-vendorsoluce-green text-white">
              NIST SP 800-161
            </span>
            <WorkspaceHealthBadge status={healthIndicators.overall_health} />
            <span
              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                metadata.mode === 'live'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
              }`}
            >
              {metadata.mode === 'live' ? 'Live mode' : 'Demo mode'}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Vendor Portfolio |{' '}
            {healthIndicators.portfolio_risk_radar.critical +
              healthIndicators.portfolio_risk_radar.high +
              healthIndicators.portfolio_risk_radar.medium +
              healthIndicators.portfolio_risk_radar.low +
              healthIndicators.portfolio_risk_radar.not_assessed}{' '}
            active vendors
          </p>
        </div>
        {/* Progress indicator */}
        <div className="flex flex-col items-end gap-1 min-w-[160px]">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {overallProgress.percent}% complete ({overallProgress.completed}/{overallProgress.total} phases)
          </p>
          <div className="w-40 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-vendorsoluce-green rounded-full transition-all duration-500"
              style={{ width: `${overallProgress.percent}%` }}
              role="progressbar"
              aria-valuenow={overallProgress.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Overall progress: ${overallProgress.percent}%`}
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Portfolio Risk Radar */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Portfolio Risk Radar
            </p>
            <div className="space-y-1 text-sm">
              {[
                { label: 'Critical', value: healthIndicators.portfolio_risk_radar.critical, color: 'text-red-600 dark:text-red-400' },
                { label: 'High', value: healthIndicators.portfolio_risk_radar.high, color: 'text-orange-500 dark:text-orange-400' },
                { label: 'Medium', value: healthIndicators.portfolio_risk_radar.medium, color: 'text-yellow-600 dark:text-yellow-400' },
                { label: 'Low', value: healthIndicators.portfolio_risk_radar.low, color: 'text-blue-500 dark:text-blue-400' },
                { label: 'Not Assessed', value: healthIndicators.portfolio_risk_radar.not_assessed, color: 'text-gray-400 dark:text-gray-500' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{label}</span>
                  <span className={`font-semibold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Remediation Aging */}
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <Clock className="h-6 w-6 text-orange-400 mb-2" aria-hidden="true" />
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {healthIndicators.remediation_aging_days_avg}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Avg. Remediation Age (days)</p>
          </CardContent>
        </Card>

        {/* Evidence Expiring */}
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <AlertTriangle
              className={`h-6 w-6 mb-2 ${healthIndicators.evidence_expiring_in_30_days > 0 ? 'text-orange-400' : 'text-gray-300 dark:text-gray-600'}`}
              aria-hidden="true"
            />
            <p
              className={`text-3xl font-bold ${healthIndicators.evidence_expiring_in_30_days > 0 ? 'text-orange-500 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}
            >
              {healthIndicators.evidence_expiring_in_30_days}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Evidence Expiring (30d)</p>
          </CardContent>
        </Card>

        {/* Assessments */}
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <CheckCircle className="h-6 w-6 text-blue-400 mb-2" aria-hidden="true" />
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {healthIndicators.assessments_in_flight}
              <span className="text-base font-normal text-gray-500 dark:text-gray-400 ml-1">
                / {healthIndicators.assessments_overdue} overdue
              </span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Assessments In Flight</p>
          </CardContent>
        </Card>

        {/* Vendor Coverage */}
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <Users className="h-6 w-6 text-vendorsoluce-green mb-2" aria-hidden="true" />
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {healthIndicators.vendor_coverage_percent}%
            </p>
            <div className="w-full mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-vendorsoluce-green rounded-full"
                style={{ width: `${healthIndicators.vendor_coverage_percent}%` }}
                role="progressbar"
                aria-valuenow={healthIndicators.vendor_coverage_percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Vendor coverage: ${healthIndicators.vendor_coverage_percent}%`}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Vendor Coverage</p>
          </CardContent>
        </Card>
      </div>

      {/* Blockers Banner */}
      {openBlockers.length > 0 && (
        <div
          className="rounded-lg border border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20 p-4"
          role="alert"
          aria-label="Active blockers"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-orange-500" aria-hidden="true" />
            <span className="font-semibold text-orange-800 dark:text-orange-300">
              {openBlockers.length} Active Blocker{openBlockers.length !== 1 ? 's' : ''}
            </span>
          </div>
          <ul className="space-y-2">
            {openBlockers.map((b) => (
              <li key={b.id} className="flex items-start justify-between gap-4">
                <div className="text-sm text-orange-700 dark:text-orange-300">
                  <span className="font-medium">{b.affected_vendor}</span>: {b.description}
                  <span className="text-xs ml-2 text-orange-500 dark:text-orange-400">
                    (Expected resolution: {b.expected_resolution.slice(0, 10)})
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => resolveBlocker(b.id)}
                  aria-label={`Resolve blocker: ${b.description}`}
                >
                  Resolve
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 5-Phase Workflow Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Workflow</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ol className="divide-y divide-gray-100 dark:divide-gray-700" aria-label="Implementation phases">
            {phases.map((phase, index) => {
              const isExpanded = expandedPhases.has(phase.id);
              return (
                <li key={phase.id} className="p-4">
                  {/* Phase header */}
                  <div className="flex items-start gap-3">
                    {/* Step number */}
                    <div
                      className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        phase.status === 'complete'
                          ? 'bg-green-500 text-white'
                          : phase.status === 'blocked'
                          ? 'bg-red-500 text-white'
                          : phase.status === 'in_progress'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}
                      aria-hidden="true"
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Health dot */}
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${PHASE_HEALTH_DOT[phase.health]}`}
                          aria-hidden="true"
                        />
                        <span className="font-medium text-gray-900 dark:text-white">{phase.name}</span>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${PHASE_STATUS_BADGE[phase.status]}`}
                        >
                          {phase.status.replace('_', ' ')}
                        </span>
                        {phase.days_remaining != null && phase.status === 'in_progress' && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {phase.days_remaining}d remaining
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          {phase.duration_type === 'ongoing'
                            ? 'Ongoing'
                            : `${phase.duration_days}d`}
                        </span>
                        <span>{phase.activities_count} activities</span>
                        <span>{phase.deliverables_count} deliverables</span>
                        {phase.roles.length > 0 && (
                          <span>Roles: {phase.roles.join(', ')}</span>
                        )}
                      </div>
                      {/* Blocker info */}
                      {phase.status === 'blocked' && phase.dependencies.blocked_by && (
                        <div className="mt-2 flex items-start gap-2 p-2 rounded bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
                          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                          <span>{phase.dependencies.blocked_by.description}</span>
                          {phase.dependencies.can_override && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => resolvePhaseBlocker(phase.id)}
                              className="ml-auto text-xs whitespace-nowrap"
                              aria-label={`Override blocker for ${phase.name}`}
                            >
                              Override (GRC Lead / CISO)
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Expand toggle */}
                    <button
                      onClick={() => togglePhase(phase.id)}
                      className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-vendorsoluce-green rounded"
                      aria-expanded={isExpanded}
                      aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${phase.name} details`}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>

                  {/* Expanded section */}
                  {isExpanded && (
                    <div className="mt-3 ml-10 space-y-3">
                      {/* Comments */}
                      {phase.comments.length > 0 && (
                        <div className="space-y-1">
                          {phase.comments.map((c) => (
                            <div
                              key={c.id}
                              className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400"
                            >
                              <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
                              <span>
                                <span className="font-medium">{c.author}</span>: {c.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Add comment */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentInput[phase.id] ?? ''}
                          onChange={(e) =>
                            setCommentInput((prev) => ({ ...prev, [phase.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment(phase.id);
                          }}
                          placeholder="Add a comment..."
                          className="flex-1 text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-vendorsoluce-green"
                          aria-label={`Add comment to ${phase.name}`}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddComment(phase.id)}
                          aria-label="Submit comment"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>

      {/* Tab Panel */}
      <div>
        {/* Tab bar */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Workspace tabs" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                aria-controls={`tabpanel-${tab.key}`}
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap py-3 px-1 border-b-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-vendorsoluce-green ${
                  activeTab === tab.key
                    ? 'border-vendorsoluce-green text-vendorsoluce-green dark:text-vendorsoluce-green'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="mt-6">
          {activeTab === 'portfolio' && (
            <div id="tabpanel-portfolio" role="tabpanel" aria-label="Portfolio tab" className="space-y-6">
              {/* Risk Radar Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { label: 'Critical', value: healthIndicators.portfolio_risk_radar.critical, color: 'bg-red-500' },
                      { label: 'High', value: healthIndicators.portfolio_risk_radar.high, color: 'bg-orange-500' },
                      { label: 'Medium', value: healthIndicators.portfolio_risk_radar.medium, color: 'bg-yellow-500' },
                      { label: 'Low', value: healthIndicators.portfolio_risk_radar.low, color: 'bg-blue-400' },
                      { label: 'Not Assessed', value: healthIndicators.portfolio_risk_radar.not_assessed, color: 'bg-gray-400' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${color}`} aria-hidden="true" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {label}: <strong>{value}</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <RemediationPanel
                items={remediationItems}
                onResolve={(id) => resolveRemediationItem(id, new Date().toISOString().slice(0, 10))}
              />
            </div>
          )}

          {activeTab === 'evidence' && (
            <div id="tabpanel-evidence" role="tabpanel" aria-label="Evidence and Assessments tab">
              <EvidenceVaultPanel
                items={evidenceItems}
                expirySummary={expirySummary}
                onApprove={approveEvidenceItem}
              />
            </div>
          )}

          {activeTab === 'governance' && (
            <div id="tabpanel-governance" role="tabpanel" aria-label="Governance tab">
              <GovernancePanel
                controls={controls}
                gaps={gaps}
                milestones={milestones}
                frameworkCompletion={frameworkCompletion}
                gapSummary={gapSummary}
                onUpdateControlStatus={updateControlStatus}
                onResolveGap={resolveGap}
                onUpdateMilestoneStatus={updateMilestoneStatus}
              />
            </div>
          )}

          {activeTab === 'tasks' && (
            <div id="tabpanel-tasks" role="tabpanel" aria-label="Tasks and Notifications tab" className="space-y-6">
              {/* Task Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total', value: taskSummary.total },
                  { label: 'Open', value: taskSummary.open },
                  { label: 'In Progress', value: taskSummary.in_progress },
                  { label: 'Overdue', value: taskSummary.overdue },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Task List */}
              <Card>
                <CardHeader>
                  <CardTitle>Tasks</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <CheckCircle className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" aria-hidden="true" />
                      <p className="text-gray-500 dark:text-gray-400 font-medium">No tasks yet</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-100 dark:divide-gray-700" role="list" aria-label="Task list">
                      {[...tasks]
                        .sort((a, b) => {
                          const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
                          return (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
                        })
                        .map((task) => (
                          <li
                            key={task.id}
                            className={`p-4 flex items-center justify-between gap-4 ${task.is_overdue ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs font-semibold ${TASK_PRIORITY_COLORS[task.priority] ?? ''}`}
                                >
                                  {task.priority.toUpperCase()}
                                </span>
                                {task.is_overdue && (
                                  <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                                    OVERDUE
                                  </span>
                                )}
                              </div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {task.title}
                              </p>
                              {task.due_date && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Due: {task.due_date}
                                </p>
                              )}
                            </div>
                            {task.status !== 'done' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => completeTask(task.id)}
                                aria-label={`Complete task: ${task.title}`}
                              >
                                Complete
                              </Button>
                            )}
                          </li>
                        ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No notifications.
                    </p>
                  ) : (
                    <ul className="space-y-2" role="list" aria-label="Notifications">
                      {notifications.slice(0, 10).map((n) => (
                        <li
                          key={n.id}
                          className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                          <span>{n.content}</span>
                          <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                            {n.sent_at.slice(0, 10)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              {/* Diagnostics */}
              <DiagnosticsPanel
                integrationHealth={diagnostics.integration_health}
                dataQuality={diagnostics.data_quality}
                coverageGaps={diagnostics.coverage_gaps}
                staleEvidence={diagnostics.stale_evidence}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViraWorkspaceDashboard;
