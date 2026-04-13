import React from 'react';
import { cn } from '../../utils/cn';
import {
  WORKSPACE_PAGE_BODY_STACK_CLASS,
  WORKSPACE_PAGE_BODY_STACK_LOOSE_CLASS,
} from '../vendorsoluce-intelligence/WorkspacePageShell';

type WorkspacePageBodyProps = {
  children: React.ReactNode;
  className?: string;
  /** `default`: gap-6 (matches shell section rhythm). `loose`: gap-8 for dense multi-panel dashboards. */
  variant?: 'default' | 'loose';
};

/**
 * Standard vertical stack for content inside {@link WorkspacePageShell} / {@link WorkspacePage}.
 * Prefer this over raw `space-y-*` so spacing stays consistent across workspace routes.
 */
const WorkspacePageBody: React.FC<WorkspacePageBodyProps> = ({
  children,
  className,
  variant = 'default',
}) => (
  <div
    className={cn(
      variant === 'loose' ? WORKSPACE_PAGE_BODY_STACK_LOOSE_CLASS : WORKSPACE_PAGE_BODY_STACK_CLASS,
      className,
    )}
  >
    {children}
  </div>
);

export default WorkspacePageBody;
