/**
 * SubscriptionContext - Provides tier, usage limits, and trial status for real-world usage.
 * Supports free tier and trial (14-day Professional) with usage limits.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { UsageService } from '../services/usageService';
import { TrialService } from '../services/trialService';
import { getUsageLimit } from '../config/tiers';
import { isLicenseMode } from '../config/license';
import { getLicenseTier } from '../services/licenseService';
import { isSupabaseEnabled } from '../lib/supabase';
import { config } from '../utils/config';
import type { TierKey } from '../config/tiers';

export type SubscriptionTier = TierKey;

export interface UsageInfo {
  used: number;
  limit: number;
  percentage: number;
  canUse: boolean;
  message?: string;
}

interface SubscriptionContextType {
  tier: SubscriptionTier;
  isTrial: boolean;
  trialDaysRemaining: number;
  isDemoMode: boolean;
  usage: {
    vendors: UsageInfo;
    assessments: UsageInfo;
    sbom_scans: UsageInfo;
  };
  limits: {
    vendors: number;
    assessments: number;
    sbom_scans: number;
  };
  canCreateVendor: boolean;
  canCreateAssessment: boolean;
  canCreateSBOM: boolean;
  refresh: () => Promise<void>;
  canStartTrial: boolean;
  startTrial: () => Promise<void>;
  isLoading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const usageService = new UsageService();

const defaultUsageInfo: UsageInfo = {
  used: 0,
  limit: -1,
  percentage: 0,
  canUse: true,
};

async function fetchUsageInfo(
  usageService: UsageService,
  userId: string,
  feature: 'vendors' | 'vendor_assessments' | 'sbom_scans'
): Promise<UsageInfo> {
  try {
    const result = await usageService.canPerformAction(userId, feature);
    const limit = result.limit;
    const percentage = limit === -1 || limit === 0 ? 0 : Math.min(100, (result.used / limit) * 100);
    return {
      used: result.used,
      limit: result.limit,
      percentage,
      canUse: result.canPerform,
      message: result.message,
    };
  } catch {
    return defaultUsageInfo;
  }
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user, profile, isDemoMode } = useAuth();
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [isTrial, setIsTrial] = useState(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0);
  const [canStartTrial, setCanStartTrial] = useState(false);
  const [usage, setUsage] = useState<SubscriptionContextType['usage']>({
    vendors: defaultUsageInfo,
    assessments: defaultUsageInfo,
    sbom_scans: defaultUsageInfo,
  });
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user || isDemoMode) {
      setTier('free');
      setIsTrial(false);
      setTrialDaysRemaining(0);
      setCanStartTrial(false);
      setUsage({
        vendors: defaultUsageInfo,
        assessments: defaultUsageInfo,
        sbom_scans: defaultUsageInfo,
      });
      setIsLoading(false);
      return;
    }

    // License (enterprise) mode: tier from license only, no trial
    if (isLicenseMode()) {
      const licenseTier = getLicenseTier() ?? 'free';
      setTier(licenseTier);
      setIsTrial(false);
      setTrialDaysRemaining(0);
      setCanStartTrial(false);
      const limit = (r: 'vendors' | 'assessments' | 'sbom_scans') => {
        const key = r === 'assessments' ? 'assessments' : r === 'sbom_scans' ? 'sbom_scans' : 'vendors';
        return getUsageLimit(licenseTier, key);
      };
      setUsage({
        vendors: { ...defaultUsageInfo, limit: limit('vendors'), used: 0 },
        assessments: { ...defaultUsageInfo, limit: limit('assessments'), used: 0 },
        sbom_scans: { ...defaultUsageInfo, limit: limit('sbom_scans'), used: 0 },
      });
      setIsLoading(false);
      return;
    }

    if (!isSupabaseEnabled()) {
      setTier('free');
      setIsTrial(false);
      setTrialDaysRemaining(0);
      setCanStartTrial(false);
      setUsage({
        vendors: defaultUsageInfo,
        assessments: defaultUsageInfo,
        sbom_scans: defaultUsageInfo,
      });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const profileTier = (profile?.subscription_tier || 'free') as SubscriptionTier;
      setTier(profileTier);

      const [daysRemaining, eligible] = await Promise.all([
        TrialService.getTrialDaysRemaining(user.id),
        TrialService.isEligibleForTrial(user.id),
      ]);
      setIsTrial(daysRemaining > 0);
      setTrialDaysRemaining(daysRemaining);
      setCanStartTrial(eligible && profileTier === 'free');

      const [vendorsUsage, assessmentsUsage, sbomUsage] = await Promise.all([
        fetchUsageInfo(usageService, user.id, 'vendors'),
        fetchUsageInfo(usageService, user.id, 'vendor_assessments'),
        fetchUsageInfo(usageService, user.id, 'sbom_scans'),
      ]);

      setUsage({
        vendors: vendorsUsage,
        assessments: assessmentsUsage,
        sbom_scans: sbomUsage,
      });
    } catch (err) {
      setUsage({
        vendors: defaultUsageInfo,
        assessments: defaultUsageInfo,
        sbom_scans: defaultUsageInfo,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, profile?.subscription_tier, isDemoMode]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const startTrial = useCallback(async () => {
    if (!user || !canStartTrial) return;
    await TrialService.startTrial(user.id);
    await refresh();
    window.location.href = '/dashboard';
  }, [user, canStartTrial, refresh]);

  const limits = {
    vendors: getUsageLimit(tier, 'vendors'),
    assessments: getUsageLimit(tier, 'assessments'),
    sbom_scans: getUsageLimit(tier, 'sbom_scans'),
  };

  const value: SubscriptionContextType = {
    tier,
    isTrial,
    trialDaysRemaining,
    isDemoMode: config.app.demoMode || isDemoMode,
    usage,
    limits,
    canCreateVendor: usage.vendors.canUse,
    canCreateAssessment: usage.assessments.canUse,
    canCreateSBOM: usage.sbom_scans.canUse,
    refresh,
    canStartTrial,
    startTrial,
    isLoading,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
