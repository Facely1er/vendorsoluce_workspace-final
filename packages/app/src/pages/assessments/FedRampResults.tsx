import { useEffect, useState, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Info, Sparkles } from 'lucide-react';
import { AssessmentResults } from '../../components/assessments/AssessmentResults';
import { Button } from '../../components/ui/Button';
import {
  generateResultsPdf,
  generateComprehensiveAssessmentPdf,
  generatePremiumReportPdf,
  type ComprehensiveAssessmentData,
} from '../../utils/generatePdf';
import { PremiumReportModal } from '../../components/reports/PremiumReportModal';
import { useSupplyChainAssessments } from '../../hooks/useSupplyChainAssessments';
import { useAuth } from '../../context/AuthContext';
import { logger } from '../../utils/logger';
import WorkspacePage from '../../components/workspace/WorkspacePage';
import WorkspaceHero from '../../components/workspace/WorkspaceHero';
import WorkspaceContextBar from '../../components/workspace/WorkspaceContextBar';
import WorkspaceSection from '../../components/workspace/WorkspaceSection';

interface SectionScore {
  title: string;
  percentage: number;
  completed: boolean;
}

interface ResultData {
  overallScore: number;
  sectionScores: SectionScore[];
}

/** Map an overall percentage score to a FISMA / FIPS 199 impact-level label. */
function getFismaImpactLevel(score: number): { label: string; description: string; color: string } {
  if (score >= 80) {
    return {
      label: 'High Impact Ready',
      description:
        'Evidence coverage supports a FISMA High impact system baseline.  ' +
        'Critical national-security and safety-of-life systems require this level.',
      color: 'text-green-700 dark:text-green-400',
    };
  }
  if (score >= 60) {
    return {
      label: 'Moderate Impact Ready',
      description:
        'Evidence coverage supports a FISMA Moderate impact system baseline.  ' +
        'Most federal systems and FedRAMP-authorized SaaS services operate at this level.',
      color: 'text-blue-700 dark:text-blue-400',
    };
  }
  if (score >= 40) {
    return {
      label: 'Low Impact Ready',
      description:
        'Evidence coverage supports a FISMA Low impact system baseline.  ' +
        'Significant gaps exist for Moderate/High authorization — use the POA&M to close them.',
      color: 'text-yellow-700 dark:text-yellow-400',
    };
  }
  return {
    label: 'Insufficient Evidence',
    description:
      'Significant evidence gaps across multiple control families.  ' +
      'A formal authorization is unlikely without remediation.  Address the priority risk areas first.',
    color: 'text-red-700 dark:text-red-400',
  };
}

const getMockResults = (): ResultData => ({
  overallScore: 58,
  sectionScores: [
    { title: 'Governance & Authorization', percentage: 75, completed: true },
    { title: 'Access Control Evidence', percentage: 50, completed: true },
    { title: 'Audit & Accountability Evidence', percentage: 65, completed: true },
    { title: 'Configuration & Change Management Evidence', percentage: 55, completed: true },
    { title: 'Contingency & Incident Response Evidence', percentage: 45, completed: true },
    { title: 'System & Communications Protection Evidence', percentage: 60, completed: true },
    { title: 'Risk Assessment & Personnel Security Evidence', percentage: 50, completed: true },
  ],
});

const FRAMEWORK_NAME = 'FedRAMP / FISMA Evidence Readiness (NIST SP 800-53 Rev 5)';

