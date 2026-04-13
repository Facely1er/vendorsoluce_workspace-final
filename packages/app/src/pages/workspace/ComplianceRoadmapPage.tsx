/**
 * Program roadmap + compliance calendar: milestones, renewals, and phase links.
 * User milestones persist in localStorage (browser-only; upgrade later to org-backed tasks).
 */

import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameMonth,
  isToday as isDateToday,
  parseISO,
  startOfMonth,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import WorkspacePageShell from '../../components/vendorsoluce-intelligence/WorkspacePageShell';
import PanelCard from '../../components/vendorsoluce-intelligence/PanelCard';
import { Button } from '../../components/ui/Button';
import { MR, WR } from 'shared/constants/routes';
import { loadImportOnboardingHints } from '../../utils/vendorImportIntegration';

const MILESTONE_STORAGE_KEY = 'vendorsoluce_compliance_milestones_v1';

export type Milestone = { id: string; title: string; date: string };

function loadMilestones(): Milestone[] {
  try {
    const raw = localStorage.getItem(MILESTONE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m): m is Milestone =>
        typeof m === 'object' &&
        m !== null &&
        typeof (m as Milestone).id === 'string' &&
        typeof (m as Milestone).title === 'string' &&
        typeof (m as Milestone).date === 'string'
    );
  } catch {
    return [];
  }
}

function seedMilestonesIfEmpty(): Milestone[] {
  const existing = loadMilestones();
  if (existing.length > 0) return existing;
  const t = new Date();
  const seed: Milestone[] = [
    {
      id: 'seed-portfolio-review',
      title: 'Quarterly vendor portfolio review',
      date: format(addDays(t, 14), 'yyyy-MM-dd'),
    },
    {
      id: 'seed-vira-intake',
      title: 'VIRA intake sweep — tier-1 vendors',
      date: format(addDays(t, 21), 'yyyy-MM-dd'),
    },
    {
      id: 'seed-assessment-renewal',
      title: 'Renewal window — critical vendor assessments',
      date: format(addDays(t, 45), 'yyyy-MM-dd'),
    },
  ];
  try {
    localStorage.setItem(MILESTONE_STORAGE_KEY, JSON.stringify(seed));
  } catch {
    /* ignore quota */
  }
  return seed;
}

const PROGRAM_PHASES: {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}[] = [
  {
    title: 'Inventory & intake',
    description: 'Establish the vendor register, VIRA weighted intake, and dependency import where available.',
    href: MR.VENDOR_RISK_RADAR,
    linkLabel: 'Vendor Risk Radar',
  },
  {
    title: 'Assessment & evidence',
    description: 'Run security assessments and collect evidence against requirements.',
    href: MR.VENDOR_ASSESSMENTS,
    linkLabel: 'Vendor assessments',
  },
  {
    title: 'Programs & remediation',
    description: 'Align to NIST C-SCRM implementation or VIRA due diligence workflows.',
    href: MR.PROGRAM_VIRA_DUE_DILIGENCE,
    linkLabel: 'VIRA program',
  },
  {
    title: 'Reporting & oversight',
    description: 'Portfolio reports, executive summaries, and continuous monitoring.',
    href: MR.VIRA_REPORTS,
    linkLabel: 'VIRA reports',
  },
];

const REVIEW_BACKLOG_LINKS: { label: string; href: string }[] = [
  { label: 'VIRA reports', href: MR.VIRA_REPORTS },
  { label: 'Vendor requirements', href: MR.VENDOR_REQUIREMENTS },
  { label: 'Vendor assessments', href: MR.VENDOR_ASSESSMENTS },
  { label: 'VIRA due diligence program', href: MR.PROGRAM_VIRA_DUE_DILIGENCE },
];

