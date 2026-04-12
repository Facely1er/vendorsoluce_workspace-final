// Active Navigation Link Detection
// This script marks the current page in navigation and handles mobile menu
(function() {
  function markActiveNavigationLinks() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    // Get all navigation links (both desktop and mobile)
    const navLinks = document.querySelectorAll('nav a[href]');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      
      // Skip external links and anchor links
      if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('#')) {
        return;
      }
      
      // Normalize the href to get just the filename
      let linkPage = href.split('/').pop();
      
      // Handle index.html and root paths
      if (linkPage === '' || linkPage === 'index.html' || href.endsWith('/') || href === './' || href === '../') {
        linkPage = 'index.html';
      }
      
      // Remove query strings and hash
      linkPage = linkPage.split('?')[0].split('#')[0];
      const currentPageClean = currentPage.split('?')[0].split('#')[0];
      
      // Normalize paths - handle relative paths like ../index.html
      const normalizedHref = href.replace(/^\.\.\//, '').replace(/^\.\//, '');
      const normalizedHrefPage = normalizedHref.split('/').pop().split('?')[0].split('#')[0];
      
      // Check if this link matches the current page
      const isMatch = 
        linkPage === currentPageClean ||
        normalizedHrefPage === currentPageClean ||
        (currentPageClean === '' && (linkPage === 'index.html' || normalizedHrefPage === 'index.html' || href === 'index.html' || href.endsWith('/'))) ||
        (currentPageClean === 'index.html' && (linkPage === '' || normalizedHrefPage === '' || href === './' || href === '../')) ||
        (currentPath.includes('radar') && (href.includes('vendor-threat-radar.html') || normalizedHref.includes('vendor-threat-radar.html'))) ||
        (currentPath.includes('legal') && (href.includes(currentPageClean) || normalizedHrefPage === currentPageClean));
      
      if (isMatch) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
        
        // For Vendor Radar button, disable hover effects
        if ((href.includes('vendor-threat-radar.html') || normalizedHref.includes('vendor-threat-radar.html')) && currentPath.includes('vendor-threat-radar.html')) {
          link.style.pointerEvents = 'none';
          link.style.opacity = '0.9';
          link.classList.add('cursor-default');
        }
      }
    });
  }

  // Mobile menu is initialized by the inline script in the header (or navigation.js).
  // Do not init here to avoid double-binding and menu opening then immediately closing.

  // Always wait for DOM to be fully loaded for active link detection
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', markActiveNavigationLinks);
  } else {
    markActiveNavigationLinks();
  }
})();

