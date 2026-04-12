import React from 'react';

/** Standard workspace / platform content width and padding. */
export const PLATFORM_PAGE_INNER_CLASS =
  'w-full min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6';

type PlatformPageLayoutProps = {
  children: React.ReactNode;
  /** Extra classes on the inner wrapper (e.g. py-6). */
  className?: string;
};

export const PlatformPageLayout: React.FC<PlatformPageLayoutProps> = ({ children, className = '' }) => (
  <div className={`${PLATFORM_PAGE_INNER_CLASS} ${className}`.trim()}>{children}</div>
);
