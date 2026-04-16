import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  BarChart3,
  Shield,
  ExternalLink,
  Home,
  Search,
} from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';
import QuickCreateMenu from './QuickCreateMenu';
import NotificationsBell from './NotificationsBell';
import CommandPalette from '../common/CommandPalette';
import { useTranslation } from 'react-i18next';
import { config } from '../../utils/config';
import { isLicenseMode } from '../../config/license';
import {
  getWorkspaceSections,
} from '../../navigation/supplyChainSolutionsNav';
import { SHELL_CLASSES } from '../../layout/shell';
import { MR, WR, isWorkspaceAppPath } from 'shared/constants/routes';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onMobileMenuToggle?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMobileMenuToggle }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  /** Center nav region (workspace search / marketing links); kept for stable refs and any future focus/outside logic. */
  const navCenterRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
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

  const toggleMenu = () => setIsOpen(!isOpen);

  const workspaceSections = useMemo(() => getWorkspaceSections(t), [t]);
  const workspaceChrome = isWorkspaceAppPath(location.pathname);
  const portalUrl =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Vite env typing varies across workspaces
    ((import.meta as any)?.env?.VITE_PORTAL_URL as string | undefined) || 'https://www.portal.vendorsoluce.com';

  const trialChip = useMemo(() => {
    const p = profile as unknown as {
      subscription_status?: string;
      trial_ends_at?: string;
      plan?: string;
    } | null;

    const status = p?.subscription_status;
    const plan = p?.plan;
    const trialEndsAt = p?.trial_ends_at;

    if (!status) return null;
    if (status === 'active' && plan === 'starter') return null;
    if (status === 'active') return null;

    if (status === 'past_due') {
      return {
        text: 'Payment due',
        classes:
          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      };
    }

    if (status === 'trialing') {
      let daysLeft: number | null = null;
      if (trialEndsAt) {
        try {
          daysLeft = differenceInDays(parseISO(trialEndsAt), new Date());
        } catch {
          daysLeft = null;
        }
      }

      if (typeof daysLeft === 'number' && daysLeft <= 0) {
        return {
          text: 'Trial expired',
          classes:
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        };
      }

      const label =
        typeof daysLeft === 'number'
          ? `Trial · ${daysLeft} days left`
          : 'Trial';

      return {
        text: label,
        classes:
          'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      };
    }

    return null;
  }, [profile]);

  const isActiveLink = (href: string): boolean => {
    if (href === '#') return false;
    const p = location.pathname;
    if (p === href) return true;
    if (href !== '/' && p.startsWith(`${href}/`)) return true;
    return false;
  };

  /** Portfolio home only (not import, vendor detail, or other `/workspace/vendors/*` routes). */
  const isWorkspacePortfolioNavActive = (): boolean => {
    const p = location.pathname;
    return p === MR.VENDORS || p.startsWith(`${MR.VENDORS}/`);
  };

  const isWorkspaceHomeActive = (): boolean => {
    return location.pathname === MR.DASHBOARD;
  };

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
            {workspaceChrome ? (
              <>
                {onMobileMenuToggle && (
                  <button
                    type="button"
                    className="mr-2 flex h-9 w-9 items-center justify-center rounded-lg
                               text-gray-500 hover:bg-gray-100 hover:text-gray-800
                               dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100
                               md:hidden"
                    onClick={onMobileMenuToggle}
                    aria-label="Open navigation menu"
                  >
                    <Menu className="h-5 w-5" aria-hidden />
                  </button>
                )}
                <Link to={MR.DASHBOARD} className="flex items-center min-w-0 group" title={t('navigation.dashboard')}>
                <img
                  src="/homepage_files/vendorsoluce.png"
                  alt="VendorSoluce™ logo"
                  width={60}
                  height={60}
                  className="vs-brand-logo h-[3.75rem] w-[3.75rem] max-h-[3.75rem] max-w-[3.75rem] flex-shrink-0 transition-transform group-hover:scale-105 object-contain"
                />
                <span className="ml-1.5 min-w-0">
                  <span className="block text-[1.5rem] sm:text-[1.625rem] md:text-[1.75rem] font-bold text-vendorsoluce-green dark:text-white leading-tight truncate">VendorSoluce™</span>
                  <span className="block text-xs sm:text-sm italic text-vendorsoluce-green/80 dark:text-vendorsoluce-light-green font-normal leading-tight tracking-tighter tagline-text">Supply Chain Risk Intelligence</span>
                </span>
              </Link>
              </>
            ) : (
              <Link to={MR.HOME} className="flex items-center min-w-0 group" title={t('navigation.home')}>
                <img
                  src="/homepage_files/vendorsoluce.png"
                  alt="VendorSoluce™ logo"
                  width={60}
                  height={60}
                  className="vs-brand-logo h-[3.75rem] w-[3.75rem] max-h-[3.75rem] max-w-[3.75rem] flex-shrink-0 transition-transform group-hover:scale-105 object-contain"
                />
                <span className="ml-1.5 min-w-0">
                  <span className="block text-[1.5rem] sm:text-[1.625rem] md:text-[1.75rem] font-bold text-vendorsoluce-green dark:text-white leading-tight truncate">VendorSoluce™</span>
                  <span className="block text-xs sm:text-sm italic text-vendorsoluce-green/80 dark:text-vendorsoluce-light-green font-normal leading-tight tracking-tighter tagline-text">Supply Chain Risk Intelligence</span>
                </span>
              </Link>
            )}
          </div>

          {workspaceChrome ? (
            <>
              <div className="flex-1 min-w-0" />

              {/* Desktop: workspace actions (search + portal + quick create + notifications + trial + user) */}
              <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                <div ref={navCenterRef} className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={() => setIsCommandPaletteOpen(true)}
                  className="inline-flex max-w-full min-w-0 items-center gap-2 rounded-lg border border-gray-200/90 bg-white/60 px-2.5 py-1.5 text-left text-sm text-gray-600 shadow-sm backdrop-blur-sm hover:border-vendorsoluce-green/35 hover:text-vendorsoluce-green dark:border-gray-600/90 dark:bg-gray-800/60 dark:text-gray-300 dark:hover:border-vendorsoluce-green/45 dark:hover:text-white"
                  aria-label={t('navigation.workspaceSearchAria', 'Search workspace')}
                  title={t('navigation.workspaceSearchHint', 'Jump to a page (Ctrl+K)')}
                >
                  <Search size={16} className="shrink-0 opacity-70" aria-hidden />
                  <span className="hidden truncate sm:inline">{t('navigation.search', 'Search')}</span>
                  <kbd className="ml-0.5 hidden shrink-0 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-sans text-[10px] font-medium text-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-500 xl:inline">
                    Ctrl+K
                  </kbd>
                </button>

                <a
                  href={portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center text-xs text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
                  title="Vendor portal"
                >
                  Vendor portal ↗
                </a>

                <QuickCreateMenu />
                <NotificationsBell />

                {trialChip && (
                  <Link
                    to={MR.PRICING}
                    className={`hidden md:inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${trialChip.classes}`}
                    title="Plan status"
                  >
                    {trialChip.text}
                  </Link>
                )}

                <div data-tour="theme-toggle" className="flex items-center">
                  <ThemeToggle />
                </div>
                <div data-tour="user-menu">
                  <UserMenu />
                </div>
                </div>
              </div>
            </>
          ) : (
            /* Desktop: marketing links — workspace uses sidebar for nav; header only Search + License */
            <div
              ref={navCenterRef}
              className="hidden md:flex md:flex-1 md:min-w-0 md:items-center md:justify-center md:gap-2 md:px-2"
            >
              <Link
                to={MR.HOME}
                className={getActiveLinkClasses(isActiveLink(MR.HOME))}
                title={t('navigation.home')}
              >
                <Home size={16} className="flex-shrink-0" />
                <span className="ml-1 text-sm">{t('navigation.home')}</span>
              </Link>
              <Link
                to={MR.PRICING}
                className={getActiveLinkClasses(isActiveLink(MR.PRICING))}
              >
                {t('navigation.pricing')}
              </Link>
              <Link
                to={MR.HOW_IT_WORKS}
                className={getActiveLinkClasses(isActiveLink(MR.HOW_IT_WORKS))}
              >
                {t('navigation.howItWorks')}
              </Link>
              <Link
                to={MR.CONTACT}
                className={getActiveLinkClasses(isActiveLink(MR.CONTACT))}
              >
                {t('navigation.contact')}
              </Link>
              <Link
                to={MR.VENDORS}
                className={getActiveLinkClasses(isWorkspacePortfolioNavActive())}
                title={t('navigation.vendorRiskDashboard')}
              >
                <BarChart3 size={16} className="flex-shrink-0" />
                <span className="ml-1 text-sm">{t('navigation.vendorRisk')}</span>
              </Link>
              <a
                href={config.app.websiteUrl}
                className="px-2 py-1.5 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-vendorsoluce-green dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 inline-flex items-center gap-1 max-w-[11rem]"
                target="_blank"
                rel="noopener noreferrer"
                title={t('navigation.corporateWebsite', 'Corporate website')}
              >
                <span className="truncate">{t('navigation.corporateWebsite', 'Corporate website')}</span>
                <ExternalLink size={14} className="opacity-60 shrink-0" aria-hidden />
              </a>
            </div>
          )}

          {/* Desktop: Theme + User (marketing + workspace) */}
          <div className="hidden md:flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
            {!workspaceChrome && (
              <>
                <div data-tour="theme-toggle" className="flex items-center">
                  <ThemeToggle />
                </div>
                <div data-tour="user-menu">
                  <UserMenu />
                </div>
              </>
            )}
          </div>
          
          {/* Mobile: theme + menu */}
          <div className="flex items-center md:hidden flex-shrink-0 ml-auto gap-1.5">
            <div data-tour="theme-toggle" className="flex items-center flex-shrink-0">
              <ThemeToggle />
            </div>
            {workspaceChrome && (
              <>
                <NotificationsBell />
                <div data-tour="user-menu" className="flex items-center">
                  <UserMenu />
                </div>
              </>
            )}
            {(!workspaceChrome || !onMobileMenuToggle) && (
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
            )}
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
            {workspaceChrome ? (
              <Link to={MR.DASHBOARD} className="flex items-center group" onClick={() => setIsOpen(false)} title={t('navigation.dashboard')}>
                <img
                  src="/homepage_files/vendorsoluce.png"
                  alt="VendorSoluce™ logo"
                  width={60}
                  height={60}
                  className="vs-brand-logo h-[3.75rem] w-[3.75rem] max-h-[3.75rem] max-w-[3.75rem] flex-shrink-0 transition-transform group-hover:scale-105 object-contain"
                />
                <span className="ml-1.5 min-w-0">
                  <span className="block text-[1.625rem] font-bold text-vendorsoluce-green dark:text-white leading-tight">VendorSoluce™</span>
                  <span className="block text-xs sm:text-sm italic text-vendorsoluce-green/80 dark:text-vendorsoluce-light-green font-normal leading-tight tracking-tighter">Supply Chain Risk Intelligence</span>
                </span>
              </Link>
            ) : (
              <Link to={MR.HOME} className="flex items-center group" onClick={() => setIsOpen(false)} title={t('navigation.home')}>
                <img
                  src="/homepage_files/vendorsoluce.png"
                  alt="VendorSoluce™ logo"
                  width={60}
                  height={60}
                  className="vs-brand-logo h-[3.75rem] w-[3.75rem] max-h-[3.75rem] max-w-[3.75rem] flex-shrink-0 transition-transform group-hover:scale-105 object-contain"
                />
                <span className="ml-1.5 min-w-0">
                  <span className="block text-[1.625rem] font-bold text-vendorsoluce-green dark:text-white leading-tight">VendorSoluce™</span>
                  <span className="block text-xs sm:text-sm italic text-vendorsoluce-green/80 dark:text-vendorsoluce-light-green font-normal leading-tight tracking-tighter">Supply Chain Risk Intelligence</span>
                </span>
              </Link>
            )}
          </div>

          <div className="px-4 pt-2 pb-3 space-y-1">
            {workspaceChrome ? (
              <>
                <Link
                  to={MR.DASHBOARD}
                  className={`text-base font-medium flex items-center rounded-md ${
                    isWorkspaceHomeActive()
                      ? 'px-3 py-2 text-vendorsoluce-green dark:text-white bg-vendorsoluce-green/10 dark:bg-vendorsoluce-green/20'
                      : 'px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-vendorsoluce-green dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <BarChart3 size={16} className="flex-shrink-0" />
                  <span className="ml-2">{t('navigation.dashboard')}</span>
                </Link>
                <button
                  type="button"
                  className="mt-1 w-full text-base font-medium flex items-center rounded-md px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-vendorsoluce-green dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => {
                    setIsCommandPaletteOpen(true);
                    setIsOpen(false);
                  }}
                >
                  <Search size={16} className="flex-shrink-0" aria-hidden />
                  <span className="ml-2">{t('navigation.search', 'Search')}</span>
                  <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">Ctrl+K</span>
                </button>
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
              </>
            ) : (
              <>
                <Link
                  to={MR.HOME}
                  className={`text-base font-medium flex items-center rounded-md ${
                    isActiveLink(MR.HOME)
                      ? 'px-3 py-2 text-vendorsoluce-green dark:text-white bg-vendorsoluce-green/10 dark:bg-vendorsoluce-green/20'
                      : 'px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-vendorsoluce-green dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Home size={16} className="flex-shrink-0" />
                  <span className="ml-2">{t('navigation.home')}</span>
                </Link>
                <Link
                  to={MR.PRICING}
                  className={`text-base font-medium flex items-center rounded-md ${
                    isActiveLink(MR.PRICING)
                      ? 'px-3 py-2 text-vendorsoluce-green dark:text-white bg-vendorsoluce-green/10 dark:bg-vendorsoluce-green/20'
                      : 'px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-vendorsoluce-green dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {t('navigation.pricing')}
                </Link>
                <Link
                  to={MR.HOW_IT_WORKS}
                  className={`text-base font-medium flex items-center rounded-md ${
                    isActiveLink(MR.HOW_IT_WORKS)
                      ? 'px-3 py-2 text-vendorsoluce-green dark:text-white bg-vendorsoluce-green/10 dark:bg-vendorsoluce-green/20'
                      : 'px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-vendorsoluce-green dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {t('navigation.howItWorks')}
                </Link>
                <Link
                  to={MR.CONTACT}
                  className={`text-base font-medium flex items-center rounded-md ${
                    isActiveLink(MR.CONTACT)
                      ? 'px-3 py-2 text-vendorsoluce-green dark:text-white bg-vendorsoluce-green/10 dark:bg-vendorsoluce-green/20'
                      : 'px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-vendorsoluce-green dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {t('navigation.contact')}
                </Link>
                <Link
                  to={MR.VENDORS}
                  className={`text-base font-medium flex items-center rounded-md ${
                    isWorkspacePortfolioNavActive()
                      ? 'px-3 py-2 text-vendorsoluce-green dark:text-white bg-vendorsoluce-green/10 dark:bg-vendorsoluce-green/20'
                      : 'px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-vendorsoluce-green dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <BarChart3 size={16} className="flex-shrink-0" />
                  <span className="ml-2">{t('navigation.vendorRisk')}</span>
                </Link>
                <a
                  href={config.app.websiteUrl}
                  className="text-base font-medium flex items-center rounded-md px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-vendorsoluce-green dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 gap-2"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                >
                  {t('navigation.corporateWebsite', 'Corporate website')}
                  <ExternalLink className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
                </a>
              </>
            )}
          </div>

          {/* Mobile User Menu Section */}
          {!workspaceChrome && (
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center px-3">
                <UserMenu />
              </div>
            </div>
          )}
        </div>,
        document.body
      )}

      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
    </nav>
  );
};

export default Navbar;