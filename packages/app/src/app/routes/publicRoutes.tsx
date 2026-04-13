import React from 'react';
import { AR, MR } from 'shared/constants/routes';
import { Navigate, Route } from 'react-router-dom';
import { lazyWithRetry } from '../../utils/lazyWithRetry';
import { config } from '../../utils/config';

const ResetPasswordPage = lazyWithRetry(() => import('../../pages/auth/ResetPasswordPage'));
const VendorActivityCatalogPage = lazyWithRetry(() => import('../../pages/programs/VendorActivityCatalogPage'));
const NistImplementationWorkflowPage = lazyWithRetry(() => import('../../pages/programs/NistImplementationWorkflowPage'));
const ViraDueDiligenceWorkflowPage = lazyWithRetry(() => import('../../pages/programs/ViraDueDiligenceWorkflowPage'));
const ViraReportsPage = lazyWithRetry(() => import('../../pages/programs/ViraReportsPage'));
const NISTChecklist = lazyWithRetry(() => import('../../pages/tools/NISTChecklist'));
const VendorRiskRadar = lazyWithRetry(() => import('../../pages/tools/VendorRiskRadar'));
const VendorRiskReports = lazyWithRetry(() => import('../../pages/tools/VendorRiskReports'));
const VendorRiskCalculator = lazyWithRetry(() => import('../../pages/tools/VendorRiskCalculator'));
const VendorSecurityAssessments = lazyWithRetry(() => import('../../pages/workspace/VendorSecurityAssessments'));
const VendorManagementPage = lazyWithRetry(() => import('../../pages/workspace/VendorManagementPage'));
const VendorRequirementsDefinition = lazyWithRetry(() => import('../../pages/workspace/VendorRequirementsDefinition'));
const DashboardDemoPage = lazyWithRetry(() => import('../../pages/public/DashboardDemoPage'));
const VendorPrivacyAssessment = lazyWithRetry(() => import('../../pages/tools/VendorPrivacyAssessment'));
const DpiaGenerator = lazyWithRetry(() => import('../../pages/tools/DpiaGenerator'));
const DataInventory = lazyWithRetry(() => import('../../pages/tools/DataInventory'));
const SupplyChainAssessment = lazyWithRetry(() => import('../../pages/assessments/SupplyChainAssessment'));
const SupplyChainResults = lazyWithRetry(() => import('../../pages/assessments/SupplyChainResults'));
const SupplyChainRecommendations = lazyWithRetry(() => import('../../pages/assessments/SupplyChainRecommendations'));
const FedRampAssessment = lazyWithRetry(() => import('../../pages/assessments/FedRampAssessment'));
const FedRampResults = lazyWithRetry(() => import('../../pages/assessments/FedRampResults'));
const VendorOnboardingPage = lazyWithRetry(() => import('../../pages/workspace/VendorOnboardingPage'));
const MarketingAdminPage = lazyWithRetry(() => import('../../pages/admin/MarketingAdminPage'));
const CreateCampaignPage = lazyWithRetry(() => import('../../pages/admin/CreateCampaignPage'));
const ConditionalDashboard = lazyWithRetry(() => import('../../components/dashboard/ConditionalDashboard'));
const ConditionalVendorDashboard = lazyWithRetry(() => import('../../components/dashboard/ConditionalVendorDashboard'));

function WebsiteRedirect({ to }: { to: string }) {
  React.useEffect(() => {
    const base = String(config.app.websiteUrl || '').replace(/\/$/, '');
    const dest = `${base}${to.startsWith('/') ? to : `/${to}`}`;
    window.location.replace(dest);
  }, [to]);
  return null;
}

export function VendorAssessmentPortalRedirect() {
  const id = window.location.pathname.split('/').pop();
  const portalBase = import.meta.env.VITE_PORTAL_URL || 'https://www.portal.vendorsoluce.com';
  React.useEffect(() => {
    if (id) window.location.replace(`${portalBase}/vendor-assessments/${id}`);
  }, [id, portalBase]);
  return null;
}

