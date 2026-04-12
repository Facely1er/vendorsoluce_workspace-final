/**
 * VendorSoluce™ process catalog — SIPOC-structured, full platform scope.
 *
 * Covers activities mapped to shipped routes and major features in:
 *   - packages/app/src/App.tsx (platform)
 *   - packages/app/src/PortalApp.tsx (vendor-facing portal deployment)
 *   - Key page modules linked from navigation even when lazy or secondary
 *
 * Extend rows only here; UI reads this catalog (Vendor activity catalog page).
 *
 * SIPOC: Supplier, Inputs, Process, Outputs, Customer.
 * inProductScope: route paths, portal paths, or stable page identifiers for traceability.
 *
 * Program tracks (`nist` | `vira`) align SIPOC phases with guided workflows:
 *   - `nist`: NIST SP 800-161 implementation workflow (`/program/nist-implementation`)
 *   - `vira`: VIRA due diligence workflow (`/program/vira-due-diligence`)
 */

/** High-level guided programs that map to subsets of this catalog. */
export type VendorSupplyProgramTrack = 'nist' | 'vira';

export type VendorSupplyPhaseId =
  | 'account-access-subscription'
  | 'product-enablement'
  | 'legal-trust-center'
  | 'integration-developer'
  | 'vendor-intake-administration'
  | 'requirements-templates'
  | 'assessments-due-diligence'
  | 'sbom-software-transparency'
  | 'risk-measurement-visualization'
  | 'results-compliance-remediation'
  | 'assets-dependencies'
  | 'team-governance'
  | 'program-marketing-operations'
  | 'portal-vendor-experience';

export interface VendorSupplySipocRow {
  id: string;
  supplier: string;
  inputs: string[];
  process: string;
  outputs: string[];
  customer: string;
  /** Routes, portal paths, or page identifiers this row maps to */
  inProductScope: string[];
}

export const VENDOR_SUPPLY_PHASE_LABELS: Record<VendorSupplyPhaseId, string> = {
  'account-access-subscription': 'Account, access & subscription',
  'product-enablement': 'Product learning, toolkit & adoption',
  'legal-trust-center': 'Legal & trust artifacts',
  'integration-developer': 'APIs & integration',
  'vendor-intake-administration': 'Vendor intake & administration',
  'requirements-templates': 'Requirements & templates',
  'assessments-due-diligence': 'Assessments, questionnaires & due diligence',
  'sbom-software-transparency': 'SBOM & software transparency',
  'risk-measurement-visualization': 'Risk measurement & visualization',
  'results-compliance-remediation': 'Results, compliance synthesis & remediation',
  'assets-dependencies': 'Assets & dependency linkage',
  'team-governance': 'Team governance & collaboration',
  'program-marketing-operations': 'Program marketing (admin)',
  'portal-vendor-experience': 'VendorSoluce™ Portal (vendor-facing deployment)',
};

export const VENDOR_SUPPLY_PHASE_DESCRIPTIONS: Record<VendorSupplyPhaseId, string> = {
  'account-access-subscription':
    'Authenticate, onboard, manage identity, subscription, billing, and personal workspace surfaces.',
  'product-enablement':
    'Discover how the product works, open tools, evaluate via demo/trial, download artifacts, and contact teams.',
  'legal-trust-center':
    'Consume published policies and master legal documents applicable to the service.',
  'integration-developer':
    'Integrate using documented APIs and deployment guides.',
  'vendor-intake-administration':
    'Register vendors, run onboarding, administer records, and set inherent-risk posture.',
  'requirements-templates':
    'Define expectations and reuse template content for assessments.',
  'assessments-due-diligence':
    'Run framework-aligned assessments, portal workflows, privacy tools, and collaborative reviews.',
  'sbom-software-transparency':
    'Ingest SBOMs, analyze components, and review analysis outputs.',
  'risk-measurement-visualization':
    'Quantify and visualize vendor risk (calculator, radar, dashboards).',
  'results-compliance-remediation':
    'Interpret scores, map compliance, recommend remediation, monitor, and re-assess.',
  'assets-dependencies':
    'Track assets tied to third parties and criticality.',
  'team-governance':
    'Assign RACI, manage stakeholders, and run collaborative assessment sessions.',
  'program-marketing-operations':
    'Operate internal marketing automation for the program (admin).',
  'portal-vendor-experience':
    'Public portal site and vendor assessment flow when deployed as VendorSoluce™ Portal.',
};

