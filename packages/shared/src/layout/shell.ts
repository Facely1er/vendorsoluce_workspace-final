export const APP_HEADER_HEIGHT_PX = 64;
export const APP_HEADER_HEIGHT_VAR = 'var(--header-height)';
export const APP_BANNER_HEIGHT_REM = 2.25;

/**
 * Tailwind arbitrary utilities must appear as complete literals in scanned source
 * (template strings like `pt-[${APP_HEADER_HEIGHT_VAR}]` are often purged in downstream apps).
 */
export const SHELL_CLASSES = {
  pageTopOffset: 'pt-[var(--header-height)]',
  pageTopOffsetWithBanner: 'pt-[calc(var(--header-height)_+_2.25rem)]',
  fixedBannerOffset: 'top-[var(--header-height)]',
  fixedMobileMenuOffset: 'top-[var(--header-height)]',
  stickyHeaderOffset: 'top-[var(--header-height)]',
  /** When demo/trial banner is visible, fixed sidebar sits below navbar + banner (matches pageTopOffsetWithBanner). */
  stickyHeaderOffsetWithBanner: 'top-[calc(var(--header-height)_+_2.25rem)]',
  sidebarHeight: 'h-[calc(100vh_-_var(--header-height))]',
  sidebarHeightWithBanner: 'h-[calc(100vh_-_var(--header-height)_-_2.25rem)]',
  heroTopSpacing: 'pt-12 lg:pt-12',
} as const;

export const SHELL_FORBIDDEN_LITERALS = ['top-16', 'pt-16'];
