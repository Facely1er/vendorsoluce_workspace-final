import React from 'react';
import WorkspacePageShell from '../vendorsoluce-intelligence/WorkspacePageShell';

export type WorkspacePageStat = { label: string; value: string | number; hint?: string };

interface WorkspacePageProps {
  title: string;
  subtitle?: string;
  /** Optional small label above the title (omit on most pages; the shell is already workspace context). */
  eyebrow?: string;
  /** Optional metric row below the hero header (same treatment as {@link WorkspacePageShell} stats). */
  stats?: WorkspacePageStat[];
  /** Extra content below the subtitle (links, meta). */
  descriptionExtra?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

/** Standard authenticated workspace page: same hero shell as {@link WorkspacePageShell} with flexible header actions. */
const WorkspacePage: React.FC<WorkspacePageProps> = ({
  title,
  subtitle,
  eyebrow,
  stats,
  descriptionExtra,
  actions,
  children,
}) => {
  return (
    <WorkspacePageShell
      eyebrow={eyebrow}
      title={title}
      description={subtitle}
      descriptionExtra={descriptionExtra}
      headerActionsSlot={actions}
      stats={stats}
    >
      {children}
    </WorkspacePageShell>
  );
};

export default WorkspacePage;
