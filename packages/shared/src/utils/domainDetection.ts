/**
 * Domain detection utilities for multi-domain support.
 * Domains: www.vendorsoluce.com (website), www.platform.vendorsoluce.com (app), www.portal.vendorsoluce.com (VendorSoluce™ Portal — vendor assurance & due diligence).
 */

/** VendorSoluce™ Portal hostnames (vendor-facing assurance / due diligence entry) */
const PORTAL_HOSTS = ['portal.vendorsoluce.com', 'www.portal.vendorsoluce.com'];

/** Platform app hostnames (sign in, dashboard) */
const PLATFORM_HOSTS = ['platform.vendorsoluce.com', 'www.platform.vendorsoluce.com'];

/**
 * Checks if the current domain is the vendor risk portal domain (www.portal.vendorsoluce.com).
 * Vendortal.com is not used for now; portal stays under VendorSoluce™ branding.
 * In development, VITE_FORCE_PORTAL=true forces the portal app on any host (e.g. localhost).
 */
export const isVendorPortalDomain = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (import.meta.env.DEV && import.meta.env.VITE_FORCE_PORTAL === 'true') return true;
  const hostname = window.location.hostname.toLowerCase();
  return PORTAL_HOSTS.some((h) => hostname === h);
};

/**
 * Checks if the current domain is the platform app domain
 */
export const isPlatformDomain = (): boolean => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname.toLowerCase();
  return PLATFORM_HOSTS.some((h) => hostname === h);
};

/**
 * Gets the app domain type (VendorSoluce™ Portal / vendor assurance & due diligence is under VendorSoluce™).
 * @returns 'portal' if on vendor risk portal domain, 'vendorsoluce' otherwise
 */
export const getAppDomain = (): 'vendorsoluce' | 'portal' => {
  return isVendorPortalDomain() ? 'portal' : 'vendorsoluce';
};

/**
 * Gets the base URL for the current domain
 * @returns The base URL for the current host (or env override when SSR)
 */
export const getBaseUrl = (): string => {
  if (typeof window === 'undefined') {
    return (
      import.meta.env.VITE_APP_URL ||
      import.meta.env.VITE_VENDOR_PORTAL_URL ||
      'https://www.vendorsoluce.com'
    );
  }
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}`;
};

/**
 * Gets the vendor risk portal URL (for links to portal from website/platform)
 */
export const getVendorPortalUrl = (): string => {
  return import.meta.env.VITE_VENDOR_PORTAL_URL || 'https://www.portal.vendorsoluce.com';
};

/**
 * Gets the platform app URL (for links to sign in / dashboard from website)
 */
export const getPlatformAppUrl = (): string => {
  return import.meta.env.VITE_APP_URL || 'https://www.platform.vendorsoluce.com';
};