export const publicRoutes = (
  <>
    <Route path={MR.HOME} element={<ConditionalDashboard />} />
      <Route path={MR.DASHBOARD} element={<ConditionalDashboard />} />
      <Route path={AR.RESET_PASSWORD} element={<ResetPasswordPage />} />
      {/* Option A: marketing + legal live on the website deployment (www.vendorsoluce.com). */}
      <Route path="/careers" element={<WebsiteRedirect to={MR.CONTACT} />} />
      <Route path={MR.PRICING} element={<WebsiteRedirect to={MR.PRICING} />} />
      <Route path={MR.CHECKOUT} element={<WebsiteRedirect to={MR.CHECKOUT} />} />
      <Route path={MR.CONTACT} element={<WebsiteRedirect to={MR.CONTACT} />} />
      <Route path={MR.PRIVACY} element={<WebsiteRedirect to={MR.PRIVACY} />} />
      <Route path={MR.ACCEPTABLE_USE_POLICY} element={<WebsiteRedirect to={MR.ACCEPTABLE_USE_POLICY} />} />
      <Route path={MR.COOKIE_POLICY} element={<WebsiteRedirect to={MR.COOKIE_POLICY} />} />
      <Route path={MR.MASTER_PRIVACY_POLICY} element={<WebsiteRedirect to={MR.MASTER_PRIVACY_POLICY} />} />
      <Route path={MR.MASTER_TERMS_OF_SERVICE} element={<WebsiteRedirect to={MR.MASTER_TERMS_OF_SERVICE} />} />
      <Route path={MR.DOWNLOAD} element={<WebsiteRedirect to={MR.DOWNLOAD} />} />
      <Route path={MR.TEMPLATES} element={<WebsiteRedirect to={MR.TEMPLATES} />} />
      <Route path={MR.TEMPLATE_PREVIEW} element={<WebsiteRedirect to={MR.TEMPLATE_PREVIEW} />} />
      <Route path={MR.HOW_IT_WORKS} element={<WebsiteRedirect to={MR.HOW_IT_WORKS} />} />
      <Route path="/tutorial" element={<WebsiteRedirect to={MR.HOW_IT_WORKS} />} />
      <Route path="/toolkit" element={<WebsiteRedirect to={MR.HOME} />} />
      <Route path={MR.VENDOR_ACTIVITY_CATALOG} element={<VendorActivityCatalogPage />} />
      <Route path={MR.PROGRAM_NIST_IMPLEMENTATION} element={<NistImplementationWorkflowPage />} />
      <Route path={MR.PROGRAM_VIRA_DUE_DILIGENCE} element={<ViraDueDiligenceWorkflowPage />} />
      <Route path={MR.VIRA_REPORTS} element={<ViraReportsPage />} />
      <Route path={MR.API_DOCS} element={<WebsiteRedirect to={MR.API_DOCS} />} />
      <Route path={MR.INTEGRATION_GUIDES} element={<WebsiteRedirect to={MR.INTEGRATION_GUIDES} />} />
      <Route path={MR.HOSTING_OPTIONS} element={<WebsiteRedirect to={MR.HOSTING_OPTIONS} />} />
      <Route path={MR.DEMO} element={<WebsiteRedirect to={MR.DEMO} />} />
      <Route path={MR.TRIAL} element={<WebsiteRedirect to={MR.TRIAL} />} />
      <Route path={MR.VENDOR_RISK_RADAR} element={<VendorRiskRadar />} />
      <Route path={MR.VENDOR_RISK_REPORTS} element={<VendorRiskReports />} />
      <Route path="/vendors/radar" element={<Navigate to={MR.VENDOR_RISK_RADAR} replace />} />
      <Route path="/tools/vendor-risk-radar" element={<Navigate to={MR.VENDOR_RISK_RADAR} replace />} />
      <Route path={MR.NIST_CHECKLIST} element={<NISTChecklist />} />
      <Route path="/tools/sbom-quick-scan" element={<Navigate to={MR.NIST_CHECKLIST} replace />} />
      <Route path={MR.VENDOR_RISK_CALCULATOR} element={<VendorRiskCalculator />} />
      <Route path="/tools/vendor-iq" element={<Navigate to={MR.VENDOR_RISK_RADAR} replace />} />
      <Route path={MR.VENDOR_PRIVACY_ASSESSMENT} element={<VendorPrivacyAssessment />} />
      <Route path={MR.DPIA} element={<DpiaGenerator />} />
      <Route path={MR.DATA_INVENTORY} element={<DataInventory />} />
      <Route path={MR.SUPPLY_CHAIN_ASSESSMENT} element={<SupplyChainAssessment />} />
      <Route path={MR.SUPPLY_CHAIN_RESULTS} element={<SupplyChainResults />} />
      <Route path={MR.SUPPLY_CHAIN_RECOMMENDATIONS} element={<SupplyChainRecommendations />} />
      <Route path={MR.FEDRAMP_ASSESSMENT} element={<FedRampAssessment />} />
      <Route path={MR.FEDRAMP_RESULTS} element={<FedRampResults />} />
      <Route path={MR.VENDOR_REQUIREMENTS} element={<VendorRequirementsDefinition />} />
      <Route path="/sbom-analyzer" element={<Navigate to={MR.NIST_CHECKLIST} replace />} />
      <Route path="/sbom-analysis/:id" element={<Navigate to={MR.VENDORS} replace />} />
      <Route path={MR.VENDORS} element={<ConditionalVendorDashboard />} />
      <Route path="/vendor-risk-dashboard" element={<Navigate to={MR.VENDORS} replace />} />
      <Route path={MR.VENDOR_ONBOARDING} element={<VendorOnboardingPage />} />
      <Route
        path={MR.ADMIN_VENDORS}
        element={<VendorManagementPage />}
      />
      <Route
        path={MR.ADMIN_MARKETING}
        element={<MarketingAdminPage />}
      />
      <Route
        path={MR.ADMIN_MARKETING_NEW_CAMPAIGN}
        element={<CreateCampaignPage />}
      />
      <Route path={MR.DASHBOARD_DEMO} element={<DashboardDemoPage />} />
      <Route path={MR.VENDOR_ASSESSMENTS} element={<VendorSecurityAssessments />} />
      <Route path={MR.VENDOR_PORTAL} element={<Navigate to={import.meta.env.VITE_PORTAL_URL || 'https://www.portal.vendorsoluce.com'} replace />} />
      <Route path="/vendor-assessments/:id" element={<VendorAssessmentPortalRedirect />} />
  </>
);
