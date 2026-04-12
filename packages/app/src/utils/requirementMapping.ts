/**
 * Requirement Mapping Utility
 * Maps vendor risk tiers to NIST SP 800-161 control requirements
 */

import type { RequirementMapping, ControlRequirement, RiskTier } from '../types/requirements';

/**
 * Complete requirement mappings for all risk tiers
 * Based on NIST SP 800-161 Supply Chain Risk Management Framework
 */
export const REQUIREMENT_MAPPINGS: Record<RiskTier, RequirementMapping> = {
  Critical: {
    riskTier: 'Critical',
    description: 'Vendors with critical risk require comprehensive security controls and evidence',
    requirements: [
      {
        id: 'req-crit-001',
        controlId: 'NIST-800-161-2.2.1',
        controlName: 'Supplier Security Requirements',
        description: 'Supplier must have documented security requirements and controls aligned with NIST SP 800-161',
        category: 'Security',
        required: true,
        evidenceType: 'Document',
        priority: 'Critical',
        nistReference: 'NIST SP 800-161 2.2.1',
        evidenceRequired: [
          'Security requirements document',
          'Control implementation documentation',
          'Security architecture diagram'
        ]
      },
      {
        id: 'req-crit-002',
        controlId: 'SOC2-TypeII',
        controlName: 'SOC 2 Type II Certification',
        description: 'Vendor must have current SOC 2 Type II certification (within last 12 months)',
        category: 'Compliance',
        required: true,
        evidenceType: 'Certificate',
        priority: 'Critical',
        nistReference: 'NIST SP 800-161 2.2.5',
        evidenceRequired: [
          'SOC 2 Type II report',
          'Attestation letter from auditor',
          'Remediation plan for any exceptions'
        ]
      },
      {
        id: 'req-crit-003',
        controlId: 'CYBER-INSURANCE-5M',
        controlName: 'Cyber Insurance ($5M minimum)',
        description: 'Vendor must maintain minimum $5M cyber liability insurance coverage',
        category: 'Operational',
        required: true,
        evidenceType: 'Certificate',
        priority: 'Critical',
        nistReference: 'NIST SP 800-161 2.2.6',
        evidenceRequired: [
          'Insurance certificate',
          'Policy declaration page',
          'Coverage details document'
        ]
      },
      {
        id: 'req-crit-004',
        controlId: 'IR-PLAN',
        controlName: 'Incident Response Plan',
        description: 'Vendor must have documented, tested incident response plan with defined procedures',
        category: 'Security',
        required: true,
        evidenceType: 'Document',
        priority: 'Critical',
        nistReference: 'NIST SP 800-161 2.8.4',
        evidenceRequired: [
          'Incident response plan document',
          'Test results from last exercise',
          'Contact information for incident response team'
        ]
      },
      {
        id: 'req-crit-005',
        controlId: 'MFA',
        controlName: 'Multi-Factor Authentication',
        description: 'Vendor must implement MFA for all system access, including administrative accounts',
        category: 'Technical',
        required: true,
        evidenceType: 'Attestation',
        priority: 'Critical',
        nistReference: 'NIST SP 800-161 3.8.1',
        evidenceRequired: [
          'MFA implementation attestation',
          'Authentication policy document',
          'Configuration documentation'
        ]
      },
      {
        id: 'req-crit-006',
        controlId: 'SEC-ASSESSMENT',
        controlName: 'Annual Security Assessment',
        description: 'Vendor must undergo annual third-party security assessment with remediation tracking',
        category: 'Compliance',
        required: true,
        evidenceType: 'Assessment',
        priority: 'High',
        nistReference: 'NIST SP 800-161 2.7.1',
        evidenceRequired: [
          'Latest security assessment report',
          'Remediation plan',
          'Assessment methodology documentation'
        ]
      }
    ]
  },
  High: {
    riskTier: 'High',
    description: 'Vendors with high risk require significant security controls',
    requirements: [
      {
        id: 'req-high-001',
        controlId: 'NIST-800-161-2.2.1',
        controlName: 'Supplier Security Requirements',
        description: 'Supplier must have documented security requirements and basic controls',
        category: 'Security',
        required: true,
        evidenceType: 'Document',
        priority: 'High',
        nistReference: 'NIST SP 800-161 2.2.1',
        evidenceRequired: [
          'Security requirements document',
          'Control implementation summary'
        ]
      },
      {
        id: 'req-high-002',
        controlId: 'CYBER-INSURANCE-2M',
        controlName: 'Cyber Insurance ($2M minimum)',
        description: 'Vendor must maintain minimum $2M cyber liability insurance coverage',
        category: 'Operational',
        required: true,
        evidenceType: 'Certificate',
        priority: 'High',
        nistReference: 'NIST SP 800-161 2.2.6',
        evidenceRequired: [
          'Insurance certificate',
          'Policy declaration page'
        ]
      },
      {
        id: 'req-high-003',
        controlId: 'SEC-QUESTIONNAIRE',
        controlName: 'Security Questionnaire',
        description: 'Vendor must complete comprehensive security questionnaire covering all security domains',
        category: 'Compliance',
        required: true,
        evidenceType: 'Attestation',
        priority: 'High',
        nistReference: 'NIST SP 800-161 2.2.2',
        evidenceRequired: [
          'Completed security questionnaire',
          'Supporting documentation for responses'
        ]
      },
      {
        id: 'req-high-004',
        controlId: 'DATA-PROTECTION',
        controlName: 'Data Protection Policy',
        description: 'Vendor must have documented data protection policy covering encryption, access controls, and data handling',
        category: 'Security',
        required: true,
        evidenceType: 'Document',
        priority: 'High',
        nistReference: 'NIST SP 800-161 3.8.3',
        evidenceRequired: [
          'Data protection policy document',
          'Encryption standards documentation',
          'Data handling procedures'
        ]
      }
    ]
  },
  Medium: {
    riskTier: 'Medium',
    description: 'Vendors with medium risk require standard security controls',
    requirements: [
      {
        id: 'req-med-001',
        controlId: 'SEC-QUESTIONNAIRE',
        controlName: 'Security Questionnaire',
        description: 'Vendor must complete basic security questionnaire covering essential security practices',
        category: 'Compliance',
        required: true,
        evidenceType: 'Attestation',
        priority: 'Medium',
        nistReference: 'NIST SP 800-161 2.2.2',
        evidenceRequired: [
          'Completed security questionnaire'
        ]
      },
      {
        id: 'req-med-002',
        controlId: 'DATA-PROTECTION',
        controlName: 'Data Protection Policy',
        description: 'Vendor should have documented data protection policy',
        category: 'Security',
        required: true,
        evidenceType: 'Document',
        priority: 'Medium',
        nistReference: 'NIST SP 800-161 3.8.3',
        evidenceRequired: [
          'Data protection policy document'
        ]
      }
    ]
  },
  Low: {
    riskTier: 'Low',
    description: 'Vendors with low risk require minimal security controls',
    requirements: [
      {
        id: 'req-low-001',
        controlId: 'BASIC-ATTESTATION',
        controlName: 'Basic Security Attestation',
        description: 'Vendor must attest to basic security practices and compliance with applicable regulations',
        category: 'Compliance',
        required: true,
        evidenceType: 'Attestation',
        priority: 'Low',
        nistReference: 'NIST SP 800-161 2.2.1',
        evidenceRequired: [
          'Security attestation form',
          'Basic security practices documentation'
        ]
      }
    ]
  }
};

/**
 * Get requirements for a specific risk tier
 */
export const getRequirementsForTier = (riskTier: RiskTier): ControlRequirement[] => {
  return REQUIREMENT_MAPPINGS[riskTier]?.requirements || [];
};

/**
 * Get risk tier from risk score
 * Matches the logic used in riskCalculations.ts
 */
export const getRiskTierFromScore = (score: number): RiskTier => {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
};

/**
 * Get requirement mapping configuration for a risk tier
 */
export const getRequirementMapping = (riskTier: RiskTier): RequirementMapping | undefined => {
  return REQUIREMENT_MAPPINGS[riskTier];
};

/**
 * Get all available risk tiers
 */
export const getAllRiskTiers = (): RiskTier[] => {
  return ['Critical', 'High', 'Medium', 'Low'];
};

/**
 * Get total number of requirements for a risk tier
 */
export const getRequirementCountForTier = (riskTier: RiskTier): number => {
  return REQUIREMENT_MAPPINGS[riskTier]?.requirements.length || 0;
};