const FedRampResults = () => {
  const location = useLocation();
  const idFromQuery = useMemo(() => new URLSearchParams(location.search).get('id'), [location.search]);
  const { isAuthenticated } = useAuth();
  const { assessments, loading } = useSupplyChainAssessments();
  const [results, setResults] = useState<ResultData | null>(null);
  const [assessmentMetadata, setAssessmentMetadata] = useState<{
    assessmentName?: string;
    completedAt?: string;
    answers?: Record<string, string>;
    assessmentId?: string;
  }>({});
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [_hasPremiumAccess, setHasPremiumAccess] = useState(false);

  useEffect(() => {
    if (location.state?.overallScore && location.state?.sectionScores) {
      setResults({
        overallScore: location.state.overallScore,
        sectionScores: location.state.sectionScores,
      });
      setAssessmentMetadata({
        assessmentName: location.state.assessmentName || 'FedRAMP/FISMA Evidence Assessment',
        completedAt: location.state.completedAt || new Date().toISOString(),
        answers: location.state.answers || {},
        assessmentId: location.state.assessmentId || 'demo',
      });
      return;
    }

    if (isAuthenticated && !loading && assessments.length > 0) {
      const completed = assessments.filter(a => a.status === 'completed');
      const preferredId = idFromQuery || location.state?.assessmentId;
      const latest = preferredId
        ? (completed.find((a) => a.id === preferredId) ?? null)
        : (completed[0] ?? null);
      if (latest) {
        setResults({
          overallScore: latest.overall_score || 0,
          sectionScores: (latest.section_scores as SectionScore[]) || [],
        });
        setAssessmentMetadata({
          assessmentName: latest.assessment_name || 'FedRAMP/FISMA Evidence Assessment',
          completedAt: latest.completed_at || new Date().toISOString(),
          answers: (latest.answers as Record<string, string>) || {},
          assessmentId: latest.id,
        });
        return;
      }
    }

    setResults(getMockResults());
    setAssessmentMetadata({
      assessmentName: 'FedRAMP/FISMA Evidence Assessment (Demo)',
      completedAt: new Date().toISOString(),
      answers: {},
      assessmentId: 'demo',
    });
  }, [location.state, assessments, loading, isAuthenticated, idFromQuery]);

  const handleExport = async (useComprehensive = false) => {
    if (!results) return;
    const dateLabel = new Date(assessmentMetadata.completedAt || Date.now()).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const fileSlug = (assessmentMetadata.assessmentName || 'fedramp-fisma-assessment')
      .toLowerCase()
      .replace(/\s+/g, '-');
    try {
      if (useComprehensive) {
        const comprehensiveData: ComprehensiveAssessmentData = {
          assessmentName: assessmentMetadata.assessmentName || 'FedRAMP/FISMA Evidence Assessment',
          frameworkName: FRAMEWORK_NAME,
          overallScore: results.overallScore,
          sectionScores: results.sectionScores,
          completedDate: dateLabel,
          assessmentId: assessmentMetadata.assessmentId,
          questions: assessmentMetadata.answers
            ? Object.entries(assessmentMetadata.answers).map(([id, answer]) => ({
                id,
                section: id.split('-')[0] || 'General',
                question: `Evidence item ${id}`,
                answer,
                type: 'text' as const,
              }))
            : undefined,
          metadata: { status: 'completed' },
        };
        await generateComprehensiveAssessmentPdf(comprehensiveData, `${fileSlug}-comprehensive-report.pdf`);
      } else {
        await generateResultsPdf(
          `${assessmentMetadata.assessmentName || 'FedRAMP/FISMA Evidence Assessment'} — Results`,
          results.overallScore,
          results.sectionScores,
          dateLabel,
          `${fileSlug}-results.pdf`
        );
      }
    } catch (error) {
      logger.error('Error generating PDF:', error);
    }
  };

  const impactLevel = useMemo(
    () => (results ? getFismaImpactLevel(results.overallScore) : null),
    [results]
  );

  if (loading || !results) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vendorsoluce-navy" />
      </div>
    );
  }

  const resultData = {
    overallScore: results.overallScore,
    sectionScores: results.sectionScores,
    assessmentType: 'supplychain' as const,
    frameworkName: FRAMEWORK_NAME,
    completedDate: new Date(assessmentMetadata.completedAt || Date.now()).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    assessmentId: assessmentMetadata.assessmentId,
  };

  return (
    <WorkspacePage
      title={`${assessmentMetadata.assessmentName || 'FedRAMP/FISMA Evidence Assessment'} — Results`}
      subtitle="Evidence readiness score mapped to FISMA Low / Moderate / High impact levels (FIPS 199)"
    >
      <WorkspaceHero>
        <WorkspaceContextBar
          items={[
            { label: 'Overall score', value: `${results.overallScore}/100` },
            { label: 'Impact level', value: impactLevel?.label ?? '—' },
            { label: 'Sections', value: `${results.sectionScores.length}` },
            { label: 'Report state', value: isAuthenticated ? 'Workspace-linked' : 'Guest session' },
          ]}
        />
      </WorkspaceHero>

      {!isAuthenticated && (
        <div className="mb-5 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-1 text-sm">
                Save your results
              </h3>
              <p className="text-xs text-blue-700 dark:text-blue-400 mb-2">
                Create a free account to save your assessment, track evidence gaps over time, and export reports.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link to="/signup">
                  <button className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700 transition-colors">
                    Create account
                  </button>
                </Link>
                <Link to="/signin">
                  <button className="px-3 py-1.5 border border-blue-300 text-blue-600 rounded-md text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    Sign in
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FISMA impact level badge */}
      {impactLevel && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <span className={`text-lg font-bold ${impactLevel.color}`}>{impactLevel.label}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{impactLevel.description}</p>
          </div>
        </div>
      )}

      <WorkspaceSection
        title="Assessment summary"
        description="Evidence coverage score per NIST SP 800-53 Rev 5 control family."
      >
        <AssessmentResults
          data={resultData}
          onExport={() => handleExport(false)}
          prioritizedActions={[]}
          fullRecommendationsHref="/fedramp-assessment"
        />
      </WorkspaceSection>

      <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-2 sm:justify-end sm:items-center">
        <Button
          type="button"
          onClick={() => setShowPremiumModal(true)}
          className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white border-0 w-full sm:w-auto justify-center"
        >
          <Sparkles className="h-4 w-4 shrink-0" />
          Premium Report - $49
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleExport(false)}
          className="w-full sm:w-auto justify-center border-gray-400 text-gray-700 hover:bg-gray-100 dark:border-gray-500 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          Export summary PDF
        </Button>
        <Button type="button" variant="primary" onClick={() => handleExport(true)} className="w-full sm:w-auto justify-center">
          Export comprehensive report
        </Button>
      </div>

      <WorkspaceSection
        title="Key findings"
        description="Control families with evidence gaps drive the highest authorization risk."
      >
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 sm:p-6 bg-gray-100/30 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-3 text-sm sm:text-base text-gray-900 dark:text-white">
                Priority evidence gaps
              </h3>
              <ul className="m-0 pl-5 list-disc list-outside space-y-2.5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed marker:text-vendorsoluce-green">
                {results.sectionScores
                  .filter(s => s.percentage < 60)
                  .map((section, i) => (
                    <li key={i} className="leading-relaxed pl-1">
                      <span className="font-medium text-gray-800 dark:text-gray-200">{section.title}</span>
                      {' '}({section.percentage}% evidence coverage)
                    </li>
                  ))}
                {results.sectionScores.filter(s => s.percentage < 60).length === 0 && (
                  <li className="text-gray-500 dark:text-gray-400 pl-1 list-none -ml-5">
                    No critical evidence gaps — good coverage across all sections.
                  </li>
                )}
              </ul>
            </div>

            <div className="p-5 sm:p-6 bg-gray-100/30 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-3 text-sm sm:text-base text-gray-900 dark:text-white">
                Strong evidence areas
              </h3>
              <ul className="m-0 pl-5 list-disc list-outside space-y-2.5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed marker:text-vendorsoluce-green">
                {results.sectionScores
                  .filter(s => s.percentage >= 70)
                  .map((section, i) => (
                    <li key={i} className="leading-relaxed pl-1">
                      <span className="font-medium text-gray-800 dark:text-gray-200">{section.title}</span>
                      {' '}({section.percentage}% evidence coverage)
                    </li>
                  ))}
                {results.sectionScores.filter(s => s.percentage >= 70).length === 0 && (
                  <li className="text-gray-500 dark:text-gray-400 pl-1 list-none -ml-5">
                    No sections at strong coverage yet — focus on closing gaps first.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        title="Next step"
        description="Re-run the assessment after collecting missing evidence, or start building your POA&M from the gaps above."
      >
        <div className="flex flex-wrap gap-3 justify-end">
          <Link to="/fedramp-assessment">
            <Button variant="outline" className="justify-center">
              Re-run assessment
            </Button>
          </Link>
          <Link to="/vendors">
            <Button variant="primary" className="justify-center">
              Go to evidence vault
            </Button>
          </Link>
        </div>
      </WorkspaceSection>

      <PremiumReportModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onPurchase={async () => {
          try {
            const dateLabel = new Date(assessmentMetadata.completedAt || Date.now()).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
            await generatePremiumReportPdf(
              `${assessmentMetadata.assessmentName || 'FedRAMP/FISMA Evidence Assessment'} — Premium Report`,
              results.overallScore,
              results.sectionScores,
              dateLabel,
              `${(assessmentMetadata.assessmentName || 'fedramp-fisma-assessment').toLowerCase().replace(/\s+/g, '-')}-premium-report.pdf`,
              {
                vendorCount: assessments?.length || 0,
                criticalFindings: results.sectionScores
                  .filter(s => s.percentage < 60)
                  .map(s => `${s.title} requires evidence remediation (${s.percentage}% coverage)`),
              }
            );
            setShowPremiumModal(false);
            setHasPremiumAccess(true);
          } catch (error) {
            logger.error('Error generating premium report:', error);
          }
        }}
        reportType="assessment"
        reportData={{
          overallScore: results.overallScore,
          sectionScores: results.sectionScores,
          assessmentName: assessmentMetadata.assessmentName,
          completedAt: assessmentMetadata.completedAt,
        }}
      />
    </WorkspacePage>
  );
};

export default FedRampResults;
