import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';

export interface PageNavTab {
  label: string;
  to: string;
}

interface PageNavTabsProps {
  tabs: PageNavTab[];
  className?: string;
  'aria-label'?: string;
}

/**
 * Underline-style page-level navigation tabs (cross-page Links).
 * Use when switching between related pages (not in-page panels).
 * For in-page panel switching, use <Tabs> instead.
 */
export const PageNavTabs: React.FC<PageNavTabsProps> = ({ tabs, className, 'aria-label': ariaLabel }) => {
  const { pathname } = useLocation();

  return (
    <div className={cn('mb-6', className)}>
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex flex-wrap gap-4 sm:gap-6" aria-label={ariaLabel ?? 'Page navigation'}>
          {tabs.map(({ label, to }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'border-b-2 px-1 py-3 text-sm font-medium transition-colors',
                  active
                    ? 'border-vendorsoluce-green text-vendorsoluce-green dark:border-vendorsoluce-light-green dark:text-vendorsoluce-light-green'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300',
                )}
                aria-current={active ? 'page' : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default PageNavTabs;
