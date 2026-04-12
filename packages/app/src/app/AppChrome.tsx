import type { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/react';
import NotificationManager from '../components/common/NotificationManager';
import Navbar from '../components/layout/Navbar';
import { MainWrapper } from '../components/layout/MainWrapper';
import Footer from '../components/layout/Footer';
import DemoModeBanner from '../components/common/DemoModeBanner';
import TrialModeBanner from '../components/common/TrialModeBanner';
import ChatWidget from '../components/chatbot/ChatWidget';

const vercelAnalyticsFlag = import.meta.env.VITE_VERCEL_ANALYTICS;
const isVercelRuntime =
  import.meta.env.VERCEL === '1' ||
  (typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app'));
const enableVercelAnalytics =
  vercelAnalyticsFlag === 'true' || (vercelAnalyticsFlag !== 'false' && isVercelRuntime);

interface AppChromeProps {
  children: ReactNode;
}

export default function AppChrome({ children }: AppChromeProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col max-w-[100vw] min-w-0 overflow-x-hidden">
      <NotificationManager />
      <DemoModeBanner />
      <TrialModeBanner />
      <Navbar />
      <MainWrapper>{children}</MainWrapper>
      <Footer />
      <ChatWidget />
      {enableVercelAnalytics && <Analytics />}
    </div>
  );
}
