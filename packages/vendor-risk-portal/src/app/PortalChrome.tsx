import type { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/react';
import PortalNav from 'shared/components/portal/PortalNav';
import PortalFooter from 'shared/components/portal/PortalFooter';
import { SHELL_CLASSES } from '../shell';

const vercelAnalyticsFlag = import.meta.env.VITE_VERCEL_ANALYTICS;
const isVercelRuntime =
  import.meta.env.VERCEL === '1' ||
  (typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app'));
const enableVercelAnalytics =
  vercelAnalyticsFlag === 'true' || (vercelAnalyticsFlag !== 'false' && isVercelRuntime);

interface PortalChromeProps {
  children: ReactNode;
}

export default function PortalChrome({ children }: PortalChromeProps) {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  const isAssessment = /^\/vendor-assessments\/.+/.test(path);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col max-w-[100vw] overflow-x-hidden">
      {isAssessment ? (
        children
      ) : (
        <>
          <PortalNav />
          <main className={`flex-1 ${SHELL_CLASSES.pageTopOffset}`}>{children}</main>
          <PortalFooter />
        </>
      )}
      {enableVercelAnalytics && <Analytics />}
    </div>
  );
}