/**
 * Which guided program(s) each SIPOC phase primarily supports.
 * Used for catalog filtering and cross-links from workflow pages.
 */
export const VENDOR_SUPPLY_PHASE_PROGRAM_TRACKS: Record<VendorSupplyPhaseId, VendorSupplyProgramTrack[]> = {
  'account-access-subscription': [],
  'product-enablement': ['nist', 'vira'],
  'legal-trust-center': ['nist'],
  'integration-developer': ['nist'],
  'vendor-intake-administration': ['nist', 'vira'],
  'requirements-templates': ['nist', 'vira'],
  'assessments-due-diligence': ['nist', 'vira'],
  'sbom-software-transparency': ['nist'],
  'risk-measurement-visualization': ['nist', 'vira'],
  'results-compliance-remediation': ['nist', 'vira'],
  'assets-dependencies': ['nist', 'vira'],
  'team-governance': ['vira'],
  'program-marketing-operations': [],
  'portal-vendor-experience': ['vira'],
};

export const VENDOR_SUPPLY_ACTIVITIES_BY_PHASE: Record<VendorSupplyPhaseId, VendorSupplySipocRow[]> = {
  'account-access-subscription': [
    {
      id: 'aa-signin',
      supplier: 'User / identity administrator',
      inputs: ['Credentials or SSO policy', 'Account invitation (if applicable)'],
      process: 'Sign in to the platform or recover access',
      outputs: ['Authenticated session', 'Password reset confirmation when used'],
      customer: 'End user',
      inProductScope: ['/signin', '/reset-password'],
    },
    {
      id: 'aa-onboarding',
      supplier: 'Organization admin / new user',
      inputs: ['Subscription or tenant context', 'Role assignment'],
      process: 'Complete post–sign-in onboarding for the workspace',
      outputs: ['Completed onboarding checklist', 'Initial preferences'],
      customer: 'User and tenant administrators',
      inProductScope: ['/onboarding'],
    },
    {
      id: 'aa-profile-account',
      supplier: 'End user',
      inputs: ['Profile fields', 'Security preferences'],
      process: 'Maintain profile and account settings',
      outputs: ['Updated profile', 'Saved account configuration'],
      customer: 'User and support (for escalations)',
      inProductScope: ['/profile', '/account'],
    },
    {
      id: 'aa-billing',
      supplier: 'Procurement / finance / tenant admin',
      inputs: ['Plan selection', 'Payment or license terms'],
      process: 'Subscribe, check out, and manage billing or license entitlements',
      outputs: ['Active subscription or license record', 'Billing artifacts'],
      customer: 'Tenant owner and finance',
      inProductScope: ['/pricing', '/checkout', '/billing', 'LicensePage (via /billing when VITE_LICENSE_MODE)'],
    },
    {
      id: 'aa-user-hub',
      supplier: 'End user',
      inputs: ['Notification preferences', 'Task context'],
      process: 'Use personal dashboard, activity history, and notification center',
      outputs: ['Acknowledged notifications', 'Activity audit trail'],
      customer: 'User and managers',
      inProductScope: ['/user-dashboard', '/user-activity', '/notifications'],
    },
    {
      id: 'aa-landing-dashboard',
      supplier: 'Authenticated or evaluating user',
      inputs: ['Entitlements', 'Demo mode flags'],
      process: 'Land on the principal dashboard experience (full or demo variant)',
      outputs: ['Dashboard view state', 'Quick links to workflows'],
      customer: 'All platform users',
      inProductScope: ['/', '/dashboard', '/dashboard-demo', 'ConditionalDashboard', 'DashboardPage / HomePage'],
    },
  ],

  'product-enablement': [
    {
      id: 'pe-how',
      supplier: 'Program sponsor / new user',
      inputs: ['Business outcomes sought'],
      process: 'Learn end-to-end workflow and next steps from How it works',
      outputs: ['Understood journey', 'Deep links to assessments and tools'],
      customer: 'Buyers and practitioners',
      inProductScope: ['/how-it-works', '/tutorial → /how-it-works'],
    },
    {
      id: 'pe-toolkit-catalog',
      supplier: 'Practitioner',
      inputs: ['Tool need (SBOM, NIST, privacy, etc.)'],
      process:
        'Use Solutions for program workflows and tools; open NIST or VIRA guided implementation pages; reference the SIPOC catalog for full traceability',
      outputs: ['Tool entry points', 'Shared vocabulary for activities', 'Workflow step alignment'],
      customer: 'Assessment and GRC teams',
      inProductScope: ['/', '/vendor-activity-catalog', '/program/nist-implementation', '/program/vira-due-diligence'],
    },
    {
      id: 'pe-evaluate',
      supplier: 'Evaluator',
      inputs: ['Evaluation criteria', 'Time box'],
      process: 'Experience demo, trial, or sample dashboard to validate fit',
      outputs: ['Evaluation notes', 'Decision to subscribe or pilot'],
      customer: 'Sponsor and security leadership',
      inProductScope: ['/demo', '/trial', '/dashboard-demo'],
    },
    {
      id: 'pe-distribute',
      supplier: 'IT / release manager',
      inputs: ['Deployment model', 'Artifact approvals'],
      process: 'Download distributable builds or bundles where offered',
      outputs: ['Installable package', 'Checksum / version record'],
      customer: 'Customer operations',
      inProductScope: ['/download'],
    },
    {
      id: 'pe-contact',
      supplier: 'Prospect or customer',
      inputs: ['Contact reason', 'Org context'],
      process: 'Reach sales or support through contact flows',
      outputs: ['Support ticket or sales lead', 'Follow-up commitment'],
      customer: 'VendorSoluce™ teams',
      inProductScope: ['/contact', '/careers → /contact', 'ContactSalesPage (license mode pricing)'],
    },
    {
      id: 'pe-professional-services',
      supplier: 'Customer executive / program lead',
      inputs: ['Scope gaps', 'Implementation constraints'],
      process: 'Review professional services and assisted rollout options',
      outputs: ['SOW or engagement request', 'Prioritized assistance areas'],
      customer: 'Customer steering committee',
      inProductScope: ['pages/ProfessionalServices.tsx (marketing/nav links)'],
    },
    {
      id: 'pe-in-app-chat',
      supplier: 'End user',
      inputs: ['Question or stuck state'],
      process: 'Use the in-app chat widget for product guidance',
      outputs: ['Answer or escalation path', 'Session context for support'],
      customer: 'User and support teams',
      inProductScope: ['ChatWidget', 'ChatbotProvider'],
    },
  ],

  'legal-trust-center': [
    {
      id: 'lt-privacy-cookies',
      supplier: 'Legal / DPO (reader); VendorSoluce™ legal (publisher)',
      inputs: ['Jurisdiction', 'Processing context'],
      process: 'Review privacy policy and cookie policy for the service',
      outputs: ['Informed consent decisions', 'Cookie preferences where applicable'],
      customer: 'Users and procurement legal',
      inProductScope: ['/privacy', '/cookie-policy'],
    },
    {
      id: 'lt-acceptable-use',
      supplier: 'Security / legal (reader)',
      inputs: ['Organizational AUP requirements'],
      process: 'Review acceptable use obligations for the platform',
      outputs: ['Internal policy alignment', 'Violation handling reference'],
      customer: 'Security operations and employees',
      inProductScope: ['/acceptable-use-policy'],
    },
    {
      id: 'lt-master-terms',
      supplier: 'Enterprise legal (reader)',
      inputs: ['Master agreement context', 'Affiliate list'],
      process: 'Review master terms of service and master privacy policy where applicable',
      outputs: ['Contractual interpretation baseline', 'Subprocessor awareness'],
      customer: 'Legal and vendor management',
      inProductScope: ['/master-terms-of-service', '/master-privacy-policy'],
    },
  ],

  'integration-developer': [
    {
      id: 'id-api-docs',
      supplier: 'Integration engineer',
      inputs: ['API keys', 'Environment endpoints'],
      process: 'Consult API documentation to design integrations',
      outputs: ['Integration design', 'Endpoint call patterns'],
      customer: 'Platform and customer engineering',
      inProductScope: ['/api-docs'],
    },
    {
      id: 'id-guides',
      supplier: 'Solutions architect / DevOps',
      inputs: ['Target deployment topology'],
      process: 'Follow integration and deployment guides',
      outputs: ['Deployed connectors', 'Runbook updates'],
      customer: 'Customer operations',
      inProductScope: ['/integration-guides'],
    },
  ],

  'vendor-intake-administration': [
    {
      id: 'vi-vendor-dashboard',
      supplier: 'Third-party risk / procurement',
      inputs: ['Vendor legal name', 'Service description', 'Data categories', 'Criticality'],
      process: 'Operate vendor dashboard: register vendors, view risk posture, and navigate to tools',
      outputs: ['Vendor portfolio view', 'Drill-down to assessments and radar'],
      customer: 'Vendor managers and GRC',
      inProductScope: ['/vendors', 'VendorRiskDashboard', 'VendorRiskDashboardDemo', 'ConditionalVendorDashboard'],
    },
    {
      id: 'vi-onboarding-flow',
      supplier: 'Vendor manager',
      inputs: ['Stakeholder list', 'Service metadata'],
      process: 'Complete guided vendor onboarding workflow',
      outputs: ['Structured vendor record', 'Next-step tasks'],
      customer: 'Assessment coordinator',
      inProductScope: ['/vendor-onboarding'],
    },
    {
      id: 'vi-admin-bulk',
      supplier: 'Tenant administrator',
      inputs: ['Governance rules', 'Bulk change requests'],
      process: 'Perform administrative vendor management operations',
      outputs: ['Updated vendor master', 'Audit trail of admin changes'],
      customer: 'Security and procurement leadership',
      inProductScope: ['/admin/vendors', 'VendorManagementPage'],
    },
    {
      id: 'vi-inherent-tier',
      supplier: 'Risk owner',
      inputs: ['Vendor profile', 'Inherent risk factors', 'Benchmarks'],
      process: 'Assign inherent risk tier and assessment depth',
      outputs: ['Tier decision', 'Cadence and scope notes'],
      customer: 'GRC and assessment team',
      inProductScope: ['/tools/vendor-risk-calculator', '/vendor-risk-radar'],
    },
  ],

  'requirements-templates': [
    {
      id: 'rt-requirements-def',
      supplier: 'Security / GRC / procurement',
      inputs: ['Regulatory drivers', 'Contract', 'Data sensitivity'],
      process: 'Define vendor security and privacy requirements for the relationship',
      outputs: ['Requirements pack', 'Evidence expectations'],
      customer: 'Assessment coordinator and legal',
      inProductScope: ['/vendor-requirements', 'VendorRequirementsDefinition'],
    },
    {
      id: 'rt-template-library',
      supplier: 'Program management / content owner',
      inputs: ['Assessment use case', 'Framework alignment'],
      process: 'Browse and select items from the templates library for campaigns',
      outputs: ['Chosen template IDs', 'Version references'],
      customer: 'Assessment authors',
      inProductScope: ['/templates', 'Templates'],
    },
    {
      id: 'rt-template-preview',
      supplier: 'Program management',
      inputs: ['Template shortlist', 'Branding parameters'],
      process: 'Preview template rendering before campaign use',
      outputs: ['Validated template output', 'Go/no-go for publish'],
      customer: 'Content owners',
      inProductScope: ['/templates/preview', 'TemplatePreviewPage'],
    },
    {
      id: 'rt-framework-scope',
      supplier: 'GRC program lead',
      inputs: ['Requirements pack', 'Subscribed frameworks (NIST SP 800-161, CMMC, privacy, etc.)'],
      process: 'Map frameworks to assessment modules and portal packages',
      outputs: ['Framework scope matrix', 'Questionnaire set'],
      customer: 'Assessment team and vendors',
      inProductScope: ['/supply-chain-assessment', '/vendor-assessments', '/pricing (framework tiers)', 'PortalFrameworks (portal)'],
    },
  ],

  'assessments-due-diligence': [
    {
      id: 'ad-supply-chain',
      supplier: 'Assessment team',
      inputs: ['Scope statement', 'Framework selection'],
      process: 'Execute supply-chain security self-assessment questionnaire',
      outputs: ['Completed responses', 'Intermediate scores'],
      customer: 'GRC and executive reviewers',
      inProductScope: ['/supply-chain-assessment', 'SupplyChainAssessment'],
    },
    {
      id: 'ad-vendor-security-campaigns',
      supplier: 'Third-party risk owner',
      inputs: ['Vendor list', 'Campaign template', 'Due dates'],
      process: 'Manage vendor security assessment campaigns and track completion',
      outputs: ['Campaign status', 'Outstanding items per vendor'],
      customer: 'Vendor managers',
      inProductScope: ['/vendor-assessments', 'VendorSecurityAssessments'],
    },
    {
      id: 'ad-portal-landing-platform',
      supplier: 'Buyer communications',
      inputs: ['Vendor contacts', 'Portal URL'],
      process: 'Orient stakeholders via vendor portal landing on the platform host',
      outputs: ['Shared entry link', 'Role-appropriate next steps'],
      customer: 'Vendors and buyers',
      inProductScope: ['/vendor-portal', 'VendorPortalLandingPage'],
    },
    {
      id: 'ad-portal-session',
      supplier: 'Vendor respondent / buyer reviewer',
      inputs: ['Secure invitation', 'Evidence artefacts'],
      process: 'Complete or review vendor assessment portal session (questionnaires, uploads, status)',
      outputs: ['Submitted responses', 'Evidence index', 'Status timeline'],
      customer: 'Buyer GRC and vendor leadership',
      inProductScope: ['/vendor-assessments/:id', 'VendorAssessmentPortal', 'PortalApp /vendor-assessments/:id'],
    },
    {
      id: 'ad-nist-checklist',
      supplier: 'Compliance analyst',
      inputs: ['NIST SP 800-161 scope', 'Control ownership'],
      process: 'Complete NIST-oriented checklist assessment in the tool',
      outputs: ['Checklist results', 'Gap highlights'],
      customer: 'GRC and auditors',
      inProductScope: ['/tools/nist-checklist', 'NISTChecklist'],
    },
    {
      id: 'ad-vendor-privacy',
      supplier: 'Privacy office',
      inputs: ['Processor role', 'Data flow context'],
      process: 'Run vendor privacy assessment workflow in the tool',
      outputs: ['Privacy risk view', 'Remediation prompts'],
      customer: 'DPO and procurement',
      inProductScope: ['/tools/vendor-privacy-assessment', 'VendorPrivacyAssessment'],
    },
    {
      id: 'ad-dpia',
      supplier: 'Privacy lead',
      inputs: ['Processing description', 'Necessity test inputs'],
      process: 'Generate DPIA documentation using the DPIA tool',
      outputs: ['DPIA draft', 'Review package'],
      customer: 'DPO and legal',
      inProductScope: ['/tools/dpia', 'DpiaGenerator'],
    },
    {
      id: 'ad-data-inventory',
      supplier: 'Privacy / data governance',
      inputs: ['System list', 'Data categories'],
      process: 'Record and classify data holdings relevant to vendor processing',
      outputs: ['Inventory register', 'Linkage to assessments'],
      customer: 'Privacy team and IT',
      inProductScope: ['/tools/data-inventory', 'DataInventory'],
    },
    {
      id: 'ad-collaborate',
      supplier: 'Assessment lead',
      inputs: ['Open findings', 'SME availability'],
      process: 'Run collaborative assessment working sessions',
      outputs: ['Session outcomes', 'Updated action items'],
      customer: 'Extended team and vendor liaison',
      inProductScope: ['/team/collaborate', 'CollaborativeAssessmentPage'],
    },
  ],

  'sbom-software-transparency': [
    {
      id: 'sb-quick-scan',
      supplier: 'Engineering / security analyst',
      inputs: ['SBOM file (any supported stage)'],
      process: 'Run SBOM quick scan for format detection and high-level inventory',
      outputs: ['Format readout', 'Component count snapshot'],
      customer: 'SBOM analyst',
      inProductScope: ['/tools/sbom-quick-scan', 'SBOMQuickScan'],
    },
    {
      id: 'sb-analyzer-upload',
      supplier: 'Engineering / security',
      inputs: ['CycloneDX or SPDX', 'Product version'],
      process: 'Upload SBOM to full analyzer: parse, correlate vulnerabilities and licenses',
      outputs: ['Analysis run', 'Findings summary'],
      customer: 'Vendor manager and remediation owners',
      inProductScope: ['/sbom-analyzer', 'SBOMAnalyzer'],
    },
    {
      id: 'sb-analysis-detail',
      supplier: 'Analyst',
      inputs: ['Prior analysis ID', 'Review checklist'],
      process: 'Review detailed SBOM analysis results and export or share',
      outputs: ['Signed-off analysis record', 'Evidence for assessments'],
      customer: 'GRC and engineering leads',
      inProductScope: ['/sbom-analysis/:id', 'SBOMAnalysisPage'],
    },
  ],

  'risk-measurement-visualization': [
    {
      id: 'rm-calculator',
      supplier: 'Risk analyst',
      inputs: ['Vendor attributes', 'Weighting assumptions'],
      process: 'Calculate vendor risk score using the risk calculator',
      outputs: ['Numeric score', 'Factor explanation'],
      customer: 'Vendor manager and steering',
      inProductScope: ['/tools/vendor-risk-calculator', 'VendorRiskCalculator'],
    },
    {
      id: 'rm-radar',
      supplier: 'Third-party risk / privacy',
      inputs: ['Vendor set', 'Service taxonomy', 'Mode (baseline / real / hybrid)'],
      process: 'Operate Vendor Risk Radar: wizard, catalog, visualization, stats, import/export, inherent risk report',
      outputs: ['Radar views', 'Portfolio exports', 'Inherent risk narratives'],
      customer: 'Executives and GRC',
      inProductScope: [
        '/vendor-risk-radar',
        'VendorRiskRadar',
        'OnboardingWizard',
        'VendorCatalog',
        'RadarVisualization',
        'StatsOverview',
        'ImportExport',
        'VendorInherentRiskReport',
      ],
    },
  ],

  'results-compliance-remediation': [
    {
      id: 'rc-results',
      supplier: 'GRC analyst',
      inputs: ['Submitted assessment', 'Scoring model'],
      process: 'Interpret supply-chain and assessment result views',
      outputs: ['Result interpretation', 'Stakeholder briefing inputs'],
      customer: 'Leadership and vendor managers',
      inProductScope: ['/supply-chain-results/:id?', 'SupplyChainResults'],
    },
    {
      id: 'rc-recommendations',
      supplier: 'Program manager',
      inputs: ['Gap list', 'Risk appetite'],
      process: 'Consume prioritized recommendations and plan remediation',
      outputs: ['Remediation backlog', 'Owned actions'],
      customer: 'Control owners and vendors',
      inProductScope: ['/supply-chain-recommendations/:id', 'SupplyChainRecommendations'],
    },
    {
      id: 'rc-consolidated-score',
      supplier: 'Assessment engine / analyst',
      inputs: ['Questionnaires', 'SBOM findings', 'Tier weights'],
      process: 'Synthesize consolidated risk and compliance posture for oversight',
      outputs: ['Scorecards', 'Rating bands', 'Audit narrative'],
      customer: 'Executive and audit',
      inProductScope: ['VendorRiskDashboard', '/vendors', '/dashboard', 'SupplyChainResults'],
    },
    {
      id: 'rc-remediation-monitor',
      supplier: 'Vendor manager / SOC',
      inputs: ['Open findings', 'Monitoring thresholds'],
      process: 'Track remediation, monitor signals, and schedule re-assessment',
      outputs: ['Closed-loop status', 'Re-assessment triggers'],
      customer: 'GRC and operations',
      inProductScope: ['/notifications', '/user-activity', '/vendor-assessments', '/vendor-risk-radar'],
    },
  ],

  'assets-dependencies': [
    {
      id: 'as-asset-register',
      supplier: 'IT asset owner',
      inputs: ['Asset inventory sources', 'Vendor mapping'],
      process: 'Register and maintain assets linked to vendor relationships',
      outputs: ['Asset register rows', 'Criticality and owner fields'],
      customer: 'Security and vendor management',
      inProductScope: ['/asset-management', '/assets → /asset-management', 'AssetManagementPage'],
    },
  ],

  'team-governance': [
    {
      id: 'tg-raci',
      supplier: 'Program manager',
      inputs: ['Role list', 'Activity catalog (this document)'],
      process: 'Define and publish RACI for third-party risk activities',
      outputs: ['RACI matrix', 'Accountability clarity'],
      customer: 'All program participants',
      inProductScope: ['/team/raci', 'TeamRaciPage'],
    },
    {
      id: 'tg-stakeholders',
      supplier: 'Program sponsor',
      inputs: ['Org chart', 'Engagement model'],
      process: 'Maintain stakeholder register for assessments and escalations',
      outputs: ['Stakeholder list', 'Contact paths'],
      customer: 'Assessment leads',
      inProductScope: ['/team/stakeholders', 'StakeholderManagementPage'],
    },
  ],

  'program-marketing-operations': [
    {
      id: 'mo-admin',
      supplier: 'Marketing operations (tenant admin)',
      inputs: ['Campaign strategy', 'Audience segments'],
      process: 'Operate marketing admin console for program communications',
      outputs: ['Configured programs', 'Launch readiness'],
      customer: 'Internal stakeholders',
      inProductScope: ['/admin/marketing', 'MarketingAdminPage'],
    },
    {
      id: 'mo-campaign-create',
      supplier: 'Campaign owner',
      inputs: ['Template', 'Schedule', 'Approver'],
      process: 'Create a new marketing or outreach campaign',
      outputs: ['Campaign record', 'Workflow state'],
      customer: 'Recipients and compliance reviewers',
      inProductScope: ['/admin/marketing/campaigns/new', 'CreateCampaignPage'],
    },
  ],

  'portal-vendor-experience': [
    {
      id: 'pv-marketing-trust',
      supplier: 'Prospect / vendor visitor',
      inputs: ['Information need (buyer vs vendor)'],
      process: 'Consume portal marketing, how-it-works, buyer/vendor pages, security story, demo, and frameworks',
      outputs: ['Informed next step', 'Trust positioning understood'],
      customer: 'Buyers and vendors',
      inProductScope: [
        'PortalApp /',
        '/how-it-works (portal)',
        '/for-buyers',
        '/for-vendors',
        '/security',
        '/demo (portal)',
        '/frameworks',
        'PortalHome',
        'PortalHowItWorks',
        'PortalForBuyers',
        'PortalForVendors',
        'PortalSecurity',
        'PortalDemo',
        'PortalFrameworks',
      ],
    },
    {
      id: 'pv-assessment-host',
      supplier: 'Vendor respondent (portal deployment)',
      inputs: ['Invitation token or link'],
      process: 'Complete vendor assessment session hosted on the portal domain',
      outputs: ['Submission consistent with platform assessment flow'],
      customer: 'Buyer GRC team',
      inProductScope: ['PortalApp /vendor-assessments/:id', 'VendorAssessmentPortal'],
    },
  ],
};

