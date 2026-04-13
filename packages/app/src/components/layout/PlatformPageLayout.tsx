import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Standalone tool pages without {@link WorkspacePageShell} hero — same max-width, horizontal padding,
 * and vertical gap as workspace body content. Prefer {@link WorkspacePageBody} inside the shell when possible.
 */
export const PLATFORM_PAGE_INNER_CLASS =
  'mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8';

type PlatformPageLayoutProps = {
  children: React.ReactNode;
  /** Extra classes on the inner wrapper (e.g. py-6). */
  className?: string;
};

export const PlatformPageLayout: React.FC<PlatformPageLayoutProps> = ({ children, className = '' }) => (
  <div className={cn(PLATFORM_PAGE_INNER_CLASS, className)}>{children}</div>
);
