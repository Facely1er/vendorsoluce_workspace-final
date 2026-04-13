import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Info, Sparkles } from 'lucide-react';
import { AssessmentResults } from '../../components/assessments/AssessmentResults';
import { Button } from '../../components/ui/Button';
import { generateResultsPdf, generateComprehensiveAssessmentPdf, generatePremiumReportPdf, type ComprehensiveAssessmentData } from '../../utils/generatePdf';
import { PremiumReportModal } from '../../components/reports/PremiumReportModal';
import { useSupplyChainAssessments } from '../../hooks/useSupplyChainAssessments';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { logger } from '../../utils/logger';
import { buildPrioritizedSupplyChainActions } from '../../utils/supplyChainActionPlan';
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

const SupplyChainResults = () => {
  const { t } = useTranslation();
  // const navigate = useNavigate();
  // const { id } = useParams<{ id: string }>();
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
  
  // Get results from location state or fetch from most recent completed assessment
  useEffect(() => {
    if (location.state?.overallScore && location.state?.sectionScores) {
      // Use results from location state (from assessment page)
      setResults({
        overallScore: location.state.overallScore,
        sectionScores: location.state.sectionScores
      });
      
      // Store metadata for PDF generation and display
      setAssessmentMetadata({
        assessmentName: location.state.assessmentName || 'Supply Chain Risk Assessment',
        completedAt: location.state.completedAt || new Date().toISOString(),
        answers: location.state.answers || {},
        assessmentId: location.state.assessmentId || 'demo'
      });
      return; // Early return to prevent further processing
    } else if (isAuthenticated && !loading && assessments.length > 0) {
      const completedAssessments = assessments.filter((a) => a.status === 'completed');
      const preferredId = idFromQuery || location.state?.assessmentId;
      const completedAssessment = preferredId
        ? (completedAssessments.find((a) => a.id === preferredId) ?? null)
        : (completedAssessments[0] ?? null);
      
      if (completedAssessment) {
        setResults({
          overallScore: completedAssessment.overall_score || 0,
          sectionScores: completedAssessment.section_scores as SectionScore[] || []
        });
        
        setAssessmentMetadata({
          assessmentName: completedAssessment.assessment_name || 'Supply Chain Risk Assessment',
          completedAt: completedAssessment.completed_at || new Date().toISOString(),
          answers: completedAssessment.answers as Record<string, string> || {},
          assessmentId: completedAssessment.id
        });
      } else {
        // If no completed assessment found, use mock data
        setResults(getMockResults());
        setAssessmentMetadata({
          assessmentName: 'Supply Chain Risk Assessment (Demo)',
          completedAt: new Date().toISOString(),
          answers: {},
          assessmentId: 'demo'
        });
      }
    } else if (!isAuthenticated || !loading) {
      // If no assessments found, use mock data
      setResults(getMockResults());
      setAssessmentMetadata({
        assessmentName: 'Supply Chain Risk Assessment (Demo)',
        completedAt: new Date().toISOString(),
        answers: {},
        assessmentId: 'demo'
      });
    }
  }, [location.state, assessments, loading, isAuthenticated, idFromQuery]);
  
  // Mock results for demo purposes
  const getMockResults = (): ResultData => {
    return {
      overallScore: 62,
      sectionScores: [
        { title: "Supplier Risk Management", percentage: 70, completed: true },
        { title: "Supply Chain Threat Management", percentage: 55, completed: true },
        { title: "Vulnerability Management", percentage: 60, completed: true },
        { title: "Information Sharing", percentage: 75, completed: true },
        { title: "Incident Response", percentage: 50, completed: true },
        { title: "Supplier Lifecycle Management", percentage: 65, completed: true }
      ]
    };
  };

  const handleExport = async (useComprehensive: boolean = false) => {
    if (!results) return;
    
    try {
      if (useComprehensive) {
        // Generate comprehensive report with detailed data
        const comprehensiveData: ComprehensiveAssessmentData = {
          assessmentName: assessmentMetadata.assessmentName || 'Supply Chain Risk Assessment',
          frameworkName: "NIST SP 800-161 Supply Chain Risk Management",
          overallScore: results.overallScore,
          sectionScores: results.sectionScores,
          completedDate: new Date(assessmentMetadata.completedAt || Date.now()).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          assessmentId: assessmentMetadata.assessmentId,
          // Convert answers to question format if available
          questions: assessmentMetadata.answers ? Object.entries(assessmentMetadata.answers).map(([id, answer]) => ({
            id,
            section: id.split('-')[0] || 'General',
            question: `Question ${id}`,
            answer: answer,
            type: 'text' as const
          })) : undefined,
          metadata: {
            status: 'completed'
          }
        };

        await generateComprehensiveAssessmentPdf(
          comprehensiveData,
          `${(assessmentMetadata.assessmentName || 'supply-chain-assessment').toLowerCase().replace(/\s+/g, '-')}-comprehensive-report.pdf`
        );
      } else {
        // Use simple report for backward compatibility
        await generateResultsPdf(
          `${assessmentMetadata.assessmentName || 'Supply Chain Risk Assessment'} - Results`,
          results.overallScore,
          results.sectionScores,
          new Date(assessmentMetadata.completedAt || Date.now()).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          `${(assessmentMetadata.assessmentName || 'supply-chain-assessment').toLowerCase().replace(/\s+/g, '-')}-results.pdf`
        );
      }
    } catch (error) {
      logger.error('Error generating PDF:', error);
      alert('Error generating PDF report. Please try again.');
    }
  };

  const prioritizedActions = useMemo(() => {
    if (!results?.sectionScores?.length) return [];
    return buildPrioritizedSupplyChainActions(
      results.sectionScores,
      assessmentMetadata.answers
    );
  }, [results, assessmentMetadata.answers]);

  if (loading || !results) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vendorsoluce-navy"></div>
      </div>
    );
  }

  // Prepare data for AssessmentResults component
  const resultData = {
    overallScore: results.overallScore,
    sectionScores: results.sectionScores,
    assessmentType: 'supplychain' as const,
    frameworkName: "NIST SP 800-161 Supply Chain Risk Management",
    completedDate: new Date(assessmentMetadata.completedAt || Date.now()).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    assessmentId: assessmentMetadata.assessmentId
  };

  const recommendationsHref = `/supply-chain-recommendations/${assessmentMetadata.assessmentId || 'demo'}`;

  return (
    <WorkspacePage
      title={`${assessmentMetadata.assessmentName || t('supplyChainResults.defaultTitle')} — ${t('supplyChainResults.resultsTitle')}`}
      subtitle={t('supplyChainResults.summaryBlurb')}
    >
      <WorkspaceHero>
        <WorkspaceContextBar
          items={[
            { label: 'Overall score', value: `${results.overallScore}/100` },
            { label: 'Sections', value: `${results.sectionScores.length}` },
            { label: 'Priority actions', value: `${prioritizedActions.length}` },
            { label: 'Report state', value: isAuthenticated ? 'Workspace-linked' : 'Guest session' },
          ]}
        />
      </WorkspaceHero>
      
      {/* Show info message for non-authenticated users - More compact */}
      {!isAuthenticated && (
        <div className="mb-5 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-1 text-sm">
                {t('supplyChainResults.accountPrompt.title')}
              </h3>
              <p className="text-xs text-blue-700 dark:text-blue-400 mb-2">
                {t('supplyChainResults.accountPrompt.description')}
              </p>
              <div className="flex flex-wrap gap-2">
                <Link to="/signup">
                  <button className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700 transition-colors">
                    {t('supplyChainResults.accountPrompt.createAccount')}
                  </button>
                </Link>
                <Link to="/signin">
                  <button className="px-3 py-1.5 border border-blue-300 text-blue-600 rounded-md text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    {t('supplyChainResults.accountPrompt.signIn')}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <WorkspaceSection title="Assessment summary" description="This score should lead directly into recommendations and reporting.">
        <AssessmentResults 
        data={resultData}
        onExport={() => handleExport(false)}
        prioritizedActions={prioritizedActions}
        fullRecommendationsHref={recommendationsHref}
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
      
      <WorkspaceSection title="Key findings" description="Use these strengths and weak areas to drive the roadmap and evidence plan.">
        <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-5 text-gray-900 dark:text-white">{t('supplyChainResults.keyFindings.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 sm:p-6 bg-gray-100/30 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-3 text-sm sm:text-base text-gray-900 dark:text-white">{t('supplyChainResults.keyFindings.primaryRiskAreas')}</h3>
            <ul className="m-0 pl-5 list-disc list-outside space-y-2.5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed marker:text-vendorsoluce-green">
              {results.sectionScores
                .filter(s => s.percentage < 60)
                .map((section, index) => (
                  <li key={index} className="leading-relaxed pl-1">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{section.title}</span>
                    {' '}
                    ({section.percentage}% {t('supplyChainResults.keyFindings.compliance')})
                  </li>
                ))}
              {results.sectionScores.filter(s => s.percentage < 60).length === 0 && (
                <li className="text-gray-500 dark:text-gray-400 pl-1 list-none -ml-5">{t('supplyChainResults.keyFindings.noCriticalRisks')}</li>
              )}
            </ul>
          </div>
          
          <div className="p-5 sm:p-6 bg-gray-100/30 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-3 text-sm sm:text-base text-gray-900 dark:text-white">{t('supplyChainResults.keyFindings.strengths')}</h3>
            <ul className="m-0 pl-5 list-disc list-outside space-y-2.5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed marker:text-vendorsoluce-green">
              {results.sectionScores
                .filter(s => s.percentage >= 70)
                .map((section, index) => (
                  <li key={index} className="leading-relaxed pl-1">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{section.title}</span>
                    {' '}
                    ({section.percentage}% {t('supplyChainResults.keyFindings.compliance')})
                  </li>
                ))}
              {results.sectionScores.filter(s => s.percentage >= 70).length === 0 && (
                <li className="text-gray-500 dark:text-gray-400 pl-1 list-none -ml-5">{t('supplyChainResults.keyFindings.noSignificantStrengths')}</li>
              )}
            </ul>
          </div>
        </div>
        </div>
      </WorkspaceSection>

      {/* Action button - More compact */}
      <WorkspaceSection title="Next step" description="Move from the score into an action plan instead of stopping at the report.">
        <div className="flex justify-end">
          <Link to={recommendationsHref}>
            <Button variant="primary" className="w-full sm:w-auto justify-center">
              {t('supplyChainResults.viewDetailedRecommendations')}
            </Button>
          </Link>
        </div>
      </WorkspaceSection>

      {/* Premium Report Modal */}
      <PremiumReportModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onPurchase={async () => {
          // After successful purchase, generate premium report
          try {
            await generatePremiumReportPdf(
              `${assessmentMetadata.assessmentName || 'Supply Chain Risk Assessment'} - Premium Report`,
              results.overallScore,
              results.sectionScores,
              new Date(assessmentMetadata.completedAt || Date.now()).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }),
              `${(assessmentMetadata.assessmentName || 'supply-chain-assessment').toLowerCase().replace(/\s+/g, '-')}-premium-report.pdf`,
              {
                vendorCount: assessments?.length || 0,
                criticalFindings: results.sectionScores
                  .filter(s => s.percentage < 60)
                  .map(s => `${s.title} requires immediate attention (${s.percentage}% compliance)`)
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
          completedAt: assessmentMetadata.completedAt
        }}
      />
    </WorkspacePage>
  );
};

export default SupplyChainResults;