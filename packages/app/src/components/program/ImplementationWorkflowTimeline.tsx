import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock,
  FileText,
  Target,
  Zap,
} from 'lucide-react';
import type { VendorProgramWorkflowId, VendorProgramWorkflowStep } from '../../lib/vendorProgramWorkflowTypes';
import { useVendorProgramWorkflowProgress } from '../../hooks/useVendorProgramWorkflowProgress';
import { ProgressBarFill } from '../ui/ProgressBarFill';

export type WorkflowTimelineLabels = {
  viewDetails: string;
  hideDetails: string;
  completed: string;
  inProgress: string;
  pending: string;
  duration: string;
  activities: string;
  deliverables: string;
  tools: string;
  assignedRoles: string;
  keyActivities: string;
  deliverablesHeading: string;
  platformTools: string;
  markComplete: string;
  markIncomplete: string;
  overallProgress: string;
  resetProgress: string;
  sipocCatalog: string;
};

type StepStatus = 'completed' | 'in_progress' | 'pending';

function deriveStatuses(
  stepIds: string[],
  completed: Set<string>
): { status: StepStatus; barPct: number }[] {
  let seenIncomplete = false;
  return stepIds.map((id) => {
    if (completed.has(id)) {
      return { status: 'completed' as const, barPct: 100 };
    }
    if (!seenIncomplete) {
      seenIncomplete = true;
      return { status: 'in_progress' as const, barPct: 40 };
    }
    return { status: 'pending' as const, barPct: 0 };
  });
}

type Props = {
  workflowId: VendorProgramWorkflowId;
  steps: readonly VendorProgramWorkflowStep[];
  activityCountForStep: (step: VendorProgramWorkflowStep) => number;
  labels: WorkflowTimelineLabels;
  alternateProgramHref: string;
  alternateProgramLabel: string;
  /** Optional per-step extra hint rendered below role chips (e.g. checklist progress). */
  stepHint?: (step: VendorProgramWorkflowStep) => React.ReactNode;
};

const statusBadge = (status: StepStatus, labels: WorkflowTimelineLabels) => {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/35 px-2 py-0.5 text-xs font-medium text-green-800 dark:text-green-300">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
        {labels.completed}
      </span>
    );
  }
  if (status === 'in_progress') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/35 px-2 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300">
        <Clock className="h-3.5 w-3.5" aria-hidden />
        {labels.inProgress}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400">
      <Target className="h-3.5 w-3.5" aria-hidden />
      {labels.pending}
    </span>
  );
};

const barFillColor = (status: StepStatus) => {
  if (status === 'completed') return 'fill-green-500';
  if (status === 'in_progress') return 'fill-blue-500';
  return 'fill-gray-200 dark:fill-gray-600';
};

