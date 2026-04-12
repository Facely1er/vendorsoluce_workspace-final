import React from 'react';
import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react';
import { cn } from '../../utils/cn';

type Tone = 'success' | 'error' | 'warning' | 'info';

const toneStyles: Record<Tone, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300',
  error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300',
  warning: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300',
  info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-300',
};

const icons = {
  success: CheckCircle2,
  error: AlertTriangle,
  warning: ShieldAlert,
  info: Info,
} as const;

export interface StatusBannerProps {
  tone?: Tone;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const StatusBanner: React.FC<StatusBannerProps> = ({ tone = 'info', title, children, className }) => {
  const Icon = icons[tone];
  return (
    <div className={cn('rounded-2xl border px-4 py-3', toneStyles[tone], className)}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
        <div className="min-w-0">
          {title ? <div className="text-sm font-semibold">{title}</div> : null}
          <div className="text-sm leading-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default StatusBanner;
