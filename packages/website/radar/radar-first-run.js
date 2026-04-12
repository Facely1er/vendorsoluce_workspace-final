/**
 * Vendor Threat Radar — first-run UX (static site).
 * Shows the welcome banner on first visit and persists dismiss in localStorage.
 * Safe to load before radar-runtime.js (no dependency on runtime globals).
 */
(function () {
  var STORAGE_KEY = 'vs_radar_welcome_dismissed_v1';

  function showBanner(banner) {
    banner.style.display = 'block';
    banner.setAttribute('data-vs-first-run-visible', 'true');
  }

  function hideBanner(banner) {
    banner.style.display = 'none';
    banner.removeAttribute('data-vs-first-run-visible');
  }

  function init() {
    var banner = document.getElementById('welcomeBanner');
    var closeBtn = document.getElementById('welcomeBannerClose');
    if (!banner) return;

    var dismissed = false;
    try {
      dismissed = localStorage.getItem(STORAGE_KEY) === '1';
    } catch (e) {
      dismissed = false;
    }

    if (!dismissed) {
      showBanner(banner);
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        try {
          localStorage.setItem(STORAGE_KEY, '1');
        } catch (e) {}
        hideBanner(banner);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
