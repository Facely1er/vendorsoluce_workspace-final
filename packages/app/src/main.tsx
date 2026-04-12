import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { initSentry } from './utils/sentry';
import { validateProductionEnvironment } from './utils/environmentValidator';
import { isVendorPortalDomain } from './utils/domainDetection';

// Validate environment configuration
validateProductionEnvironment();

// Initialize Sentry error tracking
initSentry();

// Initialize performance monitoring
if (import.meta.env.PROD) {
  import('./hooks/usePerformanceMonitoring').then(() => {
    // Performance monitoring will be initialized when components mount
  });
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

// Boot PortalApp on the vendor portal domain; platform App everywhere else.
// Both are bundled in the same build so no separate Netlify config is needed.
// Local dev: set VITE_FORCE_PORTAL=true to test the portal on localhost.
if (isVendorPortalDomain()) {
  import('./PortalApp').then(({ default: PortalApp }) => {
    createRoot(rootElement).render(
      <StrictMode>
        <PortalApp />
      </StrictMode>
    );
  });
} else {
  import('./App').then(({ default: App }) => {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  });
}