import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageLoader from '../common/PageLoader';
import { config } from '../../utils/config';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
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

  if (!requireAuth && isAuthenticated) {
    // Redirect to home if authenticated and trying to access login/signup
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;