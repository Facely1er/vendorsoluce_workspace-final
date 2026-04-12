// Severity levels used across the workspace
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

// Health / status enums
export type WorkspaceHealthStatus = 'healthy' | 'at_risk' | 'critical';
export type PhaseStatus = 'not_started' | 'pending' | 'in_progress' | 'complete' | 'blocked';
export type PhaseHealth = 'green' | 'yellow' | 'red' | 'not_started';
export type VendorTier = 'critical' | 'high' | 'medium' | 'low';
export type AssessmentStatus = 'not_started' | 'in_progress' | 'complete' | 'overdue';
export type DpaStatus = 'executed' | 'pending' | 'expired' | 'not_required';
export type EvidenceStatus = 'valid' | 'expiring_soon' | 'expired' | 'missing' | 'pending_review';
export type RemediationStatus = 'open' | 'in_progress' | 'resolved' | 'accepted';
export type TaskStatus = 'open' | 'in_progress' | 'done';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type NotificationTrigger = 'vendor_risk_threshold_crossed' | 'evidence_expiring' | 'assessment_overdue' | 'blocker_raised' | 'phase_complete';
export type NistScrm10ControlId = 'C-SCRM-1' | 'C-SCRM-2' | 'C-SCRM-3' | 'C-SCRM-4' | 'C-SCRM-5' | 'C-SCRM-6' | 'C-SCRM-7' | 'C-SCRM-8' | 'C-SCRM-9' | 'C-SCRM-10';
export type NistScrm10ControlStatus = 'not_started' | 'in_progress' | 'complete';

// Workspace metadata
export interface WorkspaceMetadata {
  name: string;
  version: string;
  framework: string;
  secondary_frameworks: string[];
  progress_percent: number;
  health_status: WorkspaceHealthStatus;
  mode: 'live' | 'demo';
  last_updated: string;
}

// Blocker
export interface WorkspaceBlocker {
  id: string;
  description: string;
  blocking_phase: string;
  affected_vendor: string;
  raised_by: string;
  raised_date: string;
  expected_resolution: string;
  status: 'open' | 'resolved';
}

// Phase dependency
export interface PhaseDependency {
  predecessor_phases: string[];
  predecessor_status_required?: PhaseStatus;
  blocked_by: {
    type: string;
    description: string;
    vendor?: string;
    raised_date: string;
    expected_resolution: string;
  } | null;
  can_override: boolean;
  override_roles?: string[];
}

// Phase deliverable
export interface PhaseDeliverable {
  name: string;
  status: 'not_started' | 'draft' | 'in_progress' | 'complete';
  completion_percent?: number;
  vendors_processed?: number;
  vendors_total?: number;
}

// Phase comment
export interface PhaseComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

// Workflow phase
export interface WorkflowPhase {
  id: string;
  name: string;
  status: PhaseStatus;
  health: PhaseHealth;
  duration_days: number;
  duration_type?: 'fixed' | 'ongoing';
  actual_days?: number;
  days_remaining?: number;
  activities_count: number;
  deliverables_count: number;
  roles: string[];
  dependencies: PhaseDependency;
  artifacts: {
    deliverables: PhaseDeliverable[];
    evidence: string[];
  };
  comments: PhaseComment[];
}

// Vendor evidence items
export interface VendorEvidenceItem {
  status: EvidenceStatus;
  expiry_date?: string;
  expected_date?: string;
  submitted_date?: string;
  completion_percent?: number;
}

// Workspace vendor (extended)
export interface WorkspaceVendor {
  id: string;
  name: string;
  tier: VendorTier;
  inherent_risk_score: number | null;
  residual_risk_score: number | null;
  assessment_status: AssessmentStatus;
  assessment_phase: string | null;
  blocker: string | null;
  dpa_status: DpaStatus;
  dpa_expiry: string | null;
  last_assessment_date: string | null;
  next_assessment_due: string | null;
  evidence: Record<string, VendorEvidenceItem>;
  risk_register_entries: Array<{
    risk: string;
    severity: SeverityLevel;
    mitigation: string;
    residual: SeverityLevel;
  }>;
  owner: string | null;
}

// Remediation item
export interface RemediationItem {
  id: string;
  vendor_id: string;
  vendor_name: string;
  finding: string;
  severity: SeverityLevel;
  status: RemediationStatus;
  raised_date: string;
  target_completion: string;
  completed_date?: string;
  owner: string | null;
  escalated: boolean;
  escalated_to: string | null;
}

// Evidence vault item
export interface EvidenceVaultItem {
  id: string;
  name: string;
  type: string;
  vendor_id: string;
  phase_id: string;
  uploaded_by: string;
  uploaded_date: string;
  expiry_date: string | null;
  expiry_status: EvidenceStatus;
  days_until_expiry: number | null;
  version: string;
  approval_status: 'pending_review' | 'approved' | 'rejected';
  approved_by: string | null;
  url?: string;
}

// Task
export interface WorkspaceTask {
  id: string;
  title: string;
  assigned_to: string | null;
  phase_id: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  is_overdue: boolean;
  created_date: string;
  comments: PhaseComment[];
}

// NIST C-SCRM control
export interface NistScrm10Control {
  id: NistScrm10ControlId;
  title: string;
  description: string;
  phase: string;
  status: NistScrm10ControlStatus;
  recommended_action?: string;
}

// Gap
export interface GovernanceGap {
  control: NistScrm10ControlId;
  description: string;
  severity: SeverityLevel;
  recommended_action: string;
  assigned_to: string | null;
  target_date: string | null;
}

// Supplier criticality tier
export interface SupplierCriticalityTier {
  tier: VendorTier;
  count: number;
  assessment_frequency_days: number | null;
  evidence_requirements: string[];
}

// Notification rule
export interface NotificationRule {
  trigger: NotificationTrigger;
  threshold_risk_score?: number;
  threshold_days?: number;
  channel: string;
  recipients: string[];
  template: string;
}

// Notification record
export interface WorkspaceNotification {
  id: string;
  type: NotificationTrigger;
  sent_at: string;
  recipient: string;
  status: 'pending' | 'delivered' | 'failed';
  content: string;
}

// Audit log entry
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  comment?: string;
  from_value?: unknown;
  to_value?: unknown;
}

// Roadmap milestone
export interface RoadmapMilestone {
  name: string;
  target_date: string;
  status: 'on_track' | 'at_risk' | 'planned' | 'complete' | 'delayed';
}

// Diagnostics integration health
export interface IntegrationHealthStatus {
  vendor_portal: 'healthy' | 'degraded' | 'down';
  questionnaire_tool: 'healthy' | 'degraded' | 'down';
  risk_calculator_api: 'healthy' | 'degraded' | 'down';
}
