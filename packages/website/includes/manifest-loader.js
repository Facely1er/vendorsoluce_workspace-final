(function() {
  if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
    var link = document.createElement('link');
    link.rel = 'manifest';
    link.href = 'site.webmanifest';
    document.head.appendChild(link);
  }
})();
