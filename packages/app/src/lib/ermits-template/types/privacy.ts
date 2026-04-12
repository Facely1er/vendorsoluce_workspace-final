/**
 * Privacy compliance types — DPIA, data inventory, privacy risk.
 * Shared across CyberCorrect (primary), VendorSoluce (vendor privacy), CyberCaution (NIST privacy controls).
 * Feature flag: PRIVACY_COMPLIANCE
 */

// ─── DPIA (Data Protection Impact Assessment) ───────────────────────────────

export type DPIAStatus = 'draft' | 'in_progress' | 'review' | 'approved' | 'rejected';
export type DPIAPriority = 'low' | 'medium' | 'high' | 'critical';
export type DPIARiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type RiskLikelihood = 'low' | 'medium' | 'high';
export type RiskImpact = 'low' | 'medium' | 'high';

export interface DPIARisk {
  id?: string;
  type: string;
  description: string;
  likelihood: RiskLikelihood;
  impact: RiskImpact;
  mitigation: string;
  residualRisk: RiskLikelihood;
  status?: 'identified' | 'mitigated' | 'accepted';
}

export interface DPIATransfer {
  country: string;
  adequacy: boolean;
  safeguards: string[];
}

export interface DPIA {
  id?: string;
  title: string;
  description?: string;
  processingActivity: string;
  dataController: string;
  dataProcessor?: string;
  status: DPIAStatus;
  priority: DPIAPriority;
  riskLevel: DPIARiskLevel;
  createdDate: string;
  dueDate: string;
  lastUpdated?: string;
  assessor: string;
  reviewer?: string;
  dataSubjects: string[];
  dataTypes: string[];
  purposes: string[];
  legalBasis: string[];
  retentionPeriod?: string;
  dataSources: string[];
  recipients: string[];
  transfers?: DPIATransfer[];
  risks: DPIARisk[];
  measures: {
    technical: string[];
    organizational: string[];
    legal: string[];
  };
  consultationRequired?: boolean;
  consultationDate?: string;
  approvalDate?: string;
  nextReviewDate?: string;
  organizationId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

// ─── Privacy Risk ─────────────────────────────────────────────────────────────

export type PrivacyRiskCategory =
  | 'data_breach'
  | 'unauthorized_access'
  | 'data_misuse'
  | 'consent_violation'
  | 'retention_violation'
  | 'cross_border_transfer'
  | 'vendor_risk';

export interface PrivacyRiskItem {
  id: string;
  category: PrivacyRiskCategory;
  description: string;
  likelihood: RiskLikelihood;
  impact: RiskImpact;
  score: number;
  controls: string[];
  residualRisk: RiskLikelihood;
  regulatoryReference?: string[];
}

export interface PrivacyRiskAssessment {
  id: string;
  organizationId?: string;
  frameworkId?: string;
  generatedAt: string;
  risks: PrivacyRiskItem[];
  overallScore: number;
  riskLevel: DPIARiskLevel;
  summary: {
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
  };
}

// ─── Data Inventory ───────────────────────────────────────────────────────────

export type DataSensitivity = 'public' | 'internal' | 'confidential' | 'restricted';
export type DataCategory =
  | 'personal'
  | 'sensitive_personal'
  | 'financial'
  | 'health'
  | 'biometric'
  | 'behavioral'
  | 'location'
  | 'technical';

export interface DataInventoryItem {
  id: string;
  name: string;
  description?: string;
  dataCategory: DataCategory;
  sensitivity: DataSensitivity;
  dataSubjects: string[];
  legalBasis: string[];
  retentionPeriod?: string;
  storageLocations: string[];
  processors: string[];
  crossBorderTransfers: boolean;
  encryptionAtRest: boolean;
  encryptionInTransit: boolean;
  lastReviewed?: string;
  organizationId?: string;
  controlMappings?: string[];
  metadata?: Record<string, unknown>;
}

// ─── Privacy Compliance Summary ───────────────────────────────────────────────

export interface PrivacyComplianceSummary {
  totalDPIAs: number;
  openDPIAs: number;
  criticalRisks: number;
  dataInventoryCount: number;
  overallComplianceScore: number;
  frameworks: string[];
  lastAssessedAt?: string;
}
