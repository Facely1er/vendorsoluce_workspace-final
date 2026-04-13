import { Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import PageLoader from 'shared/components/common/PageLoader';
import PortalChrome from './app/PortalChrome';
import PortalProviders from './app/PortalProviders';
import { PortalRoutes } from './routes/portalRoutes';

export default function PortalApp() {
  return (
    <PortalProviders>
      <Router>
        <PortalChrome>
          <Suspense fallback={<PageLoader />}>
            <PortalRoutes />
          </Suspense>
        </PortalChrome>
      </Router>
    </PortalProviders>
  );
}