export function getVendorSupplyActivitiesForPhase(phaseId: VendorSupplyPhaseId): VendorSupplySipocRow[] {
  return VENDOR_SUPPLY_ACTIVITIES_BY_PHASE[phaseId] ?? [];
}

export function allVendorSupplyPhaseIds(): VendorSupplyPhaseId[] {
  return [
    'account-access-subscription',
    'product-enablement',
    'legal-trust-center',
    'integration-developer',
    'vendor-intake-administration',
    'requirements-templates',
    'assessments-due-diligence',
    'sbom-software-transparency',
    'risk-measurement-visualization',
    'results-compliance-remediation',
    'assets-dependencies',
    'team-governance',
    'program-marketing-operations',
    'portal-vendor-experience',
  ];
}

export function totalVendorSupplyActivityCount(): number {
  return Object.values(VENDOR_SUPPLY_ACTIVITIES_BY_PHASE).reduce((sum, rows) => sum + rows.length, 0);
}

/** Activity row count for the union of the given phases (workflow metrics). */
export function countVendorSupplyActivitiesForPhases(phaseIds: readonly VendorSupplyPhaseId[]): number {
  return phaseIds.reduce((acc, id) => acc + VENDOR_SUPPLY_ACTIVITIES_BY_PHASE[id].length, 0);
}
