// Canonical theme toggle for all VendorSoluce pages.
// Loaded via embed-header-footer.js build step (data-vs-theme-toggle marker).
// The flash-prevention inline script in <head> (data-vs-theme-init) applies the
// dark class before stylesheets parse; this file wires the click handlers and
// keeps icons in sync after the DOM is ready.
(function () {
  'use strict';

  var STORAGE_KEY = 'theme';

  function getTheme() {
    var stored;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // Toggle hidden-icon class on sun/moon SVGs inside every toggle button.
  // shell.css defines .hidden-icon { display: none }.
  // Sun (first SVG) is visible in dark mode; moon (second SVG) in light mode.
  function updateIcons(theme) {
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      var sun = btn.querySelector('.lucide-sun');
      var moon = btn.querySelector('.lucide-moon');
      if (sun && moon) {
        sun.classList.toggle('hidden-icon', theme !== 'dark');
        moon.classList.toggle('hidden-icon', theme === 'dark');
      }
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }

  function applyTheme(theme) {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
    updateIcons(theme);
  }

  function init() {
    // Sync icons with the theme that was already applied by the flash-prevention script.
    applyTheme(getTheme());

    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
      });
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      try {
        if (!localStorage.getItem(STORAGE_KEY)) applyTheme(e.matches ? 'dark' : 'light');
      } catch (ex) {}
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
