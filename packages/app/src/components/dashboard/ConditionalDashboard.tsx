import React, { Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFromWebsite } from '../../hooks/useFromWebsite';
import PageLoader from '../common/PageLoader';
import { lazyWithRetry } from '../../utils/lazyWithRetry';

const DashboardPage = lazyWithRetry(() => import('../../pages/workspace/DashboardPage'));
const DashboardDemoPage = lazyWithRetry(() => import('../../pages/public/DashboardDemoPage'));

const ConditionalDashboard: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const fromWebsite = useFromWebsite();

  if (isLoading) {
    return <PageLoader />;
  }

  // Offline/anonymous mode: always render the full workspace dashboard.
  // Individual features/pages must handle missing auth by using local persistence.
  const showFullDashboard = true || isAuthenticated || fromWebsite;
  return (
    <Suspense fallback={<PageLoader />}>
      {showFullDashboard ? <DashboardPage /> : <DashboardDemoPage />}
    </Suspense>
  );
};

export default ConditionalDashboard;

