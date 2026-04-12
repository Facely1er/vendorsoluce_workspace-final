import React from 'react';
import type { WorkspaceHealthStatus, PhaseHealth } from '../../types/workspace';

type HealthValue = WorkspaceHealthStatus | PhaseHealth | 'healthy' | 'degraded' | 'down';

interface WorkspaceHealthBadgeProps {
  status: HealthValue;
  className?: string;
}

const LABEL_MAP: Record<HealthValue, string> = {
  healthy: 'Healthy',
  at_risk: 'At Risk',
  critical: 'Critical',
  green: 'On Track',
  yellow: 'At Risk',
  red: 'Blocked',
  not_started: 'Not Started',
  degraded: 'Degraded',
  down: 'Down',
};

const COLOR_MAP: Record<HealthValue, string> = {
  healthy: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  at_risk: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  green: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  red: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  not_started: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  degraded: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  down: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

const WorkspaceHealthBadge: React.FC<WorkspaceHealthBadgeProps> = ({ status, className = '' }) => {
  const label = LABEL_MAP[status] ?? status;
  const color = COLOR_MAP[status] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} ${className}`}
      role="status"
      aria-label={`Health status: ${label}`}
    >
      {label}
    </span>
  );
};

export default WorkspaceHealthBadge;
