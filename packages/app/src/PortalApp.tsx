/**
 * Vendor Risk Portal – standalone entry.
 * Used by the vendor-risk-portal package for integrated and standalone deployments.
 * Serves all portal public pages (home, how-it-works, for-buyers, for-vendors, security, demo)
 * plus the vendor assessment workflow.
 */
import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { I18nProvider } from './context/I18nContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import NotificationManager from './components/common/NotificationManager';
import PageLoader from './components/common/PageLoader';
import PortalNav from './components/portal/PortalNav';
import PortalFooter from './components/portal/PortalFooter';
import { Analytics } from '@vercel/analytics/react';

/** Only load Vercel Analytics when deployed on Vercel. On Netlify, /_vercel/insights/script.js 404s (HTML), causing MIME type errors. */
const vercelAnalyticsFlag = import.meta.env.VITE_VERCEL_ANALYTICS;
const isVercelRuntime =
  import.meta.env.VERCEL === '1' ||
  (typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app'));
const enableVercelAnalytics =
  vercelAnalyticsFlag === 'true' || (vercelAnalyticsFlag !== 'false' && isVercelRuntime);
import { lazyWithRetry } from './utils/lazyWithRetry';
import { SHELL_CLASSES } from './layout/shell';

const VendorAssessmentPortal = lazyWithRetry(() => import('./pages/portal/VendorAssessmentPortal'));

// Portal public pages
const PortalHome = lazyWithRetry(() => import('./pages/portal/PortalHome'));
const PortalHowItWorks = lazyWithRetry(() => import('./pages/portal/PortalHowItWorks'));
const PortalForBuyers = lazyWithRetry(() => import('./pages/portal/PortalForBuyers'));
const PortalForVendors = lazyWithRetry(() => import('./pages/portal/PortalForVendors'));
const PortalSecurity = lazyWithRetry(() => import('./pages/portal/PortalSecurity'));
const PortalDemo = lazyWithRetry(() => import('./pages/portal/PortalDemo'));
const PortalFrameworks = lazyWithRetry(() => import('./pages/portal/PortalFrameworks'));

function PortalApp() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <Router>
          <ErrorBoundary>
            <AuthProvider>
              <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col max-w-[100vw] overflow-x-hidden">
                <NotificationManager />
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Vendor assessment — no portal nav (full-screen flow) */}
                    <Route path="/vendor-assessments/:id" element={<VendorAssessmentPortal />} />

                    {/* Portal public pages — with nav + footer */}
                    <Route
                      path="*"
                      element={
                        <div className="flex flex-col min-h-screen">
                          <PortalNav />
                          <main className={`flex-1 ${SHELL_CLASSES.pageTopOffset}`}>
                            <Routes>
                              <Route path="/" element={<PortalHome />} />
                              <Route path="/how-it-works" element={<PortalHowItWorks />} />
                              <Route path="/for-buyers" element={<PortalForBuyers />} />
                              <Route path="/for-vendors" element={<PortalForVendors />} />
                              <Route path="/security" element={<PortalSecurity />} />
                              <Route path="/demo" element={<PortalDemo />} />
                              <Route path="/frameworks" element={<PortalFrameworks />} />
                              {/* Legacy redirect */}
                              <Route path="/vendor-portal" element={<Navigate to="/" replace />} />
                              <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                          </main>
                          <PortalFooter />
                        </div>
                      }
                    />
                  </Routes>
                </Suspense>
                {enableVercelAnalytics && <Analytics />}
              </div>
            </AuthProvider>
          </ErrorBoundary>
        </Router>
      </ThemeProvider>
    </I18nProvider>
  );
}

export default PortalApp;
