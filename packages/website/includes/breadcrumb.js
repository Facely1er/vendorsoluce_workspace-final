(function() {
  function update() {
    var bc = document.querySelector('[data-breadcrumb="true"], [data-breadcrumb], .breadcrumb, nav[aria-label="Breadcrumb"]');
    document.documentElement.style.setProperty('--breadcrumb-height', bc ? (bc.offsetHeight + 'px') : '0px');
  }
  window.addEventListener('load', update);
  window.addEventListener('resize', update);
  document.addEventListener('DOMContentLoaded', update);
})();
