import { useState } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  Copy,
  CheckCircle,
  X,
  ArrowRight,
  Building2,
  User
} from 'lucide-react';
import { CollaborationManager } from '../../utils/collaboration';

interface CollaborationSetupProps {
  onStart: (sessionId: string) => void;
}

export function CollaborationSetup({ onStart }: CollaborationSetupProps) {
  const [step, setStep] = useState<'create' | 'invite' | 'ready'>('create');
  const [sessionName, setSessionName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<Array<{ name: string; email: string }>>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const notify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateSession = () => {
    if (!sessionName || !organizationName || !ownerName || !ownerEmail) {
      notify('error', 'Please fill in all required fields');
      return;
    }
    try {
      const session = CollaborationManager.createSession(sessionName, organizationName, {
        name: ownerName,
        email: ownerEmail
      });
      setSessionId(session.id);
      setStep('invite');
      notify('success', 'Collaboration session created!');
    } catch {
      notify('error', 'Failed to create session. Please try again.');
    }
  };

  const handleAddMember = () => {
    if (!newMemberName || !newMemberEmail) {
      notify('error', 'Please enter a name and email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newMemberEmail)) {
      notify('error', 'Please enter a valid email address');
      return;
    }
    setTeamMembers([...teamMembers, { name: newMemberName, email: newMemberEmail }]);
    setNewMemberName('');
    setNewMemberEmail('');
    notify('success', `Added ${newMemberName} to the team`);
  };

  const handleRemoveMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const handleInviteMembers = () => {
    if (!sessionId) return;
    try {
      teamMembers.forEach(m => CollaborationManager.addTeamMember(sessionId, m));
      setStep('ready');
      notify('success', `Invited ${teamMembers.length} team members`);
    } catch {
      notify('error', 'Failed to invite members. Please try again.');
    }
  };

  const handleCopyLink = () => {
    if (!sessionId) return;
    navigator.clipboard.writeText(CollaborationManager.generateShareLink(sessionId));
    notify('success', 'Link copied to clipboard!');
  };

  const handleStartSession = () => {
    if (sessionId) {
      CollaborationManager.updateSessionStatus(sessionId, 'in-progress');
      onStart(sessionId);
    }
  };

  return (
    <div>
      {notification && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          notification.type === 'success'
            ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200'
            : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200'
        }`}>
          {notification.message}
        </div>
      )}

      {step === 'create' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border p-8 max-w-2xl mx-auto shadow-sm">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4">
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Create Collaborative Assessment</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Set up a team session where multiple people can assess vendor risks together
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Session Name *</label>
              <input
                type="text"
                placeholder="e.g., Q1 2025 Vendor Risk Review"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-background text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Organization Name *</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Your company name"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-background text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Full name"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-background text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Your Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-background text-sm"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={handleCreateSession}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <CheckCircle className="h-5 w-5" />
              Create Session
            </button>
          </div>
        </div>
      )}

      {step === 'invite' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border p-8 max-w-2xl mx-auto shadow-sm">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4">
              <UserPlus className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Invite Team Members</h2>
            <p className="text-gray-500 dark:text-gray-400">Add people who will contribute to this vendor assessment</p>
          </div>
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Share Link</span>
                <button
                  onClick={handleCopyLink}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
              </div>
              <code className="text-xs bg-white dark:bg-gray-900 p-2 rounded block overflow-x-auto text-gray-600 dark:text-gray-400">
                {sessionId && CollaborationManager.generateShareLink(sessionId)}
              </code>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium">Add Team Members</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Name"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-background text-sm"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-background text-sm"
                />
              </div>
              <button
                onClick={handleAddMember}
                className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                Add Member
              </button>
            </div>
            {teamMembers.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-3">Team Members ({teamMembers.length})</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {teamMembers.map((member, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </div>
                      <button onClick={() => handleRemoveMember(idx)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={handleStartSession} className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors">
                Skip &amp; Start Now
              </button>
              <button
                onClick={handleInviteMembers}
                disabled={teamMembers.length === 0}
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'ready' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border p-8 max-w-2xl mx-auto shadow-sm text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Team Ready!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Your collaborative vendor assessment session is set up</p>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold mb-4">Session Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Session Name:</span><span className="font-medium">{sessionName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Organization:</span><span className="font-medium">{organizationName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Team Size:</span><span className="font-medium">{teamMembers.length + 1} members</span></div>
            </div>
          </div>
          <button
            onClick={handleStartSession}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            Start Collaborative Assessment
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
