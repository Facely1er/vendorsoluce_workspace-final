// Shared Header and Footer Loader for VendorSoluce
(function() {
    // ============================================
    // THEME MANAGEMENT (runs immediately to prevent flash)
    // ============================================
    (function() {
        // Apply theme immediately before page renders
        try {
            const savedTheme = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        } catch (e) {
            // Ignore errors in localStorage access
        }
    })();

    // ============================================
    // PATH ADJUSTMENT FOR SUBDIRECTORIES
    // ============================================
    function adjustPathsForSubdirectory(html) {
        const path = window.location.pathname;
        // Count directory depth: split by /, filter out empty strings and the filename
        const parts = path.split('/').filter(p => p);
        const filename = parts[parts.length - 1];
        const depth = parts.length - 1; // Subtract 1 for the filename
        
        // If we're in a subdirectory (depth > 0), we need to prepend ../ to relative paths
        if (depth > 0) {
            const prefix = '../'.repeat(depth);
            
            // Adjust href attributes for relative paths (not starting with /, http, https, #, javascript:, mailto:, or ../)
            html = html.replace(/href="([^/"#hj][^"]*\.html)"/gi, (match, linkPath) => {
                // Skip if it's already a relative path to a parent directory
                if (linkPath.startsWith('../')) {
                    return match;
                }
                // Skip absolute URLs
                if (linkPath.startsWith('http://') || linkPath.startsWith('https://')) {
                    return match;
                }
                // For paths with subdirectories (like legal/privacy-policy.html),
                // we still need to prepend ../ to go up from current directory
                // But we need to be smart: if we're in legal/, and link is legal/privacy-policy.html, 
                // we should keep it as is (same directory)
                const currentDir = parts.length > 1 ? parts[parts.length - 2] : '';
                if (linkPath.includes('/')) {
                    const linkDir = linkPath.split('/')[0];
                    // If link is to same subdirectory we're in, keep it relative
                    if (currentDir === linkDir) {
                        return match;
                    }
                    // Otherwise, prepend ../ to go up
                    return `href="${prefix}${linkPath}"`;
                }
                // Simple relative paths (like index.html, how-it-works.html) need ../ prefix
                return `href="${prefix}${linkPath}"`;
            });
            
            // Adjust src attributes for images and other resources
            html = html.replace(/src="([^/"#hj][^"]*\.(png|jpg|jpeg|gif|svg|webp|ico))"/gi, (match, imgPath) => {
                if (imgPath.startsWith('../')) {
                    return match;
                }
                if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
                    return match;
                }
                // For images, check if they're in a subdirectory
                if (imgPath.includes('/')) {
                    const imgDir = imgPath.split('/')[0];
                    const currentDir = parts.length > 1 ? parts[parts.length - 2] : '';
                    // If image is in same subdirectory we're in, keep it relative
                    if (currentDir === imgDir) {
                        return match;
                    }
                }
                // For images typically in root or subdirectories, prepend ../
                return `src="${prefix}${imgPath}"`;
            });
            
            // Also handle ./ paths explicitly
            html = html.replace(/href="\.\//g, `href="${prefix}`);
            html = html.replace(/src="\.\//g, `src="${prefix}`);
        }
        
        return html;
    }

    // ============================================
    // ACTIVE NAVIGATION LINK DETECTION
    // ============================================
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

    // ============================================
    // MOBILE MENU FUNCTIONALITY
    // ============================================
    function initMobileMenu() {
        const menuButton = document.querySelector('[data-mobile-menu-button]');
        if (!menuButton) return;

        const mobileMenu = document.querySelector('[data-mobile-menu]');
        if (!mobileMenu) return;

        function closeMobileMenu() {
            mobileMenu.classList.add('hidden');
            menuButton.setAttribute('aria-expanded', 'false');
            menuButton.setAttribute('aria-label', 'Open menu');
            document.body.style.overflow = '';
        }

        function openMobileMenu() {
            mobileMenu.classList.remove('hidden');
            menuButton.setAttribute('aria-expanded', 'true');
            menuButton.setAttribute('aria-label', 'Close menu');
            document.body.style.overflow = 'hidden';
        }

        menuButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
            if (isExpanded) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileMenu.contains(e.target) && !menuButton.contains(e.target)) {
                if (!mobileMenu.classList.contains('hidden')) {
                    closeMobileMenu();
                }
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (!mobileMenu.classList.contains('hidden')) {
                    closeMobileMenu();
                }
            }
        });

        // Close menu when clicking a link
        mobileMenu.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (link) {
                closeMobileMenu();
            }
        });
    }

    // ============================================
    // LOAD HEADER
    // ============================================
    function loadHeader() {
        // Try to find placeholder first, then fall back to existing nav element
        let headerPlaceholder = document.getElementById('shared-header');
        if (!headerPlaceholder) {
            // Look for existing nav element to replace
            const existingNav = document.querySelector('nav.bg-white, nav.sticky, body > nav, body > header, #root > div > nav');
            if (existingNav) {
                // Create a wrapper div to replace the nav
                const wrapper = document.createElement('div');
                wrapper.id = 'shared-header';
                existingNav.parentNode.insertBefore(wrapper, existingNav);
                existingNav.remove();
                headerPlaceholder = wrapper;
            } else {
                // Header placeholder not found
                return;
            }
        }

        // Try multiple path variations
        const paths = [
            'includes/header.html',
            './includes/header.html',
            '../includes/header.html',
            '/includes/header.html'
        ];

        let pathIndex = 0;
        
        function tryLoadPath() {
            if (pathIndex >= paths.length) {
                // Failed to load header from all attempted paths
                return;
            }

            const currentPath = paths[pathIndex];
            
            fetch(currentPath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    return response.text();
                })
                .then(html => {
                    if (!html || html.trim() === '') {
                        throw new Error('Header HTML is empty');
                    }
                    
                    // Adjust paths for subdirectories
                    html = adjustPathsForSubdirectory(html);

                    headerPlaceholder.outerHTML = html;

                    // Initialize mobile menu after header loads
                    initMobileMenu();
                    
                    // Mark active navigation links
                    markActiveNavigationLinks();
                })
                .catch(err => {
                    // Failed to load from path, try next
                    pathIndex++;
                    tryLoadPath();
                });
        }

        tryLoadPath();
    }

    // ============================================
    // LOAD FOOTER
    // ============================================
    function loadFooter() {
        // Try to find placeholder first, then fall back to existing footer element
        let footerPlaceholder = document.getElementById('shared-footer') || document.getElementById('footer-placeholder');
        if (!footerPlaceholder) {
            // Look for existing footer element to replace
            const existingFooter = document.querySelector('footer.bg-gray-900, body > footer, main + footer, #root > div > footer');
            if (existingFooter) {
                // Create a wrapper div to replace the footer
                const wrapper = document.createElement('div');
                wrapper.id = 'shared-footer';
                existingFooter.parentNode.insertBefore(wrapper, existingFooter);
                existingFooter.remove();
                footerPlaceholder = wrapper;
            } else {
                // Footer placeholder not found
                return;
            }
        }

        // Try multiple path variations
        const paths = [
            'includes/footer.html',
            './includes/footer.html',
            '../includes/footer.html',
            '/includes/footer.html'
        ];

        let pathIndex = 0;
        
        function tryLoadPath() {
            if (pathIndex >= paths.length) {
                // Failed to load footer from all attempted paths
                return;
            }

            const currentPath = paths[pathIndex];
            
            // Add cache-busting parameter to ensure fresh footer load
            const cacheBuster = '?v=' + Date.now();
            const pathWithCache = currentPath + cacheBuster;
            
            fetch(pathWithCache)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    return response.text();
                })
                .then(html => {
                    if (!html || html.trim() === '') {
                        throw new Error('Footer HTML is empty');
                    }
                    
                    // Adjust paths for subdirectories
                    html = adjustPathsForSubdirectory(html);

                    footerPlaceholder.outerHTML = html;
                    
                    // Inject CSS to make footer borders extremely subtle - use background-matching colors
                    // Use setTimeout to ensure footer is fully rendered
                    setTimeout(() => {
                        // Remove any existing style and create new one
                        const existingStyle = document.getElementById('footer-border-removal-style');
                        if (existingStyle) {
                            existingStyle.remove();
                        }
                        
                        const style = document.createElement('style');
                        style.id = 'footer-border-removal-style';
                        style.textContent = `
                            /* Override all possible border classes */
                            footer.bg-white,
                            footer.dark\\:bg-gray-800,
                            footer[class*="border"],
                            footer {
                                border-top: 1px solid rgba(255, 255, 255, 0.02) !important;
                                border-color: rgba(255, 255, 255, 0.02) !important;
                            }
                            html.dark footer.bg-white,
                            html.dark footer.dark\\:bg-gray-800,
                            html.dark footer[class*="border"],
                            html.dark footer {
                                border-top: 1px solid rgba(31, 41, 55, 0.03) !important;
                                border-color: rgba(31, 41, 55, 0.03) !important;
                            }
                            footer > div > div:last-child,
                            footer > div > div[class*="border"] {
                                border-top: 1px solid rgba(255, 255, 255, 0.02) !important;
                                border-color: rgba(255, 255, 255, 0.02) !important;
                            }
                            html.dark footer > div > div:last-child,
                            html.dark footer > div > div[class*="border"] {
                                border-top: 1px solid rgba(31, 41, 55, 0.03) !important;
                                border-color: rgba(31, 41, 55, 0.03) !important;
                            }
                        `;
                        document.head.appendChild(style);
                        
                        // Also apply directly to the footer element with inline styles
                        const footer = document.querySelector('footer');
                        if (footer) {
                            footer.style.setProperty('border-top', '1px solid rgba(255, 255, 255, 0.02)', 'important');
                            footer.style.setProperty('border-color', 'rgba(255, 255, 255, 0.02)', 'important');
                            if (document.documentElement.classList.contains('dark')) {
                                footer.style.setProperty('border-top', '1px solid rgba(31, 41, 55, 0.03)', 'important');
                                footer.style.setProperty('border-color', 'rgba(31, 41, 55, 0.03)', 'important');
                            }
                            
                            const bottomDiv = footer.querySelector('div > div:last-child');
                            if (bottomDiv) {
                                bottomDiv.style.setProperty('border-top', '1px solid rgba(255, 255, 255, 0.02)', 'important');
                                bottomDiv.style.setProperty('border-color', 'rgba(255, 255, 255, 0.02)', 'important');
                                if (document.documentElement.classList.contains('dark')) {
                                    bottomDiv.style.setProperty('border-top', '1px solid rgba(31, 41, 55, 0.03)', 'important');
                                    bottomDiv.style.setProperty('border-color', 'rgba(31, 41, 55, 0.03)', 'important');
                                }
                            }
                        }
                    }, 200);
                })
                .catch(err => {
                    // Failed to load from path, try next
                    pathIndex++;
                    tryLoadPath();
                });
        }

        tryLoadPath();
    }

    // ============================================
    // INITIALIZE
    // ============================================
    function init() {
        loadHeader();
        loadFooter();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM already loaded, run immediately
        init();
    }
})();

