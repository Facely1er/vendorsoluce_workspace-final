import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Zap } from 'lucide-react';
import { Button } from '../../components/ui/Button';
/** Outer page background + width (matches authenticated workspace shell). */
export const WORKSPACE_PAGE_SHELL_OUTER_CLASS = 'min-h-screen bg-gray-50/70 dark:bg-gray-950';
/** Inner horizontal padding and max width for shell content and loading placeholders. */
export const WORKSPACE_PAGE_SHELL_INNER_CLASS =
  'mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8';
/** Vertical rhythm between major blocks below the hero (shell wraps `children` in this grid). */
export const WORKSPACE_PAGE_BODY_GRID_CLASS = 'grid gap-6';
/**
 * Single-column stack for page body content — use instead of ad-hoc `space-y-6` / `space-y-8`
 * so spacing matches the shell grid when a page uses one wrapper div.
 */
export const WORKSPACE_PAGE_BODY_STACK_CLASS = 'flex min-w-0 flex-col gap-6';
/** Looser vertical rhythm for dense dashboards (optional). */
export const WORKSPACE_PAGE_BODY_STACK_LOOSE_CLASS = 'flex min-w-0 flex-col gap-8';
/**
 * Page header region (flat border, no nested “card in card”) — keeps the workspace chrome readable
 * without duplicating container chrome against body sections.
 */
export const WORKSPACE_PAGE_SHELL_HERO_CARD_CLASS =
  'border-b border-gray-200/80 pb-8 dark:border-gray-800';
/** Title + actions row inside the page header. */
export const WORKSPACE_PAGE_SHELL_HERO_HEADER_CLASS = 'min-w-0';
/** Eyebrow label: same letter-spacing and weight everywhere. */
export const WORKSPACE_PAGE_SHELL_EYEBROW_CLASS =
  'text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400';
/** Uppercase metric / context labels (gray, matches shell stat tiles). */
export const WORKSPACE_PAGE_SHELL_METRIC_LABEL_CLASS =
  'text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400';
/** Section / panel titles (aligned across {@link WorkspaceSection} and PanelCard). */
export const WORKSPACE_SECTION_TITLE_CLASS =
  'text-lg font-semibold tracking-tight text-gray-950 dark:text-white';
/** Stats row below the title block: one rhythm, no per-metric cards. */
export const WORKSPACE_PAGE_SHELL_STATS_ROW_CLASS =
  'mt-8 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-gray-200/70 pt-8 sm:grid-cols-2 lg:grid-cols-4 dark:border-gray-800';

interface Action { label: string; to?: string; onClick?: () => void; variant?: 'primary'|'secondary'|'outline'|'ghost'; }
interface WorkspacePageShellProps {
  /**
   * Distinguishes orientation from doing work in-product.
   * - `guide`: playbook / how the workflow fits (avoid marketing fluff; explain sequence).
   * - `execute`: forms, wizards, assessments — the surface where tasks are performed.
   */
  mode?: 'guide' | 'execute';
  eyebrow?: string;
  title: string;
  description?: string;
  /** Rich description line(s) below the main description (e.g. inline links). */
  descriptionExtra?: React.ReactNode;
  actions?: Action[];
  /** Custom header actions (buttons/links). Takes precedence over `actions` when set. */
  headerActionsSlot?: React.ReactNode;
  stats?: Array<{label:string; value:string|number; hint?:string}>;
  children: React.ReactNode;
}
export const WorkspacePageShell: React.FC<WorkspacePageShellProps> = ({
  mode,
  eyebrow,
  title,
  description,
  descriptionExtra,
  actions = [],
  headerActionsSlot,
  stats = [],
  children,
}) => (
  <div className={WORKSPACE_PAGE_SHELL_OUTER_CLASS}>
    <div className={WORKSPACE_PAGE_SHELL_INNER_CLASS}>
      <header
        className={`${WORKSPACE_PAGE_SHELL_HERO_CARD_CLASS} ${
          mode === 'guide'
            ? 'border-l-4 border-l-slate-400 pl-4 dark:border-l-slate-500'
            : mode === 'execute'
              ? 'border-l-4 border-l-emerald-600 pl-4 dark:border-l-emerald-500'
              : ''
        }`}
      >
        <div className={WORKSPACE_PAGE_SHELL_HERO_HEADER_CLASS}>
          {/*
            Title + descriptions stay full-width (same as body). Header actions sit on their own row so
            wide button groups (e.g. VIRA reports) do not shrink the heading column beside a flex sibling.
          */}
          <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
            <div className="min-w-0 space-y-3">
              {mode === 'guide' ? (
                <div className="inline-flex max-w-full items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                  <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Playbook
                </div>
              ) : mode === 'execute' ? (
                <div className="inline-flex max-w-full items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <Zap className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Execute
                </div>
              ) : null}
              {eyebrow ? <div className={WORKSPACE_PAGE_SHELL_EYEBROW_CLASS}>{eyebrow}</div> : null}
              <div className="space-y-2">
                <h1 className="min-w-0 text-balance text-3xl font-semibold tracking-tight text-gray-950 dark:text-white sm:text-4xl">
                  {title}
                </h1>
                {description ? (
                  <p className="min-w-0 max-w-none text-pretty text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-base">
                    {description}
                  </p>
                ) : null}
                {descriptionExtra ? <div className="min-w-0 max-w-none pt-1">{descriptionExtra}</div> : null}
              </div>
            </div>
            {headerActionsSlot ? (
              <div className="flex min-w-0 flex-wrap items-center justify-start gap-3 border-t border-gray-200/60 pt-4 dark:border-gray-800/80 sm:justify-end sm:pt-5">
                {headerActionsSlot}
              </div>
            ) : actions.length > 0 ? (
              <div className="flex min-w-0 flex-wrap items-center justify-start gap-3 border-t border-gray-200/60 pt-4 dark:border-gray-800/80 sm:justify-end sm:pt-5">
                {actions.map((action) =>
                  action.to ? (
                    <Link key={action.label} to={action.to}>
                      <Button variant={action.variant ?? 'outline'}>{action.label}</Button>
                    </Link>
                  ) : (
                    <Button key={action.label} variant={action.variant ?? 'outline'} onClick={action.onClick}>
                      {action.label}
                    </Button>
                  ),
                )}
              </div>
            ) : null}
          </div>
        </div>
        {stats.length > 0 ? (
          <div className={WORKSPACE_PAGE_SHELL_STATS_ROW_CLASS} role="list">
            {stats.map((stat) => (
              <div key={stat.label} className="min-w-0" role="listitem">
                <div className={WORKSPACE_PAGE_SHELL_METRIC_LABEL_CLASS}>{stat.label}</div>
                <div className="mt-1.5 text-2xl font-semibold tabular-nums text-gray-950 dark:text-white">{stat.value}</div>
                {stat.hint ? <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{stat.hint}</div> : null}
              </div>
            ))}
          </div>
        ) : null}
      </header>
      <div className={WORKSPACE_PAGE_BODY_GRID_CLASS}>{children}</div>
    </div>
  </div>
);
export default WorkspacePageShell;
