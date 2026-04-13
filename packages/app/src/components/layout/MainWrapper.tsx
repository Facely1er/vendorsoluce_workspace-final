import React, { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { isWorkspaceAppPath } from 'shared/constants/routes';
import { useSubscription } from '../../context/SubscriptionContext';
import { config } from '../../utils/config';
import WorkspaceSidebar from './WorkspaceSidebar';
import Footer from './Footer';
import { SHELL_CLASSES } from '../../layout/shell';

const SIDEBAR_EXPANDED_KEY = 'vs_workspace_sidebar_expanded';

function readSidebarExpanded(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_EXPANDED_KEY) !== '0';
  } catch {
    return true;
  }
}

/** Applies correct top padding when demo or trial banner is visible.
 *  On desktop (lg+) renders a workspace layout with a fixed-width sidebar.
 */
export const MainWrapper: React.FC<{
  children: React.ReactNode;
  mobileNavOpen?: boolean;
  onMobileNavOpenChange?: (open: boolean) => void;
}> = ({ children, mobileNavOpen = false, onMobileNavOpenChange }) => {
  const location = useLocation();
  const showWorkspaceChrome = isWorkspaceAppPath(location.pathname);
  const { isTrial } = useSubscription();
  const needsExtraPadding = config.app.demoMode || isTrial;
  const topPad = needsExtraPadding
    ? SHELL_CLASSES.pageTopOffsetWithBanner
    : SHELL_CLASSES.pageTopOffset;
  const sidebarTop = needsExtraPadding ? SHELL_CLASSES.stickyHeaderOffsetWithBanner : SHELL_CLASSES.stickyHeaderOffset;
  const sidebarHeight = needsExtraPadding ? SHELL_CLASSES.sidebarHeightWithBanner : SHELL_CLASSES.sidebarHeight;

  const [sidebarExpanded, setSidebarExpanded] = useState(readSidebarExpanded);
  const toggleSidebar = useCallback(() => {
    setSidebarExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_EXPANDED_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const railWidth = sidebarExpanded ? 'w-56 xl:w-60' : 'w-16';

  return (
    <div className={`flex min-h-screen min-w-0 w-full flex-1 flex-col ${topPad}`}>
      <div className="flex min-h-0 min-w-0 flex-1">
        {showWorkspaceChrome && (
          <>
            {/* Mobile overlay + drawer */}
            {mobileNavOpen && (
              <div
                className="fixed inset-0 z-30 bg-black/40 md:hidden"
                onClick={() => onMobileNavOpenChange?.(false)}
                aria-hidden="true"
              />
            )}
            <div
              className={`
                fixed left-0 z-40 md:hidden
                transition-transform duration-200 ease-in-out
                ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}
                ${sidebarTop} ${sidebarHeight}
              `}
            >
              <WorkspaceSidebar className="h-full" expanded onToggleExpanded={toggleSidebar} />
            </div>

            {/* Sidebar: fixed on md+ — primary nav; header stays minimal (no duplicate section menus). */}
            <div
              className={`hidden md:fixed md:left-0 md:z-40 md:block md:overflow-y-auto md:overflow-x-hidden md:transition-[width] md:duration-200 md:ease-out ${railWidth} ${sidebarTop} ${sidebarHeight}`}
            >
              <WorkspaceSidebar
                className="h-full"
                expanded={sidebarExpanded}
                onToggleExpanded={toggleSidebar}
              />
            </div>
            <div
              className={`hidden md:block flex-shrink-0 transition-[width] duration-200 ease-out ${railWidth}`}
              aria-hidden
            />
          </>
        )}
        {/* Main + footer share the column to the right of the sidebar spacer so the fixed rail does not cover the footer */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <main className="min-w-0 flex-1">{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  );
};
