import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { cn } from '../../utils/cn';

export const PanelCard: React.FC<{ title: React.ReactNode; description?: React.ReactNode; children: React.ReactNode; className?: string; bodyClassName?: string; }> = ({ title, description, children, className, bodyClassName }) => (
  <Card className={cn('rounded-2xl border border-gray-200/70 shadow-sm dark:border-gray-800', className)}>
    <CardHeader className="space-y-1 border-b border-gray-200/70 p-5 dark:border-gray-800">
      <CardTitle className="text-base font-semibold text-gray-950 dark:text-white">{title}</CardTitle>
      {description ? <div className="text-sm leading-6 text-gray-500 dark:text-gray-400">{description}</div> : null}
    </CardHeader>
    <CardContent className={cn('p-5', bodyClassName)}>{children}</CardContent>
  </Card>
);
export default PanelCard;
