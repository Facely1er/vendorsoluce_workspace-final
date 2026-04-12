/**
 * RACI: Responsibility matrix for control or activity assignment.
 * Supports team-based workflows (CyberCaution CMMC, VendorSoluce, etc.).
 */

export type RACIRole = 'R' | 'A' | 'C' | 'I';

export interface RACIEntry {
  controlId: string;
  activityOrTask: string;
  responsible?: string;
  accountable?: string;
  consulted?: string[];
  informed?: string[];
}

export interface RACIMatrix {
  id: string;
  assessmentId?: string;
  frameworkId: string;
  entries: RACIEntry[];
  updatedAt: string;
}
