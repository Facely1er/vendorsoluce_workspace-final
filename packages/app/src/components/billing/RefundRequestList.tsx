import React, { useState, useEffect } from 'react';
import { DollarSign, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';

interface RefundRequest {
  id: string;
  amount: number;
  currency: string;
  reason: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed' | 'cancelled';
  created_at: string;
  processed_at: string | null;
  invoice_id: string | null;
}

const REFUND_REASONS: Record<string, string> = {
  technical_failure: 'Technical Service Failure',
  billing_error: 'Billing Error',
  discretionary: 'Extenuating Circumstances',
  other: 'Other',
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending: {
    label: 'Pending Review',
    icon: <Clock className="w-4 h-4" />,
    color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30',
  },
  approved: {
    label: 'Approved',
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
  },
  rejected: {
    label: 'Rejected',
    icon: <XCircle className="w-4 h-4" />,
    color: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
  },
  processed: {
    label: 'Processed',
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
  },
  cancelled: {
    label: 'Cancelled',
    icon: <XCircle className="w-4 h-4" />,
    color: 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700',
  },
};

export const RefundRequestList: React.FC = () => {
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRefundRequests();
  }, []);

  const fetchRefundRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data, error: fetchError } = await supabase
        .from('vs_refund_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setRefundRequests(data || []);
    } catch (err: unknown) {
      logger.error('Error fetching refund requests:', err);
      setError(err instanceof Error ? err.message : 'Failed to load refund requests');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Refund Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        {refundRequests.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">No refund requests yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              If you need to request a refund, please contact support or use the refund request form.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {refundRequests.map((request) => {
              const statusConfig = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
              return (
                <div
                  key={request.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatAmount(request.amount, request.currency)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {REFUND_REASONS[request.reason] || request.reason}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                      {statusConfig.icon}
                      <span className="ml-1">{statusConfig.label}</span>
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {request.description}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>Requested: {formatDate(request.created_at)}</span>
                    {request.processed_at && (
                      <span>Processed: {formatDate(request.processed_at)}</span>
                    )}
                    {request.invoice_id && (
                      <span>Invoice: {request.invoice_id}</span>
                    )}
                  </div>

                  {request.status === 'pending' && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Your request is under review. You'll receive an email notification when it's processed.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
