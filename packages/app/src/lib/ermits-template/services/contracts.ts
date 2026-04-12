/**
 * Service contracts for assessment, evidence, POA&M, gap analysis, export, onboarding, and config.
 * Implement in each product (CyberCorrect, CyberCaution, VendorSoluce, AssetManager).
 */

import type { Assessment, AssessmentResponse } from '../types/assessment';
import type { EvidenceItem, EvidenceLink } from '../types/evidence';
import type { POAMItem } from '../types/poam';
import type { GapAnalysis, GapItem } from '../types/gap';
import type { RACIMatrix } from '../types/raci';
import type { Framework } from '../types/framework';
import type { ReportOptions, ReportPayload } from '../types/export';
import type { OnboardingState, OnboardingCompletion } from '../types/onboarding';
import type { ClientEnvironmentConfig } from '../types/config';
import type {
  BaselineSchema,
  NormalizationTemplate,
  NormalizedRecord,
  DataQualityMetrics,
  TransformationRule,
} from '../types/normalization';
import type { EnrichmentConfig, EnrichmentResult, NormalizedEntityFields } from '../types/enrichment';
import type { DPIA, PrivacyRiskAssessment, DataInventoryItem, PrivacyComplianceSummary } from '../types/privacy';
import type {
  CollaborativeSession,
  TeamMember,
  ProgressSummary,
  CollaborationRole,
} from '../types/collaboration';

export interface IAssessmentService {
  getById(id: string): Promise<Assessment | null>;
  listByUser(userId: string): Promise<Assessment[]>;
  listByOrganization(organizationId: string): Promise<Assessment[]>;
  save(assessment: Assessment): Promise<Assessment>;
  updateResponses(assessmentId: string, responses: Record<string, AssessmentResponse>): Promise<void>;
}

export interface IEvidenceService {
  listByAssessment(assessmentId: string): Promise<EvidenceItem[]>;
  listByControl(assessmentId: string, controlId: string): Promise<EvidenceItem[]>;
  add(item: Omit<EvidenceItem, 'id' | 'uploadedAt'>): Promise<EvidenceItem>;
  update(id: string, patch: Partial<EvidenceItem>): Promise<EvidenceItem>;
  delete(id: string): Promise<void>;
  linkEvidence(link: EvidenceLink): Promise<void>;
}

export interface IPOAMService {
  listByAssessment(assessmentId: string): Promise<POAMItem[]>;
  add(item: Omit<POAMItem, 'id'>): Promise<POAMItem>;
  update(id: string, patch: Partial<POAMItem>): Promise<POAMItem>;
  delete(id: string): Promise<void>;
  generateFromGaps(assessmentId: string, gaps: GapItem[]): Promise<POAMItem[]>;
}

export interface IGapAnalysisService {
  run(assessmentId: string, framework: Framework): Promise<GapAnalysis>;
  getByAssessment(assessmentId: string): Promise<GapAnalysis | null>;
}

export interface IRACIService {
  getByAssessment(assessmentId: string): Promise<RACIMatrix | null>;
  save(matrix: RACIMatrix): Promise<RACIMatrix>;
}

export interface IExportService {
  buildReportPayload(assessmentId: string, options: ReportOptions): Promise<ReportPayload>;
  exportJson(assessmentId: string, options: ReportOptions): Promise<Blob>;
  exportCsv(assessmentId: string, options: ReportOptions): Promise<Blob>;
  exportPdf?(assessmentId: string, options: ReportOptions): Promise<Blob>;
}

/** Onboarding: align client environment and integrate their data; drive workflow entry. */
export interface IOnboardingService {
  getState(userId: string): Promise<OnboardingState | null>;
  saveState(userId: string, state: OnboardingState): Promise<void>;
  completeOnboarding(userId: string, state: OnboardingState): Promise<OnboardingCompletion>;
  isComplete(userId: string): Promise<boolean>;
  /** Suggested route or workflow entry point after onboarding (by use case). */
  getDestinationRoute(useCase: OnboardingState['useCase']): string;
}

/** Client environment config: tenant, integrations, workflow preferences, data mapping. */
export interface IEnvironmentConfigService {
  getConfig(tenantId: string): Promise<ClientEnvironmentConfig | null>;
  saveConfig(config: ClientEnvironmentConfig): Promise<ClientEnvironmentConfig>;
  /** Resolve config for current context (e.g. by org id or user). */
  getConfigForContext(context: { userId?: string; organizationId?: string }): Promise<ClientEnvironmentConfig | null>;
}

/**
 * Normalization: align client data to a common baseline structure before feeding the system.
 * Reduces processing effort and ensures consistent shape across products. Integrated into onboarding.
 */
export interface INormalizationService {
  getBaselineSchema(schemaId: string): Promise<BaselineSchema | null>;
  listBaselineSchemas(): Promise<BaselineSchema[]>;
  getTemplate(templateId: string): Promise<NormalizationTemplate | null>;
  listTemplates(tenantId?: string): Promise<NormalizationTemplate[]>;
  saveTemplate(template: NormalizationTemplate): Promise<NormalizationTemplate>;
  /** Transform raw input to normalized records using a template. */
  process(
    templateId: string,
    rawRows: Record<string, unknown>[],
    options?: { validateOnly?: boolean }
  ): Promise<{ records: NormalizedRecord[]; metrics: DataQualityMetrics }>;
  /** Apply transformation rules (e.g. during onboarding to build or test a template). */
  applyRules(
    rules: TransformationRule[],
    row: Record<string, unknown>
  ): Promise<Record<string, unknown>>;
}

