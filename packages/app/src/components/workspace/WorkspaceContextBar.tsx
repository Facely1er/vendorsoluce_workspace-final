import React from 'react';

export interface WorkspaceContextItem {
  label: string;
  value: string;
}

const WorkspaceContextBar: React.FC<{ items: WorkspaceContextItem[] }> = ({ items }) => {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={`${item.label}-${item.value}`} className="rounded-xl border border-white/70 bg-white/80 px-4 py-3 dark:border-gray-800 dark:bg-gray-950/40">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{item.label}</p>
          <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{item.value}</p>
        </div>
      ))}
    </div>
  );
};

export default WorkspaceContextBar;
