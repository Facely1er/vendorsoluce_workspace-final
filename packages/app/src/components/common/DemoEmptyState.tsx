import React from 'react';
import { FlaskConical } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface DemoEmptyStateProps {
  /** True when the list/section is empty */
  isEmpty: boolean;
  /** Message when in demo mode and isEmpty */
  demoMessage?: string;
  /** Standard empty state content (shown when not demo mode, or when demo mode but not empty) */
  children: React.ReactNode;
}

/**
 * Renders children (standard empty state) unless in demo mode AND empty,
 * in which case shows a demo-specific message to avoid confusion with real empty states.
 */
export const DemoEmptyState: React.FC<DemoEmptyStateProps> = ({
  isEmpty,
  demoMessage = 'Sample data not available for this section. This is demo mode.',
  children,
}) => {
  const { isDemoMode } = useAuth();

  if (!isDemoMode || !isEmpty) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <FlaskConical className="h-12 w-12 text-amber-500 mb-3" />
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{demoMessage}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">VITE_DEMO_MODE is enabled</p>
    </div>
  );
};
