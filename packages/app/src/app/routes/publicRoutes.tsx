import React from 'react';
import { AR, MR } from 'shared/constants/routes';
import { Navigate, Route } from 'react-router-dom';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { lazyWithRetry } from '../../utils/lazyWithRetry';

const ResetPasswordPage = lazyWithRetry(() => import('../../pages/auth/ResetPasswordPage'));
const Pricing = lazyWithRetry(() =>
  import.meta.env.VITE_LICENSE_MODE === 'true'
    ? import('../../pages/public/ContactSalesPage')
    : import('../../pages/public/Pricing')
);
const Checkout = lazyWithRetry(() =>
  import.meta.env.VITE_LICENSE_MODE === 'true'
    ? import('../../pages/public/ContactSalesPage')
    : import('../../pages/public/Checkout')
);
const Contact = lazyWithRetry(() => import('../../pages/public/Contact'));
const Privacy = lazyWithRetry(() => import('../../pages/legal/Privacy'));
const AcceptableUsePolicy = lazyWithRetry(() => import('../../pages/legal/AcceptableUsePolicy'));
const CookiePolicy = lazyWithRetry(() => import('../../pages/legal/CookiePolicy'));
const MasterPrivacyPolicy = lazyWithRetry(() => import('../../pages/legal/MasterPrivacyPolicy'));
const MasterTermsOfService = lazyWithRetry(() => import('../../pages/legal/MasterTermsOfService'));
const Templates = lazyWithRetry(() => import('../../pages/public/Templates'));
const DownloadsPage = lazyWithRetry(() => import('../../pages/public/DownloadsPage'));
const HowItWorks = lazyWithRetry(() => import('../../pages/public/HowItWorks'));
const APIDocumentation = lazyWithRetry(() => import('../../pages/public/APIDocumentation'));
const IntegrationGuides = lazyWithRetry(() => import('../../pages/public/IntegrationGuides'));
const HostingOptionsPage = lazyWithRetry(() => import('../../pages/public/HostingOptionsPage'));
const NISTChecklist = lazyWithRetry(() => import('../../pages/tools/NISTChecklist'));
const VendorRiskRadar = lazyWithRetry(() => import('../../pages/tools/VendorRiskRadar'));
const VendorRiskCalculator = lazyWithRetry(() => import('../../pages/tools/VendorRiskCalculator'));
const DemoPage = lazyWithRetry(() => import('../../pages/public/DemoPage'));
const TrialPage = lazyWithRetry(() => import('../../pages/public/TrialPage'));
const VendorSecurityAssessments = lazyWithRetry(() => import('../../pages/workspace/VendorSecurityAssessments'));
const VendorManagementPage = lazyWithRetry(() => import('../../pages/workspace/VendorManagementPage'));
const VendorRequirementsDefinition = lazyWithRetry(() => import('../../pages/workspace/VendorRequirementsDefinition'));
const TemplatePreviewPage = lazyWithRetry(() => import('../../pages/public/TemplatePreviewPage'));
const DashboardDemoPage = lazyWithRetry(() => import('../../pages/public/DashboardDemoPage'));
const VendorPrivacyAssessment = lazyWithRetry(() => import('../../pages/tools/VendorPrivacyAssessment'));
const DpiaGenerator = lazyWithRetry(() => import('../../pages/tools/DpiaGenerator'));
const DataInventory = lazyWithRetry(() => import('../../pages/tools/DataInventory'));
const VendorActivityCatalogPage = lazyWithRetry(() => import('../../pages/programs/VendorActivityCatalogPage'));
const NistImplementationWorkflowPage = lazyWithRetry(() => import('../../pages/programs/NistImplementationWorkflowPage'));
const ViraDueDiligenceWorkflowPage = lazyWithRetry(() => import('../../pages/programs/ViraDueDiligenceWorkflowPage'));
const ViraReportsPage = lazyWithRetry(() => import('../../pages/programs/ViraReportsPage'));
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