const ComplianceRoadmapPage: React.FC = () => {
  const { t } = useTranslation();
  const graphImportHints = loadImportOnboardingHints();
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));
  const [milestones, setMilestones] = useState<Milestone[]>(() => seedMilestonesIfEmpty());
  const [title, setTitle] = useState('');
  const [dateStr, setDateStr] = useState(() => format(new Date(), 'yyyy-MM-dd'));

  const persist = useCallback((next: Milestone[]) => {
    setMilestones(next);
    try {
      localStorage.setItem(MILESTONE_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const addMilestone = () => {
    const trimmed = title.trim();
    if (!trimmed || !dateStr) return;
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `m-${Date.now()}`;
    persist([...milestones, { id, title: trimmed, date: dateStr }]);
    setTitle('');
  };

  const removeMilestone = (id: string) => {
    persist(milestones.filter((m) => m.id !== id));
  };

  const monthDays = useMemo(
    () => eachDayOfInterval({ start: startOfMonth(monthCursor), end: endOfMonth(monthCursor) }),
    [monthCursor]
  );

  const leadingBlank = useMemo(() => {
    const firstDow = monthDays[0].getDay();
    return firstDow;
  }, [monthDays]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, Milestone[]>();
    for (const m of milestones) {
      const key = m.date;
      const list = map.get(key) ?? [];
      list.push(m);
      map.set(key, list);
    }
    return map;
  }, [milestones]);

  const upcoming = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return [...milestones]
      .filter((m) => {
        try {
          return parseISO(m.date) >= today;
        } catch {
          return false;
        }
      })
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 12);
  }, [milestones]);

  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <WorkspacePageShell
      title={t('workspace.roadmapPage.title', 'Roadmap & compliance calendar')}
      description={t(
        'workspace.roadmapPage.description',
        'Phase-aligned program roadmap plus a shared calendar for renewals, intake checkpoints, and audit milestones. Entries below are stored in this browser until connected to team tasks.'
      )}
      stats={[
        {
          label: t('workspace.roadmapPage.statMilestones', 'Milestones'),
          value: milestones.length,
          hint: t('workspace.roadmapPage.statMilestonesHint', 'Tracked dates'),
        },
        {
          label: t('workspace.roadmapPage.statMonth', 'View'),
          value: format(monthCursor, 'MMM yyyy'),
          hint: t('workspace.roadmapPage.statMonthHint', 'Calendar focus'),
        },
        {
          label: t('workspace.roadmapPage.statUpcoming', 'Upcoming'),
          value: upcoming.length,
          hint: t('workspace.roadmapPage.statUpcomingHint', 'Next events'),
        },
        {
          label: t('workspace.roadmapPage.statPrograms', 'Programs'),
          value: '4',
          hint: t('workspace.roadmapPage.statProgramsHint', 'Linked phases'),
        },
      ]}
    >
      {graphImportHints ? (
        <PanelCard
          title="Review backlog (from graph import)"
          description={`Last dependency import: ${graphImportHints.vendorCount} vendor row(s), ${graphImportHints.insertedNodes} nodes, ${graphImportHints.insertedEdges} edges. Milestones below include VIRA, requirements, evidence, and assessment checkpoints.`}
        >
          <div className="flex flex-wrap gap-2">
            {REVIEW_BACKLOG_LINKS.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="inline-flex rounded-full border border-emerald-200/90 bg-emerald-50/90 px-3 py-1.5 text-xs font-medium text-emerald-950 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-100 dark:hover:bg-emerald-900/60"
              >
                {item.label} →
              </Link>
            ))}
            <Link
              to={MR.VENDOR_ONBOARDING}
              className="inline-flex rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              Vendor onboarding →
            </Link>
          </div>
        </PanelCard>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        <PanelCard
          title={t('workspace.roadmapPage.programTitle', 'Program roadmap')}
          description={t(
            'workspace.roadmapPage.programDescription',
            'Default C-SCRM / VIRA sequence. Jump into each surface when you are ready—order matches typical enterprise rollouts.'
          )}
        >
          <ol className="space-y-4">
            {PROGRAM_PHASES.map((phase, i) => (
              <li
                key={phase.title}
                className="flex gap-3 rounded-xl border border-gray-200/80 bg-white/60 p-4 dark:border-gray-800 dark:bg-gray-900/40"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-100">
                  {i + 1}
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="text-sm font-semibold text-gray-950 dark:text-white">{phase.title}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{phase.description}</p>
                  <Link
                    to={phase.href}
                    className="inline-flex text-sm font-medium text-vendorsoluce-green hover:underline dark:text-vendorsoluce-light-green"
                  >
                    {phase.linkLabel} →
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </PanelCard>

        <div className="space-y-6">
          <PanelCard
            title={t('workspace.roadmapPage.calendarTitle', 'Calendar')}
            description={t(
              'workspace.roadmapPage.calendarDescription',
              'Dates with milestones show a dot. Use arrows to change months.'
            )}
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setMonthCursor((d) => addMonths(d, -1))}>
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </Button>
              <div className="text-center text-sm font-semibold text-gray-900 dark:text-white">
                {format(monthCursor, 'MMMM yyyy')}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setMonthCursor((d) => addMonths(d, 1))}>
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {weekdayLabels.map((w) => (
                <div key={w} className="py-1">
                  {w}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: leadingBlank }).map((_, i) => (
                <div key={`pad-${i}`} className="aspect-square min-h-[2.25rem]" />
              ))}
              {monthDays.map((day) => {
                const key = format(day, 'yyyy-MM-dd');
                const dayEvents = eventsByDay.get(key) ?? [];
                const inMonth = isSameMonth(day, monthCursor);
                const today = isDateToday(day);
                return (
                  <div
                    key={key}
                    className={`flex aspect-square min-h-[2.25rem] flex-col items-center justify-start rounded-lg border p-1 text-xs ${
                      inMonth
                        ? 'border-gray-200/80 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-900/50'
                        : 'border-transparent opacity-40'
                    } ${today ? 'ring-2 ring-vendorsoluce-green/50 dark:ring-vendorsoluce-light-green/40' : ''}`}
                  >
                    <span className={today ? 'font-semibold text-vendorsoluce-navy dark:text-white' : 'text-gray-700 dark:text-gray-300'}>
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 ? (
                      <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-vendorsoluce-green dark:bg-vendorsoluce-light-green" title={dayEvents.map((e) => e.title).join(', ')} />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </PanelCard>

          <PanelCard
            title={t('workspace.roadmapPage.milestonesTitle', 'Milestones & deadlines')}
            description={t(
              'workspace.roadmapPage.milestonesDescription',
              'Add renewal dates, audit gates, or steering reviews. Remove rows you do not need.'
            )}
          >
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t('workspace.roadmapPage.labelTitle', 'Title')}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
                  placeholder={t('workspace.roadmapPage.placeholderTitle', 'e.g. FedRAMP evidence drop')}
                />
              </div>
              <div className="w-full sm:w-40">
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t('workspace.roadmapPage.labelDate', 'Date')}
                </label>
                <input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
                />
              </div>
              <Button type="button" variant="primary" className="sm:mb-0" onClick={addMilestone}>
                <Plus className="mr-1 h-4 w-4" aria-hidden />
                {t('workspace.roadmapPage.add', 'Add')}
              </Button>
            </div>

            <ul className="max-h-64 space-y-2 overflow-y-auto pr-1" role="list">
              {upcoming.length === 0 ? (
                <li className="text-sm text-gray-500 dark:text-gray-400">
                  {t('workspace.roadmapPage.noUpcoming', 'No upcoming milestones. Add one above.')}
                </li>
              ) : (
                upcoming.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-start justify-between gap-2 rounded-lg border border-gray-200/80 px-3 py-2 text-sm dark:border-gray-700"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white">{m.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{m.date}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMilestone(m.id)}
                      className="shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                      aria-label={t('common.delete', 'Delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))
              )}
            </ul>
          </PanelCard>

          <p className="text-xs text-gray-500 dark:text-gray-500">
            {t(
              'workspace.roadmapPage.footerNote',
              'For dependency topology and critical paths, use the vendor intelligence portfolio and per-vendor detail pages. This calendar is for planning dates only.'
            )}{' '}
            <Link to={WR.VENDOR_INTELLIGENCE} className="font-medium text-vendorsoluce-green hover:underline dark:text-vendorsoluce-light-green">
              {t('workspace.roadmapPage.footerLink', 'Open portfolio')}
            </Link>
          </p>
        </div>
      </div>
    </WorkspacePageShell>
  );
};

export default ComplianceRoadmapPage;
