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

  // Full workspace after sign-in, marketing handoff (?from=website), or demo/local session (auth context provides a session).
  // Otherwise show the structured preview landing (sample metrics, CTAs) without personalized dashboard chrome.
  const showFullDashboard = isAuthenticated || fromWebsite;
  return (
    <Suspense fallback={<PageLoader />}>
      {showFullDashboard ? <DashboardPage /> : <DashboardDemoPage />}
    </Suspense>
  );
};

export default ConditionalDashboard;

