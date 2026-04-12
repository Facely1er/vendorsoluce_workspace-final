/**
 * Plan of Action & Milestones (POA&M).
 * Aligned with AssetManager FISMA POAMItem and CMMC/CyberCaution implementation flows.
 */

export type POAMStatus = 'Open' | 'In Progress' | 'Completed' | 'Risk Accepted';

export interface POAMItem {
  id: string;
  assessmentId: string;
  controlId: string;
  weakness: string;
  responsibleOffice: string;
  scheduledCompletion: string;
  resources: string;
  milestones: string;
  status: POAMStatus;
  evidenceRefs?: string[];
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface POAMSummary {
  total: number;
  byStatus: Record<POAMStatus, number>;
  openCount: number;
}
