import React from 'react';

interface LoadingBlockProps {
  label?: string;
  className?: string;
}

const LoadingBlock: React.FC<LoadingBlockProps> = ({ label = 'Loading workspace view…', className = '' }) => (
  <div className={`flex min-h-[280px] items-center justify-center rounded-2xl border border-gray-200/70 bg-white px-6 py-10 shadow-sm dark:border-gray-800 dark:bg-gray-900/60 ${className}`.trim()}>
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-emerald-600 dark:border-gray-700 dark:border-t-emerald-500" />
      <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</div>
    </div>
  </div>
);

export default LoadingBlock;
