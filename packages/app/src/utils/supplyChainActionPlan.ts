/**
 * Builds a prioritized remediation list from VRM assessment answers and section scores.
 */

export type GapPriority = 'critical' | 'high' | 'medium' | 'low';

export interface PrioritizedSupplyChainAction {
  rank: number;
  priority: GapPriority;
  questionId: string;
  sectionTitle: string;
  control: string;
  title: string;
  steps: string[];
  answer: 'no' | 'partial';
}

const PREFIX_ORDER = ['SR', 'TM', 'VM', 'IS', 'IR', 'SL'] as const;

function sectionIndexForQuestionId(questionId: string): number {
  const prefix = questionId.split('-')[0]?.toUpperCase() ?? '';
  const idx = PREFIX_ORDER.indexOf(prefix as (typeof PREFIX_ORDER)[number]);
  return idx >= 0 ? idx : 0;
}

function answerSortWeight(a: string): number {
  if (a === 'no') return 0;
  if (a === 'partial') return 1;
  return 2;
}

function derivePriority(answer: string, sectionPct: number): GapPriority {
  if (answer === 'no' && sectionPct < 50) return 'critical';
  if (answer === 'no') return 'high';
  if (answer === 'partial' && sectionPct < 50) return 'high';
  if (answer === 'partial') return 'medium';
  return 'low';
}

/** Control reference + short playbook per question (NIST SP 800-161 alignment). */
const GAP_PLAYBOOK: Record<
  string,
  { title: string; control: string; steps: string[] }
