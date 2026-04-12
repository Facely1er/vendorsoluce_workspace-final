import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, Calendar, AlertCircle, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { PRODUCTS, USAGE_PRICING, getPlanPriceLabel, getStarterUpdatesLink } from '../../config/stripe';
import { logger } from '../../utils/logger';
import { Link } from 'react-router-dom';
import { UsageService } from '../../services/usageService';
import { CancelSubscriptionModal } from './CancelSubscriptionModal';

interface Subscription {
  id: string;
  tier: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  stripe_subscription_id: string;
}

export const SubscriptionManager: React.FC = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [usageSummary, setUsageSummary] = useState<any[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const { user } = useAuth();
  const usageService = new UsageService();

  const fetchSubscription = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vs_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setSubscription(data);

      // Fetch usage summary
      if (data) {
        const summary = await usageService.getUsageSummary(user.id);
        setUsageSummary(summary);
      }
    } catch (err: unknown) {
      logger.error('Error fetching subscription:', err);
      setError('Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  }, [user, usageService]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const handleManageBilling = async () => {
    try {
      setActionLoading(true);
      setError(null);

      // Call Supabase Edge Function to create portal session
      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: {
          userId: user?.id,
          returnUrl: window.location.href,
        },
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Failed to create billing portal session');
      }
    } catch (err: unknown) {
      logger.error('Error opening billing portal:', err);
      setError(err instanceof Error ? err.message : 'Failed to open billing portal');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = async (reason?: string, feedback?: string) => {
    if (!subscription?.stripe_subscription_id) return;

    try {
      setActionLoading(true);
      setError(null);

      const { error } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          subscriptionId: subscription.stripe_subscription_id,
          userId: user?.id,
          cancellationReason: reason,
          cancellationFeedback: feedback,
        },
      });

      if (error) throw error;

      const cancelDate = new Date(subscription.current_period_end).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      setSuccessMessage(`Your subscription has been cancelled. You will retain access until ${cancelDate} (end of your billing period).`);
      setShowCancelModal(false);
      await fetchSubscription();
    } catch (err: unknown) {
      logger.error('Error cancelling subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!subscription?.stripe_subscription_id) return;

    try {
      setActionLoading(true);
      setError(null);

      const { error } = await supabase.functions.invoke('reactivate-subscription', {
        body: {
          subscriptionId: subscription.stripe_subscription_id,
          userId: user?.id,
        },
      });

      if (error) throw error;

      setSuccessMessage('Your subscription has been reactivated.');
      await fetchSubscription();
    } catch (err: unknown) {
      logger.error('Error reactivating subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to reactivate subscription');
    } finally {
      setActionLoading(false);
    }
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

  const currentPlan = subscription?.tier || 'free';
  const product = PRODUCTS[currentPlan as keyof typeof PRODUCTS];
  const starterUpdatesUrl = getStarterUpdatesLink();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'trialing':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            {status === 'trialing' ? 'Trial' : 'Active'}
          </span>
        );
      case 'canceled':
      case 'incomplete':
      case 'past_due':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <XCircle className="w-3 h-3 mr-1" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg flex items-start">
          <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Subscription Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Plan</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {product.name}
                </p>
                {currentPlan !== 'free' && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getPlanPriceLabel(currentPlan as keyof typeof PRODUCTS)}
                  </p>
                )}
              </div>
              {subscription && getStatusBadge(subscription.status)}
            </div>

            {subscription && (
              <>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    {subscription.cancel_at_period_end ? (
                      <span>
                        Cancels on {new Date(subscription.current_period_end).toLocaleDateString()}
                      </span>
                    ) : (
                      <span>
                        Renews on {new Date(subscription.current_period_end).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleManageBilling}
                    disabled={actionLoading}
                    className="flex-1"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4 mr-2" />
                    )}
                    Manage Billing
                  </Button>

                  {subscription.cancel_at_period_end ? (
                    <Button
                      variant="primary"
                      onClick={handleReactivateSubscription}
                      disabled={actionLoading}
                      className="flex-1"
                    >
                      Reactivate
                    </Button>
                  ) : subscription.tier !== 'free' && (
                    <Button
                      variant="outline"
                      onClick={() => setShowCancelModal(true)}
                      disabled={actionLoading}
                      className="flex-1 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </>
            )}

            {currentPlan === 'starter' && starterUpdatesUrl && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Optional: updates &amp; feeds
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  Your license is a one-time purchase (no recurring fees). The $99/yr Updates &amp; Feeds subscription is a separate SKU — add anytime for product releases, feed refreshes, and related support.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    window.location.href = starterUpdatesUrl;
                  }}
                  className="w-full"
                >
                  Subscribe to updates — $99/yr
                </Button>
              </div>
            )}

            {(!subscription || subscription.tier === 'free') && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Upgrade to unlock more features
                </p>
                <Button
                  variant="primary"
                  onClick={() => (window.location.href = '/pricing')}
                  className="w-full"
                >
                  View Plans
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Usage This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {usageSummary.length > 0 ? (
              usageSummary.map((item: any) => {
                const tier = (subscription?.tier || 'free') as keyof typeof PRODUCTS;
                const limit = item.limit === -1 ? Infinity : item.limit;
                const used = item.used || 0;
                const percentage = limit === Infinity ? 0 : Math.min(100, (used / limit) * 100);
                const isNearLimit = percentage >= 80 && percentage < 100;
                const isOverLimit = used > limit;
                const overage = isOverLimit ? used - limit : 0;
                
                // Get overage pricing
                const featureKey = item.feature === 'vendor_assessments' ? 'vendor_assessments' : 
                                  item.feature === 'sbom_scans' ? 'sbom_scans' : 
                                  item.feature === 'api_calls' ? 'api_calls' : null;
                const overagePrice = featureKey && USAGE_PRICING[featureKey] 
                  ? (USAGE_PRICING[featureKey] as Record<string, number>)[tier] || 0 
                  : 0;
                const estimatedOverageCost = overage * overagePrice;

                return (
                  <div key={item.feature} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {item.feature.replace('_', ' ')}
                      </span>
                      <span className={`text-sm font-medium ${isOverLimit ? 'text-red-600 dark:text-red-400' : isNearLimit ? 'text-yellow-600 dark:text-yellow-400' : ''}`}>
                        {used} / {limit === Infinity ? '∞' : limit}
                      </span>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all w-[${Math.min(100, Math.round(percentage))}%] ${
                          isOverLimit ? 'bg-red-500' : 
                          isNearLimit ? 'bg-yellow-500' : 
                          'bg-vendorsoluce-teal'
                        }`}
                      />
                    </div>

                    {/* Overage warning */}
                    {isOverLimit && overagePrice > 0 && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-red-800 dark:text-red-200">
                              Overage: {overage} {item.feature.replace('_', ' ')}
                            </p>
                            <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                              Estimated cost: ${estimatedOverageCost.toFixed(2)} (${overagePrice} per {item.feature.replace('_', ' ').slice(0, -1)})
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Near limit warning */}
                    {isNearLimit && !isOverLimit && overagePrice > 0 && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-2">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs text-yellow-800 dark:text-yellow-200">
                              Approaching limit. Additional {item.feature.replace('_', ' ')} will be charged at ${overagePrice} each.
                            </p>
                            <Link to="/pricing" className="text-xs text-yellow-700 dark:text-yellow-300 underline mt-1 inline-block">
                              Upgrade to avoid overage fees
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">SBOM Scans</span>
                  <span className="text-sm font-medium">
                    0 / {product.limits.sbom_scans === -1 ? '∞' : product.limits.sbom_scans}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Vendors</span>
                  <span className="text-sm font-medium">
                    0 / {product.limits.vendors === -1 ? '∞' : product.limits.vendors}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Assessments</span>
                  <span className="text-sm font-medium">
                    0 / {product.limits.assessments === -1 ? '∞' : product.limits.assessments}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">API Calls</span>
                  <span className="text-sm font-medium">
                    0 / {product.limits.api_calls === -1 ? '∞' : product.limits.api_calls}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showCancelModal && subscription && (
        <CancelSubscriptionModal
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelSubscription}
          cancellationDate={new Date(subscription.current_period_end).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
          planName={product?.name || subscription.tier}
        />
      )}
    </div>
  );
};