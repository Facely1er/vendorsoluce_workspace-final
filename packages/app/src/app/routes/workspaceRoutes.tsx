import React from 'react';
import { MR, WR } from 'shared/constants/routes';
import { Navigate, Route } from 'react-router-dom';
import { lazyWithRetry } from '../../utils/lazyWithRetry';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import PageLoader from '../../components/common/PageLoader';

function RouteWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-8 text-center">
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            Something went wrong loading this page.
          </p>
          <a href="/" className="text-vendorsoluce-green dark:text-vendorsoluce-light-green">
            Return to dashboard
          </a>
        </div>
      }
    >
      <React.Suspense fallback={<PageLoader />}>{children}</React.Suspense>
    </ErrorBoundary>
  );
}

const OnboardingPage = lazyWithRetry(() => import('../../pages/workspace/OnboardingPage'));
const PlatformSetupPage = lazyWithRetry(() => import('../../pages/workspace/PlatformSetupPage'));
const ProfilePage = lazyWithRetry(() => import('../../pages/workspace/ProfilePage'));
const AccountPage = lazyWithRetry(() => import('../../pages/workspace/AccountPage'));
const UserDashboard = lazyWithRetry(() => import('../../pages/workspace/UserDashboard'));
const UserActivity = lazyWithRetry(() => import('../../pages/workspace/UserActivity'));
const UserNotifications = lazyWithRetry(() => import('../../pages/workspace/UserNotifications'));
const BillingPage = lazyWithRetry(() =>
  import.meta.env.VITE_LICENSE_MODE === 'true'
    ? import('../../pages/public/LicensePage')
    : import('../../pages/workspace/BillingPage')
);
const AssetManagementPage = lazyWithRetry(() => import('../../pages/workspace/AssetManagementPage'));
const TeamRaciPage = lazyWithRetry(() => import('../../pages/workspace/team/TeamRaciPage'));
const StakeholderManagementPage = lazyWithRetry(() => import('../../pages/workspace/team/StakeholderManagementPage'));
const CollaborativeAssessmentPage = lazyWithRetry(() => import('../../pages/workspace/team/CollaborativeAssessmentPage'));
const VendorIntelligencePortfolioPage = lazyWithRetry(() => import('../../pages/workspace/vendorsoluce/VendorIntelligencePortfolioPage'));
const VendorIntelligenceImportPage = lazyWithRetry(() => import('../../pages/workspace/vendorsoluce/VendorIntelligenceImportPage'));
const VendorIntelligenceDetailPage = lazyWithRetry(() => import('../../pages/workspace/vendorsoluce/VendorIntelligenceDetailPage'));
const ComplianceRoadmapPage = lazyWithRetry(() => import('../../pages/workspace/ComplianceRoadmapPage'));
const VendorActivityCatalogPage = lazyWithRetry(() => import('../../pages/programs/VendorActivityCatalogPage'));

export const workspaceRoutes = (
  <>
    <Route
      path={WR.PLATFORM_SETUP}
      element={<RouteWrapper><PlatformSetupPage /></RouteWrapper>}
    />
    <Route
      path={WR.ONBOARDING}
      element={<RouteWrapper><OnboardingPage /></RouteWrapper>}
    />
    <Route
      path={WR.PROFILE}
      element={<RouteWrapper><ProfilePage /></RouteWrapper>}
    />
    <Route
      path={WR.BILLING}
      element={<RouteWrapper><BillingPage /></RouteWrapper>}
    />
    <Route
      path={WR.ACCOUNT}
      element={<RouteWrapper><AccountPage /></RouteWrapper>}
    />
    <Route
      path={WR.USER_DASHBOARD}
      element={<RouteWrapper><UserDashboard /></RouteWrapper>}
    />
    <Route
      path={WR.USER_ACTIVITY}
      element={<RouteWrapper><UserActivity /></RouteWrapper>}
    />
    <Route
      path={WR.NOTIFICATIONS}
      element={<RouteWrapper><UserNotifications /></RouteWrapper>}
    />
    <Route
      path={WR.ASSET_MANAGEMENT}
      element={<RouteWrapper><AssetManagementPage /></RouteWrapper>}
    />
    <Route path={WR.ASSETS_ALIAS} element={<RouteWrapper><Navigate to={WR.ASSET_MANAGEMENT} replace /></RouteWrapper>} />
    <Route
      path={WR.TEAM_COLLABORATE}
      element={<RouteWrapper><CollaborativeAssessmentPage /></RouteWrapper>}
    />
    <Route
      path={WR.TEAM_RACI}
      element={<RouteWrapper><TeamRaciPage /></RouteWrapper>}
    />
    <Route
      path={WR.TEAM_STAKEHOLDERS}
      element={<RouteWrapper><StakeholderManagementPage /></RouteWrapper>}
    />
    <Route
      path={WR.VENDOR_INTELLIGENCE}
      element={<RouteWrapper><VendorIntelligencePortfolioPage /></RouteWrapper>}
    />
    <Route
      path={WR.VENDOR_GRAPH_IMPORT}
      element={<RouteWrapper><VendorIntelligenceImportPage /></RouteWrapper>}
    />
    <Route
      path={WR.VENDOR_INTELLIGENCE_DETAIL}
      element={<RouteWrapper><VendorIntelligenceDetailPage /></RouteWrapper>}
    />
    <Route
      path={WR.COMPLIANCE_ROADMAP}
      element={<RouteWrapper><ComplianceRoadmapPage /></RouteWrapper>}
    />
    <Route path={MR.VENDOR_ACTIVITY_CATALOG} element={<RouteWrapper><VendorActivityCatalogPage /></RouteWrapper>} />
    {/* Program routes ungated in publicRoutes.tsx (external gate happens before workspace access). */}
  </>
);
