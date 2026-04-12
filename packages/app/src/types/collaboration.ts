/**
 * Team Collaboration Types for Organizational Assessments
 * Enables multi-user vendor assessment sessions with section assignments and progress tracking
 */

export type CollaborationRole = 'owner' | 'contributor' | 'reviewer';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: CollaborationRole;
  assignedSections: string[];
  completedSections: string[];
  joinedAt: Date;
  lastActive?: Date;
}

export interface QuestionComment {
  id: string;
  questionId: string;
  userId: string;
  userName: string;
  comment: string;
  timestamp: Date;
  resolved: boolean;
}

export interface QuestionFlag {
  questionId: string;
  flaggedBy: string[];
  reason: string;
  status: 'pending' | 'discussed' | 'resolved';
}

export interface CollaborativeSession {
  id: string;
  name: string;
  organizationName: string;
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
  status: 'draft' | 'in-progress' | 'review' | 'completed';
  assessmentMode: 'organizational';
  teamMembers: TeamMember[];
  answers: Record<string, {
    value: string;
    answeredBy: string;
    answeredAt: Date;
    votes?: Record<string, string>;
    comments?: QuestionComment[];
  }>;
  flags: QuestionFlag[];
  sectionAssignments: Record<string, string[]>;
  currentSection?: number;
  settings: {
    requireConsensus: boolean;
    allowAnonymousVoting: boolean;
    notifyOnComments: boolean;
  };
}

export interface ProgressSummary {
  totalQuestions: number;
  answeredQuestions: number;
  completionPercentage: number;
  flaggedQuestions: number;
  unresolvedComments: number;
  memberProgress: Array<TeamMember & { completionRate: number }>;
}
