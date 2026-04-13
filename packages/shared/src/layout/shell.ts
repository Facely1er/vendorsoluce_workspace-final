export const APP_HEADER_HEIGHT_PX = 64;
export const APP_HEADER_HEIGHT_VAR = 'var(--header-height)';
export const APP_BANNER_HEIGHT_REM = 2.25;

export const SHELL_CLASSES = {
  pageTopOffset: `pt-[${APP_HEADER_HEIGHT_VAR}]`,
  pageTopOffsetWithBanner: `pt-[calc(${APP_HEADER_HEIGHT_VAR}_+_${APP_BANNER_HEIGHT_REM}rem)]`,
  fixedBannerOffset: `top-[${APP_HEADER_HEIGHT_VAR}]`,
  fixedMobileMenuOffset: `top-[${APP_HEADER_HEIGHT_VAR}]`,
  stickyHeaderOffset: `top-[${APP_HEADER_HEIGHT_VAR}]`,
  /** When demo/trial banner is visible, fixed sidebar sits below navbar + banner (matches pageTopOffsetWithBanner). */
  stickyHeaderOffsetWithBanner: `top-[calc(${APP_HEADER_HEIGHT_VAR}_+_${APP_BANNER_HEIGHT_REM}rem)]`,
  sidebarHeight: `h-[calc(100vh_-_${APP_HEADER_HEIGHT_VAR})]`,
  sidebarHeightWithBanner: `h-[calc(100vh_-_${APP_HEADER_HEIGHT_VAR}_-_${APP_BANNER_HEIGHT_REM}rem)]`,
  heroTopSpacing: 'pt-12 lg:pt-12',
} as const;

export const SHELL_FORBIDDEN_LITERALS = ['top-16', 'pt-16'];
