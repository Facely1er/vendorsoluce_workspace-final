/**
 * Assessment types: framework-driven responses and control status.
 * Supports assessment → gap analysis → implementation (POA&M).
 */

import type { Framework } from './framework';

export type ControlStatus =
  | 'not-implemented'
  | 'partial'
  | 'implemented'
  | 'not-applicable';

export interface AssessmentResponse {
  questionId: string;
  controlId?: string;
  value: number | string;
  status?: ControlStatus;
  notes?: string;
  evidenceRefs?: string[];
}

export interface Assessment {
  id: string;
  frameworkId: string;
  frameworkVersion: string;
  userId?: string;
  organizationId?: string;
  systemName?: string;
  systemDescription?: string;
  responses: Record<string, AssessmentResponse>;
  overallScore?: number;
  status: 'draft' | 'in-progress' | 'complete' | 'submitted';
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface AssessmentWithFramework extends Assessment {
  framework: Framework;
}
