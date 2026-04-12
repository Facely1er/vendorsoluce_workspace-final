import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/cn';

interface Action { label: string; to?: string; onClick?: () => void; variant?: 'primary'|'secondary'|'outline'|'ghost'; }
interface WorkspacePageShellProps { eyebrow?: string; title: string; description: string; actions?: Action[]; stats?: Array<{label:string; value:string|number; hint?:string}>; children: React.ReactNode; }
export const WorkspacePageShell: React.FC<WorkspacePageShellProps> = ({ eyebrow, title, description, actions = [], stats = [], children }) => (
  <div className="min-h-screen bg-gray-50/70 dark:bg-gray-950">
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200/70 bg-gradient-to-br from-white via-white to-emerald-50/50 px-6 py-6 dark:border-gray-800 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-950/30 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              {eyebrow ? <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">{eyebrow}</div> : null}
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-gray-950 dark:text-white sm:text-4xl">{title}</h1>
                <p className="max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-base">{description}</p>
              </div>
            </div>
            {actions.length > 0 ? <div className="flex flex-wrap items-center gap-3">{actions.map((action) => action.to ? <Link key={action.label} to={action.to}><Button variant={action.variant ?? 'outline'}>{action.label}</Button></Link> : <Button key={action.label} variant={action.variant ?? 'outline'} onClick={action.onClick}>{action.label}</Button>)}</div> : null}
          </div>
        </div>
        {stats.length > 0 ? <div className="grid gap-4 px-6 py-5 sm:grid-cols-2 xl:grid-cols-4 sm:px-8">{stats.map((stat) => <Card key={stat.label} className="rounded-xl border border-gray-200/70 shadow-none dark:border-gray-800"><CardContent className="p-5"><div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{stat.label}</div><div className="mt-2 text-2xl font-semibold text-gray-950 dark:text-white">{stat.value}</div>{stat.hint ? <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{stat.hint}</div> : null}</CardContent></Card>)}</div> : null}
      </section>
      <div className={cn('grid gap-6')}>{children}</div>
    </div>
  </div>
);
export default WorkspacePageShell;
