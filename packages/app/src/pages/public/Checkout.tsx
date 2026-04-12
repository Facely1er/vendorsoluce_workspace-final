import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileText, Check, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { PRODUCTS, getPaymentLink, getPlanPriceLabel } from '../../config/stripe';
import { Link } from 'react-router-dom';
import { logger } from '../../utils/logger';

/** Extract a user-facing message from Supabase Edge Function error (non-2xx response). */
async function getEdgeFunctionErrorMessage(
  err: unknown,
  fallback: string
): Promise<string> {
  const ctx = err && typeof err === 'object' && 'context' in err
    ? (err as { context?: Response }).context
    : undefined;
  if (ctx && typeof (ctx as Response).json === 'function') {
    try {
      const body = (await (ctx as Response).json()) as { error?: string; details?: string };
      if (body?.error) return body.details ? `${body.error}: ${body.details}` : body.error;
      if (body?.details) return body.details;
    } catch {
      // ignore parse errors
    }
  }
  return err instanceof Error ? err.message : fallback;
}

// Policy document paths (relative to public folder)
const POLICY_DOCUMENTS = [
  {
    title: 'EU Standard Contractual Clauses (GDPR)',
    path: '/policies/EU_SCC__GDPR_Client_.md',
    description: 'Standard Contractual Clauses for International Data Transfers (GDPR Compliance)'
  },
  {
    title: 'DFARS/FAR Compliance Addendum',
    path: '/policies/_Fed_Contractor_Client__DFARS_FAR_Compliance_Addendum.md',
    description: 'DFARS/FAR Compliance Addendum for Federal Contractors'
  },
  {
    title: 'E-Commerce Policies',
    path: '/policies/ecommerce_policies.md',
    description: 'Subscription & Payment Terms, Refund & Cancellation Policy'
  },
  {
    title: 'Data Processing Agreement (GDPR)',
    path: '/policies/Enterprise__GDPR_Client__-_Data_Processing_Agreement.md',
    description: 'Data Processing Agreement for GDPR Compliance'
  },
  {
    title: 'Business Associate Agreement (HIPAA)',
    path: '/policies/Enterprise__HIPAA_client__-___ERMITS_LLC_-_Business_Associate_Agreement__BAA_.md',
    description: 'Business Associate Agreement for HIPAA Compliance'
  },
  {
    title: 'Service Level Agreement',
    path: '/policies/Enterprise_-_SLA.md',
    description: 'Enterprise Service Level Agreement'
  }
];

// Other policy pages links
const OTHER_POLICY_LINKS = [
  { title: 'Master Terms of Service', path: '/master-terms-of-service' },
  { title: 'Master Privacy Policy', path: '/master-privacy-policy' },
  { title: 'Cookie Policy', path: '/cookie-policy' },
  { title: 'Acceptable Use Policy', path: '/acceptable-use-policy' }
];

