import React from 'react';
import { cn } from '../../utils/cn';
export const MetricPill: React.FC<{ label: string; value: string|number|null|undefined; tone?: 'default'|'good'|'warn'|'danger' }> = ({ label, value, tone = 'default' }) => {
  const tones = {
    default: 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200',
    good: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300',
    warn: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-300',
    danger: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300',
  } as const;
  return <div className={cn('rounded-xl border px-3 py-2', tones[tone])}><div className="text-[11px] font-semibold uppercase tracking-wide opacity-80">{label}</div><div className="mt-1 text-sm font-semibold">{value ?? '—'}</div></div>;
};
