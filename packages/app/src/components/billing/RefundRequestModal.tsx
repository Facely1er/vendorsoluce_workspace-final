import React, { useState } from 'react';
import { X, AlertTriangle, Info, DollarSign } from 'lucide-react';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';

interface RefundRequestModalProps {
  onClose: () => void;
  onSuccess: () => void;
  invoiceId?: string;
  invoiceAmount?: number;
  invoiceCurrency?: string;
}

const REFUND_REASONS = [
  { 
    value: 'technical_failure', 
    label: 'Technical Service Failure',
    description: 'Extended service outage, critical feature failures, or data loss due to system failure'
  },
  { 
    value: 'billing_error', 
    label: 'Billing Error',
    description: 'Duplicate charge, incorrect amount, or billing mistake'
  },
  { 
    value: 'discretionary', 
    label: 'Extenuating Circumstances',
    description: 'Serious illness, death, business closure, or other exceptional circumstances'
  },
  { 
    value: 'other', 
    label: 'Other',
    description: 'Other reason (requires manual review)'
  },
];

export const RefundRequestModal: React.FC<RefundRequestModalProps> = ({
  onClose,
  onSuccess,
  invoiceId,
  invoiceAmount,
  invoiceCurrency = 'usd',
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedReason) {
      setError('Please select a reason for your refund request');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a detailed explanation');
      return;
    }

    if (description.trim().length < 20) {
      setError('Please provide a more detailed explanation (at least 20 characters)');
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data, error: requestError } = await supabase.functions.invoke('request-refund', {
        body: {
          invoiceId: invoiceId || null,
          reason: selectedReason,
          description: description.trim(),
          amount: invoiceAmount || null,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (requestError) throw requestError;
      if (data?.error) throw new Error(data.error);

      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('Error submitting refund request:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit refund request');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <DollarSign className="w-6 h-6 mr-2 text-vendorsoluce-green" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Request Refund</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Policy Information */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-semibold mb-1">Refund Policy</p>
                <p className="mb-2">ERMITS does not offer a standard money-back guarantee. Refunds may be granted for:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Technical service failures</li>
                  <li>Billing errors or duplicate charges</li>
                  <li>Extenuating circumstances (at our discretion)</li>
                </ul>
                <p className="mt-2 text-xs">All refund requests are reviewed within 5 business days. Approved refunds are processed within 2 business days.</p>
              </div>
            </div>
          </div>

          {/* Invoice Amount Display */}
          {invoiceAmount && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Refund Amount</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatAmount(invoiceAmount, invoiceCurrency)}
              </p>
              {invoiceId && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Invoice: {invoiceId}</p>
              )}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
            </div>
          )}

          {/* Reason Selection */}
          <div className="mb-6">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason for Refund Request <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {REFUND_REASONS.map((reason) => (
                <label
                  key={reason.value}
                  className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedReason === reason.value
                      ? 'border-vendorsoluce-green bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{reason.label}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{reason.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Detailed Explanation <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="Please provide a detailed explanation of why you're requesting a refund. Include any relevant dates, invoice numbers, or documentation..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-vendorsoluce-green focus:border-transparent resize-none"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {description.length} characters (minimum 20)
            </p>
          </div>

          {/* Warning */}
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <p className="font-semibold mb-1">Important</p>
                <p>Please note that refund requests are reviewed on a case-by-case basis. Not all requests will be approved. If you have questions, please contact support before submitting a request.</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !selectedReason || description.trim().length < 20}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