export const ImplementationWorkflowTimeline: React.FC<Props> = ({
  workflowId,
  steps,
  activityCountForStep,
  labels,
  alternateProgramHref,
  alternateProgramLabel,
  stepHint,
}) => {
  const { completed, completedCount, toggleStep, reset } = useVendorProgramWorkflowProgress(workflowId);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const stepIds = useMemo(() => steps.map((s) => s.id), [steps]);
  const derived = useMemo(() => deriveStatuses(stepIds, completed), [stepIds, completed]);

  const overallPct = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/40 p-4">
        <div className="flex-1 min-w-[12rem]">
          <ProgressBarFill percent={overallPct} fillClassName="fill-vendorsoluce-green" />
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
          {labels.overallProgress}: {overallPct}% ({completedCount}/{steps.length})
        </span>
        {completedCount > 0 && (
          <button
            type="button"
            onClick={reset}
            className="text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 underline underline-offset-2"
          >
            {labels.resetProgress}
          </button>
        )}
        <Link
          to="/vendor-activity-catalog"
          className="text-xs font-medium text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline"
        >
          {labels.sipocCatalog} →
        </Link>
        <Link
          to={alternateProgramHref}
          className="text-xs font-medium text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline"
        >
          {alternateProgramLabel} →
        </Link>
      </div>

      <div className="relative">
        <div
          className="absolute left-[1.15rem] top-4 bottom-4 w-0.5 bg-vendorsoluce-green/30 dark:bg-vendorsoluce-green/40 hidden sm:block"
          aria-hidden
        />

        <ul className="space-y-6 list-none m-0 p-0">
          {steps.map((step, index) => {
            const { status, barPct } = derived[index];
            const isOpen = expanded.has(step.id);
            const actCount = activityCountForStep(step);
            const delivCount = step.deliverables.length;
            const toolCount = step.tools.length;

            return (
              <li key={step.id} className="relative sm:pl-12">
                <div
                  className="absolute left-0 top-6 hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-vendorsoluce-green text-white text-sm font-bold shadow-md ring-4 ring-white dark:ring-gray-900"
                  aria-hidden
                >
                  {step.n}
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 shadow-sm overflow-hidden">
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <span className="sm:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-vendorsoluce-green text-white text-sm font-bold">
                          {step.n}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {step.title}
                            </h2>
                            {statusBadge(status, labels)}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{step.description}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleExpand(step.id)}
                        className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-vendorsoluce-green/40 bg-vendorsoluce-green/10 dark:bg-vendorsoluce-green/20 px-3 py-1.5 text-xs font-medium text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:bg-vendorsoluce-green/20"
                        aria-expanded={isOpen ? 'true' : 'false'}
                      >
                        {isOpen ? labels.hideDetails : labels.viewDetails}
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          aria-hidden
                        />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-center">
                      <div className="rounded-lg bg-gray-50 dark:bg-gray-800/80 p-2">
                        <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          {labels.duration}
                        </div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {step.durationLabel}
                        </div>
                      </div>
                      <div className="rounded-lg bg-gray-50 dark:bg-gray-800/80 p-2">
                        <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          {labels.activities}
                        </div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                          {actCount}
                        </div>
                      </div>
                      <div className="rounded-lg bg-gray-50 dark:bg-gray-800/80 p-2">
                        <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          {labels.deliverables}
                        </div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                          {delivCount}
                        </div>
                      </div>
                      <div className="rounded-lg bg-gray-50 dark:bg-gray-800/80 p-2">
                        <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          {labels.tools}
                        </div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                          {toolCount}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <ProgressBarFill
                        percent={barPct}
                        fillClassName={barFillColor(status)}
                        trackClassName="bg-gray-100 dark:bg-gray-800"
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{labels.assignedRoles}:</span>
                      {step.roles.map((role) => (
                        <span
                          key={role}
                          className="text-xs rounded-full bg-blue-50 dark:bg-blue-900/25 text-blue-800 dark:text-blue-300 px-2 py-0.5"
                        >
                          {role}
                        </span>
                      ))}
                    </div>

                    {step.nistChecklistControls && (
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        NIST checklist: {step.nistChecklistControls}
                      </p>
                    )}

                    {stepHint && (
                      <div className="mt-2">
                        {stepHint(step)}
                      </div>
                    )}

                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => toggleStep(step.id)}
                        className="text-xs font-medium text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline"
                      >
                        {completed.has(step.id) ? labels.markIncomplete : labels.markComplete}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/60 px-4 py-4 sm:px-5">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                            <CircleDot className="h-3.5 w-3.5" aria-hidden />
                            {labels.keyActivities}
                          </h3>
                          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1.5 list-disc list-inside">
                            {step.keyActivities.map((a) => (
                              <li key={a}>{a}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5" aria-hidden />
                            {labels.deliverablesHeading}
                          </h3>
                          <ul className="space-y-2">
                            {step.deliverables.map((d) => (
                              <li key={d.id}>
                                {d.href ? (
                                  <Link
                                    to={d.href}
                                    className="flex items-start gap-2 rounded-lg border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-900/15 px-3 py-2 text-sm text-blue-900 dark:text-blue-200 hover:bg-blue-100/60 dark:hover:bg-blue-900/25"
                                  >
                                    <FileText className="h-4 w-4 shrink-0 mt-0.5 opacity-70" aria-hidden />
                                    <span>{d.label}</span>
                                  </Link>
                                ) : (
                                  <span className="flex items-start gap-2 rounded-lg border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-900/15 px-3 py-2 text-sm text-blue-900 dark:text-blue-200">
                                    <FileText className="h-4 w-4 shrink-0 mt-0.5 opacity-70" aria-hidden />
                                    {d.label}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                            <Zap className="h-3.5 w-3.5" aria-hidden />
                            {labels.platformTools}
                          </h3>
                          <ul className="space-y-2">
                            {step.tools.map((t) => (
                              <li key={t.label}>
                                {t.external ? (
                                  <a
                                    href={t.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-start gap-2 rounded-lg border border-vendorsoluce-green/25 bg-vendorsoluce-green/5 dark:bg-vendorsoluce-green/10 px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-vendorsoluce-green/15"
                                  >
                                    <Zap className="h-4 w-4 shrink-0 mt-0.5 text-vendorsoluce-green" aria-hidden />
                                    {t.label}
                                  </a>
                                ) : (
                                  <Link
                                    to={t.href}
                                    className="flex items-start gap-2 rounded-lg border border-vendorsoluce-green/25 bg-vendorsoluce-green/5 dark:bg-vendorsoluce-green/10 px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-vendorsoluce-green/15"
                                  >
                                    <Zap className="h-4 w-4 shrink-0 mt-0.5 text-vendorsoluce-green" aria-hidden />
                                    {t.label}
                                  </Link>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
