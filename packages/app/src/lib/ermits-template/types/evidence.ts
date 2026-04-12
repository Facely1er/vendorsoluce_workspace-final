/**
 * Evidence model: per control/question, with optional file refs and status.
 * Used across CyberCaution, CyberCorrect, VendorSoluce, AssetManager.
 */

export type EvidenceType =
  | 'document'
  | 'screenshot'
  | 'policy'
  | 'procedure'
  | 'certificate'
  | 'audit-report'
  | 'other';

export type EvidenceStatus = 'active' | 'archived' | 'expired';

export interface EvidenceItem {
  id: string;
  assessmentId: string;
  controlId?: string;
  questionId?: string;
  name: string;
  type: EvidenceType;
  description: string;
  uploadedAt: string;
  uploadedBy?: string;
  fileSize?: number;
  mimeType?: string;
  urlOrPath?: string;
  tags: string[];
  status: EvidenceStatus;
  expirationDate?: string;
  version?: string;
  metadata?: Record<string, unknown>;
}

export interface EvidenceLink {
  evidenceId: string;
  controlId?: string;
  questionId?: string;
  relevance: 'primary' | 'supporting' | 'reference';
  linkedAt: string;
  linkedBy?: string;
  notes?: string;
}
