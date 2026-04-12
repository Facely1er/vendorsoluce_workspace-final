import type { VendorProgramWorkflowStep } from '../lib/vendorProgramWorkflowTypes';

/**
 * FedRAMP/FISMA Evidence Collection Workflow
 *
 * This workflow organises evidence collection into four phases aligned with the
 * NIST SP 800-37 Risk Management Framework (RMF) life-cycle.  NIST SP 800-37 and
 * NIST SP 800-53 Rev 5 are U.S. government publications in the public domain.
 *
 * The workflow does NOT reproduce the official FedRAMP Security Assessment Plan
 * (SAP), Security Assessment Report (SAR), or any AICPA/ISO-proprietary
 * questionnaire content.  It guides practitioners in assembling the evidence
 * artifacts that support any federal or evidence-based compliance program.
 */

function buildSteps(): VendorProgramWorkflowStep[] {
  return [
    {
      id: 'fedramp-categorize',
      n: 1,
      title: 'Categorize & authorize',
      description:
        'Establish the system boundary, classify the information system using FIPS 199 impact levels (Low / Moderate / High), and document formal authorization artifacts.',
      durationLabel: '2–4 wks',
      roles: ['ISSO', 'System owner', 'Authorizing official', 'GRC lead'],
      sipocPhaseIds: ['product-enablement', 'legal-trust-center'] as const,
      nistChecklistControls: 'NIST SP 800-53 Rev 5 — CA, PL, PM',
      keyActivities: [
        'Define the authorization boundary and system inventory',
        'Complete FIPS 199 impact categorization (C/I/A)',
        'Draft or update the System Security Plan (SSP)',
        'Identify the Authorizing Official (AO) and ISSO',
        'Record or obtain the current Authorization to Operate (ATO) decision',
      ],
      deliverables: [
        { id: 'fips199', label: 'FIPS 199 categorization worksheet' },
        { id: 'ssp', label: 'System Security Plan (SSP) draft or current version' },
        { id: 'ato', label: 'ATO letter or formal risk acceptance decision' },
      ],
      tools: [
        { label: 'FedRAMP/FISMA evidence assessment', href: '/fedramp-assessment' },
        { label: 'NIST 800-53 control catalog (NIST)', href: 'https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final' },
      ],
    },
    {
      id: 'fedramp-select-implement',
      n: 2,
      title: 'Select & implement controls',
      description:
        'Select the applicable NIST SP 800-53 Rev 5 control baseline for the categorized impact level and collect evidence that controls are implemented.',
      durationLabel: '4–8 wks',
      roles: ['ISSO', 'Security engineer', 'System owner', 'IT operations'],
      sipocPhaseIds: ['assessments-due-diligence', 'integration-developer'] as const,
      nistChecklistControls: 'NIST SP 800-53 Rev 5 — AC, AU, CM, SC, SI, IA, IR, CP',
      keyActivities: [
        'Map the system against the Low / Moderate / High control baseline',
        'Collect access-control policy and user provisioning evidence',
        'Gather audit-logging, log-retention, and review records',
        'Document configuration baselines and change-control procedures',
        'Assemble encryption, boundary protection, and patch management records',
        'Collect incident response and contingency planning artifacts',
      ],
      deliverables: [
        { id: 'ctrl-evidence', label: 'Evidence package per control family (AC, AU, CM, SC, SI, IA, IR, CP)' },
        { id: 'config-baseline', label: 'System configuration baseline document' },
        { id: 'ir-plan', label: 'Incident Response Plan (IRP)' },
        { id: 'bcp-dr', label: 'Business Continuity / Disaster Recovery Plan' },
      ],
      tools: [
        { label: 'FedRAMP/FISMA evidence assessment', href: '/fedramp-assessment' },
        { label: 'Evidence vault', href: '/vendors' },
      ],
    },
    {
      id: 'fedramp-assess',
      n: 3,
      title: 'Assess & identify gaps',
      description:
        'Run the evidence-focused FedRAMP/FISMA assessment to score each control family, identify gaps, and create a Plan of Action & Milestones (POA&M).',
      durationLabel: '1–3 wks',
      roles: ['ISSO', 'Independent assessor', 'GRC lead', 'Risk analyst'],
      sipocPhaseIds: ['assessments-due-diligence', 'legal-trust-center'] as const,
      nistChecklistControls: 'NIST SP 800-53 Rev 5 — CA, RA',
      keyActivities: [
        'Complete the FedRAMP/FISMA evidence assessment tool',
        'Review section scores against the targeted impact baseline',
        'Document each control-family gap and assign a severity',
        'Draft the initial POA&M with remediation owners and due dates',
        'Prepare the Security Assessment Report (SAR) outline',
      ],
      deliverables: [
        { id: 'assessment-report', label: 'FedRAMP/FISMA evidence assessment results (PDF)' },
        { id: 'poam', label: 'Plan of Action & Milestones (POA&M)' },
        { id: 'sar-outline', label: 'Security Assessment Report (SAR) outline' },
      ],
      tools: [
        { label: 'FedRAMP/FISMA evidence assessment', href: '/fedramp-assessment' },
        { label: 'Supply chain assessment', href: '/supply-chain-assessment' },
        { label: 'Vendor security assessments', href: '/vendor-assessments' },
      ],
    },
    {
      id: 'fedramp-authorize-monitor',
      n: 4,
      title: 'Authorize & monitor',
      description:
        'Close POA&M items, support the authorization decision, and maintain continuous monitoring to keep evidence current.',
      durationLabel: 'Ongoing',
      roles: ['ISSO', 'Authorizing official', 'System owner', 'Security operations'],
      sipocPhaseIds: ['assessments-due-diligence', 'results-compliance-remediation'] as const,
      nistChecklistControls: 'NIST SP 800-53 Rev 5 — CA, PM, SI, RA',
      keyActivities: [
        'Remediate or accept risks identified in the POA&M',
        'Submit authorization package to the Authorizing Official',
        'Establish continuous monitoring cadence (monthly/quarterly scans)',
        'Track evidence expiry and schedule re-attestations',
        'Perform annual control assessments or significant change reviews',
      ],
      deliverables: [
        { id: 'auth-package', label: 'Complete authorization package (SSP + SAR + POA&M)' },
        { id: 'conmon-plan', label: 'Continuous Monitoring (ConMon) plan' },
        { id: 'annual-review', label: 'Annual assessment or significant change review record' },
      ],
      tools: [
        { label: 'FedRAMP/FISMA evidence assessment', href: '/fedramp-assessment' },
        { label: 'Vendor risk radar', href: '/vendor-risk-radar' },
        { label: 'VIRA due diligence workflow', href: '/program/vira-due-diligence' },
      ],
    },
  ];
}

export const fedRampFismaEvidenceWorkflowSteps: VendorProgramWorkflowStep[] = buildSteps();
