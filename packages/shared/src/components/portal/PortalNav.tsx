import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Workflow, Users, Shield, Menu, X } from 'lucide-react';
import ThemeToggle from '../layout/ThemeToggle';

// Resolve logo from app public folder (same as main nav); works with Vite base path
const LOGO_SRC = `${(import.meta.env.BASE_URL || '/').replace(/\/*$/, '')}/vendorsoluce.png`;

interface NavLink {
  label: string;
  to: string;
  icon: React.ElementType;
}

// Security and Frameworks are in the footer only to keep the header uncluttered
const NAV_LINKS: NavLink[] = [
  { label: 'How It Works', to: '/how-it-works', icon: Workflow },
  { label: 'For Buyers',   to: '/for-buyers',   icon: Users },
  { label: 'For Vendors',  to: '/for-vendors',  icon: Shield },
];

const PortalNav: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 min-h-16">

          {/* Logo — public/vendorsoluce.png (VendorSoluce logo) */}
          <Link to="/" className="flex items-center group flex-shrink-0 min-w-0" aria-label="VendorSoluce Vendor Risk Portal">
            <img
              src={LOGO_SRC}
              alt="VendorSoluce\u2122"
              className="h-[3.75rem] w-[3.75rem] flex-shrink-0 object-contain transition-transform group-hover:scale-105"
            />
            <span className="ml-1.5 min-w-0">
              <span className="block text-sm font-bold text-vendorsoluce-green dark:text-white leading-tight truncate">VendorSoluce\u2122</span>
              <span className="block text-[10px] italic text-vendorsoluce-green/80 dark:text-vendorsoluce-light-green leading-tight">Vendor Risk Portal</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0">
            {NAV_LINKS.map(({ label, to, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-0.5 px-1.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  isActive(to)
                    ? 'bg-vendorsoluce-pale-green text-vendorsoluce-green dark:bg-vendorsoluce-green/20 dark:text-vendorsoluce-light-green'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-2.5 h-2.5 flex-shrink-0" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop: theme toggle on the right */}
          <div className="hidden md:flex items-center gap-1">
            <ThemeToggle />
          </div>

          {/* Mobile: theme toggle + menu button on the right */}
          <div className="flex md:hidden items-center gap-1">
            <ThemeToggle />
            <button
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map(({ label, to, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive(to)
                    ? 'bg-vendorsoluce-pale-green text-vendorsoluce-green dark:bg-vendorsoluce-green/20 dark:text-vendorsoluce-light-green'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default PortalNav;
