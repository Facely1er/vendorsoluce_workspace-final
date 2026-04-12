import { useState } from 'react';
import { MessageSquare, Flag, Send, CheckCircle, User } from 'lucide-react';
import { CollaborationManager } from '../../utils/collaboration';
import { QuestionComment } from '../../types/collaboration';

interface QuestionCollaborationProps {
  sessionId: string;
  questionId: string;
  currentUserId: string;
  currentUserName: string;
}

export function QuestionCollaboration({
  sessionId,
  questionId,
  currentUserId,
  currentUserName
}: QuestionCollaborationProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showFlagForm, setShowFlagForm] = useState(false);
  const [flagReason, setFlagReason] = useState('');

  const session = CollaborationManager.getSession(sessionId);
  const questionData = session?.answers[questionId];
  const comments = questionData?.comments || [];
  const isFlagged = session?.flags.some(f => f.questionId === questionId && f.status === 'pending');

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    CollaborationManager.addComment(sessionId, questionId, newComment, currentUserId, currentUserName);
    setNewComment('');
  };

  const handleResolveComment = (commentId: string) => {
    CollaborationManager.resolveComment(sessionId, questionId, commentId);
  };

  const handleFlagQuestion = () => {
    if (!flagReason.trim()) return;
    CollaborationManager.flagQuestion(sessionId, questionId, currentUserId, flagReason);
    setShowFlagForm(false);
    setFlagReason('');
  };

  const handleUnflagQuestion = () => {
    CollaborationManager.unflagQuestion(sessionId, questionId);
  };

  const formatTimestamp = (date: Date) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-xs px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1 transition-colors"
        >
          <MessageSquare className="h-3 w-3" />
          Comments ({comments.length})
        </button>
        {!isFlagged ? (
          <button
            onClick={() => setShowFlagForm(!showFlagForm)}
            className="text-xs px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1 transition-colors"
          >
            <Flag className="h-3 w-3" />
            Flag for Discussion
          </button>
        ) : (
          <button
            onClick={handleUnflagQuestion}
            className="text-xs px-3 py-1.5 border border-amber-300 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-100 flex items-center gap-1 transition-colors"
          >
            <Flag className="h-3 w-3 fill-amber-500" />
            Flagged
          </button>
        )}
      </div>

      {showFlagForm && (
        <div className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
          <div className="space-y-2">
            <label className="text-xs font-medium">Why are you flagging this?</label>
            <input
              type="text"
              placeholder="e.g., Need clarification on requirements..."
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-background text-sm"
            />
            <div className="flex gap-2">
              <button onClick={handleFlagQuestion} className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                <Flag className="h-3 w-3" /> Flag
              </button>
              <button onClick={() => { setShowFlagForm(false); setFlagReason(''); }} className="py-1.5 px-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-xs transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showComments && (
        <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="space-y-4">
            {comments.length > 0 ? (
              <div className="space-y-3 max-h-56 overflow-y-auto">
                {comments.map((comment: QuestionComment) => (
                  <div key={comment.id} className={`p-3 rounded-lg ${comment.resolved ? 'bg-gray-50 dark:bg-gray-800 opacity-60' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <User className="h-3 w-3 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium">{comment.userName}</p>
                          <p className="text-[10px] text-gray-500">{formatTimestamp(comment.timestamp)}</p>
                        </div>
                      </div>
                      {!comment.resolved && comment.userId !== currentUserId && (
                        <button
                          onClick={() => handleResolveComment(comment.id)}
                          className="text-green-600 hover:text-green-700"
                          title="Mark as resolved"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm">{comment.comment}</p>
                    {comment.resolved && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Resolved
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No comments yet. Be the first!</p>
            )}
            <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-background text-sm"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
