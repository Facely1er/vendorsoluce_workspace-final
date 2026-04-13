import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Shield, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useVendors } from '../../hooks/useVendors';
import { useSupplyChainAssessments } from '../../hooks/useSupplyChainAssessments';
import { getRiskLevel } from '../../utils/riskCalculations';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { TrialConversionPrompt } from '../../components/onboarding/TrialConversionPrompt';
import { OnboardingChecklist } from '../../components/onboarding/OnboardingChecklist';
import WorkspacePage from '../../components/workspace/WorkspacePage';
import WorkspaceSection from '../../components/workspace/WorkspaceSection';
import RadarWidget from '../../components/dashboard/RadarWidget';
import PortalStatusWidget from '../../components/dashboard/PortalStatusWidget';
import type { VendorRisk } from '../../types';
import { MR, WR } from 'shared/constants/routes';

const DashboardPage: React.FC = () => {
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
  const isGettingStarted =
    vendors.length === 0 ||
    profile?.onboarding_complete === false ||
    completedAssessments === 0;

  const priorities = useMemo(() => {
    const items: string[] = [];
    if (vendors.length === 0) items.push('Start your vendor portfolio to make radar and reporting meaningful.');
    if (vendors.length > 0 && highRiskCount > 0) items.push(`${highRiskCount} vendor${highRiskCount === 1 ? '' : 's'} currently sit in a high or critical tier and should be reviewed first.`);
    if (completedAssessments === 0) items.push('Complete the supply chain assessment to establish a defensible program baseline.');
    if (vendors.length > 0 && completedAssessments > 0) items.push('Generate a VIRA portfolio report to turn current portfolio data into an executive-ready summary.');
    if (items.length === 0) items.push('Your baseline is in place. Move into review cadence and evidence collection.');
    return items.slice(0, 3);
  }, [vendors.length, highRiskCount, completedAssessments]);

  if (isLoading) {
    return (
      <WorkspacePage title={`Welcome back, ${currentUserName}`}>
        <LoadingSkeleton variant="dashboard" />
      </WorkspacePage>
    );
  }

  const radarVendors: VendorRisk[] = vendors.map((vendor) => {
    const score = vendor.risk_score || 0;
    return {
      id: vendor.id,
      name: vendor.name,
      industry: vendor.industry || 'Unknown',
      riskScore: score,
      lastAssessment: vendor.last_assessment_date || 'Never',
      complianceStatus: score >= 70 ? 'Partial' : 'Compliant',
      riskLevel: getRiskLevel(score),
    };
  });

  return (
    <WorkspacePage title={isGettingStarted ? `Welcome, ${currentUserName}` : 'Dashboard'}>
      {isGettingStarted ? (
        <div className="space-y-8">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                Welcome, {currentUserName}
              </div>
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get the portfolio set up once—then everything scores and reports automatically.
              </div>
            </div>
          </div>

          <div data-tour="get-started-widget">
            <OnboardingChecklist />
          </div>

          <TrialConversionPrompt showAfterDays={7} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                icon: <Users className="h-5 w-5" />,
                title: 'Add vendors',
                description: 'Import or create vendors to build your portfolio baseline.',
                href: WR.VENDOR_GRAPH_IMPORT,
                cta: 'Add vendors',
              },
              {
                icon: <Shield className="h-5 w-5" />,
                title: 'Run an assessment',
                description: 'Launch an assessment to start collecting evidence.',
                href: MR.SUPPLY_CHAIN_ASSESSMENT,
                cta: 'Run assessment',
              },
              {
                icon: <ClipboardList className="h-5 w-5" />,
                title: 'Generate a VIRA report',
                description: 'Turn current vendor data into an executive-ready report.',
                href: MR.VIRA_REPORTS,
                cta: 'Generate report',
              },
            ].map((step) => (
              <Card key={step.title} className="rounded-2xl border border-gray-200/70 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-xl bg-gray-100 p-2 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                      {step.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{step.title}</div>
                      <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">{step.description}</div>
                      <div className="mt-4">
                        <Link to={step.href}>
                          <Button variant="primary" size="sm">
                            {step.cta}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-sm text-gray-500 dark:text-gray-400">Welcome back, {currentUserName}</div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Critical', value: riskSummary.critical, tone: 'red' as const },
              { label: 'High', value: riskSummary.high, tone: 'orange' as const },
              { label: 'Medium', value: riskSummary.medium, tone: 'yellow' as const },
              { label: 'Low', value: riskSummary.low, tone: 'green' as const },
            ].map((metric) => {
              const toneClasses =
                metric.tone === 'red'
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  : metric.tone === 'orange'
                  ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                  : metric.tone === 'yellow'
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                  : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
              return (
                <Card key={metric.label} className="rounded-2xl border border-gray-200/70 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.label}</div>
                        <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{metric.value}</div>
                      </div>
                      <div className={`rounded-xl p-3 ${toneClasses}`} aria-hidden />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_1fr]">
            <WorkspaceSection title="Priorities" description="Top items to review next.">
              <ul className="space-y-3">
                {priorities.map((item) => (
                  <li
                    key={item}
                    className="rounded-xl border border-gray-200/70 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-700 dark:border-gray-800 dark:bg-gray-950/40 dark:text-gray-300"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </WorkspaceSection>

            <div className="grid grid-cols-1 gap-6">
              <RadarWidget vendors={radarVendors} />
              <PortalStatusWidget
                assessments={assessments.map((a) => ({
                  id: a.id,
                  vendorName: (a as any).vendor_name || a.assessment_name || 'Vendor',
                  status: (a.status as any) || 'pending',
                  dueDate: (a as any).due_date ?? undefined,
                  framework: (a as any).framework ?? undefined,
                }))}
              />
            </div>
          </div>
        </div>
      )}
    </WorkspacePage>
  );
};

export default DashboardPage;
