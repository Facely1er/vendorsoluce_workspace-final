import React from 'react';
import { WR } from 'shared/constants/routes';
import { Navigate, Route } from 'react-router-dom';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { lazyWithRetry } from '../../utils/lazyWithRetry';

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

export function WorkspaceRoutes() {
  return (
    <>
      <Route path={WR.PLATFORM_SETUP} element={<ProtectedRoute><PlatformSetupPage /></ProtectedRoute>} />
      <Route path={WR.ONBOARDING} element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
      <Route path={WR.PROFILE} element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path={WR.BILLING} element={<ProtectedRoute><BillingPage /></ProtectedRoute>} />
      <Route path={WR.ACCOUNT} element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
      <Route path={WR.USER_DASHBOARD} element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
      <Route path={WR.USER_ACTIVITY} element={<ProtectedRoute><UserActivity /></ProtectedRoute>} />
      <Route path={WR.NOTIFICATIONS} element={<ProtectedRoute><UserNotifications /></ProtectedRoute>} />
      <Route path={WR.ASSET_MANAGEMENT} element={<ProtectedRoute><AssetManagementPage /></ProtectedRoute>} />
      <Route path={WR.ASSETS_ALIAS} element={<Navigate to={WR.ASSET_MANAGEMENT} replace />} />
      <Route path={WR.TEAM_COLLABORATE} element={<ProtectedRoute><CollaborativeAssessmentPage /></ProtectedRoute>} />
      <Route path={WR.TEAM_RACI} element={<ProtectedRoute><TeamRaciPage /></ProtectedRoute>} />
      <Route path={WR.TEAM_STAKEHOLDERS} element={<ProtectedRoute><StakeholderManagementPage /></ProtectedRoute>} />
      <Route path={WR.VENDOR_INTELLIGENCE} element={<ProtectedRoute><VendorIntelligencePortfolioPage /></ProtectedRoute>} />
      <Route path={WR.VENDOR_GRAPH_IMPORT} element={<ProtectedRoute><VendorIntelligenceImportPage /></ProtectedRoute>} />
      <Route path={WR.VENDOR_INTELLIGENCE_DETAIL} element={<ProtectedRoute><VendorIntelligenceDetailPage /></ProtectedRoute>} />
    </>
  );
}
