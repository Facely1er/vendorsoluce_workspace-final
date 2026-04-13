import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export interface WorkspaceEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  primaryAction: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
}

const WorkspaceEmptyState: React.FC<WorkspaceEmptyStateProps> = ({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
}) => {
  return (
    <div className="flex items-center justify-center py-14">
      <div className="w-full max-w-[400px] px-4 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
          {icon}
        </div>
        <div className="text-base font-medium text-gray-900 dark:text-white">{title}</div>
        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <Link to={primaryAction.href}>
            <Button variant="primary">{primaryAction.label}</Button>
          </Link>
          {secondaryAction && (
            <Link
              to={secondaryAction.href}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:underline dark:text-gray-300 dark:hover:text-white"
            >
              {secondaryAction.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceEmptyState;