const Checkout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [policiesAccepted, setPoliciesAccepted] = useState(false);
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null);
  const [policyContents, setPolicyContents] = useState<Record<string, string>>({});

  const plan = (searchParams.get('plan') as keyof typeof PRODUCTS) || 'professional';
  const intervalParam = searchParams.get('interval');
  const interval = intervalParam === 'year' ? 'year' : intervalParam === 'month' ? 'month' : undefined;
  const resolvedInterval = interval ?? (plan === 'starter' ? undefined : 'month');
  const product = PRODUCTS[plan];

  // Eagerly check if the payment link is configured so we can warn before the user clicks.
  const paymentLinkConfigured = plan === 'free' || plan === 'federal' || !!getPaymentLink(plan, resolvedInterval);

  // Load policy documents
  useEffect(() => {
    const loadPolicies = async () => {
      const contents: Record<string, string> = {};
      
      for (const policy of POLICY_DOCUMENTS) {
        try {
          // Try to fetch from public/policies folder
          const response = await fetch(policy.path);
          
          if (response.ok) {
            const text = await response.text();
            contents[policy.path] = text;
          } else {
            // Fallback: show policy information with download option
            contents[policy.path] = `# ${policy.title}\n\n${policy.description}\n\n## Policy Document\n\nThis policy document is required reading before checkout. The full document is available for download or review.\n\n**Important:** Please ensure you have read and understood all terms in this policy before proceeding with checkout.\n\n*Note: If you cannot view the full document here, please contact support for a copy.*`;
          }
        } catch (err) {
          logger.error(`Error loading policy ${policy.path}:`, err);
          // Fallback content
          contents[policy.path] = `# ${policy.title}\n\n${policy.description}\n\n## Policy Document\n\nThis policy document is required reading before checkout. Please ensure you have read and understood all terms before proceeding.\n\n**Contact support if you need a copy of this policy document.**`;
        }
      }
      
      setPolicyContents(contents);
    };

    loadPolicies();
  }, []);

  const handleProceedToStripe = async () => {
    if (!policiesAccepted) {
      setError('Please accept the policies to continue');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Free tier: guest creates account after "checkout" (policies accepted); then we set tier when they return to /checkout
      if (plan === 'free' && !user) {
        navigate(`/signin?mode=signup`, { state: { from: { pathname: '/checkout', search: `?plan=${plan}` } } });
        return;
      }

      // Free tier (logged-in user): update profile and go to dashboard
      if (plan === 'free' && user) {
        const { error: updateError } = await supabase
          .from('vs_profiles')
          .update({ subscription_tier: 'free' } as never)
          .eq('id', user.id);

        if (updateError) throw updateError;
        navigate('/dashboard');
        return;
      }

      // Use Stripe Payment Links — redirect directly to configured Payment Link URL.
      const paymentLinkUrl = getPaymentLink(plan, resolvedInterval);
      if (!paymentLinkUrl) {
        throw new Error(
          `Payment link not configured for ${plan}. Add VITE_STRIPE_LINK_${plan.toUpperCase()}${plan !== 'starter' && plan !== 'federal' ? ' (and _MONTHLY / _ANNUAL for billing intervals)' : ''} in environment variables. Run packages/app/scripts/rebuild-stripe-catalog.js to create Payment Links.`
        );
      }
      window.location.href = paymentLinkUrl;
      return;

    } catch (err: unknown) {
      logger.error('Checkout error:', err);
      const message = await getEdgeFunctionErrorMessage(
        err,
        'Failed to start checkout process. Please try again or contact support.'
      );
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const togglePolicy = (policyPath: string) => {
    setExpandedPolicy(expandedPolicy === policyPath ? null : policyPath);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Checkout - {product.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review our policies before proceeding to payment
          </p>
        </div>

        {/* Plan Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Plan Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {product.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {getPlanPriceLabel(plan, resolvedInterval)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {getPlanPriceLabel(plan, resolvedInterval)}
                </p>
                {plan !== 'free' && plan !== 'starter' && plan !== 'federal' && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {resolvedInterval === 'year' ? 'Billed annually' : 'Billed monthly'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Policy Documents */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Policy Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {POLICY_DOCUMENTS.map((policy) => (
                <div
                  key={policy.path}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => togglePolicy(policy.path)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center flex-1 text-left">
                      <FileText className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {policy.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {policy.description}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-gray-400" />
                  </button>
                  {expandedPolicy === policy.path && (
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                      <div className="prose dark:prose-invert max-w-none">
                        <div className="mb-4 flex gap-2">
                          <a
                            href={policy.path}
                            download
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Download PDF
                          </a>
                          <span className="text-gray-400">|</span>
                          <a
                            href={policy.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Open in New Tab
                          </a>
                        </div>
                        <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded p-4 bg-white dark:bg-gray-900">
                          <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono">
                            {policyContents[policy.path] || 'Loading policy document...'}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Other Policy Links */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Additional Policy Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {OTHER_POLICY_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="text-gray-900 dark:text-white font-medium">
                    {link.title}
                  </span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Acceptance Checkbox */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={policiesAccepted}
                onChange={(e) => setPoliciesAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                I have read and agree to all the policies listed above, including the{' '}
                <Link to="/master-terms-of-service" target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Master Terms of Service
                </Link>
                {' '}and{' '}
                <Link to="/master-privacy-policy" target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Master Privacy Policy
                </Link>
                . I understand that by proceeding, I am entering into a legally binding agreement.
              </span>
            </label>
          </CardContent>
        </Card>

        {/* Payment link misconfiguration warning (shown before user clicks) */}
        {!paymentLinkConfigured && !error && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
                Payment not available
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                The payment link for the <strong>{plan}</strong> plan is not configured yet. Please contact support or try again later.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-800 dark:text-red-200 mb-1">
                Error
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/pricing')}
            disabled={loading}
          >
            Back to Pricing
          </Button>
          <Button
            variant="primary"
            onClick={handleProceedToStripe}
            disabled={loading || !policiesAccepted || !paymentLinkConfigured}
            className="flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Proceed to Payment
              </>
            )}
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Questions about our policies?{' '}
            <Link to="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

