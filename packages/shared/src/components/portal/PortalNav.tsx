import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Workflow, Users, Shield, Menu, X } from 'lucide-react';
import ThemeToggle from '../layout/ThemeToggle';
import { PORTAL_LOGO_SRC } from './portalBrand';

interface NavLink {
  label: string;
  to: string;
  icon: React.ElementType;
}

const NAV_LINKS: NavLink[] = [
  { label: 'How It Works', to: '/how-it-works', icon: Workflow },
  { label: 'For Buyers', to: '/for-buyers', icon: Users },
  { label: 'For Vendors', to: '/for-vendors', icon: Shield },
];

const desktopLinkBase =
  'nav-link inline-flex items-center gap-1.5 px-2 py-2 rounded-md text-sm font-medium transition-colors duration-200';

const PortalNav: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav
      className="glass-nav-vs fixed top-0 left-0 right-0 z-[99999] w-full max-w-[100vw]"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 w-full min-w-0 relative">
        <div className="relative flex h-16 w-full min-w-0 items-center justify-between gap-x-2 sm:gap-x-3 lg:gap-x-4">
          {/* Brand — matches packages/website/includes/header.html */}
          <div
            className="flex items-center flex-shrink-0 min-w-0 md:max-w-none max-w-[calc(100%-60px)] relative z-[62]"
            data-tour="main-nav"
          >
            <Link to="/" className="flex items-center min-w-0 group" aria-label="VendorSoluce — home">
              <img
                src={PORTAL_LOGO_SRC}
                alt="VendorSoluce™ Logo"
                width={60}
                height={60}
                className="vs-brand-logo h-[3.75rem] w-[3.75rem] max-h-[3.75rem] max-w-[3.75rem] flex-shrink-0 transition-transform group-hover:scale-105 object-contain"
                loading="eager"
              />
              <span className="ml-1.5 min-w-0">
                <span className="block text-[1.5rem] sm:text-[1.625rem] md:text-[1.75rem] font-bold text-vendorsoluce-green dark:text-white leading-tight">
                  VendorSoluce™
                </span>
                <span className="block text-xs sm:text-sm italic text-vendorsoluce-green/80 dark:text-vendorsoluce-light-green font-normal leading-tight tracking-tighter tagline-text">
                  Supply Chain Risk Intelligence
                </span>
              </span>
            </Link>
          </div>

          {/* Desktop nav — geometric center of the bar (avoids grid middle-column offset when logo wider than right controls) */}
          <div className="pointer-events-none absolute inset-0 hidden md:flex items-center justify-center z-[61] px-10 md:px-14 lg:px-20">
            <div className="pointer-events-auto flex max-w-full items-center justify-center gap-1 flex-wrap">
              {NAV_LINKS.map(({ label, to, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`${desktopLinkBase} ${
                    isActive(to)
                      ? 'text-vendorsoluce-green dark:text-white bg-gray-50 dark:bg-gray-700'
                      : 'text-gray-700 dark:text-white hover:text-vendorsoluce-green dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop: theme */}
          <div className="hidden md:flex items-center justify-end gap-2 flex-shrink-0 relative z-[62]">
            <div data-tour="theme-toggle">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile: theme + menu */}
          <div className="flex md:hidden items-center justify-end gap-1.5 flex-shrink-0 relative z-[62]">
            <div data-tour="theme-toggle">
              <ThemeToggle />
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center p-1.5 rounded-md text-gray-700 dark:text-gray-300 hover:text-vendorsoluce-green dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none flex-shrink-0 w-9 h-9"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200/60 dark:border-gray-700/60 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 space-y-1">
            {NAV_LINKS.map(({ label, to, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(to)
                    ? 'bg-vendorsoluce-pale-green text-vendorsoluce-green dark:bg-vendorsoluce-green/20 dark:text-vendorsoluce-light-green'
                    : 'text-gray-700 dark:text-gray-300 hover:text-vendorsoluce-green dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default PortalNav;
