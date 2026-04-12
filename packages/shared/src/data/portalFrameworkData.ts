// Authoritative framework control data for the Vendor Risk Portal.
// Sources: NIST SP 800-161 r1, NIST SP 800-53 r5, CMMC 2.0 Level 2,
// ISO/IEC 27001:2022 Annex A, AICPA TSC 2017 (SOC 2).

export type FrameworkId = 'nist-800-161' | 'cmmc-l2' | 'iso-27001' | 'soc2' | 'fedramp-fisma';

export interface FrameworkMeta {
  id: FrameworkId;
  name: string;
  shortName: string;
  version: string;
  publisher: string;
  description: string;
  url: string;
  controlCount: number;
  color: string;
  bgColor: string;
}

export const FRAMEWORKS: FrameworkMeta[] = [
  {
    id: 'nist-800-161',
    name: 'NIST SP 800-161 Rev. 1',
    shortName: 'NIST 800-161',
    version: 'Rev. 1 (May 2022)',
    publisher: 'National Institute of Standards and Technology',
    description: 'Cybersecurity Supply Chain Risk Management Practices for Systems and Organizations. Provides guidance on identifying, assessing, and mitigating supply chain risks throughout the system development lifecycle.',
    url: 'https://csrc.nist.gov/publications/detail/sp/800-161/rev-1/final',
    controlCount: 267,
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    id: 'cmmc-l2',
    name: 'CMMC Level 2',
    shortName: 'CMMC L2',
    version: '2.0 (December 2021)',
    publisher: 'U.S. Department of Defense',
    description: 'Cybersecurity Maturity Model Certification Level 2 — Advanced. Aligns with NIST SP 800-171 Rev. 2 and requires 110 practices protecting Controlled Unclassified Information (CUI).',
    url: 'https://dodcio.defense.gov/CMMC/',
    controlCount: 110,
    color: 'text-indigo-700 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
  },
  {
    id: 'iso-27001',
    name: 'ISO/IEC 27001:2022',
    shortName: 'ISO 27001',
    version: '2022 (Annex A)',
    publisher: 'International Organization for Standardization',
    description: 'Information security management system standard with 93 controls across 4 themes: Organizational, People, Physical, and Technological. The global benchmark for information security certification.',
    url: 'https://www.iso.org/standard/27001',
    controlCount: 93,
    color: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  {
    id: 'soc2',
    name: 'SOC 2 Type II',
    shortName: 'SOC 2',
    version: 'TSC 2017',
    publisher: 'American Institute of CPAs (AICPA)',
    description: 'Trust Services Criteria across five categories: Security, Availability, Processing Integrity, Confidentiality, and Privacy. SOC 2 Type II reports cover operating effectiveness over a period.',
    url: 'https://www.aicpa.org/topic/audit-assurance/audit-and-assurance-greater-than-soc-2',
    controlCount: 64,
    color: 'text-purple-700 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
  },
  {
    id: 'fedramp-fisma',
    name: 'FedRAMP / FISMA Evidence Readiness',
    shortName: 'FedRAMP/FISMA',
    version: 'NIST SP 800-53 Rev 5 (2020)',
    publisher: 'National Institute of Standards and Technology / U.S. OMB',
    description:
      'Evidence-readiness assessment for federal information-security programmes. ' +
      'Questions ask whether documented artifacts exist for NIST SP 800-53 Rev 5 control families ' +
      '(AC, AU, CM, CP, IR, SC, SI, RA, PS, SA, CA, PL, PM). Results map to FISMA Low / Moderate / High ' +
      'impact levels per FIPS 199. Avoids reproducing proprietary FedRAMP Security Assessment content.',
    url: 'https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final',
    controlCount: 28,
    color: 'text-teal-700 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-900/20',
  },
];

export interface ControlMapping {
  nist: string;
  nistTitle: string;
  nistFamily: string;
  cmmc?: string;
  iso?: string;
  soc2?: string;
  domain: string;
  objective: string;
}

export const CONTROL_MAPPINGS: Record<string, ControlMapping> = {
  'AC-2': {
    nist: 'AC-2', nistTitle: 'Account Management', nistFamily: 'Access Control',
    cmmc: 'AC.L2-3.1.1', iso: 'A.5.15 / A.5.18', soc2: 'CC6.1',
    domain: 'Access Management',
    objective: 'Manage system accounts including establishing, activating, modifying, reviewing, disabling, and removing accounts.',
  },
  'AC-6': {
    nist: 'AC-6', nistTitle: 'Least Privilege', nistFamily: 'Access Control',
    cmmc: 'AC.L2-3.1.5', iso: 'A.8.2 / A.8.3', soc2: 'CC6.1 / CC6.3',
    domain: 'Access Management',
    objective: 'Employ the principle of least privilege, allowing only authorized accesses necessary to accomplish assigned tasks.',
  },
  'AC-17': {
    nist: 'AC-17', nistTitle: 'Remote Access', nistFamily: 'Access Control',
    cmmc: 'AC.L2-3.1.12', iso: 'A.6.7 / A.8.1', soc2: 'CC6.1',
    domain: 'Access Management',
    objective: 'Establish and enforce usage restrictions, configuration, and connection requirements for remote access.',
  },
  'AU-12': {
    nist: 'AU-12', nistTitle: 'Audit Record Generation', nistFamily: 'Audit and Accountability',
    cmmc: 'AU.L2-3.3.1', iso: 'A.8.15', soc2: 'CC7.2',
    domain: 'Audit & Accountability',
    objective: 'Provide audit record generation capability at system components and allow personnel to map actions to users.',
  },
  'CP-9': {
    nist: 'CP-9', nistTitle: 'System Backup', nistFamily: 'Contingency Planning',
    cmmc: 'RE.L2-3.8.9', iso: 'A.8.13', soc2: 'A1.2',
    domain: 'Continuity',
    objective: 'Conduct backups of user-level and system-level information with defined frequency consistent with recovery objectives.',
  },
  'IR-4': {
    nist: 'IR-4', nistTitle: 'Incident Handling', nistFamily: 'Incident Response',
    cmmc: 'IR.L2-3.6.1', iso: 'A.5.24 / A.5.25 / A.5.26', soc2: 'CC7.3 / CC7.4',
    domain: 'Incident Response',
    objective: 'Implement incident handling capability including preparation, detection, analysis, containment, eradication, and recovery.',
  },
  'PE-3': {
    nist: 'PE-3', nistTitle: 'Physical Access Control', nistFamily: 'Physical and Environmental',
    cmmc: 'PE.L2-3.10.1', iso: 'A.7.1 / A.7.2', soc2: 'CC6.4',
    domain: 'Physical Security',
    objective: 'Enforce physical access authorizations at entry/exit points to facilities containing information systems.',
  },
  'PM-1': {
    nist: 'PM-1', nistTitle: 'Information Security Program Plan', nistFamily: 'Program Management',
    iso: 'A.5.1 / A.5.2', soc2: 'CC1.1',
    domain: 'General',
    objective: 'Develop and disseminate an organization-wide information security program plan.',
  },
  'PS-7': {
    nist: 'PS-7', nistTitle: 'External Personnel Security', nistFamily: 'Personnel Security',
    cmmc: 'PS.L2-3.9.2', iso: 'A.6.1 / A.6.6', soc2: 'CC1.4',
    domain: 'Personnel Security',
    objective: 'Establish personnel security requirements for third-party providers and monitor compliance.',
  },
  'PT-2': {
    nist: 'PT-2', nistTitle: 'Authority to Process PII', nistFamily: 'PII Processing and Transparency',
    iso: 'A.5.34', soc2: 'P1.1',
    domain: 'Privacy',
    objective: 'Determine and document the legal authority that permits the processing of personally identifiable information.',
  },
  'SA-11': {
    nist: 'SA-11', nistTitle: 'Developer Testing and Evaluation', nistFamily: 'System and Services Acquisition',
    cmmc: 'SA.L2-3.13.2', iso: 'A.8.25 / A.8.29', soc2: 'CC8.1',
    domain: 'Secure Development',
    objective: 'Require developers to create and implement a security assessment plan including testing and evaluation.',
  },
  'SC-8': {
    nist: 'SC-8', nistTitle: 'Transmission Confidentiality and Integrity', nistFamily: 'System and Communications',
    cmmc: 'SC.L2-3.13.8', iso: 'A.8.24', soc2: 'CC6.1 / CC6.7',
    domain: 'Cryptography',
    objective: 'Protect the confidentiality and integrity of transmitted information using cryptographic mechanisms.',
  },
  'SI-12': {
    nist: 'SI-12', nistTitle: 'Information Management and Retention', nistFamily: 'System and Information Integrity',
    iso: 'A.5.33', soc2: 'CC6.5 / P4.3',
    domain: 'Data Management',
    objective: 'Manage and retain information within the system and information output in accordance with applicable laws and policies.',
  },
  'SR-6': {
    nist: 'SR-6', nistTitle: 'Supplier Assessments and Reviews', nistFamily: 'Supply Chain Risk Management',
    iso: 'A.5.19 / A.5.20 / A.5.21', soc2: 'CC9.2',
    domain: 'Supply Chain Risk',
    objective: 'Assess and review the supply chain-related risks associated with suppliers and the systems/components they provide.',
  },
};

export type RiskTier = 'Critical' | 'High' | 'Medium' | 'Low';

export const TIER_COLORS: Record<RiskTier, string> = {
  Critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  High: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export interface RiskScoringDimension {
  name: string;
  weight: number;
  description: string;
  examples: string[];
}

export const RISK_SCORING_DIMENSIONS: RiskScoringDimension[] = [
  {
    name: 'Data Sensitivity',
    weight: 4,
    description: 'Classification of the data the vendor accesses, processes, or stores.',
    examples: ['PII / PHI / financial records (Critical)', 'Internal-only business data (Medium)', 'No data access (Low)'],
  },
  {
    name: 'System Exposure',
    weight: 3,
    description: 'The degree of network or infrastructure access granted to the vendor.',
    examples: ['Privileged admin access (Critical)', 'VPN / internal network (High)', 'SaaS-only (Medium)', 'None (Low)'],
  },
  {
    name: 'Access Control Rating',
    weight: 3,
    description: 'The maturity of the vendor\'s identity and access management practices.',
    examples: ['MFA enforced, RBAC, JIT access (Low risk)', 'Password-only, shared accounts (High risk)'],
  },
  {
    name: 'Security Controls Score',
    weight: 3,
    description: 'Assessment of the vendor\'s implemented technical and organizational controls.',
    examples: ['SOC 2 + ISO 27001 certified (Low risk)', 'Basic security policy only (High risk)'],
  },
  {
    name: 'Compliance Status',
    weight: 2,
    description: 'Whether the vendor holds relevant compliance certifications or attestations.',
    examples: ['Current SOC 2 Type II + ISO 27001 (Low risk)', 'No certifications (High risk)'],
  },
];

export interface SBOMCapability {
  title: string;
  description: string;
  standard: string;
}

export const SBOM_CAPABILITIES: SBOMCapability[] = [
  {
    title: 'Format detection and parsing',
    description: 'Accepts CycloneDX (JSON/XML) and SPDX (JSON/RDF/tag-value) formats. Auto-detects and normalizes to a common component inventory.',
    standard: 'NTIA Minimum Elements for SBOM (July 2021)',
  },
  {
    title: 'Vulnerability correlation',
    description: 'Cross-references every component against the NIST National Vulnerability Database (NVD) and CISA Known Exploited Vulnerabilities (KEV) catalog.',
    standard: 'NIST NVD / MITRE CVE / CISA KEV',
  },
  {
    title: 'License compliance validation',
    description: 'Identifies open-source license types per component and flags restrictive or incompatible licenses (GPL, AGPL, SSPL).',
    standard: 'SPDX License List',
  },
  {
    title: 'SBOM health scoring',
    description: 'Generates a 0–100 health score based on CVE severity, component criticality, update availability, and NTIA completeness.',
    standard: 'EO 14028, Section 4 (Software Supply Chain)',
  },
  {
    title: 'Component risk propagation',
    description: 'Calculates how vulnerabilities in transitive dependencies propagate risk to the consuming application.',
    standard: 'NIST SP 800-161 r1, SR-3 / SR-6',
  },
];

export const FRAMEWORK_COVERAGE: Record<FrameworkId, {
  domains: string[];
  assessmentTypes: string[];
  riskTiers: RiskTier[];
}> = {
  'nist-800-161': {
    domains: ['Access Management', 'Audit & Accountability', 'Continuity', 'Cryptography', 'Incident Response', 'Personnel Security', 'Physical Security', 'Privacy', 'Secure Development', 'Supply Chain Risk', 'Data Management', 'General'],
    assessmentTypes: ['Full', 'Light', 'Evidence Request'],
    riskTiers: ['Critical', 'High', 'Medium', 'Low'],
  },
  'cmmc-l2': {
    domains: ['Access Management', 'Audit & Accountability', 'Continuity', 'Cryptography', 'Incident Response', 'Personnel Security', 'Physical Security', 'Secure Development', 'Supply Chain Risk'],
    assessmentTypes: ['Full'],
    riskTiers: ['Critical', 'High'],
  },
  'iso-27001': {
    domains: ['Access Management', 'Audit & Accountability', 'Continuity', 'Cryptography', 'Incident Response', 'Personnel Security', 'Physical Security', 'Privacy', 'Secure Development', 'Supply Chain Risk', 'Data Management', 'General'],
    assessmentTypes: ['Full', 'Light'],
    riskTiers: ['Critical', 'High', 'Medium'],
  },
  'soc2': {
    domains: ['Access Management', 'Audit & Accountability', 'Continuity', 'Cryptography', 'Incident Response', 'Physical Security', 'Privacy', 'Data Management'],
    assessmentTypes: ['Full', 'Evidence Request'],
    riskTiers: ['Critical', 'High', 'Medium'],
  },
  'fedramp-fisma': {
    domains: ['Access Management', 'Audit & Accountability', 'Continuity', 'Cryptography', 'Incident Response', 'Personnel Security', 'Privacy', 'Secure Development', 'Data Management'],
    assessmentTypes: ['Full', 'Evidence Request'],
    riskTiers: ['Critical', 'High', 'Medium', 'Low'],
  },
};
