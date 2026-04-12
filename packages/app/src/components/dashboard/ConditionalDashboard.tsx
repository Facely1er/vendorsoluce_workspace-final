import React, { Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFromWebsite } from '../../hooks/useFromWebsite';
import PageLoader from '../common/PageLoader';
import { lazyWithRetry } from '../../utils/lazyWithRetry';
import { config } from '../../utils/config';

const DashboardPage = lazyWithRetry(() => import('../../pages/workspace/DashboardPage'));
const DashboardDemoPage = lazyWithRetry(() => import('../../pages/public/DashboardDemoPage'));

const ConditionalDashboard: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const fromWebsite = useFromWebsite();

  if (isLoading) {
    return <PageLoader />;
  }

  // When coming from the website, QA ungate, or signed-in: full dashboard; otherwise demo for unauthenticated
  const showFullDashboard = isAuthenticated || fromWebsite || config.app.ungateProtectedRoutes;
  return (
    <Suspense fallback={<PageLoader />}>
      {showFullDashboard ? <DashboardPage /> : <DashboardDemoPage />}
    </Suspense>
  );
};

export default ConditionalDashboard;

