import React from 'react';
import { FlaskConical } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SHELL_CLASSES } from '../../layout/shell';

/**
 * Banner shown when VITE_DEMO_MODE=true.
 * Indicates the app is running in demo mode for testing.
 */
const DemoModeBanner: React.FC = () => {
  const { isDemoMode } = useAuth();

  if (!isDemoMode) return null;

  return (
    <div
      className={`fixed left-0 right-0 z-[90] bg-amber-500 text-amber-950 text-center py-1.5 px-4 text-sm font-medium flex items-center justify-center gap-2 ${SHELL_CLASSES.fixedBannerOffset}`}
      role="banner"
      aria-label="Demo mode active"
    >
      <FlaskConical className="h-4 w-4 flex-shrink-0" />
      <span>Demo Mode — Sample data displayed. Full access for testing. Set VITE_DEMO_MODE=false for production.</span>
    </div>
  );
};

export default DemoModeBanner;
