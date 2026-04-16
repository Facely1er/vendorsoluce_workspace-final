import React, { Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFromWebsite } from '../../hooks/useFromWebsite';
import PageLoader from '../common/PageLoader';
import { lazyWithRetry } from '../../utils/lazyWithRetry';
import { config } from '../../utils/config';

const DashboardPage = lazyWithRetry(() => import('../../pages/workspace/DashboardPage'));
const DashboardLandingPage = lazyWithRetry(() => import('../../pages/public/DashboardLandingPage'));

const ConditionalDashboard: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const fromWebsite = useFromWebsite();

  if (isLoading) {
    return <PageLoader />;
  }

  /**
   * Deployment intent:
   * - Demo / ungated / dev: full dashboard should be explorable without a backend.
   * - Platform production: unauthenticated users should see an explicit landing (sign in / get started).
   */
  const allowFromWebsite = config.app.isDemo || import.meta.env.DEV;
  const allowUnauthenticatedFullDashboard =
    config.app.isDemo ||
    config.app.demoMode ||
    config.app.ungateProtectedRoutes ||
    import.meta.env.DEV ||
    (allowFromWebsite && fromWebsite);
  const showFullDashboard = isAuthenticated || allowUnauthenticatedFullDashboard;

  return (
    <Suspense fallback={<PageLoader />}>
      {showFullDashboard ? (
        <DashboardPage />
      ) : (
        <DashboardLandingPage />
      )}
    </Suspense>
  );
};

export default ConditionalDashboard;

