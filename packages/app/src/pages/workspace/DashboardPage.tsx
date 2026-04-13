import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardList, FileCheck, Radar, Shield, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useVendors } from '../../hooks/useVendors';
import { useSupplyChainAssessments } from '../../hooks/useSupplyChainAssessments';
import { getRiskLevel } from '../../utils/riskCalculations';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { TrialCountdownBanner } from '../../components/onboarding/TrialCountdownBanner';
import { TrialConversionPrompt } from '../../components/onboarding/TrialConversionPrompt';
import { OnboardingChecklist } from '../../components/onboarding/OnboardingChecklist';
import WorkspacePage from '../../components/workspace/WorkspacePage';
import WorkspaceSection from '../../components/workspace/WorkspaceSection';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const { vendors, loading: vendorsLoading } = useVendors();
  const { assessments, loading: assessmentsLoading } = useSupplyChainAssessments();

  const isLoading = vendorsLoading || assessmentsLoading;

  const riskSummary = useMemo(() => {
    const buckets = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const vendor of vendors) {
      const tier = getRiskLevel(vendor.risk_score || 0);
      if (tier === 'Critical') buckets.critical += 1;
      else if (tier === 'High') buckets.high += 1;
      else if (tier === 'Medium') buckets.medium += 1;
      else buckets.low += 1;
    }
    return buckets;
  }, [vendors]);

  const highRiskCount = riskSummary.critical + riskSummary.high;
  const completedAssessments = assessments.filter((assessment) => assessment.status === 'completed').length;
  const currentUserName = user?.user_metadata?.full_name || profile?.full_name || 'User';

  const priorities = useMemo(() => {
    const items: string[] = [];
    if (vendors.length === 0) items.push('Start your vendor portfolio to make radar and reporting meaningful.');
    if (vendors.length > 0 && highRiskCount > 0) items.push(`${highRiskCount} vendor${highRiskCount === 1 ? '' : 's'} currently sit in a high or critical tier and should be reviewed first.`);
    if (completedAssessments === 0) items.push('Complete the supply chain assessment to establish a defensible program baseline.');
    if (vendors.length > 0 && completedAssessments > 0) items.push('Generate a VIRA portfolio report to turn current portfolio data into an executive-ready summary.');
    if (items.length === 0) items.push('Your baseline is in place. Move into review cadence and evidence collection.');
    return items.slice(0, 4);
  }, [vendors.length, highRiskCount, completedAssessments]);

  if (isLoading) {
    return (
      <WorkspacePage title={`Welcome back, ${currentUserName}`}>
        <LoadingSkeleton variant="dashboard" />
      </WorkspacePage>
    );
  }

  return (
    <WorkspacePage
      title={`Welcome back, ${currentUserName}`}
      subtitle="Control the workflow from portfolio discovery through assessment, reporting, and follow-up actions."
      stats={[
        { label: 'Portfolio', value: `${vendors.length} vendors` },
        { label: 'High exposure', value: `${highRiskCount} high / critical` },
        { label: 'Assessments', value: `${assessments.length} total` },
        { label: 'Completed', value: `${completedAssessments} completed` },
      ]}
      actions={(
        <>
          <Link to="/supply-chain-assessment">
            <Button variant="primary" size="sm" data-tour="run-assessment">
              Run assessment
            </Button>
          </Link>
          <Link to="/vendor-risk-radar">
            <Button variant="outline" size="sm">Open radar</Button>
          </Link>
        </>
      )}
    >
      <TrialCountdownBanner />
      <TrialConversionPrompt showAfterDays={7} />

      <div data-tour="get-started-widget">
        {(vendors.length === 0 || assessments.length === 0) ? (
          <OnboardingChecklist />
        ) : (
          <p className="sr-only">Onboarding checklist complete.</p>
        )}
      </div>

      <WorkspaceSection title="Workflow status" description="The workspace should move users through one operating sequence instead of isolated tools.">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          {[
            ['Discover', vendors.length > 0],
            ['Assess', assessments.length > 0],
            ['Analyze', vendors.length > 0],
            ['Report', vendors.length > 0],
            ['Act', completedAssessments > 0],
          ].map(([label, complete]) => (
            <div key={label} className="rounded-xl border border-gray-200/70 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950/40">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{label}</span>
                {complete ? <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" /> : <ArrowRight className="h-4 w-4 text-gray-400" />}
              </div>
            </div>
          ))}
        </div>
      </WorkspaceSection>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total vendors', value: vendors.length, icon: Users, tone: 'blue' },
          { label: 'High risk vendors', value: highRiskCount, icon: AlertTriangle, tone: 'red' },
          { label: 'Assessments', value: assessments.length, icon: FileCheck, tone: 'green' },
          { label: 'Reports ready', value: vendors.length > 0 ? 1 : 0, icon: ClipboardList, tone: 'purple' },
        ].map((metric) => {
          const Icon = metric.icon;
          const toneClasses = metric.tone === 'blue'
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
            : metric.tone === 'red'
            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
            : metric.tone === 'green'
            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
          return (
            <Card key={metric.label} className="rounded-2xl border border-gray-200/70 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`rounded-xl p-3 ${toneClasses}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
        <WorkspaceSection title="Current priorities" description="These are the next actions that move the workspace forward.">
          <ul className="space-y-3">
            {priorities.map((item) => (
              <li key={item} className="rounded-xl border border-gray-200/70 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-700 dark:border-gray-800 dark:bg-gray-950/40 dark:text-gray-300">
                {item}
              </li>
            ))}
          </ul>
        </WorkspaceSection>

        <WorkspaceSection title="Quick actions" description="Keep the entry points limited and tied to outcomes.">
          <div className="space-y-3" data-tour="quick-actions">
            {[
              { label: 'Manage vendors', href: '/vendors', icon: Users, tour: 'add-vendor' as const },
              { label: 'Continue assessment', href: '/supply-chain-assessment', icon: FileCheck },
              { label: 'SBOM & NIST checklist', href: '/tools/nist-checklist', icon: Shield, tour: 'analyze-sbom' as const },
              { label: 'Review radar', href: '/vendor-risk-radar', icon: Radar },
              { label: 'Open reports', href: '/vira-reports', icon: ClipboardList },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href + action.label}
                  to={action.href}
                  data-tour={'tour' in action ? action.tour : undefined}
                  className="flex items-center justify-between rounded-xl border border-gray-200/70 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-800 transition hover:border-vendorsoluce-green hover:text-vendorsoluce-green dark:border-gray-800 dark:bg-gray-950/40 dark:text-gray-200"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {action.label}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              );
            })}
          </div>
        </WorkspaceSection>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        {t('dashboard.footerNote', 'Structured. Measurable. Practical. The workspace should feel like one operating system, not a stack of disconnected tools.')}
      </p>
    </WorkspacePage>
  );
};

export default DashboardPage;
