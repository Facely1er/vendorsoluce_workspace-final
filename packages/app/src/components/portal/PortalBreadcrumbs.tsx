import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface Crumb {
  label: string;
  to?: string;
}

interface PortalBreadcrumbsProps {
  crumbs: Crumb[];
}

const PortalBreadcrumbs: React.FC<PortalBreadcrumbsProps> = ({ crumbs }) => (
  <nav aria-label="Breadcrumb" className="mb-5">
    <ol className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
      <li>
        <Link to="/" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          Portal
        </Link>
      </li>
      {crumbs.map(({ label, to }, i) => (
        <React.Fragment key={label}>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <li>
            {to && i < crumbs.length - 1 ? (
              <Link to={to} className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                {label}
              </Link>
            ) : (
              <span className="text-gray-700 dark:text-gray-300 font-medium">{label}</span>
            )}
          </li>
        </React.Fragment>
      ))}
    </ol>
  </nav>
);

export default PortalBreadcrumbs;