export function VendorAssessmentPortalRedirect() {
  const id = window.location.pathname.split('/').pop();
  const portalBase = import.meta.env.VITE_PORTAL_URL || 'https://www.portal.vendorsoluce.com';
  React.useEffect(() => {
    if (id) window.location.replace(`${portalBase}/vendor-assessments/${id}`);
  }, [id, portalBase]);
  return null;
}

export function PublicRoutes() {
  return (
    <>
      <Route path={MR.HOME} element={<ConditionalDashboard />} />
      <Route path={MR.DASHBOARD} element={<ConditionalDashboard />} />
      <Route path={AR.RESET_PASSWORD} element={<ResetPasswordPage />} />
      <Route path="/careers" element={<Navigate to={MR.CONTACT} replace />} />
      <Route path={MR.PRICING} element={<Pricing />} />
      <Route path={MR.CHECKOUT} element={<Checkout />} />
      <Route path={MR.CONTACT} element={<Contact />} />
      <Route path={MR.PRIVACY} element={<Privacy />} />
      <Route path={MR.ACCEPTABLE_USE_POLICY} element={<AcceptableUsePolicy />} />
      <Route path={MR.COOKIE_POLICY} element={<CookiePolicy />} />
      <Route path={MR.MASTER_PRIVACY_POLICY} element={<MasterPrivacyPolicy />} />
      <Route path={MR.MASTER_TERMS_OF_SERVICE} element={<MasterTermsOfService />} />
      <Route path={MR.DOWNLOAD} element={<DownloadsPage />} />
      <Route path={MR.TEMPLATES} element={<Templates />} />
      <Route path={MR.TEMPLATE_PREVIEW} element={<TemplatePreviewPage />} />
      <Route path={MR.HOW_IT_WORKS} element={<HowItWorks />} />
      <Route path="/tutorial" element={<Navigate to={MR.HOW_IT_WORKS} replace />} />
      <Route path="/toolkit" element={<Navigate to={MR.HOME} replace />} />
      <Route path={MR.VENDOR_ACTIVITY_CATALOG} element={<VendorActivityCatalogPage />} />
      <Route path={MR.PROGRAM_NIST_IMPLEMENTATION} element={<NistImplementationWorkflowPage />} />
      <Route path={MR.PROGRAM_VIRA_DUE_DILIGENCE} element={<ViraDueDiligenceWorkflowPage />} />
      <Route path={MR.VIRA_REPORTS} element={<ViraReportsPage />} />
      <Route path={MR.API_DOCS} element={<APIDocumentation />} />
      <Route path={MR.INTEGRATION_GUIDES} element={<IntegrationGuides />} />
      <Route path={MR.HOSTING_OPTIONS} element={<HostingOptionsPage />} />
      <Route path={MR.DEMO} element={<DemoPage />} />
      <Route path={MR.TRIAL} element={<TrialPage />} />
      <Route path={MR.VENDOR_RISK_RADAR} element={<VendorRiskRadar />} />
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
        element={<ProtectedRoute><VendorManagementPage /></ProtectedRoute>}
      />
      <Route
        path={MR.ADMIN_MARKETING}
        element={<ProtectedRoute><MarketingAdminPage /></ProtectedRoute>}
      />
      <Route
        path={MR.ADMIN_MARKETING_NEW_CAMPAIGN}
        element={<ProtectedRoute><CreateCampaignPage /></ProtectedRoute>}
      />
      <Route path={MR.DASHBOARD_DEMO} element={<DashboardDemoPage />} />
      <Route path={MR.VENDOR_ASSESSMENTS} element={<VendorSecurityAssessments />} />
      <Route path={MR.VENDOR_PORTAL} element={<Navigate to={import.meta.env.VITE_PORTAL_URL || 'https://www.portal.vendorsoluce.com'} replace />} />
      <Route path="/vendor-assessments/:id" element={<VendorAssessmentPortalRedirect />} />
    </>
  );
}
