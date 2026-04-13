import React from 'react';
import { MR, WR } from 'shared/constants/routes';
import { Navigate, Route } from 'react-router-dom';
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
const ComplianceRoadmapPage = lazyWithRetry(() => import('../../pages/workspace/ComplianceRoadmapPage'));
const VendorActivityCatalogPage = lazyWithRetry(() => import('../../pages/programs/VendorActivityCatalogPage'));

export const workspaceRoutes = (
  <>
    <Route
      path={WR.PLATFORM_SETUP}
      element={<PlatformSetupPage />}
    />
    <Route
      path={WR.ONBOARDING}
      element={<OnboardingPage />}
    />
    <Route
      path={WR.PROFILE}
      element={<ProfilePage />}
    />
    <Route
      path={WR.BILLING}
      element={<BillingPage />}
    />
    <Route
      path={WR.ACCOUNT}
      element={<AccountPage />}
    />
    <Route
      path={WR.USER_DASHBOARD}
      element={<UserDashboard />}
    />
    <Route
      path={WR.USER_ACTIVITY}
      element={<UserActivity />}
    />
    <Route
      path={WR.NOTIFICATIONS}
      element={<UserNotifications />}
    />
    <Route
      path={WR.ASSET_MANAGEMENT}
      element={<AssetManagementPage />}
    />
    <Route path={WR.ASSETS_ALIAS} element={<Navigate to={WR.ASSET_MANAGEMENT} replace />} />
    <Route
      path={WR.TEAM_COLLABORATE}
      element={<CollaborativeAssessmentPage />}
    />
    <Route
      path={WR.TEAM_RACI}
      element={<TeamRaciPage />}
    />
    <Route
      path={WR.TEAM_STAKEHOLDERS}
      element={<StakeholderManagementPage />}
    />
    <Route
      path={WR.VENDOR_INTELLIGENCE}
      element={<VendorIntelligencePortfolioPage />}
    />
    <Route
      path={WR.VENDOR_GRAPH_IMPORT}
      element={<VendorIntelligenceImportPage />}
    />
    <Route
      path={WR.VENDOR_INTELLIGENCE_DETAIL}
      element={<VendorIntelligenceDetailPage />}
    />
    <Route
      path={WR.COMPLIANCE_ROADMAP}
      element={<ComplianceRoadmapPage />}
    />
    <Route path={MR.VENDOR_ACTIVITY_CATALOG} element={<VendorActivityCatalogPage />} />
    {/* Program routes ungated in publicRoutes.tsx (external gate happens before workspace access). */}
  </>
);
