import React, { useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import WorkspacePageShell from '../../components/vendorsoluce-intelligence/WorkspacePageShell';
import { ImplementationWorkflowTimeline } from '../../components/program/ImplementationWorkflowTimeline';
import { NIST_IMPLEMENTATION_WORKFLOW, nistWorkflowStepActivityCount } from '../../catalog/nistImplementationWorkflow';

const NIST_CHECKLIST_KEY = 'nist-checklist-progress-v1';

/** Map each workflow step to the checklist item IDs that cover its controls. */
const STEP_CHECKLIST_MAP: Record<string, string[]> = {
  'nist-governance': ['c1', 'c2'],
  'nist-supplier':   ['c3', 'c4', 'c5'],
  'nist-product':    ['c6', 'c7'],
  'nist-operate':    ['c8', 'c9', 'c10'],
};

function loadChecklistDone(): Set<string> {
  try {
    const raw = localStorage.getItem(NIST_CHECKLIST_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

/** Small inline hint showing checklist completion for the relevant step. */
function ChecklistStepHint({
  stepId,
  doneIds,
}: {
  stepId: string;
  doneIds: Set<string>;
}) {
  const ids = STEP_CHECKLIST_MAP[stepId];
  if (!ids) return null;
  const done = ids.filter((id) => doneIds.has(id)).length;
  if (done === 0) return null;
  const all = done === ids.length;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs ${
        all ? 'text-green-700 dark:text-green-400' : 'text-blue-700 dark:text-blue-300'
      }`}
    >
      {all ? (
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <span className="h-3.5 w-3.5 inline-flex items-center justify-center" aria-hidden>·</span>
      )}
      Checklist: {done}/{ids.length} controls ticked
    </span>
  );
}

const NistImplementationWorkflowPage: React.FC = () => {
  const { t } = useTranslation();
  const [checklistDone, setChecklistDone] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setChecklistDone(loadChecklistDone());
  }, []);

  const labels = useMemo(
    () => ({
      viewDetails: t('vendorProgramWorkflow.common.viewDetails'),
      hideDetails: t('vendorProgramWorkflow.common.hideDetails'),
      completed: t('vendorProgramWorkflow.common.completed'),
      inProgress: t('vendorProgramWorkflow.common.inProgress'),
      pending: t('vendorProgramWorkflow.common.pending'),
      duration: t('vendorProgramWorkflow.common.duration'),
      activities: t('vendorProgramWorkflow.common.activities'),
      deliverables: t('vendorProgramWorkflow.common.deliverables'),
      tools: t('vendorProgramWorkflow.common.tools'),
      assignedRoles: t('vendorProgramWorkflow.common.assignedRoles'),
      keyActivities: t('vendorProgramWorkflow.common.keyActivities'),
      deliverablesHeading: t('vendorProgramWorkflow.common.deliverablesHeading'),
      platformTools: t('vendorProgramWorkflow.common.platformTools'),
      markComplete: t('vendorProgramWorkflow.common.markComplete'),
      markIncomplete: t('vendorProgramWorkflow.common.markIncomplete'),
      overallProgress: t('vendorProgramWorkflow.common.overallProgress'),
      resetProgress: t('vendorProgramWorkflow.common.resetProgress'),
      sipocCatalog: t('vendorProgramWorkflow.common.sipocCatalog'),
    }),
    [t]
  );

  return (
    <WorkspacePageShell
      title={t('vendorProgramWorkflow.nist.pageTitle')}
      description={t('vendorProgramWorkflow.nist.pageSubtitle')}
      descriptionExtra={
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('vendorProgramWorkflow.nist.checklistHint')}{' '}
          <Link to="/tools/nist-checklist" className="font-medium text-vendorsoluce-green hover:underline dark:text-vendorsoluce-light-green">
            {t('navigation.nistChecklist')}
          </Link>
        </p>
      }
    >
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('navigation.home')}
      </Link>

      <ImplementationWorkflowTimeline
        workflowId="nist-implementation"
        steps={NIST_IMPLEMENTATION_WORKFLOW.steps}
        activityCountForStep={nistWorkflowStepActivityCount}
        labels={labels}
        alternateProgramHref="/program/vira-due-diligence"
        alternateProgramLabel={t('navigation.viraDueDiligenceWorkflow')}
        stepHint={(step) => <ChecklistStepHint stepId={step.id} doneIds={checklistDone} />}
      />
    </WorkspacePageShell>
  );
};

export default NistImplementationWorkflowPage;
