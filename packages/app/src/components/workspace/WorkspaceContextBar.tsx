import React from 'react';
import { cn } from '../../utils/cn';
import { WORKSPACE_PAGE_SHELL_METRIC_LABEL_CLASS } from '../vendorsoluce-intelligence/WorkspacePageShell';

export interface WorkspaceContextItem {
  label: string;
  value: string;
}

const WorkspaceContextBar: React.FC<{ items: WorkspaceContextItem[] }> = ({ items }) => {
  return (
    <div
      className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-x-0 sm:divide-x sm:divide-gray-200/80 dark:sm:divide-gray-700"
      role="list"
    >
      {items.map((item, index) => (
        <div
          key={`${item.label}-${item.value}`}
          className={cn(
            'min-w-0 sm:max-w-none sm:flex-1 sm:px-5',
            index === 0 && 'sm:pl-0',
            index === items.length - 1 && 'sm:pr-0',
          )}
          role="listitem"
        >
          <div className={WORKSPACE_PAGE_SHELL_METRIC_LABEL_CLASS}>{item.label}</div>
          <div className="mt-1 text-sm font-semibold tabular-nums text-gray-950 dark:text-white">{item.value}</div>
        </div>
      ))}
    </div>
  );
};

export default WorkspaceContextBar;
