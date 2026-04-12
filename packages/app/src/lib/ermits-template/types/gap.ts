/**
 * Gap analysis: from assessment to prioritized gaps and recommendations.
 * Feeds POA&M and implementation planning.
 */

export type GapPriority = 'critical' | 'high' | 'medium' | 'low';

export interface GapItem {
  controlId: string;
  questionId?: string;
  currentScore?: number;
  targetScore?: number;
  gap: number;
  priority: GapPriority;
  recommendations: string[];
  estimatedEffort?: 'low' | 'medium' | 'high';
  timeframe?: string;
  businessImpact?: string;
  requiredActions: string[];
}

export interface GapAnalysis {
  id: string;
  assessmentId: string;
  frameworkId: string;
  generatedAt: string;
  gaps: GapItem[];
  summary: {
    totalGaps: number;
    criticalCount: number;
    highCount: number;
    overallScore: number;
    targetScore?: number;
  };
}
