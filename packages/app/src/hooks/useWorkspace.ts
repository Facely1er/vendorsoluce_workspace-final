import { useMemo } from 'react';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useRemediationStore } from '../stores/remediationStore';
import { useEvidenceStore } from '../stores/evidenceStore';
import { useTaskStore } from '../stores/taskStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useGovernanceStore } from '../stores/governanceStore';
import { useAuditStore } from '../stores/auditStore';
import { useVendorStore } from '../stores/vendorStore';
import { isSupabaseEnabled } from '../lib/supabase';
import type {
  WorkspaceHealthStatus,
  IntegrationHealthStatus,
} from '../types/workspace';

export function useWorkspace() {
  const {
    phases,
    blockers,
    workspaceVendors,
    updatePhaseStatus,
    updatePhaseHealth,
    addPhaseComment,
    setPhaseBlocker,
    resolvePhaseBlocker,
    addBlocker,
    resolveBlocker,
    upsertWorkspaceVendor,
    getWorkspaceProgress,
    getHealthStatus,
    getBlockedPhases,
    getVendorCoverage,
  } = useWorkspaceStore();

  const {
    items: remediationItems,
    addRemediationItem,
    updateRemediationItem,
    resolveRemediationItem,
    getAgingDaysAvg,
    getOverdueItems: getOverdueRemediationItems,
  } = useRemediationStore();

  const {
    items: evidenceItems,
    addEvidenceItem,
    updateEvidenceItem,
    approveEvidenceItem,
    getExpiringItems,
    getExpirySummary,
  } = useEvidenceStore();

  const {
    tasks,
    addTask,
    updateTask,
    completeTask,
    getTaskSummary,
  } = useTaskStore();

  const {
    notifications,
    unreadCount,
    evaluateRules,
  } = useNotificationStore();

  const {
    controls,
    gaps,
    milestones,
    getFrameworkCompletion,
    getGapSummary,
    updateControlStatus,
    addGap,
    resolveGap,
    updateMilestoneStatus,
  } = useGovernanceStore();

  const { getRecentEntries } = useAuditStore();
  const { vendors: dbVendors, getRiskDistribution } = useVendorStore();

  const overallProgress = getWorkspaceProgress();
  const vendorCoverage = getVendorCoverage();
  const riskDist = getRiskDistribution();
  const agingDaysAvg = getAgingDaysAvg();
  const expirySummary = getExpirySummary();
  const expiringItems = getExpiringItems(30);
  const taskSummary = getTaskSummary();
  const frameworkCompletion = getFrameworkCompletion();
  const gapSummary = getGapSummary();
  const recentEntries = getRecentEntries(20);
  const overallHealth: WorkspaceHealthStatus = getHealthStatus();

  const assessmentsInFlight = workspaceVendors.filter(
    (v) => v.assessment_status === 'in_progress'
  ).length;
  const assessmentsOverdue = workspaceVendors.filter(
    (v) => v.assessment_status === 'overdue'
  ).length;

  const healthIndicators = useMemo(
    () => ({
      overall_health: overallHealth,
      portfolio_risk_radar: {
        critical: riskDist.critical,
        high: riskDist.high,
        medium: riskDist.medium,
        low: riskDist.low,
        not_assessed: riskDist.not_assessed,
      },
      remediation_aging_days_avg: agingDaysAvg,
      evidence_expiring_in_30_days: expiringItems.length,
      assessments_in_flight: assessmentsInFlight,
      assessments_overdue: assessmentsOverdue,
      vendor_coverage_percent: vendorCoverage.percent,
    }),
    [
      overallHealth,
      riskDist,
      agingDaysAvg,
      expiringItems.length,
      assessmentsInFlight,
      assessmentsOverdue,
      vendorCoverage.percent,
    ]
  );

  const integrationHealth: IntegrationHealthStatus = useMemo(
    () => ({
      vendor_portal: isSupabaseEnabled() ? 'healthy' : 'degraded',
      questionnaire_tool: isSupabaseEnabled() ? 'healthy' : 'degraded',
      risk_calculator_api: 'healthy',
    }),
    []
  );

  const diagnostics = useMemo(() => {
    const missingInherentRisk = workspaceVendors.filter(
      (v) => v.inherent_risk_score == null
    ).length;
    const incompleteAssessments = workspaceVendors.filter(
      (v) =>
        v.assessment_status === 'in_progress' || v.assessment_status === 'not_started'
    ).length;
    const orphanedRemediation = remediationItems.filter((item) =>
      !workspaceVendors.some((v) => v.id === item.vendor_id)
    ).length;

    return {
      coverage_gaps: [] as Array<{
        area: string;
        vendor_count: number;
        vendors: string[];
        missing_evidence_types: string[];
      }>,
      stale_evidence: [] as Array<{
        evidence_id: string;
        vendor_name: string;
        days_since_update: number;
        evidence_type: string;
        recommendation: string;
      }>,
      integration_health: integrationHealth,
      data_quality: {
        missing_inherent_risk: missingInherentRisk,
        incomplete_assessments: incompleteAssessments,
        orphaned_remediation_items: orphanedRemediation,
      },
    };
  }, [workspaceVendors, remediationItems, integrationHealth]);

  const metadata = useMemo(
    () => ({
      name: 'VIRA™ Vendor Risk Workspace',
      version: '1.0',
      framework: 'NIST SP 800-161',
      secondary_frameworks: ['CMMC 2.0', 'ISO 27001'],
      progress_percent: overallProgress.percent,
      health_status: overallHealth,
      mode: (dbVendors.length > 0 ? 'live' : 'demo') as 'live' | 'demo',
      last_updated: new Date().toISOString(),
    }),
    [overallProgress.percent, overallHealth, dbVendors.length]
  );

  return {
    // metadata
    metadata,
    overallProgress,
    // phases
    phases,
    updatePhaseStatus,
    updatePhaseHealth,
    addPhaseComment,
    setPhaseBlocker,
    resolvePhaseBlocker,
    // vendors
    workspaceVendors,
    upsertWorkspaceVendor,
    // health
    healthIndicators,
    // blockers
    blockers,
    addBlocker,
    resolveBlocker,
    // remediation
    remediationItems,
    addRemediationItem,
    updateRemediationItem,
    resolveRemediationItem,
    agingDaysAvg,
    getOverdueRemediationItems,
    // evidence
    evidenceItems,
    addEvidenceItem,
    updateEvidenceItem,
    approveEvidenceItem,
    expirySummary,
    expiringItems,
    // tasks
    tasks,
    addTask,
    updateTask,
    completeTask,
    taskSummary,
    // governance
    controls,
    gaps,
    milestones,
    frameworkCompletion,
    gapSummary,
    updateControlStatus,
    addGap,
    resolveGap,
    updateMilestoneStatus,
    // notifications
    notifications,
    unreadCount,
    evaluateRules,
    // audit
    auditLog: recentEntries,
    // diagnostics
    diagnostics,
    // re-export for completeness
    getBlockedPhases,
  };
}