/**
 * Enrichment: overlay inferred metadata (e.g. privacy, ransomware, vendor) after normalization.
 * Configurable during onboarding; improves quality and downstream results.
 */
export interface IEnrichmentService {
  getConfig(tenantId: string): Promise<EnrichmentConfig[]>;
  saveConfig(tenantId: string, configs: EnrichmentConfig[]): Promise<EnrichmentConfig[]>;
  /** Enrich a single normalized entity; returns overlay + confidence. */
  enrich(
    entityId: string,
    normalizedFields: NormalizedEntityFields,
    domains: EnrichmentConfig['domain'][]
  ): Promise<EnrichmentResult[]>;
  /** Batch enrich after normalization pass. */
  enrichBatch(
    entities: Array<{ id: string; normalized: NormalizedEntityFields }>,
    domains: EnrichmentConfig['domain'][]
  ): Promise<Map<string, EnrichmentResult[]>>;
}

/**
 * DPIA Service: Data Protection Impact Assessments (GDPR Article 35).
 * Feature flag: PRIVACY_COMPLIANCE
 * Primary: CyberCorrect. Consumers: VendorSoluce (vendor processors), CyberCaution (NIST 800-53 privacy baseline).
 */
export interface IDPIAService {
  getById(id: string): Promise<DPIA | null>;
  listByOrganization(organizationId: string): Promise<DPIA[]>;
  listByUser(userId: string): Promise<DPIA[]>;
  save(dpia: DPIA): Promise<DPIA>;
  update(id: string, patch: Partial<DPIA>): Promise<DPIA>;
  delete(id: string): Promise<void>;
  /** Generate DPIA from assessment responses (e.g. after a NIST Privacy Framework assessment). */
  generateFromAssessment(assessmentId: string): Promise<DPIA>;
}

/**
 * Privacy Compliance Service: risk assessment, data inventory, compliance summary.
 * Feature flag: PRIVACY_COMPLIANCE
 */
export interface IPrivacyComplianceService {
  /** Run a privacy risk assessment; can be linked to a framework assessment. */
  runRiskAssessment(organizationId: string, frameworkId?: string): Promise<PrivacyRiskAssessment>;
  getRiskAssessment(id: string): Promise<PrivacyRiskAssessment | null>;
  /** Data inventory CRUD */
  listDataInventory(organizationId: string): Promise<DataInventoryItem[]>;
  addDataInventoryItem(item: Omit<DataInventoryItem, 'id'>): Promise<DataInventoryItem>;
  updateDataInventoryItem(id: string, patch: Partial<DataInventoryItem>): Promise<DataInventoryItem>;
  deleteDataInventoryItem(id: string): Promise<void>;
  /** Compliance summary for dashboards */
  getSummary(organizationId: string): Promise<PrivacyComplianceSummary>;
}

/**
 * Collaboration Service: multi-user assessment sessions with section assignments and progress tracking.
 * Feature flag: TEAM_COLLABORATION
 * Shared across CyberCaution, VendorSoluce, CyberCorrect.
 */
export interface ICollaborationService {
  createSession(
    name: string,
    organizationName: string,
    createdBy: { name: string; email: string }
  ): Promise<CollaborativeSession>;
  getSession(sessionId: string): Promise<CollaborativeSession | null>;
  listSessions(organizationId?: string): Promise<CollaborativeSession[]>;
  saveSession(session: CollaborativeSession): Promise<CollaborativeSession>;
  deleteSession(sessionId: string): Promise<void>;
  addTeamMember(
    sessionId: string,
    member: { name: string; email: string; role?: CollaborationRole }
  ): Promise<TeamMember | null>;
  removeTeamMember(sessionId: string, userId: string): Promise<void>;
  assignSection(sessionId: string, sectionId: string, userIds: string[]): Promise<void>;
  submitAnswer(sessionId: string, questionId: string, answer: string, userId: string): Promise<void>;
  addComment(sessionId: string, questionId: string, comment: string, userId: string, userName: string): Promise<void>;
  resolveComment(sessionId: string, questionId: string, commentId: string): Promise<void>;
  flagQuestion(sessionId: string, questionId: string, userId: string, reason: string): Promise<void>;
  updateFlagStatus(sessionId: string, questionId: string, status: 'pending' | 'discussed' | 'resolved'): Promise<void>;
  markSectionCompleted(sessionId: string, sectionId: string, userId: string): Promise<void>;
  updateSessionStatus(sessionId: string, status: CollaborativeSession['status']): Promise<void>;
  getProgressSummary(sessionId: string): Promise<ProgressSummary | null>;
  generateShareLink(sessionId: string): string;
  exportSession(sessionId: string): Promise<string>;
  importSession(sessionData: string): Promise<CollaborativeSession | null>;
}
