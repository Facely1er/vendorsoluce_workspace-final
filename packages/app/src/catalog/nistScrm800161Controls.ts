import type { NistScrm10Control } from '../types/workspace';

export const NIST_SCRM_800161_CONTROLS: NistScrm10Control[] = [
  {
    id: 'C-SCRM-1',
    title: 'Vendor Risk Management Policy',
    description: 'Establish and maintain a formal vendor/supply chain risk management policy.',
    phase: 'Governance',
    status: 'not_started',
    recommended_action: 'Draft and approve a vendor risk management policy aligned to NIST SP 800-161.',
  },
  {
    id: 'C-SCRM-2',
    title: 'Roles and Responsibilities',
    description: 'Define roles and responsibilities for C-SCRM activities across the organisation.',
    phase: 'Governance',
    status: 'not_started',
    recommended_action: 'Document RACI matrix and assign ownership in the vendor program.',
  },
  {
    id: 'C-SCRM-3',
    title: 'Supplier Identification',
    description: 'Identify and catalogue suppliers, including sub-tier relationships.',
    phase: 'Supplier Identification',
    status: 'in_progress',
    recommended_action: 'Complete vendor intake for all 47 active vendors.',
  },
  {
    id: 'C-SCRM-4',
    title: 'Supplier Prioritisation',
    description: 'Prioritise suppliers based on criticality and inherent risk scoring.',
    phase: 'Supplier Identification',
    status: 'not_started',
    recommended_action: 'Apply VIRA tier classification to all identified vendors.',
  },
  {
    id: 'C-SCRM-5',
    title: 'Continuous Monitoring',
    description: 'Implement continuous monitoring of supplier security posture.',
    phase: 'Supplier Identification',
    status: 'not_started',
    recommended_action: 'Implement vendor risk scoring automation and monitoring cadence.',
  },
  {
    id: 'C-SCRM-6',
    title: 'Product and Service Integrity',
    description: 'Assess integrity of products and services provided by suppliers.',
    phase: 'Product Security',
    status: 'not_started',
    recommended_action: 'Integrate SBOM analysis into vendor due diligence workflow.',
  },
  {
    id: 'C-SCRM-7',
    title: 'Counterfeit Prevention',
    description: 'Establish controls to prevent counterfeit or tampered components.',
    phase: 'Product Security',
    status: 'not_started',
    recommended_action: 'Define tamper-evident and provenance requirements in vendor contracts.',
  },
  {
    id: 'C-SCRM-8',
    title: 'Risk Assessment',
    description: 'Conduct structured risk assessments for all in-scope suppliers.',
    phase: 'Assess & Respond',
    status: 'not_started',
    recommended_action: 'Launch due diligence assessments for critical and high-tier vendors.',
  },
  {
    id: 'C-SCRM-9',
    title: 'Risk Response',
    description: 'Define and execute risk treatment plans for identified supplier risks.',
    phase: 'Assess & Respond',
    status: 'not_started',
    recommended_action: 'Create remediation items and track to closure for each risk finding.',
  },
  {
    id: 'C-SCRM-10',
    title: 'Incident Response Integration',
    description: "Integrate supplier risk into the organisation's incident response process.",
    phase: 'Assess & Respond',
    status: 'not_started',
    recommended_action: 'Update IR playbooks to include third-party supplier breach scenarios.',
  },
];

export const SUPPLIER_CRITICALITY_MATRIX = [
  {
    tier: 'critical' as const,
    assessment_frequency_days: 180,
    evidence_requirements: ['SOC2 Type II', 'Penetration test', 'BCP/DR plan', 'Financials'],
  },
  {
    tier: 'high' as const,
    assessment_frequency_days: 365,
    evidence_requirements: ['SOC2 Type I or II', 'Questionnaire'],
  },
  {
    tier: 'medium' as const,
    assessment_frequency_days: 730,
    evidence_requirements: ['Questionnaire'],
  },
  {
    tier: 'low' as const,
    assessment_frequency_days: null,
    evidence_requirements: ['Self-attestation'],
  },
];