> = {
  'SR-1': {
    title: 'Identify and document critical suppliers',
    control: 'NIST SP 800-161 2.2.1',
    steps: [
      'Inventory suppliers with access to sensitive data, production, or regulated workloads.',
      'Classify suppliers by criticality and data/system impact.',
      'Maintain ownership and review cadence for the critical-supplier list.',
    ],
  },
  'SR-2': {
    title: 'Integrate supply chain risk into enterprise risk',
    control: 'NIST SP 800-161 2.2.5',
    steps: [
      'Add explicit supply chain risk criteria to enterprise risk registers.',
      'Align supplier risk with business continuity and procurement decisions.',
      'Report top supplier risks to leadership on a defined schedule.',
    ],
  },
  'SR-3': {
    title: 'Define supplier security requirements',
    control: 'NIST SP 800-161 2.2.2',
    steps: [
      'Publish baseline security and privacy requirements by supplier tier.',
      'Embed requirements in RFPs, contracts, and renewal checklists.',
      'Track exceptions and compensating controls.',
    ],
  },
  'SR-4': {
    title: 'Assess and monitor supplier security posture',
    control: 'NIST SP 800-161 2.2.6',
    steps: [
      'Use questionnaires, evidence review, or third-party ratings for critical suppliers.',
      'Schedule periodic reassessment and trigger reviews on material changes.',
      'Document findings and remediation tracking.',
    ],
  },
  'TM-1': {
    title: 'Establish supply chain threat awareness',
    control: 'NIST SP 800-161 2.3.1',
    steps: [
      'Identify relevant threat scenarios for your products and suppliers.',
      'Subscribe to sector and vendor-relevant threat feeds.',
      'Brief procurement and engineering on emerging supply chain threats.',
    ],
  },
  'TM-2': {
    title: 'Plan mitigations for prioritized threats',
    control: 'NIST SP 800-161 3.4.1',
    steps: [
      'Map controls to the highest-likelihood / highest-impact scenarios.',
      'Assign owners, budgets, and timelines for mitigation work.',
      'Validate effectiveness after major process or architecture changes.',
    ],
  },
  'TM-3': {
    title: 'Coordinate threat information with suppliers',
    control: 'NIST SP 800-161 2.2.14',
    steps: [
      'Define what intelligence can be shared under NDA or community programs.',
      'Establish secure channels for indicators and incident-related context.',
      'Run tabletop exercises that include key suppliers where appropriate.',
    ],
  },
  'TM-4': {
    title: 'Measure and improve threat management maturity',
    control: 'NIST SP 800-161 3.3.1',
    steps: [
      'Track metrics (coverage, time-to-consume intel, exercises completed).',
      'Review threat assumptions after near-misses or industry incidents.',
      'Fold lessons learned into procurement and architecture standards.',
    ],
  },
  'VM-1': {
    title: 'Discover and track supplier-exposed vulnerabilities',
    control: 'NIST SP 800-161 3.4.2',
    steps: [
      'Extend vulnerability management scope to vendor-managed assets and services.',
      'Define SLAs for critical patch timelines by tier.',
      'Escalate repeated misses through governance and contract mechanisms.',
    ],
  },
  'VM-2': {
    title: 'Govern third-party and open-source components',
    control: 'NIST SP 800-161 2.7.1',
    steps: [
      'Generate or collect SBOMs for critical software you ship or operate.',
      'Integrate SCA into CI/CD and vendor deliverable acceptance.',
      'Set policy for approved sources, signing, and provenance checks.',
    ],
  },
  'VM-3': {
    title: 'Remediate supplier-related weaknesses',
    control: 'NIST SP 800-161 2.7.3',
    steps: [
      'Prioritize findings by exploitability and business impact.',
      'Require remediation plans from vendors for critical issues.',
      'Verify closure before renewals or production promotion.',
    ],
  },
  'VM-4': {
    title: 'Assess vulnerability disclosure and coordination',
    control: 'NIST SP 800-161 3.6.2',
    steps: [
      'Confirm suppliers publish coordinated disclosure and security contacts.',
      'Include notification timelines in contracts for exploitable issues.',
      'Practice joint communications during drills.',
    ],
  },
  'IS-1': {
    title: 'Protect supply chain information',
    control: 'NIST SP 800-161 3.8.1',
    steps: [
      'Classify schematics, roadmaps, and supplier data by sensitivity.',
      'Apply access control, encryption, and logging commensurate with risk.',
      'Limit distribution to need-to-know internal and external parties.',
    ],
  },
  'IS-2': {
    title: 'Control information flows with suppliers',
    control: 'NIST SP 800-161 3.8.3',
    steps: [
      'Document approved collaboration tools and data-exchange paths.',
      'Block unapproved channels via policy and technical enforcement where possible.',
      'Train staff on handling supplier-provided confidential material.',
    ],
  },
  'IS-3': {
    title: 'Sanitize and dispose of supplier information',
    control: 'NIST SP 800-161 3.8.5',
    steps: [
      'Define retention and secure disposal for supplier artifacts.',
      'Verify return or destruction at offboarding.',
      'Audit samples of supplier data stores periodically.',
    ],
  },
  'IS-4': {
    title: 'Detect misuse or leakage of supply chain information',
    control: 'NIST SP 800-161 3.8.6',
    steps: [
      'Monitor for anomalous access to supplier portals and shared drives.',
      'Use DLP or CASB signals where appropriate.',
      'Investigate and document suspected misuse with supplier involvement.',
    ],
  },
  'IR-1': {
    title: 'Prepare for supplier-linked incidents',
    control: 'NIST SP 800-161 2.8.4',
    steps: [
      'Add supplier compromise and software tampering scenarios to IR plans.',
      'Pre-assign legal, comms, and procurement roles for supply chain events.',
      'Maintain contact trees and escalation paths for critical vendors.',
    ],
  },
  'IR-2': {
    title: 'Detect supply chain incidents early',
    control: 'NIST SP 800-161 2.8.5',
    steps: [
      'Instrument integrity checks, signing failures, and abnormal supplier behavior.',
      'Correlate vendor notifications with internal telemetry.',
      'Define severity thresholds that trigger executive engagement.',
    ],
  },
  'IR-3': {
    title: 'Respond and contain across the supplier boundary',
    control: 'NIST SP 800-161 2.8.8',
    steps: [
      'Isolate affected systems, credentials, or integrations quickly.',
      'Coordinate containment steps with the vendor under contractual playbooks.',
      'Preserve evidence for forensics and regulatory needs.',
    ],
  },
  'IR-4': {
    title: 'Recover and learn from supply chain incidents',
    control: 'NIST SP 800-161 2.8.9',
    steps: [
      'Validate restoration via trusted media and configuration baselines.',
      'Run post-incident reviews with procurement and engineering.',
      'Update controls, contracts, and monitoring based on root cause.',
    ],
  },
  'SL-1': {
    title: 'Security across sourcing and onboarding',
    control: 'NIST SP 800-161 2.2.16',
    steps: [
      'Gate new suppliers with minimum security evidence before access.',
      'Align onboarding tasks with tiered requirements.',
      'Track completion before production connectivity.',
    ],
  },
  'SL-2': {
    title: 'Sustain assurance through the relationship',
    control: 'NIST SP 800-161 2.2.17',
    steps: [
      'Schedule recurring reviews, audits, or attestation checks.',
      'Reassess on mergers, outsourcing changes, or scope expansion.',
      'Maintain a single system of record for supplier status.',
    ],
  },
  'SL-3': {
    title: 'Integrity in acquisition and fulfillment',
    control: 'NIST SP 800-161 2.6.3',
    steps: [
      'Verify authenticity of hardware and software deliveries.',
      'Use trusted distribution paths and checksum or signature validation.',
      'Document chain-of-custody for critical components.',
    ],
  },
  'SL-4': {
    title: 'Secure offboarding and service transitions',
    control: 'NIST SP 800-161 2.6.4',
    steps: [
      'Revoke accounts, keys, and API access on exit.',
      'Retrieve or certify deletion of your data held by the supplier.',
      'Plan knowledge transfer to avoid risky shadow continuity arrangements.',
    ],
  },
};

