import React, { useState } from 'react';
import { CreditCard, Package, TrendingUp, FileText, DollarSign } from 'lucide-react';
import { SubscriptionManager } from '../../components/billing/SubscriptionManager';
import { InvoiceList } from '../../components/billing/InvoiceList';
import { RefundRequestList } from '../../components/billing/RefundRequestList';
import { RefundRequestModal } from '../../components/billing/RefundRequestModal';
import { UsageIndicator } from '../../components/billing/FeatureGate';
import { useSubscription } from '../../hooks/useSubscription';
import { PRODUCTS } from '../../config/stripe';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import WorkspacePageShell from '../../components/vendorsoluce-intelligence/WorkspacePageShell';
import PanelCard from '../../components/vendorsoluce-intelligence/PanelCard';
import { ProgressBarFill } from '../../components/ui/ProgressBarFill';
import LoadingBlock from '../../components/vendorsoluce-intelligence/LoadingBlock';

const BillingPage: React.FC = () => {
  const { tier, loading } = useSubscription();
  const product = PRODUCTS[tier as keyof typeof PRODUCTS];
  const [showRefundModal, setShowRefundModal] = useState(false);

  if (loading) {
    return (
      <WorkspacePageShell eyebrow="Workspace administration" title="Billing & subscription" description="Manage subscription details, feature usage, refunds, and invoices from a single operational billing view.">
        <LoadingBlock label="Loading subscription and billing controls…" />
      </WorkspacePageShell>
    );
  }

  return (
    <WorkspacePageShell
      eyebrow="Workspace administration"
      title="Billing & subscription"
      description="Manage your subscription, billing details, refunds, and operational usage from one structured view."
      stats={[
        { label: 'Plan', value: product.name, hint: 'Current subscription tier' },
        { label: 'Billing ops', value: 'Centralized', hint: 'Invoices + refunds + usage' },
      ]}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SubscriptionManager />
          <InvoiceList />
          <RefundRequestList />
        </div>

        <div className="space-y-6">
          <PanelCard
            title={<span className="flex items-center gap-2"><Package className="h-5 w-5" /> Quick actions</span>}
            description="Use these links to move between billing operations without leaving the same structured control surface."
          >
            <div className="space-y-3">
              {tier !== 'enterprise' && (
                <Link to="/pricing" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Upgrade plan
                  </Button>
                </Link>
              )}
              <Link to="/billing#invoices" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  View invoices
                </Button>
              </Link>
              <Link to="/contact" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Payment support
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start" onClick={() => setShowRefundModal(true)}>
                <DollarSign className="mr-2 h-4 w-4" />
                Request refund
              </Button>
            </div>
          </PanelCard>

          <PanelCard title="Feature usage" description="Monitor billing consumption in the same panel format used across the workspace.">
            <div className="space-y-4">
              {[
                { label: 'SBOM Scans', feature: 'sbom_scans', percent: 30 },
                { label: 'Vendors', feature: 'vendors', percent: 20 },
                { label: 'Assessments', feature: 'assessments', percent: 50 },
                { label: 'API Calls', feature: 'api_calls', percent: 0 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</span>
                    <UsageIndicator feature={item.feature} />
                  </div>
                  <ProgressBarFill percent={item.percent} fillClassName="fill-vendorsoluce-green" />
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-800">
              <Link to="/account" className="text-sm font-medium text-vendorsoluce-green hover:text-vendorsoluce-dark-green">
                View detailed usage →
              </Link>
            </div>
          </PanelCard>

          <PanelCard title={`Your ${product.name} benefits`} description="Keep plan entitlements visible while evaluating upgrades, billing changes, and refund decisions.">
            <ul className="space-y-2">
              {product.features.slice(0, 5).map((feature, index) => (
                <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                  <svg className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            {product.features.length > 5 ? (
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">+ {product.features.length - 5} more features</p>
            ) : null}
          </PanelCard>
        </div>
      </div>

      {showRefundModal ? (
        <RefundRequestModal
          onClose={() => setShowRefundModal(false)}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      ) : null}
    </WorkspacePageShell>
  );
};

export default BillingPage;
