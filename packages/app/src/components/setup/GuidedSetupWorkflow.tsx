import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  Circle,
  ChevronRight,
  Target,
  Building,
  Shield,
  Users,
  FileCheck,
  FileJson,
  BarChart3,
  Zap,
  Clock,
  Award,
  ArrowRight,
} from 'lucide-react';
import { useVendors } from '../../hooks/useVendors';
import { useSupplyChainAssessments } from '../../hooks/useSupplyChainAssessments';

const STORAGE_KEY = 'vs-setup-completed-steps';

type StepCategory = 'Setup' | 'Configuration' | 'Operations' | 'Advanced';
type Difficulty = 'Easy' | 'Medium' | 'Advanced';
type ActionType = 'navigate' | 'external' | 'info';

interface StepAction {
  id: string;
  title: string;
  description: string;
  actionType: ActionType;
  href?: string;
  external?: boolean;
}

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  estimatedTime: string;
  difficulty: Difficulty;
  category: StepCategory;
  prerequisites?: string[];
  actions: StepAction[];
  tips: string[];
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 'platform-setup',
    title: 'Configure Platform Environment',
    description: 'Set up your organization profile, explore the dashboard, and review platform capabilities',
    icon: Target,
    estimatedTime: '5–10 min',
    difficulty: 'Easy',
    category: 'Setup',
    actions: [
      {
        id: 'explore-dashboard',
        title: 'Explore the Dashboard',
        description: 'Review your supply chain risk overview and available analytics',
        actionType: 'navigate',
        href: '/dashboard',
      },
      {
        id: 'review-profile',
        title: 'Review Your Account Profile',
        description: 'Confirm your organization details, industry, and subscription tier',
        actionType: 'navigate',
        href: '/account',
      },
      {
        id: 'understand-sections',
        title: 'Understand the Workspace Sections',
        description: 'Assess → Analyze → Programs is the core supply chain assessment lifecycle',
        actionType: 'info',
      },
    ],
    tips: [
      'The dashboard reflects live data — vendor counts and risk scores update in real time',
      'Supply chain risk management works best with 5+ vendors in the portfolio',
      'Your subscription tier controls which features and vendor limits are available',
    ],
  },
  {
    id: 'vendor-portfolio',
    title: 'Build Your Vendor Portfolio',
    description: 'Add your critical suppliers and third-party vendors to start tracking supply chain risk',
    icon: Building,
    estimatedTime: '15–30 min',
    difficulty: 'Easy',
    category: 'Setup',
    prerequisites: ['platform-setup'],
    actions: [
      {
        id: 'add-vendor',
        title: 'Add Your First Vendor',
        description: 'Create a vendor risk profile with company details and risk tier',
        actionType: 'navigate',
        href: '/vendors',
      },
      {
        id: 'vendor-dashboard',
        title: 'Review the Vendor Risk Dashboard',
        description: 'See portfolio-level risk distribution and vendor scores',
        actionType: 'navigate',
        href: '/vendor-risk-dashboard',
      },
      {
        id: 'manage-vendors',
        title: 'Manage Vendor Records',
        description: 'Add additional vendors, categorize by type, and assign risk tiers',
        actionType: 'navigate',
        href: '/vendors',
      },
    ],
    tips: [
      'Prioritise critical suppliers (single-source, high-data-access) first',
      'The vendor risk radar visualizes your full portfolio at a glance',
      'Vendor records feed into NIST SP 800-161 assessment scoring',
    ],
  },
  {
    id: 'configure-requirements',
    title: 'Define Vendor Requirements',
    description: 'Configure the security and compliance requirements you expect from vendors',
    icon: Shield,
    estimatedTime: '15–30 min',
    difficulty: 'Medium',
    category: 'Configuration',
    prerequisites: ['vendor-portfolio'],
    actions: [
      {
        id: 'set-requirements',
        title: 'Define Requirements Templates',
        description: 'Create reusable requirement sets based on NIST SP 800-161, ISO 27001, or custom controls',
        actionType: 'navigate',
        href: '/vendor-requirements',
      },
      {
        id: 'vendor-assessments',
        title: 'Configure Vendor Assessments',
        description: 'Set up assessment questionnaires to send to vendors',
        actionType: 'navigate',
        href: '/vendor-assessments',
      },
      {
        id: 'nist-checklist',
        title: 'Review the NIST Checklist',
        description: 'Use the NIST SP 800-161 checklist to guide requirement selection',
        actionType: 'navigate',
        href: '/tools/nist-checklist',
      },
    ],
    tips: [
      'Start with NIST SP 800-161 for federal/government supply chains',
      'Requirements templates can be reused across multiple vendor assessments',
      'Align requirements with your own compliance obligations (CMMC, FedRAMP, etc.)',
    ],
  },
  {
    id: 'team-collaboration',
    title: 'Set Up Team Access',
    description: 'Invite team members and configure roles so analysts and managers can collaborate',
    icon: Users,
    estimatedTime: '10–20 min',
    difficulty: 'Easy',
    category: 'Configuration',
    prerequisites: ['configure-requirements'],
    actions: [
      {
        id: 'invite-team',
        title: 'Invite Team Members',
        description: 'Add colleagues who need access to vendor risk data and assessments',
        actionType: 'navigate',
        href: '/team/collaborate',
      },
      {
        id: 'configure-account',
        title: 'Configure Account Settings',
        description: 'Review notification preferences and access controls',
        actionType: 'navigate',
        href: '/account',
      },
    ],
    tips: [
      'Team collaboration features require a paid subscription tier',
      'Assign roles: risk analyst, procurement lead, or read-only for stakeholders',
      'Collaborative sessions allow real-time assessment co-editing',
    ],
  },
  {
    id: 'first-assessment',
    title: 'Run Supply Chain Assessment',
    description: 'Execute a NIST SP 800-161 supply chain risk assessment against your vendor portfolio',
    icon: FileCheck,
    estimatedTime: '20–60 min',
    difficulty: 'Medium',
    category: 'Operations',
    prerequisites: ['team-collaboration'],
    actions: [
      {
        id: 'run-assessment',
        title: 'Start Supply Chain Assessment',
        description: 'Launch the NIST SP 800-161 assessment flow for your organization',
        actionType: 'navigate',
        href: '/supply-chain-assessment',
      },
      {
        id: 'review-results',
        title: 'Review Assessment Results',
        description: 'Analyze your supply chain risk posture and control gaps',
        actionType: 'navigate',
        href: '/supply-chain-results',
      },
      {
        id: 'risk-radar',
        title: 'Open the Vendor Risk Radar',
        description: 'Visualize vendor risk distribution across your portfolio',
        actionType: 'navigate',
        href: '/vendor-risk-radar',
      },
    ],
    tips: [
      'The assessment scores each NIST SP 800-161 control family',
      'Results feed directly into the remediation and program workflow',
      'Re-run assessments periodically to track posture improvement',
    ],
  },
  {
    id: 'nist-compliance',
    title: 'Configure NIST Compliance',
    description: 'Run NIST SP 800-161 compliance checklist to validate your supply chain risk posture',
    icon: FileJson,
    estimatedTime: '15–30 min',
    difficulty: 'Medium',
    category: 'Operations',
    prerequisites: ['vendor-portfolio'],
    actions: [
      {
        id: 'run-nist-checklist',
        title: 'Run NIST Checklist',
        description: 'Validate NIST SP 800-161 compliance controls across your vendor program',
        actionType: 'navigate',
        href: '/tools/nist-checklist',
      },
      {
        id: 'review-nist-results',
        title: 'Review NIST Assessment Results',
        description: 'Check compliance gaps and recommended remediation steps',
        actionType: 'navigate',
        href: '/tools/nist-checklist',
      },
    ],
    tips: [
      'NIST SP 800-161 covers 24 supply chain risk management controls',
      'Link findings to specific vendors for targeted remediation',
      'Export compliance reports for stakeholder review',
    ],
  },
  {
    id: 'reporting-analytics',
    title: 'Set Up Reporting & Analytics',
    description: 'Configure dashboards and generate your first supply chain risk report',
    icon: BarChart3,
    estimatedTime: '15–30 min',
    difficulty: 'Medium',
    category: 'Advanced',
    prerequisites: ['first-assessment'],
    actions: [
      {
        id: 'asset-register',
        title: 'Review Asset Management',
        description: 'Check your asset register and link assets to vendor risk data',
        actionType: 'navigate',
        href: '/asset-management',
      },
      {
        id: 'nist-workflow',
        title: 'Start NIST Implementation Workflow',
        description: 'Launch the guided multi-step NIST SP 800-161 implementation program',
        actionType: 'navigate',
        href: '/program/nist-implementation',
      },
      {
        id: 'download-templates',
        title: 'Download Report Templates',
        description: 'Get Excel, PDF, and CSV templates for stakeholder reporting',
        actionType: 'navigate',
        href: '/templates',
      },
    ],
    tips: [
      'The NIST implementation workflow guides you through program-level remediation',
      'Export reports for procurement, leadership, or compliance teams',
      'Schedule recurring assessments to maintain a current risk picture',
    ],
  },
];

