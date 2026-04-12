import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Radar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PlatformPageLayout } from '../../components/layout/PlatformPageLayout';
import { ImplementationWorkflowTimeline } from '../../components/program/ImplementationWorkflowTimeline';
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
    <PlatformPageLayout>
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('navigation.home')}
      </Link>

      <div className="flex items-start gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-vendorsoluce-green/10 dark:bg-vendorsoluce-green/20 flex items-center justify-center text-vendorsoluce-green dark:text-vendorsoluce-light-green flex-shrink-0">
          <Radar className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('vendorProgramWorkflow.vira.pageTitle')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
            {t('vendorProgramWorkflow.vira.pageSubtitle')}
          </p>
        </div>
      </div>

      <ImplementationWorkflowTimeline
        workflowId="vira-due-diligence"
        steps={VIRA_DUE_DILIGENCE_WORKFLOW.steps}
        activityCountForStep={viraWorkflowStepActivityCount}
        labels={labels}
        alternateProgramHref="/program/nist-implementation"
        alternateProgramLabel={t('navigation.nistImplementationWorkflow')}
      />
    </PlatformPageLayout>
  );
};

export default ViraDueDiligenceWorkflowPage;
