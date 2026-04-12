import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  PieChart,
  CheckCircle,
  AlertTriangle,
  Download,
  FileOutput,
  ArrowRight,
  Info,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Target,
  ListOrdered,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { PrioritizedSupplyChainAction } from '../../utils/supplyChainActionPlan';
import './AssessmentResults.css';

interface SectionScore {
  title: string;
  percentage: number;
  completed: boolean;
}

interface ResultData {
  overallScore: number;
  sectionScores: SectionScore[];
  assessmentType: 'ransomware' | 'supplychain' | 'cui' | 'privacy';
  frameworkName: string;
  completedDate: string;
  assessmentId?: string;
}

interface AssessmentResultsProps {
  data: ResultData;
  onExport: () => void;
  prioritizedActions?: PrioritizedSupplyChainAction[];
  fullRecommendationsHref?: string;
}

const priorityBadgeClass: Record<string, string> = {
  critical:
    'bg-red-100 text-red-900 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900',
  high: 'bg-orange-100 text-orange-900 border-orange-200 dark:bg-orange-950/40 dark:text-orange-200 dark:border-orange-900',
  medium:
    'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900',
  low: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600',
};

const AssessmentResults: React.FC<AssessmentResultsProps> = ({
  data,
  onExport,
  prioritizedActions,
  fullRecommendationsHref,
}) => {
  const { t } = useTranslation();
  // Refs for progress bars
  const overallProgressRef = useRef<HTMLDivElement>(null);
  const sectionProgressRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  // Set CSS custom properties for overall progress bar
  useEffect(() => {
    if (overallProgressRef.current) {
      overallProgressRef.current.style.setProperty('--progress-width', `${data.overallScore}%`);
    }
  }, [data.overallScore]);

  // Set CSS custom properties for section progress bars
  useEffect(() => {
    sectionProgressRefs.current.forEach((ref, index) => {
      if (ref && data.sectionScores[index]) {
        ref.style.setProperty('--progress-width', `${data.sectionScores[index].percentage}%`);
      }
    });
  }, [data.sectionScores]);

  // Calculate key metrics (guard against empty sectionScores)
  const sectionScores = data.sectionScores ?? [];
  const completedSections = sectionScores.filter(s => s.completed).length;
  const avgSectionScore = sectionScores.length > 0
    ? Math.round(sectionScores.reduce((sum, s) => sum + s.percentage, 0) / sectionScores.length)
    : 0;
  const criticalSections = sectionScores.filter(s => s.percentage < 50);
  const strongSections = sectionScores.filter(s => s.percentage >= 80);
  
  const toggleSection = (index: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Helper functions
  const getRecommendationsLink = (assessmentType: string, assessmentId?: string) => {
    const id = assessmentId || 'demo';
    // Map assessment types to their correct route paths
    const typeMap: Record<string, string> = {
      'supplychain': 'supply-chain',
      'ransomware': 'supply-chain', // Currently only supply-chain recommendations exist
      'cui': 'supply-chain',
      'privacy': 'supply-chain'
    };
    const routeType = typeMap[assessmentType] || 'supply-chain';
    return `/${routeType}-recommendations/${id}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-700 dark:text-green-400';
    if (score >= 60) return 'text-vendorsoluce-navy dark:text-vendorsoluce-blue';
    if (score >= 40) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-500/15 dark:bg-green-500/25';
    if (score >= 60) return 'bg-vendorsoluce-navy/10 dark:bg-vendorsoluce-navy/30';
    if (score >= 40) return 'bg-amber-500/15 dark:bg-amber-500/20';
    return 'bg-red-500/15 dark:bg-red-500/25';
  };

  const getSeverityText = (score: number) => {
    if (score >= 80) return 'Low Risk';
    if (score >= 60) return 'Moderate Risk';
    if (score >= 40) return 'High Risk';
    return 'Critical Risk';
  };

  const frameworkLogos = {
    'ransomware': <PieChart className="h-12 w-12 text-red-600 dark:text-red-400 shrink-0" />,
    'supplychain': <CheckCircle className="h-12 w-12 text-vendorsoluce-green dark:text-vendorsoluce-light-green shrink-0" />,
    'cui': <FileOutput className="h-12 w-12 text-vendorsoluce-teal dark:text-teal-400 shrink-0" />,
    'privacy': <Info className="h-12 w-12 text-vendorsoluce-blue shrink-0" />
  };

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <Card className="border dark:border-gray-700 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex-shrink-0">{frameworkLogos[data.assessmentType]}</div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Assessment results</CardTitle>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-0.5 break-words">
                  <span className="font-medium text-gray-700 dark:text-gray-200">{data.frameworkName}</span>
                  <span className="text-gray-400 dark:text-gray-500 mx-1.5" aria-hidden>
                    ·
                  </span>
                  {data.completedDate}
                </p>
              </div>
            </div>
            <Button onClick={onExport} size="sm" className="flex-shrink-0">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Overall Score - Compact */}
            <div className="lg:col-span-1 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-800/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-center mb-3">
                <div
                  className="inline-flex flex-col items-center justify-center rounded-2xl border-2 border-gray-200 dark:border-gray-600 px-6 py-4 bg-white/80 dark:bg-gray-900/40"
                  role="img"
                  aria-label={`Overall score ${data.overallScore} percent, ${getSeverityText(data.overallScore)}`}
                >
                  <div className={`text-4xl sm:text-5xl font-bold tabular-nums ${getScoreColor(data.overallScore)} leading-none`}>
                    {data.overallScore}%
                  </div>
                  <div className={`text-xs font-semibold mt-2 uppercase tracking-wide ${getScoreColor(data.overallScore)}`}>
                    {getSeverityText(data.overallScore)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-1.5 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-700 dark:text-gray-300">Compliance Score</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div 
                    ref={overallProgressRef}
                    className={`assessment-progress-bar assessment-progress-bar-overall ${getScoreBackground(data.overallScore)}`}>
                  </div>
                </div>
              </div>

              {data.overallScore < 70 && (
                <div className="mb-3 p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 rounded-lg text-xs flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-amber-950 dark:text-amber-100 leading-relaxed">
                    <span className="font-semibold">Action required.</span> Address identified gaps.
                  </span>
                </div>
              )}

              <Link to={getRecommendationsLink(data.assessmentType, data.assessmentId)}>
                <Button className="w-full text-xs" size="sm">
                  View Recommendations
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            {/* Key Metrics - Compact */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Completed</span>
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{completedSections}/{sectionScores.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">sections</div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-vendorsoluce-navy dark:text-vendorsoluce-blue shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Avg Score</span>
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{avgSectionScore}%</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">across sections</div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Critical</span>
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{criticalSections.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">need attention</div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Strong</span>
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{strongSections.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">excellent areas</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {prioritizedActions && prioritizedActions.length > 0 && (
        <Card className="border dark:border-gray-700 shadow-sm">
          <CardHeader className="pb-3 space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-vendorsoluce-navy/10 dark:bg-vendorsoluce-navy/25 shrink-0">
                  <ListOrdered className="h-5 w-5 text-vendorsoluce-navy dark:text-vendorsoluce-blue" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    {t('supplyChainResults.actionPlan.title')}
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                    {t('supplyChainResults.actionPlan.subtitle')}
                  </p>
                </div>
              </div>
              {fullRecommendationsHref && (
                <Link to={fullRecommendationsHref} className="shrink-0">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
                    {t('supplyChainResults.actionPlan.viewFull')}
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ol
              className={`space-y-4 list-none m-0 p-0 ${
                prioritizedActions.length > 8
                  ? 'max-h-[min(32rem,70vh)] overflow-y-auto assessment-scrollbar pr-1'
                  : ''
              }`}
            >
              {prioritizedActions.map((action) => (
                <li
                  key={`${action.questionId}-${action.rank}`}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-start gap-2 sm:gap-3 mb-3">
                    <span className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-md bg-vendorsoluce-green/15 text-vendorsoluce-dark-green dark:text-vendorsoluce-light-green text-sm font-bold">
                      {action.rank}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${priorityBadgeClass[action.priority] ?? priorityBadgeClass.medium}`}
                    >
                      {t(`supplyChainRecommendations.priorities.${action.priority}`)}
                    </span>
                    {!action.questionId.startsWith('SECTION-') && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{action.questionId}</span>
                    )}
                  </div>
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white leading-snug mb-1">
                    {action.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {action.sectionTitle}
                    <span className="mx-1.5">·</span>
                    <span className="font-medium text-gray-600 dark:text-gray-300">{action.control}</span>
                    <span className="mx-1.5">·</span>
                    {action.questionId.startsWith('SECTION-')
                      ? t('supplyChainResults.actionPlan.fromSectionScores')
                      : action.answer === 'no'
                        ? t('supplyChainResults.actionPlan.gapNo')
                        : t('supplyChainResults.actionPlan.gapPartial')}
                  </p>
                  <div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('supplyChainResults.actionPlan.steps')}
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 m-0 pl-4 list-disc marker:text-vendorsoluce-green">
                      {action.steps.map((step, i) => (
                        <li key={i} className="leading-relaxed pl-0.5">
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Section Scores - Collapsible */}
      <Card className="border dark:border-gray-700 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Section Breakdown</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show Details
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className={`space-y-3 assessment-scrollbar ${showDetails ? 'max-h-[500px] overflow-y-auto pr-2' : ''}`}>
            {sectionScores
              .map((section, originalIndex) => ({ section, originalIndex }))
              .sort((a, b) => a.section.percentage - b.section.percentage) // Sort by score (lowest first)
              .map(({ section, originalIndex }) => {
                const isExpanded = expandedSections.has(originalIndex);
                const isCritical = section.percentage < 50;
                const isStrong = section.percentage >= 80;
                
                return (
                  <div 
                    key={originalIndex} 
                    className={`group border rounded-lg p-3 transition-all ${
                      isCritical ? 'border-amber-300/80 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20' :
                      isStrong ? 'border-green-300/80 dark:border-green-800 bg-green-50/40 dark:bg-green-950/20' :
                      'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {isCritical && <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />}
                        {isStrong && <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />}
                        <div className="text-sm font-medium text-gray-900 dark:text-white min-w-0 flex-1 line-clamp-2 sm:truncate">{section.title}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`text-sm font-semibold ${getScoreColor(section.percentage)} flex-shrink-0`}>
                          {section.percentage}%
                        </div>
                        {showDetails && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSection(originalIndex)}
                            className="h-6 w-6 p-0"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden mb-2">
                      <div 
                        ref={(el) => {
                          sectionProgressRefs.current[originalIndex] = el;
                        }}
                        className={`assessment-progress-bar assessment-progress-bar-section ${getScoreBackground(section.percentage)}`}>
                      </div>
                    </div>
                    {showDetails && isExpanded && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        {section.completed ? (
                          <span className="text-green-700 dark:text-green-400">Completed for this section.</span>
                        ) : (
                          <span className="text-amber-800 dark:text-amber-200">Incomplete — review required.</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions - Compact */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10 dark:bg-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Strengths</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{strongSections.length} strong areas</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 dark:bg-amber-500/20">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Improvements</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{criticalSections.length} critical gaps</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-vendorsoluce-navy/10 dark:bg-vendorsoluce-navy/25">
                <FileOutput className="h-5 w-5 text-vendorsoluce-navy dark:text-vendorsoluce-blue" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Documentation</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Evidence & reports</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssessmentResults;

export { AssessmentResults }