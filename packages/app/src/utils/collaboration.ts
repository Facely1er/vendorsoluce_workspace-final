/**
 * Collaboration Manager for VendorSoluce
 * Handles multi-user vendor assessment sessions, team management, and progress tracking
 */

import { CollaborativeSession, TeamMember, QuestionComment, ProgressSummary, CollaborationRole } from '../types/collaboration';

const SESSIONS_KEY = 'vs_collaborative_sessions';
const CURRENT_USER_KEY = 'vs_current_collab_user';

function getStorage(): Storage | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  return window.localStorage;
}

function storageGet<T>(key: string): T | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function storageSet(key: string, value: unknown): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // storage might be full
  }
}

export class CollaborationManager {

  static createSession(
    name: string,
    organizationName: string,
    createdBy: { name: string; email: string }
  ): CollaborativeSession {
    const session: CollaborativeSession = {
      id: `vs-collab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      organizationName,
      createdBy: createdBy.email,
      createdAt: new Date(),
      lastModified: new Date(),
      status: 'draft',
      assessmentMode: 'organizational',
      teamMembers: [{
        id: `user-${Date.now()}`,
        name: createdBy.name,
        email: createdBy.email,
        role: 'owner',
        assignedSections: [],
        completedSections: [],
        joinedAt: new Date()
      }],
      answers: {},
      flags: [],
      sectionAssignments: {},
      currentSection: 0,
      settings: {
        requireConsensus: false,
        allowAnonymousVoting: true,
        notifyOnComments: false
      }
    };

    this.saveSession(session);
    this.setCurrentUser({ id: session.teamMembers[0].id, name: createdBy.name, email: createdBy.email });
    return session;
  }

  static saveSession(session: CollaborativeSession): void {
    const sessions = this.getAllSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    session.lastModified = new Date();
    if (index >= 0) { sessions[index] = session; } else { sessions.push(session); }
    storageSet(SESSIONS_KEY, sessions);
  }

  static getSession(sessionId: string): CollaborativeSession | null {
    return this.getAllSessions().find(s => s.id === sessionId) || null;
  }

  static getAllSessions(): CollaborativeSession[] {
    return storageGet<CollaborativeSession[]>(SESSIONS_KEY) || [];
  }

  static deleteSession(sessionId: string): void {
    storageSet(SESSIONS_KEY, this.getAllSessions().filter(s => s.id !== sessionId));
  }

  static addTeamMember(
    sessionId: string,
    member: { name: string; email: string; role?: CollaborationRole }
  ): TeamMember | null {
    const session = this.getSession(sessionId);
    if (!session) return null;
    const existing = session.teamMembers.find(m => m.email === member.email);
    if (existing) return existing;
    const newMember: TeamMember = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: member.name,
      email: member.email,
      role: member.role || 'contributor',
      assignedSections: [],
      completedSections: [],
      joinedAt: new Date()
    };
    session.teamMembers.push(newMember);
    this.saveSession(session);
    return newMember;
  }

  static removeTeamMember(sessionId: string, userId: string): void {
    const session = this.getSession(sessionId);
    if (!session) return;
    session.teamMembers = session.teamMembers.filter(m => m.id !== userId);
    this.saveSession(session);
  }

  static assignSection(sessionId: string, sectionId: string, userIds: string[]): void {
    const session = this.getSession(sessionId);
    if (!session) return;
    session.sectionAssignments[sectionId] = userIds;
    userIds.forEach(userId => {
      const member = session.teamMembers.find(m => m.id === userId);
      if (member && !member.assignedSections.includes(sectionId)) {
        member.assignedSections.push(sectionId);
      }
    });
    this.saveSession(session);
  }

  static submitAnswer(sessionId: string, questionId: string, answer: string, userId: string): void {
    const session = this.getSession(sessionId);
    if (!session) return;
    session.answers[questionId] = { value: answer, answeredBy: userId, answeredAt: new Date() };
    this.saveSession(session);
  }

  static addComment(
    sessionId: string,
    questionId: string,
    comment: string,
    userId: string,
    userName: string
  ): void {
    const session = this.getSession(sessionId);
    if (!session) return;
    if (!session.answers[questionId]) {
      session.answers[questionId] = { value: '', answeredBy: '', answeredAt: new Date(), comments: [] };
    }
    if (!session.answers[questionId].comments) {
      session.answers[questionId].comments = [];
    }
    const newComment: QuestionComment = {
      id: `comment-${Date.now()}`,
      questionId,
      userId,
      userName,
      comment,
      timestamp: new Date(),
      resolved: false
    };
    session.answers[questionId].comments!.push(newComment);
    this.saveSession(session);
  }

  static resolveComment(sessionId: string, questionId: string, commentId: string): void {
    const session = this.getSession(sessionId);
    if (!session || !session.answers[questionId]?.comments) return;
    const comment = session.answers[questionId].comments!.find(c => c.id === commentId);
    if (comment) { comment.resolved = true; this.saveSession(session); }
  }

  static flagQuestion(sessionId: string, questionId: string, userId: string, reason: string): void {
    const session = this.getSession(sessionId);
    if (!session) return;
    const existing = session.flags.find(f => f.questionId === questionId);
    if (existing) {
      if (!existing.flaggedBy.includes(userId)) existing.flaggedBy.push(userId);
    } else {
      session.flags.push({ questionId, flaggedBy: [userId], reason, status: 'pending' });
    }
    this.saveSession(session);
  }

  static unflagQuestion(sessionId: string, questionId: string): void {
    const session = this.getSession(sessionId);
    if (!session) return;
    session.flags = session.flags.filter(f => f.questionId !== questionId);
    this.saveSession(session);
  }

  static updateFlagStatus(sessionId: string, questionId: string, status: 'pending' | 'discussed' | 'resolved'): void {
    const session = this.getSession(sessionId);
    if (!session) return;
    const flag = session.flags.find(f => f.questionId === questionId);
    if (flag) { flag.status = status; this.saveSession(session); }
  }

  static markSectionCompleted(sessionId: string, sectionId: string, userId: string): void {
    const session = this.getSession(sessionId);
    if (!session) return;
    const member = session.teamMembers.find(m => m.id === userId);
    if (member && !member.completedSections.includes(sectionId)) {
      member.completedSections.push(sectionId);
      member.lastActive = new Date();
      this.saveSession(session);
    }
  }

  static updateSessionStatus(sessionId: string, status: 'draft' | 'in-progress' | 'review' | 'completed'): void {
    const session = this.getSession(sessionId);
    if (!session) return;
    session.status = status;
    this.saveSession(session);
  }

  static updateCurrentSection(sessionId: string, sectionIndex: number): void {
    const session = this.getSession(sessionId);
    if (!session) return;
    session.currentSection = sectionIndex;
    this.saveSession(session);
  }

  static getProgressSummary(sessionId: string): ProgressSummary | null {
    const session = this.getSession(sessionId);
    if (!session) return null;
    const totalQuestions = Object.keys(session.answers).length;
    const answeredQuestions = Object.values(session.answers).filter(a => a.value).length;
    const flaggedQuestions = session.flags.filter(f => f.status === 'pending').length;
    const unresolvedComments = Object.values(session.answers)
      .flatMap(a => a.comments || [])
      .filter(c => !c.resolved).length;
    const memberProgress = session.teamMembers.map(member => ({
      ...member,
      completionRate: member.assignedSections.length > 0
        ? (member.completedSections.length / member.assignedSections.length) * 100
        : 0
    }));
    return {
      totalQuestions,
      answeredQuestions,
      completionPercentage: totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0,
      flaggedQuestions,
      unresolvedComments,
      memberProgress
    };
  }

  static generateShareLink(sessionId: string): string {
    return `${window.location.origin}/team/collaborate/${sessionId}`;
  }

  static setCurrentUser(user: { id: string; name: string; email: string }): void {
    storageSet(CURRENT_USER_KEY, user);
  }

  static getCurrentUser(): { id: string; name: string; email: string } | null {
    return storageGet(CURRENT_USER_KEY);
  }

  static isSessionOwner(sessionId: string, userId: string): boolean {
    const session = this.getSession(sessionId);
    if (!session) return false;
    return session.teamMembers.find(m => m.id === userId)?.role === 'owner';
  }

  static getUserAssignedSections(sessionId: string, userId: string): string[] {
    const session = this.getSession(sessionId);
    if (!session) return [];
    return session.teamMembers.find(m => m.id === userId)?.assignedSections || [];
  }

  static exportSession(sessionId: string): string {
    const session = this.getSession(sessionId);
    return session ? JSON.stringify(session, null, 2) : '';
  }

  static importSession(sessionData: string): CollaborativeSession | null {
    try {
      const session = JSON.parse(sessionData) as CollaborativeSession;
      this.saveSession(session);
      return session;
    } catch {
      return null;
    }
  }
}
