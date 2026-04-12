import React from 'react';

const WorkspaceHero: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div className={`rounded-2xl border border-vendorsoluce-green/20 bg-gradient-to-r from-vendorsoluce-pale-green via-white to-white p-5 shadow-sm dark:border-vendorsoluce-green/20 dark:from-vendorsoluce-green/10 dark:via-gray-900 dark:to-gray-900 ${className}`.trim()}>
      {children}
    </div>
  );
};

export default WorkspaceHero;
