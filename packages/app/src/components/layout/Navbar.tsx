import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BarChart3, Radar, ListTree, Shield, ChevronDown, ExternalLink, LayoutDashboard } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';
import CommandPalette from '../common/CommandPalette';
import { useTranslation } from 'react-i18next';
import { config } from '../../utils/config';
import { isLicenseMode } from '../../config/license';
import {
  getWorkspaceSections,
} from '../../navigation/supplyChainSolutionsNav';
import { SHELL_CLASSES } from '../../layout/shell';
import { WR } from 'shared/constants/routes';
type DropdownId = string | null;

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<DropdownId>(null);
  const navCenterRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setOpenDropdown(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Prevent body scroll when mobile menu is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close mobile menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const mobileMenu = target.closest('[data-mobile-menu]');
      const mobileMenuButton = target.closest('[data-mobile-menu-button]');
      if (isOpen && !mobileMenu && !mobileMenuButton) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close dropdown when clicking outside nav center (desktop dropdowns)
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && navCenterRef.current && !navCenterRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const workspaceSections = useMemo(() => getWorkspaceSections(t), [t]);

  const isActiveLink = (href: string): boolean =>
    location.pathname === href && href !== '#';

  // Define active and default link classes
  const getActiveLinkClasses = (isActive: boolean) => {
    return isActive
      ? 'px-2 py-1.5 rounded-md text-sm font-medium text-vendorsoluce-green dark:text-white bg-vendorsoluce-green/10 dark:bg-vendorsoluce-green/20 flex items-center'
      : 'px-2 py-1.5 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-vendorsoluce-green dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center';
  };

  return (
    <nav
      className="glass-nav-vs fixed top-0 left-0 right-0 z-[99999] w-full max-w-[100vw] overflow-x-hidden"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 w-full min-w-0">
        <div className="flex items-center justify-between h-16 w-full min-w-0 gap-2">
          {/* Left: Logo — compact on small screens (typography matches website includes/header.html + Footer) */}
          <div className="flex items-center flex-shrink-0 min-w-0 md:max-w-none max-w-[calc(100%-11rem)]" data-tour="main-nav">
            <a href={config.app.websiteUrl} className="flex items-center min-w-0 group" target="_blank" rel="noopener noreferrer" title="VendorSoluce™ – main site">
              <img 
                src="/vendorsoluce.png" 
                alt="VendorSoluce™ logo" 
                className="h-[3.75rem] w-[3.75rem] flex-shrink-0 transition-transform group-hover:scale-105 object-contain" 
              />
              <span className="ml-1.5 min-w-0">
                <span className="block text-[1.5rem] sm:text-[1.625rem] md:text-[1.75rem] font-bold text-vendorsoluce-green dark:text-white leading-tight truncate">VendorSoluce™</span>
                <span className="block text-xs sm:text-sm italic text-vendorsoluce-green/80 dark:text-vendorsoluce-light-green font-normal leading-tight tracking-tighter tagline-text">Supply Chain Risk Intelligence</span>
              </span>
            </a>
          </div>
          
          {/* Center: Dashboard, Assess, Analyze, Programs (+ License) */}
          <div ref={navCenterRef} className="hidden md:flex md:items-center md:gap-0.5 min-w-0 shrink-0">
            <Link
              to={WR.VENDOR_INTELLIGENCE}
              className={getActiveLinkClasses(isActiveLink(WR.VENDOR_INTELLIGENCE))}
              title={t('navigation.dashboard')}
            >
              <BarChart3 size={16} className="flex-shrink-0" />
              <span className="ml-1 text-sm">{t('navigation.dashboard')}</span>
            </Link>

            {/* Per-section dropdowns: Assess, Analyze, Programs */}
            {workspaceSections.map((section) => {
              const sectionIcon =
                section.id === 'overview' ? <LayoutDashboard size={16} className="flex-shrink-0" /> :
                section.id === 'assessments' ? <BarChart3 size={16} className="flex-shrink-0" /> :
                section.id === 'analysis' ? <Radar size={16} className="flex-shrink-0" /> :
                <ListTree size={16} className="flex-shrink-0" />;

              const isSectionActive = section.items.some(
                (item) => !item.external && (location.pathname === item.href || location.pathname.startsWith(item.href + '/'))
              );

              return (
                <div key={section.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === section.id ? null : section.id)}
                    className={getActiveLinkClasses(isSectionActive)}
                    aria-expanded={openDropdown === section.id}
                    aria-haspopup="menu"
                    aria-label={`${section.label} menu`}
                  >
                    {sectionIcon}
                    <span className="ml-1 text-sm">{section.label}</span>
                    <ChevronDown size={14} className={`ml-0.5 flex-shrink-0 transition-transform ${openDropdown === section.id ? 'rotate-180' : ''}`} />
                  </button>
                  {openDropdown === section.id && (
                    <div
                      className="absolute left-0 top-full mt-1 py-2 w-64 min-w-[16rem] max-h-[min(80vh,32rem)] overflow-y-auto rounded-lg bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 z-50"
                      role="menu"
                      aria-label={section.label}
                    >
                      {section.items.map((item) =>
                        item.external ? (
                          <a
                            key={item.href}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            role="menuitem"
                            className="flex items-center justify-between gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md mx-1"
                            onClick={() => setOpenDropdown(null)}
                          >
                            <span>{item.label}</span>
                            <ExternalLink className="h-3 w-3 shrink-0 opacity-50" aria-hidden />
                          </a>
                        ) : (
                          <Link
                            key={item.href}
                            to={item.href}
                            role="menuitem"
                            className={`block px-3 py-2 text-sm rounded-md mx-1 ${
                              isActiveLink(item.href)
                                ? 'text-vendorsoluce-green dark:text-white bg-vendorsoluce-green/10 dark:bg-vendorsoluce-green/20 font-medium'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                            onClick={() => setOpenDropdown(null)}
                          >
                            {item.label}
                          </Link>
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {isLicenseMode() && (
              <Link
                to="/billing"
                className={getActiveLinkClasses(isActiveLink('/billing'))}
                title="License"
              >
                <Shield size={16} className="flex-shrink-0" />
                <span className="ml-1 text-sm">License</span>
              </Link>
            )}
          </div>

          {/* Right: Theme + User */}
          <div className="hidden md:flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
            <div data-tour="theme-toggle" className="flex items-center">
              <ThemeToggle />
            </div>
            <div data-tour="user-menu">
              <UserMenu />
            </div>
          </div>
          
          {/* Mobile: theme + menu */}
          <div className="flex items-center md:hidden flex-shrink-0 ml-auto gap-1.5">
            <div data-tour="theme-toggle" className="flex items-center flex-shrink-0">
              <ThemeToggle />
            </div>
            <button
              type="button"
              onClick={toggleMenu}
              data-mobile-menu-button
              id="mobile-menu-hamburger-btn"
              className="inline-flex items-center justify-center p-1.5 rounded-md text-gray-700 dark:text-gray-300 hover:text-vendorsoluce-green dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none flex-shrink-0 w-9 h-9"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              {...(isOpen ? { 'aria-expanded': 'true' as const } : { 'aria-expanded': 'false' as const })}
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation - rendered via Portal to avoid overflow/stacking issues */}
      {isOpen && createPortal(
        <div
          data-mobile-menu
          className={`md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg fixed left-0 right-0 bottom-0 z-[99990] overflow-y-auto ${SHELL_CLASSES.fixedMobileMenuOffset}`}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          {/* Mobile branding */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-200 dark:border-gray-700">
            <a href={config.app.websiteUrl} className="flex items-center group" target="_blank" rel="noopener noreferrer" title="VendorSoluce™ – main site" onClick={() => setIsOpen(false)}>
              <img
                src="/vendorsoluce.png"
                alt="VendorSoluce™ logo"
                className="h-[3.75rem] w-[3.75rem] flex-shrink-0 transition-transform group-hover:scale-105"
              />
              <span className="ml-1.5 min-w-0">
                <span className="block text-[1.625rem] font-bold text-vendorsoluce-green dark:text-white leading-tight">VendorSoluce™</span>
                <span className="block text-xs sm:text-sm italic text-vendorsoluce-green/80 dark:text-vendorsoluce-light-green font-normal leading-tight tracking-tighter">Supply Chain Risk Intelligence</span>
              </span>
            </a>
          </div>

          <div className="px-4 pt-2 pb-3 space-y-1">
            <Link
              to={WR.VENDOR_INTELLIGENCE}
              className={`text-base font-medium flex items-center rounded-md ${
                isActiveLink(WR.VENDOR_INTELLIGENCE)
                  ? 'px-3 py-2 text-vendorsoluce-green dark:text-white bg-vendorsoluce-green/10 dark:bg-vendorsoluce-green/20'
                  : 'px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-vendorsoluce-green dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <BarChart3 size={16} className="flex-shrink-0" />
              <span className="ml-2">{t('navigation.dashboard')}</span>
            </Link>
            <div className="pt-2">
              {workspaceSections.map((section, si) => (
                <div key={section.id}>
                  {si > 0 && <div className="my-1 mx-3 border-t border-gray-100 dark:border-gray-700/60" />}
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {section.label}
                  </div>
                  {section.items.map((item) =>
                    item.external ? (
                      <a
                        key={item.href}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-medium flex items-center rounded-md px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-vendorsoluce-green dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => setIsOpen(false)}
                      >
                        <span className="ml-2">{item.label}</span>
                        <ExternalLink className="h-4 w-4 ml-2 shrink-0 opacity-70" aria-hidden />
                      </a>
                    ) : (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={`text-base font-medium flex items-center rounded-md ${
                          isActiveLink(item.href)
                            ? 'px-3 py-2 text-vendorsoluce-green dark:text-white bg-vendorsoluce-green/10 dark:bg-vendorsoluce-green/20'
                            : 'px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-vendorsoluce-green dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <span className="ml-2">{item.label}</span>
                      </Link>
                    )
                  )}
                </div>
              ))}
            </div>
            {isLicenseMode() && (
              <Link
                to="/billing"
                className={`text-base font-medium flex items-center rounded-md ${
                  isActiveLink('/billing')
                    ? 'px-3 py-2 text-vendorsoluce-green dark:text-white bg-vendorsoluce-green/10 dark:bg-vendorsoluce-green/20'
                    : 'px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-vendorsoluce-green dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Shield size={16} className="flex-shrink-0" />
                <span className="ml-2">License</span>
              </Link>
            )}
          </div>

          {/* Mobile User Menu Section */}
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center px-3">
              <UserMenu />
            </div>
          </div>
        </div>,
        document.body
      )}

      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
    </nav>
  );
};

export default Navbar;