const CATEGORY_COLORS: Record<StepCategory, string> = {
  Setup: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300',
  Configuration: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-300',
  Operations: 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-300',
  Advanced: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-300',
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Easy: 'text-green-700 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
  Medium: 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
  Advanced: 'text-red-700 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
};

function useSetupProgress(vendorCount: number, assessmentCount: number) {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const manual: string[] = stored ? JSON.parse(stored) : [];
    const auto: string[] = [];

    if (vendorCount >= 1) auto.push('platform-setup', 'vendor-portfolio');
    if (assessmentCount >= 1) auto.push('first-assessment');

    const merged = Array.from(new Set([...manual, ...auto]));
    setCompletedSteps(merged);
  }, [vendorCount, assessmentCount]);

  const markStep = (stepId: string) => {
    setCompletedSteps((prev) => {
      const next = prev.includes(stepId) ? prev : [...prev, stepId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const isStepCompleted = (stepId: string) => completedSteps.includes(stepId);
  const canStart = (step: WorkflowStep) =>
    !step.prerequisites || step.prerequisites.every((p) => completedSteps.includes(p));
  const totalProgress = Math.round(
    (completedSteps.filter((id) => WORKFLOW_STEPS.some((s) => s.id === id)).length / WORKFLOW_STEPS.length) * 100
  );
  const nextRecommended = WORKFLOW_STEPS.find((s) => !isStepCompleted(s.id) && canStart(s));

  return { isStepCompleted, canStart, markStep, totalProgress, nextRecommended };
}

const GuidedSetupWorkflow: React.FC = () => {
  const { vendors } = useVendors();
  const { assessments } = useSupplyChainAssessments();

  const { isStepCompleted, canStart, markStep, totalProgress, nextRecommended } = useSetupProgress(
    vendors.length,
    assessments.length
  );
  const [expandedStep, setExpandedStep] = useState<string | null>(WORKFLOW_STEPS[0].id);

  const categoryProgress = (cat: StepCategory) => {
    const steps = WORKFLOW_STEPS.filter((s) => s.category === cat);
    const done = steps.filter((s) => isStepCompleted(s.id)).length;
    return { done, total: steps.length, pct: Math.round((done / steps.length) * 100) };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-vendorsoluce-navy to-vendorsoluce-blue p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-3">
              <Target className="h-7 w-7" />
              Platform Setup Roadmap
            </h1>
            <p className="text-blue-100 mb-4 max-w-xl">
              Configure your supply chain risk environment with vendor data, requirements, and assessments so risk scoring and reporting are immediately operational.
            </p>
            <div className="flex items-center gap-6 text-sm text-blue-100">
              <span className="flex items-center gap-1"><Award className="h-4 w-4" />{totalProgress}% complete</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />Est. 1.5–3 hours total</span>
              <span className="flex items-center gap-1"><Zap className="h-4 w-4" />{WORKFLOW_STEPS.length} steps</span>
            </div>
          </div>
          <div className="hidden lg:flex h-20 w-20 rounded-full bg-white/20 items-center justify-center text-2xl font-bold">
            {totalProgress}%
          </div>
        </div>
        <div className="mt-6 h-2 rounded-full bg-white/30">
          <div className="h-2 rounded-full bg-vendorsoluce-green transition-all duration-500" style={{ width: `${totalProgress}%` }} />
        </div>
      </div>

      {/* Category progress */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['Setup', 'Configuration', 'Operations', 'Advanced'] as StepCategory[]).map((cat) => {
          const { done, total, pct } = categoryProgress(cat);
          return (
            <div key={cat} className={`rounded-xl p-4 ${CATEGORY_COLORS[cat]}`}>
              <div className="font-semibold text-sm mb-1">{cat}</div>
              <div className="text-xs opacity-75 mb-2">{done}/{total} steps</div>
              <div className="h-1.5 rounded-full bg-current/20">
                <div className="h-1.5 rounded-full bg-current transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Next recommended */}
      {nextRecommended && (
        <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Zap className="h-3.5 w-3.5" /> Recommended next
              </p>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">{nextRecommended.title}</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">{nextRecommended.description}</p>
            </div>
            <button
              onClick={() => setExpandedStep(nextRecommended.id)}
              className="ml-4 flex-shrink-0 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
            >
              Start
            </button>
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-4">
        {WORKFLOW_STEPS.map((step, index) => {
          const completed = isStepCompleted(step.id);
          const unlocked = canStart(step);
          const expanded = expandedStep === step.id;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`rounded-xl border-2 transition-all duration-200 ${
                completed
                  ? 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/10'
                  : expanded && unlocked
                  ? 'border-vendorsoluce-navy dark:border-blue-600 shadow-sm'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <button
                className="w-full p-5 text-left flex items-start gap-4"
                onClick={() => setExpandedStep(expanded ? null : step.id)}
              >
                <div
                  className={`mt-0.5 p-2.5 rounded-lg flex-shrink-0 ${
                    completed ? 'bg-green-600' : unlocked ? 'bg-vendorsoluce-navy' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  {completed ? <CheckCircle className="h-5 w-5 text-white" /> : <Icon className="h-5 w-5 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {index + 1}. {step.title}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${DIFFICULTY_COLORS[step.difficulty]}`}>
                      {step.difficulty}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[step.category]}`}>
                      {step.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {step.estimatedTime}
                    {!unlocked && ' · Complete prerequisites first'}
                  </p>
                </div>
                <ChevronRight
                  className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform mt-1 ${expanded ? 'rotate-90' : ''}`}
                />
              </button>

              {expanded && (
                <div className="border-t border-gray-100 dark:border-gray-700 p-5">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-3">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Action items</h4>
                      {step.actions.map((action) => (
                        <div key={action.id} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <Circle className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{action.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{action.description}</p>
                              </div>
                            </div>
                            {action.actionType !== 'info' && action.href && (
                              <Link
                                to={action.href}
                                className="flex-shrink-0 p-1.5 rounded bg-vendorsoluce-navy text-white hover:bg-blue-800 transition-colors"
                              >
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-5">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tips</h4>
                        <ul className="space-y-1.5">
                          {step.tips.map((tip, i) => (
                            <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                              <span className="text-vendorsoluce-green mt-0.5">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {step.prerequisites && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Prerequisites</h4>
                          <ul className="space-y-1.5">
                            {step.prerequisites.map((prereqId) => {
                              const prereq = WORKFLOW_STEPS.find((s) => s.id === prereqId);
                              const done = isStepCompleted(prereqId);
                              return prereq ? (
                                <li key={prereqId} className="flex items-center gap-2 text-xs">
                                  {done ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Circle className="h-4 w-4 text-gray-400" />
                                  )}
                                  <span className={done ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
                                    {prereq.title}
                                  </span>
                                </li>
                              ) : null;
                            })}
                          </ul>
                        </div>
                      )}

                      {unlocked && !completed && (
                        <button
                          onClick={() => markStep(step.id)}
                          className="w-full py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Mark complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion */}
      {totalProgress === 100 && (
        <div className="rounded-xl bg-gradient-to-r from-vendorsoluce-green to-teal-600 p-8 text-white text-center">
          <Award className="h-12 w-12 mx-auto mb-3" />
          <h2 className="text-xl font-bold mb-2">Platform Setup Complete</h2>
          <p className="text-green-100 mb-5">
            Your supply chain risk environment is configured. Vendor risk scoring, assessments, and NIST compliance checks are fully operational.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/dashboard" className="px-6 py-2.5 bg-white text-green-700 rounded-lg font-medium hover:bg-green-50 transition-colors">
              Open Dashboard
            </Link>
            <Link to="/vendor-risk-radar" className="px-6 py-2.5 bg-white/20 text-white border border-white/40 rounded-lg font-medium hover:bg-white/30 transition-colors">
              View Risk Radar
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuidedSetupWorkflow;
