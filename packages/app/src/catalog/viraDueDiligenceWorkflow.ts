import { countVendorSupplyActivitiesForPhases } from './vendorSupplyChainSipocCatalog';
import type { VendorProgramWorkflowDefinition, VendorProgramWorkflowStep } from '../lib/vendorProgramWorkflowTypes';

const steps: VendorProgramWorkflowStep[] = [
  {
    id: 'vira-intake',
    n: 1,
    title: 'Intake & inherent risk (VIRA)',
    description:
      'Capture vendor context and weighted inherent-risk factors using the same VIRA model as the risk calculator and radar.',
    durationLabel: '1–2 wks',
    roles: ['Vendor manager', 'Risk analyst', 'Business owner'],
    sipocPhaseIds: ['vendor-intake-administration', 'product-enablement'],
    keyActivities: [
      'Add or refresh vendors in the vendor dashboard',
      'Score inherent risk with the VIRA-weighted calculator',
      'Prioritize tier-1 vendors for deeper diligence',
    ],
    deliverables: [
      { id: 'v1', label: 'Inherent risk tier summary', href: '/vendors' },
      { id: 'v2', label: 'Calculator export / email handoff', href: '/tools/vendor-risk-calculator' },
    ],
    tools: [
      { label: 'Vendor dashboard', href: '/vendors' },
      { label: 'VIRA risk calculator', href: '/tools/vendor-risk-calculator' },
      { label: 'Vendor Risk Radar', href: '/vendor-risk-radar' },
    ],
  },
  {
    id: 'vira-requirements',
    n: 2,
    title: 'Requirements & scope',
    description:
      'Define security, privacy, and resilience expectations before questionnaires and evidence collection.',
    durationLabel: '1–3 wks',
    roles: ['GRC', 'Security architect', 'Procurement'],
    sipocPhaseIds: ['requirements-templates', 'legal-trust-center'],
    keyActivities: [
      'Draft vendor security requirements from templates',
      'Align contractual and policy references with trust center artifacts',
    ],
    deliverables: [
      { id: 'v3', label: 'Security requirements baseline', href: '/vendor-requirements' },
      { id: 'v4', label: 'Template pack references', href: '/templates' },
      { id: 'v4-dl', label: 'Download questionnaire templates', href: '/download' },
    ],
    tools: [
      { label: 'Vendor requirements', href: '/vendor-requirements' },
      { label: 'Templates', href: '/templates' },
    ],
  },
  {
    id: 'vira-diligence',
    n: 3,
    title: 'Due diligence & evidence',
    description:
      'Run structured assessments, collaborative reviews, and vendor portal sessions to collect attestations and artifacts.',
    durationLabel: '2–6 wks',
    roles: ['Assessor', 'Privacy / legal', 'Vendor respondent'],
    sipocPhaseIds: ['assessments-due-diligence', 'portal-vendor-experience', 'team-governance'],
    keyActivities: [
      'Issue vendor security assessments',
      'Use team sessions / RACI when review spans multiple groups',
      'Collect portal submissions where VendorSoluce™ Portal is deployed',
    ],
    deliverables: [
      { id: 'v5', label: 'Completed questionnaire set', href: '/vendor-assessments' },
      { id: 'v6', label: 'Collaboration notes', href: '/team/collaborate' },
    ],
    tools: [
      { label: 'Vendor assessments', href: '/vendor-assessments' },
      { label: 'Team sessions', href: '/team/collaborate' },
      { label: 'RACI', href: '/team/raci' },
      { label: 'Stakeholders', href: '/team/stakeholders' },
    ],
  },
  {
    id: 'vira-measure',
    n: 4,
    title: 'Portfolio measurement',
    description:
      'Aggregate risk posture across vendors with radar views, dashboards, and asset-linked technical signals.',
    durationLabel: 'Ongoing',
    roles: ['Risk lead', 'Executive sponsor'],
    sipocPhaseIds: ['risk-measurement-visualization', 'assets-dependencies'],
    keyActivities: [
      'Maintain radar portfolios and rescoring triggers',
      'Tie asset and dependency data to vendor criticality',
    ],
    deliverables: [
      { id: 'v7', label: 'Portfolio radar snapshot', href: '/vendor-risk-radar' },
      { id: 'v8', label: 'Vendor compliance evidence', href: '/vendor-assessments' },
    ],
    tools: [
      { label: 'Vendor Risk Radar', href: '/vendor-risk-radar' },
      { label: 'Asset management', href: '/asset-management' },
    ],
  },
  {
    id: 'vira-remediate',
    n: 5,
    title: 'Remediation, monitoring & re-assessment',
    description:
      'Track treatment plans, map compliance themes, and schedule recurring reviews.',
    durationLabel: 'Ongoing',
    roles: ['GRC', 'Vendor manager', 'Control owners'],
    sipocPhaseIds: ['results-compliance-remediation', 'vendor-intake-administration'],
    keyActivities: [
      'Use supply chain assessment results and recommendations',
      'Monitor vendor changes and trigger re-assessment',
    ],
    deliverables: [
      { id: 'v9', label: 'Action plan & recommendations', href: '/supply-chain-assessment' },
      { id: 'v10', label: 'Management readout', href: '/download' },
      { id: 'v10-rpt', label: 'Export portfolio report', href: '/download' },
    ],
    tools: [
      { label: 'Supply chain assessment', href: '/supply-chain-assessment' },
      { label: 'Downloads', href: '/download' },
      { label: 'Vendor dashboard', href: '/vendors' },
    ],
  },
];

export const VIRA_DUE_DILIGENCE_WORKFLOW: VendorProgramWorkflowDefinition = {
  id: 'vira-due-diligence',
  steps,
};

export function viraWorkflowStepActivityCount(step: VendorProgramWorkflowStep): number {
  return countVendorSupplyActivitiesForPhases([...step.sipocPhaseIds]);
}
