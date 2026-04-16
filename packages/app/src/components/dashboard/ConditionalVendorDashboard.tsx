/**
 * Renders VendorRiskDashboard for authenticated users and VendorRiskDashboardDemo
 * for unauthenticated users. When the user comes from the website (e.g. vendorsoluce.com),
 * show full VendorRiskDashboard without requiring sign-in, same as the assessment page.
 */

import React, { Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFromWebsite } from '../../hooks/useFromWebsite';
import PageLoader from '../common/PageLoader';
import { lazyWithRetry } from '../../utils/lazyWithRetry';
import { config } from '../../utils/config';

const VendorRiskDashboard = lazyWithRetry(() => import('../../pages/workspace/VendorRiskDashboard'));
const VendorRiskDashboardDemo = lazyWithRetry(() => import('../../pages/workspace/VendorRiskDashboardDemo'));

const ConditionalVendorDashboard: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const fromWebsite = useFromWebsite();

  if (isLoading) {
    return <PageLoader />;
  }

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
      {showFullDashboard ? <VendorRiskDashboard /> : <VendorRiskDashboardDemo />}
    </Suspense>
  );
};

export default ConditionalVendorDashboard;
