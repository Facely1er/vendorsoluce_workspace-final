import React, { useState } from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';

interface PremiumReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: () => void;
  reportType: 'assessment' | 'sbom' | 'vendor';
  reportData?: any;
}

export const PremiumReportModal: React.FC<PremiumReportModalProps> = ({
  isOpen,
  onClose,
  onPurchase: _onPurchase,
  reportType,
  reportData
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    if (!user) {
      window.location.href = '/signin?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    setLoading(true);
    try {
      // Create Stripe checkout session for premium report
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          mode: 'payment', // One-time payment
          lineItems: [{
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Premium Report',
                description: `Premium ${reportType} report with executive summary and detailed analytics`,
              },
              unit_amount: 4900, // $49.00 in cents
            },
            quantity: 1,
          }],
          success_url: `${window.location.origin}/reports/premium-success?type=${reportType}`,
          cancel_url: window.location.href,
          metadata: {
            report_type: reportType,
            user_id: user.id,
            report_data: JSON.stringify(reportData || {})
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      logger.error('Error creating checkout session:', error);
      alert('Failed to start checkout. Please try again.');
      setLoading(false);
    }
  };

  const premiumFeatures = [
    'Executive summary with grade scoring',
    'Detailed section-by-section analysis',
    'Priority recommendations with implementation steps',
    'Critical findings highlighted',
    'Professional branded formatting',
    'Shareable with stakeholders',
    'Enhanced analytics and insights'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Upgrade to Premium Report
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get a professional, executive-ready report
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">$49</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">One-time purchase</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">vs. Free Report</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">Enhanced</div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Premium Report Includes:
            </h3>
            <ul className="space-y-3">
              {premiumFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>💡 Perfect for:</strong> Executive presentations, compliance audits, stakeholder reports, and board meetings.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handlePurchase}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
            >
              {loading ? 'Processing...' : 'Purchase Premium Report - $49'}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
            Secure payment via Stripe. Report will be available immediately after purchase.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
