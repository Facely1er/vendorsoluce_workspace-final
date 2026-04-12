import React from 'react';

interface WorkspaceSectionProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const WorkspaceSection: React.FC<WorkspaceSectionProps> = ({
  title,
  description,
  actions,
  children,
  className = '',
}) => {
  return (
    <section className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/80 ${className}`.trim()}>
      {(title || description || actions) ? (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {title ? <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
};

export default WorkspaceSection;
