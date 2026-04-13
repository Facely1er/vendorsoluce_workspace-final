import { Route, Routes, Navigate } from 'react-router-dom';
import { PR } from 'shared/constants/routes';
import { lazyWithRetry } from 'shared/utils/lazyWithRetry';

const VendorAssessmentPortal = lazyWithRetry(() => import('../pages/portal/VendorAssessmentPortal'));
const PortalHome = lazyWithRetry(() => import('../pages/portal/PortalHome'));
const PortalHowItWorks = lazyWithRetry(() => import('../pages/portal/PortalHowItWorks'));
const PortalForBuyers = lazyWithRetry(() => import('../pages/portal/PortalForBuyers'));
const PortalForVendors = lazyWithRetry(() => import('../pages/portal/PortalForVendors'));
const PortalSecurity = lazyWithRetry(() => import('../pages/portal/PortalSecurity'));
const PortalDemo = lazyWithRetry(() => import('../pages/portal/PortalDemo'));
const PortalFrameworks = lazyWithRetry(() => import('../pages/portal/PortalFrameworks'));

export function PortalRoutes() {
  return (
    <Routes>
      <Route path={PR.ASSESSMENT} element={<VendorAssessmentPortal />} />
      <Route path={PR.HOME} element={<PortalHome />} />
      <Route path={PR.HOW_IT_WORKS} element={<PortalHowItWorks />} />
      <Route path={PR.FOR_BUYERS} element={<PortalForBuyers />} />
      <Route path={PR.FOR_VENDORS} element={<PortalForVendors />} />
      <Route path={PR.SECURITY} element={<PortalSecurity />} />
      <Route path={PR.DEMO} element={<PortalDemo />} />
      <Route path={PR.FRAMEWORKS} element={<PortalFrameworks />} />
      <Route path={PR.VENDOR_PORTAL} element={<Navigate to={PR.HOME} replace />} />
      <Route path="*" element={<Navigate to={PR.HOME} replace />} />
    </Routes>
  );
}
