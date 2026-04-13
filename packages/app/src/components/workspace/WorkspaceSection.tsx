import React from 'react';
import { cn } from '../../utils/cn';
import { WORKSPACE_SECTION_TITLE_CLASS } from '../vendorsoluce-intelligence/WorkspacePageShell';

interface WorkspaceSectionProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** `plain`: typographic section with spacing only (default). `card`: bordered panel when content needs containment. */
  variant?: 'plain' | 'card';
}

const WorkspaceSection: React.FC<WorkspaceSectionProps> = ({
  title,
  description,
  actions,
  children,
  className = '',
  variant = 'plain',
}) => {
  return (
    <section
      className={cn(
        'min-w-0',
        variant === 'card' &&
          'rounded-2xl border border-gray-200/70 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900',
        variant === 'plain' && 'py-1',
        className,
      )}
    >
      {(title || description || actions) ? (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {title ? <h2 className={WORKSPACE_SECTION_TITLE_CLASS}>{title}</h2> : null}
            {description ? (
              <p className="mt-1.5 text-sm leading-6 text-gray-600 dark:text-gray-400">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-shrink-0 flex-wrap gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
};

export default WorkspaceSection;
