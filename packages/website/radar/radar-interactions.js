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
    var grids = document.querySelectorAll('.stats-grid');
    if (!grids.length) return;

    function revealAll() {
      grids.forEach(function (grid) {
        grid.classList.add('stats-grid--in-view');
      });
    }

    if (REDUCED) {
      revealAll();
      return;
    }
    if (typeof IntersectionObserver === 'undefined') {
      revealAll();
      return;
    }
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            revealAll();
            obs.disconnect();
          }
        });
      },
      { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
    );
    obs.observe(grids[0]);
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
