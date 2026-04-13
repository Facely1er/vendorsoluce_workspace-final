import { MR, WR } from 'shared/constants/routes';
import { countVendorSupplyActivitiesForPhases } from './vendorSupplyChainSipocCatalog';
import type { VendorProgramWorkflowDefinition, VendorProgramWorkflowStep } from '../lib/vendorProgramWorkflowTypes';

const RADAR_DELIVERABLES_HASH = '#vendor-risk-radar-deliverables';

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
      { id: 'v1', label: 'Inherent risk tier summary', href: MR.VENDORS },
      { id: 'v2', label: 'Calculator export / email handoff', href: MR.VENDOR_RISK_CALCULATOR },
    ],
    tools: [
      { label: 'Vendor dashboard', href: MR.VENDORS },
      { label: 'VIRA risk calculator', href: MR.VENDOR_RISK_CALCULATOR },
      { label: 'Vendor Risk Radar', href: MR.VENDOR_RISK_RADAR },
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
      { id: 'v3', label: 'Security requirements baseline', href: MR.VENDOR_REQUIREMENTS },
      { id: 'v4', label: 'Template pack references', href: MR.TEMPLATES },
      { id: 'v4-dl', label: 'Download questionnaire templates', href: MR.DOWNLOAD },
    ],
    tools: [
      { label: 'Vendor requirements', href: MR.VENDOR_REQUIREMENTS },
      { label: 'Templates', href: MR.TEMPLATES },
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
      { id: 'v5', label: 'Completed questionnaire set', href: MR.VENDOR_ASSESSMENTS },
      { id: 'v6', label: 'Collaboration notes', href: WR.TEAM_COLLABORATE },
    ],
    tools: [
      { label: 'Vendor assessments', href: MR.VENDOR_ASSESSMENTS },
      { label: 'Team sessions', href: WR.TEAM_COLLABORATE },
      { label: 'RACI', href: WR.TEAM_RACI },
      { label: 'Stakeholders', href: WR.TEAM_STAKEHOLDERS },
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
      { id: 'v7', label: 'Portfolio radar snapshot', href: MR.VENDOR_RISK_RADAR },
      {
        id: 'v7-vira',
        label: 'VIRA portfolio reports (summary, print/PDF, audit trail)',
        href: MR.VIRA_REPORTS,
      },
      { id: 'v8', label: 'Vendor compliance evidence', href: MR.VENDOR_ASSESSMENTS },
    ],
    tools: [
      { label: 'Vendor Risk Radar', href: MR.VENDOR_RISK_RADAR },
      { label: 'VIRA portfolio reports', href: MR.VIRA_REPORTS },
      { label: 'Asset management', href: WR.ASSET_MANAGEMENT },
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
      { id: 'v9', label: 'Action plan & recommendations', href: MR.SUPPLY_CHAIN_ASSESSMENT },
      { id: 'v10', label: 'Management readout (VIRA summary)', href: MR.VIRA_REPORTS },
      {
        id: 'v10-rpt',
        label: 'Portfolio C-SCRM report (HTML export)',
        href: `${MR.VENDOR_RISK_RADAR}${RADAR_DELIVERABLES_HASH}`,
      },
    ],
    tools: [
      { label: 'Supply chain assessment', href: MR.SUPPLY_CHAIN_ASSESSMENT },
      { label: 'VIRA portfolio reports', href: MR.VIRA_REPORTS },
      { label: 'Downloads', href: MR.DOWNLOAD },
      { label: 'Vendor dashboard', href: MR.VENDORS },
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
