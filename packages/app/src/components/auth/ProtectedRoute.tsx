import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageLoader from '../common/PageLoader';
import { config } from '../../utils/config';
import { useErmitsEntitlement } from '../../hooks/useErmitsEntitlement';
import { AR } from 'shared/constants/routes';

const ERMITS_PRODUCT = 'vendorsoluce';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { isAuthenticated, isLoading, isDemoMode, isLocalWorkspaceMode } = useAuth();
  const location = useLocation();
  const needsErmits =
    requireAuth &&
    isAuthenticated &&
    !isDemoMode &&
    !isLocalWorkspaceMode &&
    !config.app.ungateProtectedRoutes;
  const { result: entResult, loading: entLoading } = useErmitsEntitlement(ERMITS_PRODUCT, {
    skip: !needsErmits,
  });

  if (isLoading || (needsErmits && entLoading)) {
    return <PageLoader message="Checking authentication..." />;
  }

  if (requireAuth && !isAuthenticated) {
    if (config.app.ungateProtectedRoutes) {
      if (import.meta.env.DEV) {
        console.warn(
          '[VendorSoluce] Ungated protected route: rendering without sign-in (dev default or VITE_UNGATE_PROTECTED_ROUTES).'
        );
      }
      return (
        <>
          <div
            role="status"
            className="bg-amber-400/95 dark:bg-amber-600/95 text-amber-950 dark:text-amber-50 text-center text-xs sm:text-sm font-medium py-2 px-4 border-b border-amber-600/40"
          >
            QA: protected routes are open (dev default or VITE_UNGATE_PROTECTED_ROUTES). Disable before public production.
          </div>
          {children}
        </>
      );
    }
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (needsErmits && entResult && !entResult.access) {
    const reason = 'reason' in entResult ? entResult.reason : 'no_entitlement';
    return (
      <Navigate
        to={AR.UPGRADE}
        replace
        state={{ reason, productCode: ERMITS_PRODUCT }}
      />
    );
  }

  if (!requireAuth && isAuthenticated) {
    // Redirect to home if authenticated and trying to access login/signup
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;