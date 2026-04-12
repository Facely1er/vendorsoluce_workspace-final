import { useEffect, useState } from 'react';
import { Users, CheckCircle, AlertTriangle, MessageSquare, Clock, User, Shield } from 'lucide-react';
import { CollaborationManager } from '../../utils/collaboration';

interface CollaborativeProgressProps {
  sessionId: string;
}

export function CollaborativeProgress({ sessionId }: CollaborativeProgressProps) {
  const [progress, setProgress] = useState(CollaborationManager.getProgressSummary(sessionId));

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(CollaborationManager.getProgressSummary(sessionId));
    }, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  if (!progress) return null;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'contributor': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'reviewer': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="mb-6 bg-white dark:bg-gray-900 rounded-xl border-2 border-blue-200 dark:border-blue-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Team Progress
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Updates every 5s</span>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Overall Completion</span>
            <span className="font-bold text-blue-600">{progress.completionPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${progress.completionPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {progress.answeredQuestions} of {progress.totalQuestions} questions answered
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: CheckCircle, label: 'Completed', value: progress.answeredQuestions, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' },
            { icon: AlertTriangle, label: 'Flagged', value: progress.flaggedQuestions, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
            { icon: MessageSquare, label: 'Comments', value: progress.unresolvedComments, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className={`text-center p-4 rounded-lg border ${bg}`}>
              <Icon className={`h-6 w-6 mx-auto mb-2 ${color}`} />
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Individual Progress ({progress.memberProgress.length} members)
          </h4>
          <div className="space-y-3">
            {progress.memberProgress.map(member => (
              <div key={member.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      {member.role === 'owner' ? (
                        <Shield className="h-4 w-4 text-blue-600" />
                      ) : (
                        <User className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <span className="font-medium">{member.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor(member.role)}`}>
                      {member.role}
                    </span>
                  </div>
                  <span className="text-gray-500 text-xs">
                    {member.assignedSections.length > 0
                      ? `${member.completedSections.length}/${member.assignedSections.length} sections`
                      : 'No sections assigned'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${member.completionRate}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 min-w-[40px] text-right">
                    {member.completionRate.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {progress.memberProgress.some(m => m.lastActive) && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-xs font-semibold text-gray-500 mb-2">Recent Activity</h4>
            <div className="space-y-1 text-xs text-gray-500">
              {progress.memberProgress
                .filter(m => m.lastActive)
                .sort((a, b) => {
                  const aTime = a.lastActive ? new Date(a.lastActive).getTime() : 0;
                  const bTime = b.lastActive ? new Date(b.lastActive).getTime() : 0;
                  return bTime - aTime;
                })
                .slice(0, 3)
                .map(member => (
                  <div key={member.id} className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>{member.name} — {member.lastActive && new Date(member.lastActive).toLocaleTimeString()}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
