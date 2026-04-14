import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList, Shield, Users } from 'lucide-react';
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
import { WORKSPACE_PAGE_BODY_STACK_LOOSE_CLASS } from '../../components/vendorsoluce-intelligence/WorkspacePageShell';
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
    if (vendors.length > 0 && highRiskCount > 0)
      items.push(
        `${highRiskCount} vendor${highRiskCount === 1 ? '' : 's'} currently sit in a high or critical tier and should be reviewed first.`,
      );
    if (completedAssessments === 0)
      items.push('Complete the supply chain assessment to establish a defensible program baseline.');
    if (vendors.length > 0 && completedAssessments > 0)
      items.push('Generate a VIRA portfolio report to turn current portfolio data into an executive-ready summary.');
    if (items.length === 0) items.push('Your baseline is in place. Move into review cadence and evidence collection.');
    return items.slice(0, 3);
  }, [vendors.length, highRiskCount, completedAssessments]);

  const overviewSubtitle = useMemo(() => {
    if (vendors.length === 0) {
      return 'Add vendors and complete one assessment to unlock portfolio scoring, radar, and reporting.';
    }
    if (highRiskCount > 0) {
      return `${highRiskCount} vendor${highRiskCount === 1 ? '' : 's'} need attention first. The rest of your program view updates as evidence and scores change.`;
    }
    return 'Portfolio health, assessments, and radar stay in sync—use priorities below to drive the next review cycle.';
  }, [vendors.length, highRiskCount]);

  const riskStats = useMemo(
    () => [
      { label: 'Critical', value: riskSummary.critical, hint: 'Immediate review' },
      { label: 'High', value: riskSummary.high, hint: 'Next in queue' },
      { label: 'Medium', value: riskSummary.medium, hint: 'Scheduled cadence' },
      { label: 'Low', value: riskSummary.low, hint: 'Monitor' },
    ],
    [riskSummary.critical, riskSummary.high, riskSummary.medium, riskSummary.low],
  );

  const onboardingStats = useMemo(
    () => [
      { label: 'Vendors', value: vendors.length, hint: vendors.length ? 'In your portfolio' : 'Start with your critical few' },
      { label: 'Assessments done', value: completedAssessments, hint: completedAssessments ? 'Baseline captured' : 'Run one to anchor the program' },
      { label: 'High / critical', value: highRiskCount, hint: highRiskCount ? 'Review first' : 'None flagged' },
    ],
    [vendors.length, completedAssessments, highRiskCount],
  );

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

  const stepCards = [
    {
      icon: Users,
      title: 'Add vendors',
      description: 'Import or create vendors so radar, tiers, and reports reflect your real footprint.',
      href: WR.VENDOR_GRAPH_IMPORT,
      cta: 'Add vendors',
    },
    {
      icon: Shield,
      title: 'Run an assessment',
      description: 'Walk a NIST-aligned supply chain assessment and capture evidence in one place.',
      href: MR.SUPPLY_CHAIN_ASSESSMENT,
      cta: 'Start assessment',
    },
    {
      icon: ClipboardList,
      title: 'Generate a VIRA report',
      description: 'Package current scores and posture into an executive-ready deliverable.',
      href: MR.VIRA_REPORTS,
      cta: 'Open reports',
    },
  ] as const;

  if (isGettingStarted) {
    return (
      <WorkspacePage
        eyebrow="Build your program"
        title={`Welcome, ${currentUserName}`}
        subtitle="Three moves turn VendorSoluce from an empty workspace into a living risk picture your leadership can trust."
        stats={onboardingStats}
      >
        <div className={WORKSPACE_PAGE_BODY_STACK_LOOSE_CLASS}>
          <div data-tour="get-started-widget">
            <OnboardingChecklist />
          </div>

          <TrialConversionPrompt showAfterDays={7} />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {stepCards.map((step) => {
              const Icon = step.icon;
              return (
                <Card
                  key={step.title}
                  className="group relative overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-vendorsoluce-green via-vendorsoluce-light-green to-vendorsoluce-teal opacity-95" />
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-vendorsoluce-pale-green text-vendorsoluce-green ring-1 ring-vendorsoluce-green/20 dark:bg-vendorsoluce-green/10 dark:text-vendorsoluce-light-green dark:ring-vendorsoluce-green/25">
                          <Icon className="h-5 w-5" aria-hidden />
                        </div>
                        <div className="min-w-0">
                          <div className="text-base font-semibold tracking-tight text-gray-950 dark:text-white">{step.title}</div>
                          <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{step.description}</p>
                        </div>
                      </div>
                      <Link to={step.href} className="inline-flex">
                        <Button variant="primary" size="sm" className="group/btn inline-flex items-center gap-2">
                          {step.cta}
                          <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" aria-hidden />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </WorkspacePage>
    );
  }

  return (
    <WorkspacePage
      eyebrow="Program overview"
      title={`Welcome back, ${currentUserName}`}
      subtitle={overviewSubtitle}
      stats={riskStats}
    >
      <div className={WORKSPACE_PAGE_BODY_STACK_LOOSE_CLASS}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] xl:items-start">
          <WorkspaceSection
            variant="card"
            title="Priorities"
            description="Focused queue—work top to bottom to tighten the program fastest."
          >
            <ol className="space-y-3">
              {priorities.map((item, index) => (
                <li
                  key={item}
                  className="flex gap-4 rounded-xl border border-gray-200/70 bg-gray-50/80 px-4 py-3.5 dark:border-gray-800 dark:bg-gray-950/50"
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-semibold text-vendorsoluce-green shadow-sm ring-1 ring-gray-200/80 dark:bg-gray-900 dark:text-vendorsoluce-light-green dark:ring-gray-700"
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  <p className="min-w-0 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{item}</p>
                </li>
              ))}
            </ol>
          </WorkspaceSection>

          <div className="flex min-w-0 flex-col gap-6">
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
    </WorkspacePage>
  );
};

export default DashboardPage;
