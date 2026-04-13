import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { cn } from '../../utils/cn';
import { WORKSPACE_SECTION_TITLE_CLASS } from './WorkspacePageShell';

export const PanelCard: React.FC<{ title: React.ReactNode; description?: React.ReactNode; children: React.ReactNode; className?: string; bodyClassName?: string; }> = ({ title, description, children, className, bodyClassName }) => (
  <Card className={cn('rounded-2xl border border-gray-200/70 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900', className)}>
    <CardHeader className="space-y-1.5 border-b border-gray-200/70 px-6 py-5 dark:border-gray-800">
      <CardTitle className={cn(WORKSPACE_SECTION_TITLE_CLASS, 'leading-snug')}>{title}</CardTitle>
      {description ? <div className="text-sm leading-6 text-gray-600 dark:text-gray-400">{description}</div> : null}
    </CardHeader>
    <CardContent className={cn('p-6', bodyClassName)}>{children}</CardContent>
  </Card>
);
export default PanelCard;
