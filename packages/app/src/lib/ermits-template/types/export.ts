/**
 * Export and report payload types.
 * Contract for JSON/CSV/PDF report generation across products.
 */

export type ExportFormat = 'json' | 'csv' | 'pdf';

export interface ReportOptions {
  format: ExportFormat;
  includeExecutiveSummary?: boolean;
  includeFindings?: boolean;
  includePOAMSummary?: boolean;
  includeEvidenceList?: boolean;
  includeGapAnalysis?: boolean;
  branding?: {
    organizationName?: string;
    logoUrl?: string;
  };
}

export interface ReportPayload {
  assessmentId: string;
  generatedAt: string;
  executiveSummary?: string;
  overallScore?: number;
  findings?: Array<{ controlId: string; status: string; evidence?: string; remediation?: string }>;
  poamSummary?: { total: number; openCount: number };
  evidenceList?: Array<{ id: string; name: string; controlId?: string; type: string }>;
  gapSummary?: { totalGaps: number; criticalCount: number };
}
