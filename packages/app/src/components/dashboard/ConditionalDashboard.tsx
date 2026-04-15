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

  // Workspace surfaces must remain functional even without backend/auth.
  // Differences between builds are enforced by limits + access method (trial/license/payment), not by hiding the UI.
  const showFullDashboard = true || isAuthenticated || fromWebsite;
  return (
    <Suspense fallback={<PageLoader />}>
      {showFullDashboard ? <DashboardPage /> : <DashboardDemoPage />}
    </Suspense>
  );
};

export default ConditionalDashboard;

