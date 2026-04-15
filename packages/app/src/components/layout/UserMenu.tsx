import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, LogOut, Settings, UserCog, Bell, Activity, Mail, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { HelpCircle } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import {
  getBrowserWorkspaceDisplayName,
  WORKSPACE_DISPLAY_NAME_EVENT,
} from '../../utils/workspaceBrowserIdentity';

const UserMenu: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout, isAuthenticated, startTour, isDemoMode, isLocalWorkspaceMode } = useAuth();
  const ephemeralSession = isDemoMode || isLocalWorkspaceMode;
  const [browserLabelTick, setBrowserLabelTick] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onIdentity = () => setBrowserLabelTick((n) => n + 1);
    window.addEventListener(WORKSPACE_DISPLAY_NAME_EVENT, onIdentity);
    return () => window.removeEventListener(WORKSPACE_DISPLAY_NAME_EVENT, onIdentity);
  }, []);

  const navDisplayName = useMemo(() => {
    if (!user) return '';
    if (ephemeralSession) {
      const local = getBrowserWorkspaceDisplayName();
      return local?.trim() || t('auth.browserGuest', 'Guest');
    }
    return user.name || user.user_metadata?.full_name || user.email || '';
  }, [user, ephemeralSession, t, browserLabelTick]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!isAuthenticated) {
    return (
      <Link
        to="/signin?redirect=/dashboard"
        className="inline-flex items-center justify-center h-9 w-9 shrink-0 rounded-lg bg-vendorsoluce-green text-white hover:bg-vendorsoluce-green/90 dark:bg-vendorsoluce-green dark:hover:bg-vendorsoluce-green/90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vendorsoluce-green/50"
        aria-label={t('auth.getStarted', 'Get Started')}
        title={t('auth.getStarted', 'Get Started')}
      >
        <User className="h-5 w-5" />
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center focus:outline-none"
        {...(isOpen ? { 'aria-expanded': 'true' as const } : { 'aria-expanded': 'false' as const })}
        aria-haspopup="menu"
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={navDisplayName}
            className="h-8 w-8 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-vendorsoluce-navy text-white flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
        )}
        <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">
          {navDisplayName}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="font-medium text-gray-900 dark:text-white">{navDisplayName}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {ephemeralSession ? t('auth.browserSessionHint', 'This browser only') : user?.email}
            </div>
          </div>

          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Language</div>
            <LanguageSwitcher variant="buttons" className="flex flex-wrap gap-1" />
          </div>
          
          <Link
            to="/user-dashboard"
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            onClick={() => setIsOpen(false)}
          >
            <User className="h-4 w-4 mr-2" />
            {t('auth.dashboard')}
          </Link>
          
          <Link
            to="/profile"
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            onClick={() => setIsOpen(false)}
          >
            <UserCog className="h-4 w-4 mr-2" />
            {t('auth.profile')}
          </Link>
          
          <Link
            to="/account"
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {t('auth.account')}
          </Link>
          
          <Link
            to="/admin/marketing"
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            onClick={() => setIsOpen(false)}
          >
            <Mail className="h-4 w-4 mr-2" />
            Marketing Admin
          </Link>
          
          <Link
            to="/notifications"
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            onClick={() => setIsOpen(false)}
          >
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Link>
          
          <Link
            to="/user-activity"
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            onClick={() => setIsOpen(false)}
          >
            <Activity className="h-4 w-4 mr-2" />
            Activity History
          </Link>
          
          <button
            onClick={() => {
              startTour();
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Take Product Tour
          </button>
          
          <a
            href="https://www.vendorsoluce.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            onClick={() => setIsOpen(false)}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Back to Website
          </a>
          
          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
          
          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {t('auth.logout')}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;