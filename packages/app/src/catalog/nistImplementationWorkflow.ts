import { countVendorSupplyActivitiesForPhases } from './vendorSupplyChainSipocCatalog';
import type { VendorProgramWorkflowDefinition, VendorProgramWorkflowStep } from '../lib/vendorProgramWorkflowTypes';

/**
 * Returns the steps for the NIST implementation workflow.
 */
function buildSteps(): VendorProgramWorkflowStep[] {
  const step3Tools: VendorProgramWorkflowStep['tools'] = [
    { label: 'NIST checklist', href: '/tools/nist-checklist' },
    { label: 'API documentation', href: '/api-docs' },
    { label: 'Integration guides', href: '/integration-guides' },
  ];

  return [
  {
    id: 'nist-governance',
    n: 1,
    title: 'Governance & program baseline',
    description:
      'Establish supply chain risk governance, policies, and a repeatable assessment baseline aligned with NIST SP 800-161 (C-SCRM-1, C-SCRM-2).',
    durationLabel: '2–4 wks',
    roles: ['GRC / Program lead', 'ISSO', 'Procurement sponsor'],
    sipocPhaseIds: [
      'product-enablement',
      'legal-trust-center',
      'integration-developer',
    ],
    nistChecklistControls: 'C-SCRM-1 — C-SCRM-2',
    keyActivities: [
      'Define third-party / supply chain risk appetite and escalation paths',
      'Run the in-app NIST checklist for governance items and record gaps',
      'Publish or map policies using legal & trust artifacts and templates',
    ],
    deliverables: [
      { id: 'd1', label: 'Program charter & governance outline', href: '/templates' },
      { id: 'd2', label: 'NIST checklist gap summary', href: '/tools/nist-checklist' },
      { id: 'd3', label: 'Policy / standards crosswalk (templates)', href: '/templates' },
      { id: 'd3-dl', label: 'Download NIST templates pack', href: '/download' },
    ],
    tools: [
      { label: 'NIST SP 800-161 checklist', href: '/tools/nist-checklist' },
      { label: 'Supply chain assessment', href: '/supply-chain-assessment' },
      { label: 'How it works', href: '/how-it-works' },
      { label: 'Templates library', href: '/templates' },
    ],
  },
  {
    id: 'nist-supplier',
    n: 2,
    title: 'Supplier identification & management',
    description:
      'Identify critical suppliers, tier vendors, and operationalize onboarding, contracts, and ongoing management (C-SCRM-3 — C-SCRM-5).',
    durationLabel: '3–6 wks',
    roles: ['Vendor manager', 'Procurement', 'Risk analyst'],
    sipocPhaseIds: [
      'vendor-intake-administration',
      'requirements-templates',
      'assets-dependencies',
    ],
    nistChecklistControls: 'C-SCRM-3 — C-SCRM-5',
    keyActivities: [
      'Register vendors and criticality in the vendor dashboard',
      'Define security / resilience requirements using vendor requirements',
      'Link assets and dependencies to high-impact suppliers',
    ],
    deliverables: [
      { id: 'd4', label: 'Critical vendor inventory', href: '/vendors' },
      { id: 'd5', label: 'Requirements pack', href: '/vendor-requirements' },
      { id: 'd6', label: 'Asset–vendor linkage record', href: '/asset-management' },
    ],
    tools: [
      { label: 'Vendor dashboard', href: '/vendors' },
      { label: 'Vendor requirements', href: '/vendor-requirements' },
      { label: 'Asset management', href: '/asset-management' },
    ],
  },
  {
    id: 'nist-product',
    n: 3,
    title: 'Product security & software transparency',
    description:
      'Validate software provenance and product security practices using technical evidence and compliance controls (C-SCRM-6, C-SCRM-7).',
    durationLabel: '2–5 wks',
    roles: ['Engineering / security', 'SRE', 'Vendor tech lead'],
    sipocPhaseIds: ['integration-developer'],
    nistChecklistControls: 'C-SCRM-6 — C-SCRM-7',
    keyActivities: [
      'Document software components and technical dependencies for critical vendors',
      'Run NIST compliance checks and validate product security controls',
      'Record integration touchpoints via API / integration guides where relevant',
    ],
    deliverables: [
      { id: 'd7', label: 'Product security evidence', href: '/vendor-assessments' },
      { id: 'd8', label: 'Component risk notes', href: '/tools/nist-checklist' },
    ],
    tools: step3Tools,
  },
  {
    id: 'nist-operate',
    n: 4,
    title: 'Assess, respond, and share',
    description:
      'Operationalize assessments, incident coordination, and information sharing with stakeholders; close the loop with monitoring (C-SCRM-8 — C-SCRM-10).',
    durationLabel: 'Ongoing',
    roles: ['SOC / IR', 'GRC', 'Legal', 'Program operations'],
    sipocPhaseIds: [
      'assessments-due-diligence',
      'risk-measurement-visualization',
      'results-compliance-remediation',
    ],
    nistChecklistControls: 'C-SCRM-8 — C-SCRM-10',
    keyActivities: [
      'Run vendor security assessments and portal workflows',
      'Track residual risk with radar and dashboards',
      'Export results, recommendations, and management reporting',
    ],
    deliverables: [
      { id: 'd9', label: 'Assessment outcomes & evidence', href: '/vendor-assessments' },
      { id: 'd10', label: 'Portfolio / radar views', href: '/vendor-risk-radar' },
      { id: 'd11', label: 'Remediation & monitoring plan', href: '/supply-chain-recommendations' },
      { id: 'd11-dl', label: 'Export results & reports', href: '/download' },
    ],
    tools: [
      { label: 'Vendor assessments', href: '/vendor-assessments' },
      { label: 'Vendor Risk Radar', href: '/vendor-risk-radar' },
      { label: 'Risk calculator (VIRA intake)', href: '/tools/vendor-risk-calculator' },
      { label: 'Downloads & exports', href: '/download' },
    ],
  },
  ];
}

export const NIST_IMPLEMENTATION_WORKFLOW: VendorProgramWorkflowDefinition = {
  id: 'nist-implementation',
  steps: buildSteps(),
};

export function nistWorkflowStepActivityCount(step: VendorProgramWorkflowStep): number {
  return countVendorSupplyActivitiesForPhases([...step.sipocPhaseIds]);
}
