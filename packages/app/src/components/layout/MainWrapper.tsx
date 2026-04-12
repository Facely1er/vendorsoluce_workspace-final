import React from 'react';
import { useSubscription } from '../../context/SubscriptionContext';
import { config } from '../../utils/config';
import WorkspaceSidebar from './WorkspaceSidebar';
import { SHELL_CLASSES } from '../../layout/shell';

/** Applies correct top padding when demo or trial banner is visible.
 *  On desktop (lg+) renders a workspace layout with a fixed-width sidebar.
 */
export const MainWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isTrial } = useSubscription();
  const needsExtraPadding = config.app.demoMode || isTrial;
  const topPad = needsExtraPadding
    ? SHELL_CLASSES.pageTopOffsetWithBanner
    : SHELL_CLASSES.pageTopOffset;

  return (
    <div className={`flex flex-1 min-w-0 w-full min-h-screen ${topPad}`}>
      {/* Sidebar: visible lg+ only */}
      <div className={`hidden lg:block w-56 xl:w-60 flex-shrink-0 sticky self-start overflow-y-auto ${SHELL_CLASSES.stickyHeaderOffset} ${SHELL_CLASSES.sidebarHeight}`}>
        <WorkspaceSidebar className="h-full" />
      </div>
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
};
