/**
 * Base URLs for platform and vendor portal links.
 * Public route paths are generated from packages/shared/routes.json into
 * assets/js/generated/route-manifest.js so the static website uses the same
 * canonical path map as the app route modules.
 */
(function () {
  window.VENDOR_PORTAL_BASE = window.VENDOR_PORTAL_BASE || 'https://app.vendorsoluce.com';
  window.PLATFORM_APP_BASE = window.PLATFORM_APP_BASE || window.VENDOR_PORTAL_BASE;
  window.VENDOR_RISK_PORTAL_BASE = window.VENDOR_RISK_PORTAL_BASE || 'https://www.portal.vendorsoluce.com';
  // Optional: set window.CONTACT_API_URL (HTTPS JSON endpoint) before this script on contact.html
  // to submit via fetch instead of Netlify Forms. The static site does not require Supabase.
  window.VENDORSOLUCE_ROUTE_MANIFEST = window.VENDORSOLUCE_ROUTE_MANIFEST || { marketing: {}, workspace: {}, auth: {}, portal: {} };
})();
