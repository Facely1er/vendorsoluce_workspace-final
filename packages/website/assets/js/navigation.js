/**
 * VendorSoluce Navigation System
 * Handles mobile menu, active navigation states, breadcrumb height, and nav link paths
 */

(function() {
    'use strict';

    /**
     * Directory URL path of the static site root (folder that contains assets/js/navigation.js).
     * Empty string means the script lives at /assets/js/navigation.js (site root = server path root).
     * null = could not resolve (fall back to legacy rewrite).
     */
    function getStaticSiteRootPathPrefix() {
        var el = document.querySelector('script[src*="navigation.js"]');
        if (!el) return null;
        try {
            var abs = new URL(el.src || el.getAttribute('src') || '', window.location.href).pathname;
            var marker = '/assets/js/navigation.js';
            var i = abs.indexOf(marker);
            if (i === -1) return null;
            return abs.slice(0, i);
        } catch (e) {
            return null;
        }
    }

    /**
     * Rewrite root-relative links and image src (e.g. /index.html, /homepage_files/logo.png)
     * to relative paths so navigation, breadcrumb, footer, and assets work when opened via
     * file:// or from a non-root server path.
     *
     * Root-relative hrefs are defined relative to the static site root (same folder as index.html),
     * not necessarily the HTTP server's filesystem root. We infer that folder from this script's URL.
     */
    function rewriteNavLinksForCurrentPath() {
        var pathname = window.location.pathname || '';
        var siteRoot = getStaticSiteRootPathPrefix();
        var segments = pathname.replace(/^\/+/, '').split('/').filter(Boolean);
        var legacyBaseDir = segments.length > 1 ? segments.slice(0, -1).join('/') + '/' : '';
        var legacyPrefix = segments.length > 1 ? Array(segments.length - 1).fill('..').join('/') + '/' : '';

        function legacyToRelative(path) {
            if (legacyBaseDir && path.indexOf(legacyBaseDir) === 0) {
                return path.slice(legacyBaseDir.length) || 'index.html';
            }
            return legacyPrefix + path;
        }

        function siteAwareToRelative(path) {
            if (siteRoot === null) {
                return legacyToRelative(path);
            }
            var tgtParts = path.split('/').filter(Boolean);
            var currentSuffix;
            if (siteRoot === '') {
                currentSuffix = pathname.replace(/^\/+/, '');
            } else if (pathname.indexOf(siteRoot) === 0) {
                currentSuffix = pathname.slice(siteRoot.length).replace(/^\/+/, '');
            } else {
                return legacyToRelative(path);
            }
            var curParts = currentSuffix.split('/').filter(Boolean);
            if (curParts.length) {
                curParts.pop();
            }
            var i = 0;
            var max = Math.min(curParts.length, tgtParts.length);
            while (i < max && curParts[i] === tgtParts[i]) {
                i++;
            }
            var up = curParts.length - i;
            var down = tgtParts.slice(i);
            var out = [];
            for (var j = 0; j < up; j++) {
                out.push('..');
            }
            Array.prototype.push.apply(out, down);
            return out.join('/') || '.';
        }

        // Rewrite all root-relative links (header, breadcrumb, footer, CTAs)
        document.querySelectorAll('a[href^="/"]').forEach(function(a) {
            var href = a.getAttribute('href');
            if (!href || href.indexOf('//') === 0) return;
            var path = href.replace(/^\/+/, '');
            a.setAttribute('href', siteAwareToRelative(path));
        });

        // Rewrite root-relative image src (e.g. logo) so assets load when not at root
        document.querySelectorAll('img[src^="/"]').forEach(function(img) {
            var src = img.getAttribute('src');
            if (!src) return;
            var path = src.replace(/^\/+/, '');
            img.setAttribute('src', siteAwareToRelative(path));
        });
    }

    /**
     * Initialize Dropdown Menus (click + hover)
     */
    function initDropdowns() {
        const dropdownButtons = document.querySelectorAll('[data-dropdown-toggle]');
        let hoverTimeout = null;

        dropdownButtons.forEach(button => {
            const dropdownId = button.getAttribute('data-dropdown-toggle');
            const dropdown = document.getElementById(dropdownId + '-dropdown');
            const parent = button.closest('.nav-dropdown');

            if (!dropdown || !parent) return;

            // Open on hover (desktop)
            parent.addEventListener('mouseenter', function() {
                if (hoverTimeout) {
                    clearTimeout(hoverTimeout);
                    hoverTimeout = null;
                }
                document.querySelectorAll('.nav-dropdown').forEach(d => {
                    if (d !== parent) d.classList.remove('open');
                });
                parent.classList.add('open');
            });

            // Close on mouse leave with short delay so user can move to menu
            parent.addEventListener('mouseleave', function() {
                hoverTimeout = setTimeout(function() {
                    parent.classList.remove('open');
                    hoverTimeout = null;
                }, 120);
            });

            // Toggle dropdown on click (for keyboard and touch)
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                const isOpen = parent.classList.contains('open');

                document.querySelectorAll('.nav-dropdown').forEach(d => {
                    if (d !== parent) d.classList.remove('open');
                });

                if (isOpen) {
                    parent.classList.remove('open');
                } else {
                    parent.classList.add('open');
                }
            });
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.nav-dropdown')) {
                document.querySelectorAll('.nav-dropdown').forEach(d => {
                    d.classList.remove('open');
                });
            }
        });

        // Close dropdowns on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                document.querySelectorAll('.nav-dropdown').forEach(d => {
                    d.classList.remove('open');
                });
            }
        });
    }

    /**
     * Initialize Mobile Menu
     */
    function initMobileMenu() {
        const menuButton = document.querySelector('[data-mobile-menu-button]');
        if (!menuButton) return;

        const mobileMenu = document.querySelector('[data-mobile-menu]');
        if (!mobileMenu) return;

        // Toggle menu (listener is on the hamburger only; do not use broad closest('a[href]') — it is never correct here)
        menuButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
            
            if (isExpanded) {
                closeMobileMenu(menuButton, mobileMenu);
            } else {
                openMobileMenu(menuButton, mobileMenu);
            }
        });

        // Close menu when clicking outside (use aria-expanded: radar pages use !important CSS + .mobile-menu-open, not always .hidden)
        document.addEventListener('click', function(e) {
            if (menuButton.getAttribute('aria-expanded') !== 'true') return;
            if (!mobileMenu.contains(e.target) && !menuButton.contains(e.target)) {
                closeMobileMenu(menuButton, mobileMenu);
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
                closeMobileMenu(menuButton, mobileMenu);
            }
        });

        // Close menu when clicking a link inside
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                closeMobileMenu(menuButton, mobileMenu);
            });
        });
    }

    function openMobileMenu(button, menu) {
        menu.classList.remove('hidden');
        menu.classList.add('mobile-menu-open');
        button.setAttribute('aria-expanded', 'true');
        button.setAttribute('aria-label', 'Close menu');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu(button, menu) {
        menu.classList.add('hidden');
        menu.classList.remove('mobile-menu-open');
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-label', 'Open menu');
        document.body.style.overflow = '';
    }

    /**
     * Set Active Navigation Link
     * Marks the current page's navigation link as active
     */
    function setActiveNavLink() {
        const currentPath = window.location.pathname;
        const pathSegments = currentPath.split('/').filter(Boolean);
        const currentFile = pathSegments.length ? pathSegments[pathSegments.length - 1] : 'index.html';
        const normalizedCurrentFile = currentFile.split('?')[0].split('#')[0];
        
        // Find navigation menu links (desktop: any nav a[title][href] not inside mobile menu; mobile: links inside [data-mobile-menu])
        const allTitledInNav = document.querySelectorAll('nav a[title][href]');
        const desktopNavLinks = Array.from(allTitledInNav).filter(function(a) { return !a.closest('[data-mobile-menu]'); });
        const mobileNavLinks = document.querySelectorAll('[data-mobile-menu] a[href]');
        const navLinks = [...desktopNavLinks, ...mobileNavLinks];
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return;
            
            // Skip branding link
            if (link.closest('[data-tour="main-nav"]')) {
                return;
            }
            
            // Skip Vendor Radar button
            if (link.getAttribute('title') === 'Vendor Radar' || 
                link.querySelector('svg.lucide-radar') ||
                link.textContent.trim().includes('Vendor Radar')) {
                return;
            }
            
            // Skip action buttons area
            const parentContainer = link.parentElement;
            if (parentContainer && (
                parentContainer.querySelector('[data-tour="user-menu"]') || 
                parentContainer.querySelector('[data-tour="theme-toggle"]') ||
                parentContainer.classList.contains('flex-shrink-0')
            )) {
                const hasActionButtons = parentContainer.querySelector('[data-tour="user-menu"]') || 
                                        parentContainer.querySelector('[data-tour="theme-toggle"]');
                if (hasActionButtons) {
                    return;
                }
            }
            
            // Extract filename from href
            let linkFile = href.replace(/^\.\.?\//, '').split('/').pop() || '';
            linkFile = linkFile.split('?')[0].split('#')[0];
            // Normalize for comparison: strip .html so /how-it-works matches link /how-it-works.html
            const currentBase = (normalizedCurrentFile.replace(/\.html$/i, '') || 'index');
            const linkBase = (linkFile.replace(/\.html$/i, '') || 'index');
            const isCurrentPage = currentBase === linkBase;
            
            if (isCurrentPage) {
                link.classList.add('active', 'nav-link-active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active', 'nav-link-active');
                link.removeAttribute('aria-current');
            }
        });
    }

    /**
     * Calculate and set breadcrumb height
     * Updates CSS variable for proper main content padding
     */
    function updateBreadcrumbHeight() {
        const breadcrumb = document.querySelector('[data-breadcrumb="true"]');
        if (!breadcrumb) {
            document.documentElement.style.setProperty('--breadcrumb-height', '0px');
            return;
        }

        const height = breadcrumb.offsetHeight;
        document.documentElement.style.setProperty('--breadcrumb-height', `${height}px`);
    }

    /**
     * Initialize all navigation functionality
     */
    function init() {
        function runInit() {
            rewriteNavLinksForCurrentPath();
            initDropdowns();
            initMobileMenu();
            setActiveNavLink();
            updateBreadcrumbHeight();
            window.addEventListener('resize', updateBreadcrumbHeight);
        }
        // Always wait for full DOM so mobile menu panel (often after script) exists
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                requestAnimationFrame(runInit);
            });
        } else {
            requestAnimationFrame(runInit);
        }
    }

    // Start initialization
    init();
})();
