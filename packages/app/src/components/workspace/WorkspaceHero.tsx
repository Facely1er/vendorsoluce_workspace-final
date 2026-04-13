import React from 'react';
import { cn } from '../../utils/cn';
import { WORKSPACE_PAGE_SHELL_EYEBROW_CLASS } from '../vendorsoluce-intelligence/WorkspacePageShell';

/** Re-export for pages that show a secondary headline inside a hero strip (same rhythm as the shell eyebrow). */
export const WORKSPACE_HERO_EYEBROW_CLASS = WORKSPACE_PAGE_SHELL_EYEBROW_CLASS;

const WorkspaceHero: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'border-b border-gray-200/80 pb-6 dark:border-gray-800',
        className,
      )}
    >
      {children}
    </div>
  );
};

export default WorkspaceHero;
