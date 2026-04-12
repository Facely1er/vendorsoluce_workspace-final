import React from 'react';

interface WorkspacePageProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

const WorkspacePage: React.FC<WorkspacePageProps> = ({ title, subtitle, actions, children }) => {
  return (
    <div className="w-full min-w-0">
      <div className="w-full min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h1>
            {subtitle ? (
              <p className="mt-2 max-w-3xl text-sm sm:text-base leading-relaxed text-gray-600 dark:text-gray-300">{subtitle}</p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>

        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default WorkspacePage;
