import React from 'react';
import { Bell, FolderOpen } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/cn';

type EmptyIcon = 'bell' | 'folder';
const iconMap = {
  bell: Bell,
  folder: FolderOpen,
} as const;

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: EmptyIcon;
  action?: { label: string; onClick?: () => void };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon = 'folder', action, className }) => {
  const Icon = iconMap[icon];
  return (
    <div className={cn('rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center dark:border-gray-800 dark:bg-gray-900/60', className)}>
      <Icon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-lg font-semibold text-gray-950 dark:text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-600 dark:text-gray-300">{description}</p>
      {action ? (
        <div className="mt-5">
          <Button variant="primary" onClick={action.onClick}>{action.label}</Button>
        </div>
      ) : null}
    </div>
  );
};

export default EmptyState;
