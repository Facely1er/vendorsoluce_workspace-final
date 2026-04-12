import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';

interface CancelSubscriptionModalProps {
  onClose: () => void;
  onConfirm: (reason?: string, feedback?: string) => Promise<void>;
  cancellationDate: string;
  planName: string;
}

const CANCELLATION_REASONS = [
  { value: 'too_expensive', label: 'Too expensive' },
  { value: 'not_using_enough', label: "Not using the service enough" },
  { value: 'found_alternative', label: 'Found an alternative solution' },
  { value: 'missing_features', label: 'Missing features I need' },
  { value: 'technical_issues', label: 'Technical issues or bugs' },
  { value: 'budget_cuts', label: 'Budget cuts or cost reduction' },
  { value: 'company_changes', label: 'Company changes or restructuring' },
  { value: 'temporary_pause', label: 'Temporary pause (may return later)' },
  { value: 'other', label: 'Other' },
];

export const CancelSubscriptionModal: React.FC<CancelSubscriptionModalProps> = ({
  onClose,
  onConfirm,
  cancellationDate,
  planName,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onConfirm(selectedReason, feedback);
      onClose();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Cancel Subscription</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <div className="flex items-start mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <p className="font-semibold mb-1">Important Information</p>
                <p>Your subscription will remain active until <strong>{cancellationDate}</strong> (end of your billing period).</p>
                <p className="mt-2">You will retain full access to your <strong>{planName}</strong> plan until then.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Why are you cancelling? <span className="text-gray-500">(Optional)</span>
              </label>
              <select
                id="reason"
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-vendorsoluce-navy focus:border-transparent"
              >
                <option value="">Select a reason (optional)</option>
                {CANCELLATION_REASONS.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Additional Feedback <span className="text-gray-500">(Optional)</span>
              </label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                placeholder="Help us improve by sharing your thoughts..."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-vendorsoluce-navy focus:border-transparent resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Keep Subscription
            </Button>
            <Button
              type="submit"
              variant="danger"
              disabled={loading}
            >
              {loading ? 'Cancelling...' : 'Cancel Subscription'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
