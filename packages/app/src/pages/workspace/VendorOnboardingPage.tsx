import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList, GitBranch, HelpCircle, Layers, ListChecks, MessageCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import WorkspacePageShell, { WORKSPACE_PAGE_BODY_GRID_CLASS } from '../../components/vendorsoluce-intelligence/WorkspacePageShell';
import PanelCard from '../../components/vendorsoluce-intelligence/PanelCard';
import VendorOnboardingWizard from '../../components/vendor/VendorOnboardingWizard';
import VendorDashboard from '../../components/vendor/VendorDashboard';
import ChatbotTrigger from '../../components/chatbot/ChatbotTrigger';
import { useChatbot } from '../../components/chatbot/ChatbotProvider';
import { MR, WR } from 'shared/constants/routes';

type OnboardingStep = 'welcome' | 'wizard' | 'dashboard';

const EXECUTION_STEPS: { n: number; title: string; body: string; href?: string; here?: boolean }[] = [
  {
    n: 1,
    title: 'Portfolio & dependency data',
    body: 'Import graph CSVs (when connected) and review the vendor intelligence portfolio so downstream steps have entities to attach to.',
    href: WR.VENDOR_GRAPH_IMPORT,
  },
  {
    n: 2,
    title: 'Vendor intake (this page)',
    body: 'Structured wizard: company profile, contacts (with “same as primary” shortcuts), optional documents, and assessment defaults. Produces a consistent vendor record for programs.',
    here: true,
  },
  {
    n: 3,
    title: 'Requirements & scope',
    body: 'Define security expectations and control scope before evidence and formal assessments.',
    href: MR.VENDOR_REQUIREMENTS,
  },
  {
    n: 4,
    title: 'Assessments & measurement',
    body: 'Run vendor / supply-chain assessments and radar views; outputs feed VIRA reporting.',
    href: MR.VENDOR_ASSESSMENTS,
  },
  {
    n: 5,
    title: 'Reports & evidence',
    body: 'VIRA reports and evidence collection close the loop; roadmap milestones track due dates.',
    href: MR.VENDOR_RISK_REPORTS,
  },
];

const VendorOnboardingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [_isCompleted, setIsCompleted] = useState(false);
  const { openChatbot } = useChatbot();

  if (currentStep === 'wizard') {
    return <VendorOnboardingWizard onComplete={() => { setIsCompleted(true); setCurrentStep('dashboard'); }} />;
  }
  if (currentStep === 'dashboard') {
    return <VendorDashboard />;
  }

  return (
    <WorkspacePageShell
      mode="guide"
      eyebrow="Vendor programs"
      title="Vendor onboarding playbook"
      description="Run the intake wizard and follow the recommended onboarding flow."
      actions={[
        { label: 'Start onboarding', onClick: () => setCurrentStep('wizard'), variant: 'primary' },
        { label: 'Get help', onClick: () => openChatbot('vendor-onboarding'), variant: 'outline' },
      ]}
      stats={[
        { label: 'This step', value: 'Intake wizard', hint: 'Execution — 6-step form' },
        { label: 'SIPOC tracking', value: 'Activity catalog', hint: 'Per-activity completion' },
        { label: 'Programs', value: 'NIST / VIRA', hint: 'Phased workflows' },
        { label: 'After intake', value: 'Requirements', hint: 'Scope before evidence' },
      ]}
    >
      <div className={`${WORKSPACE_PAGE_BODY_GRID_CLASS} xl:grid-cols-[minmax(0,1fr)_300px]`}>
        <div className="flex min-w-0 flex-col gap-6">
          <PanelCard
            title="Execution path (order of operations)"
            description="Guidance only — follow this sequence in the workspace. Links open the execution surfaces."
          >
            <ol className="space-y-4">
              {EXECUTION_STEPS.map((step) => (
                <li
                  key={step.n}
                  className={`flex gap-4 rounded-xl border p-4 ${
                    step.here
                      ? 'border-emerald-300/80 bg-emerald-50/50 dark:border-emerald-800/60 dark:bg-emerald-950/25'
                      : 'border-gray-200/80 bg-white/60 dark:border-gray-800 dark:bg-gray-950/40'
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white dark:bg-gray-100 dark:text-gray-900">
                    {step.n}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-gray-950 dark:text-white">{step.title}</span>
                      {step.here ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100">
                          You are here
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">{step.body}</p>
                    {step.href ? (
                      <Link
                        to={step.href}
                        className="inline-flex text-sm font-medium text-vendorsoluce-green hover:underline dark:text-vendorsoluce-light-green"
                      >
                        Open execution surface →
                      </Link>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </PanelCard>

          <PanelCard
            title="SIPOC & completion model"
            description="How structured activities map to your operating workflow — not marketing copy."
          >
            <div className="space-y-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
              <p>
                The{' '}
                <strong className="text-gray-900 dark:text-white">Vendor Activity Catalog</strong> lists supply-chain workflow
                activities as <strong className="text-gray-900 dark:text-white">SIPOC-style rows</strong> (phases, inputs/outputs,
                roles). You mark activities complete as you execute them; that is the product’s completion mechanism for the
                program—not this onboarding page alone.
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">This onboarding wizard</strong> covers{' '}
                <strong className="text-gray-900 dark:text-white">intake only</strong> (identity, contacts, optional uploads,
                defaults). It prepares vendors for requirements definition, assessments, and evidence requests aligned to NIST SP
                800-161 and VIRA™ program phases.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  to={MR.VENDOR_ACTIVITY_CATALOG}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
                >
                  <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
                  Activity catalog (SIPOC checklist)
                </Link>
                <Link
                  to={MR.PROGRAM_VIRA_DUE_DILIGENCE}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
                >
                  <GitBranch className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
                  VIRA program (phased execution)
                </Link>
                <Link
                  to={MR.PROGRAM_NIST_IMPLEMENTATION}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
                >
                  <ListChecks className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
                  C-SCRM implementation program
                </Link>
              </div>
            </div>
          </PanelCard>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <PanelCard
            title="Run execution"
            description="The wizard is the intake execution surface — not this playbook text."
          >
            <p className="text-sm text-gray-600 dark:text-gray-300">
              When you are ready, open the wizard. Data may be pre-filled from your profile, portfolio vendor, or last graph import.
            </p>
            <Button variant="primary" className="mt-4 w-full justify-center" onClick={() => setCurrentStep('wizard')}>
              <ArrowRight className="mr-2 h-4 w-4" />
              Start onboarding wizard
            </Button>
          </PanelCard>

          <PanelCard title="Checklist before you run" description="Quick sanity checks.">
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex gap-2">
                <ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" aria-hidden />
                Confirm vendor name and primary email (required in the wizard).
              </li>
              <li className="flex gap-2">
                <ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" aria-hidden />
                Optional: import graph data first so intake can align with portfolio rows.
              </li>
            </ul>
          </PanelCard>

          <PanelCard title="Help" description="In-product support for vendors or buyers on this flow.">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 rounded-xl border border-gray-200/70 bg-gray-50/70 p-3 dark:border-gray-800 dark:bg-gray-900/50">
                <MessageCircle className="mt-0.5 h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Ask about requirements, evidence, or next steps after intake.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <ChatbotTrigger context="vendor-onboarding" variant="minimal" size="sm" />
                <Button variant="outline" size="sm" onClick={() => openChatbot('vendor-onboarding')}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Open help
                </Button>
              </div>
            </div>
          </PanelCard>
        </div>
      </div>
    </WorkspacePageShell>
  );
};

export default VendorOnboardingPage;
