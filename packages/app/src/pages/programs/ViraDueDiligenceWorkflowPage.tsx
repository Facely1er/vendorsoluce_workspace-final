import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import WorkspacePageShell from '../../components/vendorsoluce-intelligence/WorkspacePageShell';
import { ImplementationWorkflowTimeline } from '../../components/program/ImplementationWorkflowTimeline';
import { MR } from 'shared/constants/routes';
import { VIRA_DUE_DILIGENCE_WORKFLOW, viraWorkflowStepActivityCount } from '../../catalog/viraDueDiligenceWorkflow';

const ViraDueDiligenceWorkflowPage: React.FC = () => {
  const { t } = useTranslation();

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
      title={t('vendorProgramWorkflow.vira.pageTitle')}
      description={t('vendorProgramWorkflow.vira.pageSubtitle')}
    >
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('navigation.home')}
      </Link>

      <ImplementationWorkflowTimeline
        workflowId="vira-due-diligence"
        steps={VIRA_DUE_DILIGENCE_WORKFLOW.steps}
        activityCountForStep={viraWorkflowStepActivityCount}
        labels={labels}
        alternateProgramHref={MR.PROGRAM_NIST_IMPLEMENTATION}
        alternateProgramLabel={t('navigation.nistImplementationWorkflow')}
      />
    </WorkspacePageShell>
  );
};

export default ViraDueDiligenceWorkflowPage;
