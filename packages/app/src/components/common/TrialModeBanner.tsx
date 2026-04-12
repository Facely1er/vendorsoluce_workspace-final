import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import { SHELL_CLASSES } from '../../layout/shell';

/**
 * Banner shown when user is on a free trial (14-day Professional tier).
 * Displays days remaining and upgrade CTA.
 */
const TrialModeBanner: React.FC = () => {
  const { isTrial, trialDaysRemaining, isDemoMode } = useSubscription();

  if (!isTrial || isDemoMode) return null;

  return (
    <div
      className={`fixed left-0 right-0 z-[90] bg-vendorsoluce-green/95 text-white text-center py-1.5 px-4 text-sm font-medium flex items-center justify-center gap-2 ${SHELL_CLASSES.fixedBannerOffset}`}
      role="banner"
      aria-label="Trial mode active"
    >
      <Zap className="h-4 w-4 flex-shrink-0" />
      <span>
        Free Trial — {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} remaining.
        Full Professional access with your real data.
      </span>
      <Link
        to="/checkout?plan=professional"
        className="ml-2 underline font-semibold hover:text-vendorsoluce-pale-green"
      >
        Upgrade to keep access →
      </Link>
    </div>
  );
};

export default TrialModeBanner;