function fallbackSectionAction(
  title: string,
  percentage: number,
  index: number
): PrioritizedSupplyChainAction {
  return {
    rank: index + 1,
    priority: percentage < 40 ? 'critical' : percentage < 60 ? 'high' : 'medium',
    questionId: `SECTION-${index}`,
    sectionTitle: title,
    control: 'NIST SP 800-161 (program-level)',
    title: `Strengthen practices in “${title}”`,
    steps: [
      `Revisit assessment responses in this area (current maturity ~${percentage}%).`,
      'Assign an owner and 30–90 day milestones for the largest gaps.',
      'Add evidence artifacts (policy, process records, metrics) to demonstrate progress.',
    ],
    answer: 'no',
  };
}

export function buildPrioritizedSupplyChainActions(
  sectionScores: { title: string; percentage: number }[],
  answers: Record<string, string> | undefined
): PrioritizedSupplyChainAction[] {
  const ans = answers ?? {};
  const raw: Omit<PrioritizedSupplyChainAction, 'rank'>[] = [];

  for (const [questionId, value] of Object.entries(ans)) {
    if (value !== 'no' && value !== 'partial') continue;
    const playbook = GAP_PLAYBOOK[questionId];
    if (!playbook) continue;

    const sIdx = sectionIndexForQuestionId(questionId);
    const sectionTitle = sectionScores[sIdx]?.title ?? 'Program area';
    const sectionPct = sectionScores[sIdx]?.percentage ?? 0;

    raw.push({
      priority: derivePriority(value, sectionPct),
      questionId,
      sectionTitle,
      control: playbook.control,
      title: playbook.title,
      steps: playbook.steps,
      answer: value,
    });
  }

  raw.sort((a, b) => {
    const w = answerSortWeight(a.answer) - answerSortWeight(b.answer);
    if (w !== 0) return w;
    const ia = sectionIndexForQuestionId(a.questionId);
    const ib = sectionIndexForQuestionId(b.questionId);
    const pa = sectionScores[ia]?.percentage ?? 100;
    const pb = sectionScores[ib]?.percentage ?? 100;
    if (pa !== pb) return pa - pb;
    const pr =
      { critical: 0, high: 1, medium: 2, low: 3 }[a.priority] -
      { critical: 0, high: 1, medium: 2, low: 3 }[b.priority];
    if (pr !== 0) return pr;
    return a.questionId.localeCompare(b.questionId);
  });

  if (raw.length === 0) {
    return sectionScores
      .map((s, i) => ({ s, i }))
      .filter(({ s }) => s.percentage < 75)
      .sort((a, b) => a.s.percentage - b.s.percentage)
      .slice(0, 8)
      .map(({ s }, j) => fallbackSectionAction(s.title, s.percentage, j));
  }

  return raw.map((item, i) => ({ ...item, rank: i + 1 }));
}
