import React from 'react';

interface WorkspaceResultSummaryProps {
  score: number;
  tier: string;
  summary: string;
}

const WorkspaceResultSummary: React.FC<WorkspaceResultSummaryProps> = ({ score, tier, summary }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Current score</p>
          <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{score}<span className="text-base font-medium text-gray-500 dark:text-gray-400">/100</span></p>
          <p className="mt-1 text-sm font-medium text-vendorsoluce-green dark:text-vendorsoluce-light-green">{tier}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{summary}</p>
    </div>
  );
};

export default WorkspaceResultSummary;
