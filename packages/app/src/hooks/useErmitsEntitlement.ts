import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ermitsEntitlements, type ErmitsAccessResult } from '../lib/ermits';
import { isSupabaseEnabled } from '../lib/supabase';
import { config } from '../utils/config';

export function useErmitsEntitlement(productCode: string, options?: { skip?: boolean }) {
  const { user, isLoading, isDemoMode, isLocalWorkspaceMode } = useAuth();
  const [result, setResult] = useState<ErmitsAccessResult | null>(null);
  const [loading, setLoading] = useState(true);

  const skip =
    options?.skip ||
    !isSupabaseEnabled() ||
    isDemoMode ||
    isLocalWorkspaceMode ||
    config.app.ungateProtectedRoutes ||
    !user?.email;

  useEffect(() => {
    if (skip) {
      setResult({
        access: true,
        isTrial: false,
        productRole: 'viewer',
        trialEndsAt: null,
        usageRemaining: null,
        organizationId: '',
        organizationSlug: '',
        productId: '',
      });
      setLoading(false);
      return;
    }

    if (isLoading) {
      setLoading(true);
      return;
    }

    let cancelled = false;
    setLoading(true);
    ermitsEntitlements.checkAccess(productCode).then((r) => {
      if (!cancelled) {
        setResult(r);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id, productCode, skip, isLoading]);

  return { result, loading: loading || isLoading };
}
