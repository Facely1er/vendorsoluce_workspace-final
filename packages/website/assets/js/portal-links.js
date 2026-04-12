/**
 * Centralizes platform/portal URLs. Path aliases come from the generated
 * route manifest so the website and app do not drift independently.
 */
(function () {
  var platformBase = window.PLATFORM_APP_BASE || window.VENDOR_PORTAL_BASE || 'https://www.platform.vendorsoluce.com';
  var vendorPortalBase = window.VENDOR_RISK_PORTAL_BASE || 'https://www.portal.vendorsoluce.com';
  var manifest = window.VENDORSOLUCE_ROUTE_MANIFEST || { marketing: {}, workspace: {}, auth: {}, portal: {} };
  var aliasMap = {
    dashboard: manifest.marketing.DASHBOARD,
    pricing: manifest.marketing.PRICING,
    contact: manifest.marketing.CONTACT,
    vendors: manifest.marketing.VENDORS,
    vendorPortal: manifest.marketing.VENDOR_PORTAL,
    vendorAssessments: manifest.marketing.VENDOR_ASSESSMENTS,
    signIn: manifest.auth.SIGNIN,
    signUp: manifest.auth.SIGNUP,
    billing: manifest.workspace.BILLING,
    profile: manifest.workspace.PROFILE,
    account: manifest.workspace.ACCOUNT
  };

  function resolvePath(el) {
    var explicit = (el.getAttribute('data-portal-path') || el.getAttribute('data-platform-path') || el.getAttribute('data-vendor-portal-path') || '').trim();
    var alias = (el.getAttribute('data-route-key') || '').trim();
    if (alias && aliasMap[alias]) return aliasMap[alias];
    if (explicit === '' && el.hasAttribute('data-vendor-portal-path')) return '';
    return explicit;
  }

  function setHref(el, base) {
    var path = resolvePath(el);
    var url = base.replace(/\/$/, '') + (path && path.indexOf('/') === 0 ? path : (path ? '/' + path : ''));
    el.href = url;
  }

  document.querySelectorAll('[data-portal-path], [data-platform-path]').forEach(function (el) {
    setHref(el, platformBase);
  });
  document.querySelectorAll('[data-vendor-portal-path]').forEach(function (el) {
    setHref(el, vendorPortalBase);
  });
})();
