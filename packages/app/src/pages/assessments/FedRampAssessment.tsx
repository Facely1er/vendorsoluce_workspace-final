import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  AlertTriangle,
  CheckCircle,
  Circle,
  Info,
  ArrowLeft,
  ArrowRight,
  FileText,
  Shield,
  RotateCcw,
  Check,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSupplyChainAssessments } from '../../hooks/useSupplyChainAssessments';
import WorkspacePage from '../../components/workspace/WorkspacePage';
import WorkspaceHero from '../../components/workspace/WorkspaceHero';
import WorkspaceContextBar from '../../components/workspace/WorkspaceContextBar';
import { logger } from '../../utils/logger';

/**
 * FedRAMP / FISMA Evidence-Based Assessment
 *
 * This assessment is evidence-focused: each question asks whether the organisation
 * possesses a documented artifact for a given NIST SP 800-53 Rev 5 control family.
 * NIST SP 800-53 is a U.S. government publication in the public domain.
 *
 * Scoring maps to FIPS 199 impact levels (Low / Moderate / High), which are also
 * public-domain U.S. government standards.  The assessment does NOT reproduce the
 * official FedRAMP Security Assessment Plan / Report or any AICPA / ISO-proprietary
 * content.
 *
 * Answer scale:
 *   has_evidence     = 2 pts  (current, documented artifact exists)
 *   partial_evidence = 1 pt   (draft, outdated, or partially documented)
 *   no_evidence      = 0 pts  (missing or undocumented)
 */

const ASSESSMENT_NAME_DEFAULT = 'FedRAMP/FISMA Evidence Assessment';

