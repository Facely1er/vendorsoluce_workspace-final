/**
 * Vendor Threat Radar — lightweight engagement layer (no dependency on radar-runtime).
 * - Stagger-in for stat cards when scrolled into view
 * - Brief highlight when stat numbers update (runtime-driven)
 * - “Live” pulse on status strip when all clear
 */
(function () {
  var REDUCED =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function initStatsGridReveal() {
    if (REDUCED) {
      var grid = document.querySelector('.stats-grid');
      if (grid) grid.classList.add('stats-grid--in-view');
      return;
    }
    var grid = document.querySelector('.stats-grid');
    if (!grid || typeof IntersectionObserver === 'undefined') {
      if (grid) grid.classList.add('stats-grid--in-view');
      return;
    }
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            grid.classList.add('stats-grid--in-view');
            obs.disconnect();
          }
        });
      },
      { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
    );
    obs.observe(grid);
  }

  function pulseStatValue(el) {
    if (REDUCED) return;
    el.classList.remove('stat-value--flash');
    void el.offsetWidth;
    el.classList.add('stat-value--flash');
    window.setTimeout(function () {
      el.classList.remove('stat-value--flash');
    }, 450);
  }

  function initStatObservers() {
    var ids = [
      'criticalCount',
      'highCount',
      'mediumCount',
      'lowCount',
      'totalCount',
      'avgRisk',
      'activeThreats',
      'predictiveAlerts',
    ];
    if (typeof MutationObserver === 'undefined') return;

    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var obs = new MutationObserver(function () {
        pulseStatValue(el);
      });
      obs.observe(el, { characterData: true, subtree: true, childList: true });
    });
  }

  function initAlertBannerPulse() {
    if (REDUCED) return;
    var banner = document.getElementById('alertBanner');
    if (!banner || !banner.classList.contains('clear')) return;
    banner.classList.add('alert-banner--live');
  }

  onReady(function () {
    var root = document.querySelector('.radar-container');
    if (root) root.classList.add('radar-container--engage');
    initStatsGridReveal();
    initStatObservers();
    initAlertBannerPulse();
  });
})();
