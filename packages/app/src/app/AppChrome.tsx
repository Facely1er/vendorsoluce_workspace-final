import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import NotificationManager from '../components/common/NotificationManager';
import Navbar from '../components/layout/Navbar';
import { MainWrapper } from '../components/layout/MainWrapper';
import DemoModeBanner from '../components/common/DemoModeBanner';
import TrialModeBanner from '../components/common/TrialModeBanner';
import ChatWidget from '../components/chatbot/ChatWidget';
import CommandPalette from '../components/common/CommandPalette';
import AppTour from '../components/onboarding/AppTour';
import { useAuth } from '../context/AuthContext';

const vercelAnalyticsFlag = import.meta.env.VITE_VERCEL_ANALYTICS;
const isVercelRuntime =
  import.meta.env.VERCEL === '1' ||
  (typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app'));
const enableVercelAnalytics =
  vercelAnalyticsFlag === 'true' || (vercelAnalyticsFlag !== 'false' && isVercelRuntime);

interface AppChromeProps {
  children: ReactNode;
}

const TOUR_SESSION_KEY = 'vs_app_tour_auto_started';

export default function AppChrome({ children }: AppChromeProps) {
  const { isAuthenticated, profile, startTour, markTourComplete, isTourRunning, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const tourTimerRef = useRef<number | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    if (!isTourRunning) return;
    const path = location.pathname;
    if (path !== '/' && path !== '/dashboard') {
      navigate('/dashboard', { replace: true });
    }
  }, [isTourRunning, location.pathname, navigate]);

  useEffect(() => {
    if (isLoading || !isAuthenticated || profile?.tour_completed) return;
    const path = location.pathname;
    if (path !== '/' && path !== '/dashboard') return;
    try {
      if (sessionStorage.getItem(TOUR_SESSION_KEY) === '1') return;
    } catch {
      /* ignore */
    }
    tourTimerRef.current = window.setTimeout(() => {
      tourTimerRef.current = null;
      try {
        if (sessionStorage.getItem(TOUR_SESSION_KEY) === '1') return;
        sessionStorage.setItem(TOUR_SESSION_KEY, '1');
      } catch {
        /* ignore */
      }
      startTour();
    }, 1400);
    return () => {
      if (tourTimerRef.current !== null) {
        window.clearTimeout(tourTimerRef.current);
        tourTimerRef.current = null;
      }
    };
  }, [isLoading, isAuthenticated, profile?.tour_completed, location.pathname, startTour]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col max-w-[100vw] min-w-0 overflow-x-hidden">
      <NotificationManager />
      <DemoModeBanner />
      <TrialModeBanner />
      <Navbar />
      <MainWrapper>{children}</MainWrapper>
      <ChatWidget />
      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
      <AppTour
        isRunning={isTourRunning}
        onComplete={() => {
          void markTourComplete();
        }}
        onSkip={() => {
          void markTourComplete();
        }}
      />
      {enableVercelAnalytics && <Analytics />}
    </div>
  );
}