const FedRampAssessment = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { createOrUpdateAssessment, loading } = useSupplyChainAssessments();

  const [assessmentStage, setAssessmentStage] = useState<'startScreen' | 'onboarding' | 'assessment'>('startScreen');
  const [assessmentName, setAssessmentName] = useState(ASSESSMENT_NAME_DEFAULT);
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const progressBarRef = useRef<HTMLDivElement>(null);

  const sections = useMemo(() => [
    {
      title: 'Governance & Authorization',
      description:
        'Evidence covering system authorization, security planning, and program-management artifacts (NIST SP 800-53 Rev 5: CA, PL, PM control families).',
      questions: [
        {
          id: 'GA-1',
          question: 'Does the organization have a current System Security Plan (SSP) or equivalent authorization documentation that describes the system boundary, environment, and implemented controls?',
          control: 'NIST SP 800-53 Rev 5 — CA-7, PL-2',
          guidance: 'The SSP is the primary authorization artifact.  Evidence: a dated SSP document, version history, and signature from the system owner.',
        },
        {
          id: 'GA-2',
          question: 'Is there a formal Authorization to Operate (ATO) letter, interim ATO, or documented risk acceptance decision from an Authorizing Official (AO)?',
          control: 'NIST SP 800-53 Rev 5 — CA-6',
          guidance: 'Evidence: the ATO letter (or denial / authorization with conditions), its expiry date, and the AO\'s identity.',
        },
        {
          id: 'GA-3',
          question: 'Is a designated Information System Security Officer (ISSO) or equivalent security-responsible role documented with defined responsibilities?',
          control: 'NIST SP 800-53 Rev 5 — PM-2',
          guidance: 'Evidence: role charter, appointment memo, or RACI/responsibility matrix showing the ISSO accountabilities.',
        },
        {
          id: 'GA-4',
          question: 'Does the organization operate a continuous monitoring program with documented frequency, metrics, and reporting cadence?',
          control: 'NIST SP 800-53 Rev 5 — CA-7',
          guidance: 'Evidence: a Continuous Monitoring (ConMon) plan, automated scan schedules, or monthly status reports submitted to the AO.',
        },
      ],
    },
    {
      title: 'Access Control Evidence',
      description:
        'Evidence covering user access policies, account management, multi-factor authentication, and privileged access (NIST SP 800-53 Rev 5: AC, IA control families).',
      questions: [
        {
          id: 'AC-1',
          question: 'Is there a documented access control policy covering least privilege, need-to-know, and separation of duties?',
          control: 'NIST SP 800-53 Rev 5 — AC-1',
          guidance: 'Evidence: a dated access control policy, approval signature, and distribution record.',
        },
        {
          id: 'AC-2',
          question: 'Are user-account provisioning, modification, and de-provisioning procedures documented with records of recent account reviews?',
          control: 'NIST SP 800-53 Rev 5 — AC-2, IA-4',
          guidance: 'Evidence: onboarding/offboarding checklists, quarterly account-review reports, and tickets showing deactivations when accounts are no longer needed.',
        },
        {
          id: 'AC-3',
          question: 'Is multi-factor authentication (MFA) enforced for privileged accounts and remote access, with configuration evidence?',
          control: 'NIST SP 800-53 Rev 5 — IA-2, IA-3',
          guidance: 'Evidence: MFA configuration screenshots, policy enforcement screenshots (e.g., Conditional Access or SAML assertions), or audit report confirming MFA coverage.',
        },
        {
          id: 'AC-4',
          question: 'Are privileged access management (PAM) controls implemented with audit trails for privileged user activity?',
          control: 'NIST SP 800-53 Rev 5 — AC-6, AU-9',
          guidance: 'Evidence: PAM tool configuration, privileged-session recording policy, and sample audit log showing privileged actions and attribution.',
        },
      ],
    },
    {
      title: 'Audit & Accountability Evidence',
      description:
        'Evidence covering audit logging, log retention, and review procedures (NIST SP 800-53 Rev 5: AU control family).',
      questions: [
        {
          id: 'AU-1',
          question: 'Is there a documented audit-logging policy specifying which event categories are captured across all system components?',
          control: 'NIST SP 800-53 Rev 5 — AU-1, AU-2',
          guidance: 'Evidence: the audit policy document listing auditable events (authentication, authorization changes, privileged actions, failures) and the systems in scope.',
        },
        {
          id: 'AU-2',
          question: 'Are audit logs retained for the required duration (typically 90 days online / 1 year archive for Moderate baseline) and protected from modification?',
          control: 'NIST SP 800-53 Rev 5 — AU-11, AU-9',
          guidance: 'Evidence: SIEM or log-management configuration showing retention settings, immutable storage policy, and access controls on log repositories.',
        },
        {
          id: 'AU-3',
          question: 'Are audit log-review procedures documented and executed on a defined schedule, with evidence of alert triage and anomaly response?',
          control: 'NIST SP 800-53 Rev 5 — AU-6',
          guidance: 'Evidence: log-review SOP, sample review records or SIEM alert tickets closed within the required timeframe.',
        },
        {
          id: 'AU-4',
          question: 'Does the organization have capacity planning for audit log storage to prevent loss of audit records?',
          control: 'NIST SP 800-53 Rev 5 — AU-4',
          guidance: 'Evidence: storage capacity reports, auto-scaling or archival configuration, and any audit failures log or alerting on storage thresholds.',
        },
      ],
    },
    {
      title: 'Configuration & Change Management Evidence',
      description:
        'Evidence covering system baselines, change control, patching, and configuration monitoring (NIST SP 800-53 Rev 5: CM, SI control families).',
      questions: [
        {
          id: 'CM-1',
          question: 'Is a baseline configuration inventory maintained for all authorized hardware, software, firmware, and network components within the authorization boundary?',
          control: 'NIST SP 800-53 Rev 5 — CM-2, CM-8',
          guidance: 'Evidence: asset inventory tool export (CMDB, AWS Config, etc.), inventory review date, and ownership assignments.',
        },
        {
          id: 'CM-2',
          question: 'Are change management and configuration-change control procedures documented, with approval records for recent changes?',
          control: 'NIST SP 800-53 Rev 5 — CM-3',
          guidance: 'Evidence: change-management policy, a sample change advisory board (CAB) approval record, and rollback procedure documentation.',
        },
        {
          id: 'CM-3',
          question: 'Are vulnerability scanning results available from the past 30 days, with evidence that critical/high findings are remediated within defined timeframes?',
          control: 'NIST SP 800-53 Rev 5 — RA-5, SI-2',
          guidance: 'Evidence: authenticated scan report, SLA policy for patch timelines (e.g., critical = 15 days), and POA&M entries for unmitigated findings.',
        },
        {
          id: 'CM-4',
          question: 'Is there a documented software usage restriction policy listing approved products, with evidence of enforcement (e.g., allowlisting or application-control configuration)?',
          control: 'NIST SP 800-53 Rev 5 — CM-7',
          guidance: 'Evidence: approved software list, application-control tool configuration, or periodic scan results confirming no unauthorized software is present.',
        },
      ],
    },
    {
      title: 'Contingency & Incident Response Evidence',
      description:
        'Evidence covering business continuity, disaster recovery testing, incident response planning, and incident records (NIST SP 800-53 Rev 5: CP, IR control families).',
      questions: [
        {
          id: 'CP-1',
          question: 'Is a Business Continuity / Disaster Recovery (BCP/DR) plan documented, including recovery time objectives (RTO) and recovery point objectives (RPO)?',
          control: 'NIST SP 800-53 Rev 5 — CP-2',
          guidance: 'Evidence: BCP/DR plan document with defined RTO/RPO per system, owner signature, and review date within the past 12 months.',
        },
        {
          id: 'CP-2',
          question: 'Has the BCP/DR plan been tested within the past 12 months, with an after-action report documenting findings and remediation actions?',
          control: 'NIST SP 800-53 Rev 5 — CP-4',
          guidance: 'Evidence: tabletop exercise notes or functional test record, after-action report, and tracking of identified gaps.',
        },
        {
          id: 'CP-3',
          question: 'Is there a documented Incident Response Plan (IRP) covering detection, analysis, containment, eradication, recovery, and post-incident review phases?',
          control: 'NIST SP 800-53 Rev 5 — IR-1, IR-8',
          guidance: 'Evidence: IRP document with defined roles, escalation paths, and communication templates.  Reviewed and updated within the past 12 months.',
        },
        {
          id: 'CP-4',
          question: 'Are incident-handling records or after-action reports available from real incidents or exercises conducted within the past 12 months?',
          control: 'NIST SP 800-53 Rev 5 — IR-4, IR-5',
          guidance: 'Evidence: incident ticket/report (sanitized), post-mortem or lessons-learned document, and evidence that lessons learned were integrated back into the IRP.',
        },
      ],
    },
    {
      title: 'System & Communications Protection Evidence',
      description:
        'Evidence covering boundary protection, encryption, malware defense, and patch management (NIST SP 800-53 Rev 5: SC, SI control families).',
      questions: [
        {
          id: 'SC-1',
          question: 'Is a current network architecture diagram available showing the authorization boundary, DMZ, internal segmentation, and external interconnections?',
          control: 'NIST SP 800-53 Rev 5 — SC-7, AC-20',
          guidance: 'Evidence: network diagram (dated within 12 months), firewall rule review records, and documented interconnection security agreements (ISAs) for external connections.',
        },
        {
          id: 'SC-2',
          question: 'Is data-in-transit and data-at-rest encryption implemented and documented, with evidence of key-management procedures?',
          control: 'NIST SP 800-53 Rev 5 — SC-8, SC-28',
          guidance: 'Evidence: encryption policy specifying approved algorithms (e.g., FIPS 140-2/3 validated modules), TLS configuration screenshot, and storage-encryption configuration.',
        },
        {
          id: 'SC-3',
          question: 'Is endpoint/malware protection deployed across all endpoints and servers, with signature update records and evidence of coverage?',
          control: 'NIST SP 800-53 Rev 5 — SI-3',
          guidance: 'Evidence: EDR/AV console deployment report, recent signature version dates, and policy configuration ensuring real-time protection.',
        },
        {
          id: 'SC-4',
          question: 'Are patch management records available demonstrating that operating system and application patches are applied within defined timeframes?',
          control: 'NIST SP 800-53 Rev 5 — SI-2',
          guidance: 'Evidence: patch compliance dashboard or report, SLA policy (e.g., critical patches within 15 days), and POA&M for any deferred patches with risk acceptance.',
        },
      ],
    },
    {
      title: 'Risk Assessment & Personnel Security Evidence',
      description:
        'Evidence covering formal risk assessments, POA&M management, personnel screening, and security requirements in contracts (NIST SP 800-53 Rev 5: RA, PS, SA control families).',
      questions: [
        {
          id: 'RA-1',
          question: 'Has a formal risk assessment been conducted within the past 12 months and documented in a risk assessment report?',
          control: 'NIST SP 800-53 Rev 5 — RA-3',
          guidance: 'Evidence: risk assessment report (dated within 12 months), methodology description, identified threat sources, and risk ratings.',
        },
        {
          id: 'RA-2',
          question: 'Is a Plan of Action & Milestones (POA&M) actively maintained, tracking all open findings from assessments, audits, and scans with owners and target remediation dates?',
          control: 'NIST SP 800-53 Rev 5 — CA-5',
          guidance: 'Evidence: current POA&M spreadsheet or tracker with columns for finding, severity, assigned owner, milestone dates, and status.  Submitted to AO if applicable.',
        },
        {
          id: 'RA-3',
          question: 'Are personnel screening and background-check procedures documented and applied to employees and contractors with access to the system?',
          control: 'NIST SP 800-53 Rev 5 — PS-3, PS-7',
          guidance: 'Evidence: personnel security policy, background check completion records (or attestation of procedure), and onboarding checklist confirming screening.',
        },
        {
          id: 'RA-4',
          question: 'Do vendor / contractor agreements include security requirements and flow-down clauses referencing applicable controls or compliance obligations?',
          control: 'NIST SP 800-53 Rev 5 — SA-4, SA-9',
          guidance: 'Evidence: sample contract security exhibit or DPA clause referencing NIST/FISMA/FedRAMP requirements, and a vendor risk management procedure confirming these terms are enforced.',
        },
      ],
    },
  ], []);

  useEffect(() => {
    if (progressBarRef.current && assessmentStage === 'assessment') {
      const answered = sections[currentSection].questions.filter(q => answers[q.id]).length;
      const total = sections[currentSection].questions.length;
      progressBarRef.current.style.setProperty('--progress-width', `${total > 0 ? (answered / total) * 100 : 0}%`);
    }
  }, [answers, currentSection, assessmentStage, sections]);

  const calculateSectionScore = (sectionIndex: number) => {
    const qs = sections[sectionIndex].questions;
    let score = 0;
    let answered = 0;
    qs.forEach(q => {
      const a = answers[q.id];
      if (a === 'has_evidence') { score += 2; answered++; }
      else if (a === 'partial_evidence') { score += 1; answered++; }
      else if (a === 'no_evidence') { answered++; }
    });
    return {
      score,
      total: qs.length * 2,
      completed: answered === qs.length,
      percentage: Math.round((score / (qs.length * 2)) * 100),
    };
  };

  const getOverallScore = () => {
    let total = 0;
    let possible = 0;
    sections.forEach((_, i) => {
      const s = calculateSectionScore(i);
      total += s.score;
      possible += s.total;
    });
    return possible === 0 ? 0 : Math.round((total / possible) * 100);
  };

  const hasCompletedMinimumSections = () => {
    const completed = sections.filter((_, i) => calculateSectionScore(i).completed).length;
    return completed >= Math.ceil(sections.length / 2);
  };

  const handleAnswer = async (questionId: string, answer: string) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    if (isAuthenticated) {
      try {
        setSaveStatus('saving');
        await createOrUpdateAssessment({ assessment_name: assessmentName }, newAnswers);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (err) {
        logger.error('Error saving FedRAMP assessment:', err);
        setSaveStatus('error');
      }
    }
  };

  const handleContinueToAssessment = async () => {
    if (isAuthenticated) {
      try {
        setSaveStatus('saving');
        await createOrUpdateAssessment({ assessment_name: assessmentName, status: 'in_progress' }, answers);
        setSaveStatus('saved');
      } catch (err) {
        logger.error('Error initializing FedRAMP assessment:', err);
        setSaveStatus('error');
      }
    }
    setAssessmentStage('assessment');
  };

  const handleViewResults = async () => {
    const sectionScores = sections.map((section, i) => {
      const s = calculateSectionScore(i);
      return { title: section.title, percentage: s.percentage, completed: s.completed };
    });
    const overallScore = getOverallScore();
    let assessmentId: string | undefined;
    if (isAuthenticated) {
      try {
        const updated = await createOrUpdateAssessment({
          assessment_name: assessmentName,
          overall_score: overallScore,
          section_scores: sectionScores,
          status: 'completed',
          completed_at: new Date().toISOString(),
        }, answers);
        if (updated?.id) assessmentId = updated.id;
      } catch (err) {
        logger.error('Error completing FedRAMP assessment:', err);
      }
    }
    navigate('/fedramp-results', {
      state: {
        overallScore,
        sectionScores,
        assessmentName,
        answers,
        completedAt: new Date().toISOString(),
        assessmentId: assessmentId ?? 'demo',
      },
    });
  };

  const handleRestartAssessment = () => {
    setAnswers({});
    setCurrentSection(0);
    setAssessmentStage('onboarding');
    setSaveStatus('idle');
  };

  const renderAnswerButtons = (questionId: string) => {
    const current = answers[questionId];
    return (
      <div className="flex flex-wrap gap-2 mt-1">
        <Button
          variant={current === 'has_evidence' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => handleAnswer(questionId, 'has_evidence')}
          className="flex items-center gap-1 min-h-[40px]"
        >
          <CheckCircle className="w-4 h-4" />
          Has Evidence
        </Button>
        <Button
          variant={current === 'partial_evidence' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => handleAnswer(questionId, 'partial_evidence')}
          className="flex items-center gap-1 min-h-[40px]"
        >
          <Circle className="w-4 h-4" />
          Partial
        </Button>
        <Button
          variant={current === 'no_evidence' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => handleAnswer(questionId, 'no_evidence')}
          className="flex items-center gap-1 min-h-[40px]"
        >
          <AlertTriangle className="w-4 h-4" />
          No Evidence
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vendorsoluce-navy" />
      </div>
    );
  }

  if (assessmentStage === 'startScreen') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 p-4 bg-vendorsoluce-pale-green dark:bg-vendorsoluce-green/10 rounded-lg border border-vendorsoluce-green/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-vendorsoluce-green dark:text-vendorsoluce-light-green uppercase tracking-wide">
              Compliance Track
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
            <span className="text-xs font-semibold text-vendorsoluce-green dark:text-vendorsoluce-light-green">
              Evidence readiness for federal information-security programs
            </span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Outcome: "I know which evidence artifacts are in place for a FedRAMP/FISMA authorization"
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Assess your evidence readiness across NIST SP 800-53 Rev 5 control families.
            Questions ask whether documented artifacts exist — not whether a specific framework questionnaire has been completed.
          </p>
        </div>

        <Card className="border-vendorsoluce-navy dark:border-trust-blue border-l-4">
          <CardHeader className="text-center pb-0">
            <div className="mx-auto w-16 h-16 bg-vendorsoluce-navy/10 dark:bg-vendorsoluce-navy/30 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-vendorsoluce-navy dark:text-vendorsoluce-blue" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
              FedRAMP / FISMA Evidence Assessment
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-xl mx-auto">
              A 28-question evidence-readiness assessment organised around the NIST SP 800-53 Rev 5
              control families that underpin both FedRAMP and FISMA authorization programs.
            </p>
          </CardHeader>

          <CardContent className="pt-8 pb-8 px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-lg flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-vendorsoluce-navy/10 dark:bg-vendorsoluce-navy/30 rounded-full flex items-center justify-center mb-3">
                  <Shield className="h-6 w-6 text-vendorsoluce-navy dark:text-vendorsoluce-blue" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">NIST 800-53 Aligned</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Questions are mapped to NIST SP 800-53 Rev 5 control families — the public-domain
                  foundation of both FedRAMP and FISMA requirements.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-lg flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-vendorsoluce-navy/10 dark:bg-vendorsoluce-navy/30 rounded-full flex items-center justify-center mb-3">
                  <FileText className="h-6 w-6 text-vendorsoluce-navy dark:text-vendorsoluce-blue" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Evidence-Focused</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Each question asks "do you have the artifact?" rather than reproducing proprietary
                  framework questionnaires — avoiding accreditation or copyright concerns.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-lg flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-vendorsoluce-navy/10 dark:bg-vendorsoluce-navy/30 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle className="h-6 w-6 text-vendorsoluce-navy dark:text-vendorsoluce-blue" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">FIPS 199 Impact Levels</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Results are expressed as FISMA impact-level readiness (Low / Moderate / High),
                  helping you gauge authorization readiness without a formal assessment.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4 mb-8">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-blue-800 dark:text-blue-300 text-sm">
                  This assessment covers 7 control-family areas across 28 evidence questions.
                  You can save progress and return later.  Completing at least 4 of 7 sections
                  unlocks your impact-level readiness score.
                </p>
              </div>
            </div>

            <Button variant="primary" size="lg" className="w-full" onClick={() => setAssessmentStage('onboarding')}>
              Start Evidence Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (assessmentStage === 'onboarding') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 dark:text-white">
              Name your assessment
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Give this assessment a meaningful name — for example, the system name, project, or
              authorization boundary it covers.
            </p>

            <div className="mb-6">
              <label htmlFor="assessmentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assessment name
              </label>
              <input
                type="text"
                id="assessmentName"
                value={assessmentName}
                onChange={e => setAssessmentName(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-vendorsoluce-navy focus:border-vendorsoluce-navy bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="e.g. Agency Portal – FedRAMP Moderate Readiness"
              />
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md mb-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">What to expect</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" aria-hidden />
                  <span>7 control-family sections, 4 evidence questions each (28 total)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" aria-hidden />
                  <span>Answer &quot;Has Evidence&quot;, &quot;Partial&quot;, or &quot;No Evidence&quot; for each artifact</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" aria-hidden />
                  <span>Progress is auto-saved if you are signed in</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" aria-hidden />
                  <span>Results are mapped to FISMA Low / Moderate / High impact-level readiness</span>
                </li>
              </ul>
            </div>

            <Button variant="primary" className="w-full" onClick={handleContinueToAssessment}>
              Begin assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentSectionData = sections[currentSection];
  const sectionScore = calculateSectionScore(currentSection);
  const overallScore = getOverallScore();

  return (
    <WorkspacePage
      title={assessmentName}
      subtitle="FedRAMP / FISMA evidence readiness — NIST SP 800-53 Rev 5 control families"
      actions={(
        <Button
          variant="outline"
          size="sm"
          onClick={handleRestartAssessment}
          className="flex items-center text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Restart
        </Button>
      )}
    >
      <WorkspaceHero>
        <WorkspaceContextBar
          items={[
            { label: 'Overall score', value: `${overallScore}/100` },
            { label: 'Section', value: `${currentSection + 1}/${sections.length}` },
            { label: 'Section score', value: `${sectionScore.percentage}%` },
            {
              label: 'Save status',
              value:
                saveStatus === 'saved'
                  ? 'Saved'
                  : saveStatus === 'saving'
                    ? 'Saving…'
                    : saveStatus === 'error'
                      ? 'Save error'
                      : 'Unsaved',
            },
          ]}
        />
      </WorkspaceHero>

      {/* Section grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
        {sections.map((s, i) => {
          const sc = calculateSectionScore(i);
          return (
            <button
              key={i}
              onClick={() => setCurrentSection(i)}
              className={`p-2 rounded-lg text-xs text-left transition-colors ${
                i === currentSection
                  ? 'bg-vendorsoluce-navy text-white'
                  : sc.completed
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-gray-700 dark:text-gray-300'
                  : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <div className="font-medium truncate">{s.title}</div>
              <div className="mt-1 text-xs opacity-80">{sc.percentage}%</div>
            </button>
          );
        })}
      </div>

      {/* Main assessment card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-gray-900 dark:text-white">
                {currentSectionData.title}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {currentSectionData.description}
              </p>
            </div>
            <div className="text-right ml-4 shrink-0">
              <div className="text-3xl font-bold text-vendorsoluce-green dark:text-vendorsoluce-light-green">
                {sectionScore.percentage}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">section score</div>
            </div>
          </div>

          {/* Section progress bar */}
          <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              ref={progressBarRef}
              className="h-full rounded-full bg-vendorsoluce-green transition-all w-[var(--progress-width,0%)]"
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-8">
            {currentSectionData.questions.map((q, qi) => (
              <div key={q.id} className="border-b border-gray-100 dark:border-gray-800 pb-6 last:border-0 last:pb-0">
                <div className="flex items-start gap-3 mb-2">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-vendorsoluce-navy/10 dark:bg-vendorsoluce-navy/30 flex items-center justify-center text-xs font-bold text-vendorsoluce-navy dark:text-vendorsoluce-blue">
                    {qi + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{q.question}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span className="font-semibold">Control:</span> {q.control}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-3">
                      <span className="font-semibold not-italic">Guidance:</span> {q.guidance}
                    </p>
                    {renderAnswerButtons(q.id)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentSection(prev => Math.max(0, prev - 1))}
              disabled={currentSection === 0}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            {currentSection < sections.length - 1 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCurrentSection(prev => Math.min(sections.length - 1, prev + 1))}
                className="flex items-center"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleViewResults}
                disabled={!hasCompletedMinimumSections()}
                className="flex items-center"
              >
                View results
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>

          {currentSection === sections.length - 1 && !hasCompletedMinimumSections() && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 text-right">
              Complete at least 4 of 7 sections to unlock results.
            </p>
          )}
        </CardContent>
      </Card>
    </WorkspacePage>
  );
};

export default FedRampAssessment;
