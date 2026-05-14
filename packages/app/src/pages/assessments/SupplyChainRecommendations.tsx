import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { generateRecommendationsPdf } from '../../utils/generatePdf';
import WorkspaceSection from '../../components/workspace/WorkspaceSection';
import WorkspacePageShell from '../../components/vendorsoluce-intelligence/WorkspacePageShell';
import StatusBanner from '../../components/vendorsoluce-intelligence/StatusBanner';
import { useSupplyChainAssessments } from '../../hooks/useSupplyChainAssessments';
import { logger } from '../../utils/logger';
import { SectionScore } from '../../stores/assessmentStore';
import { 
  Search, 
  Filter, 
  Download, 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  AlertCircle,
  FileText,
  Target,
  Calendar,
  Users,
  TrendingUp
} from 'lucide-react';

interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  effort: 'minimal' | 'moderate' | 'significant';
  timeframe: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
  impact: string;
  steps: string[];
  references: {
    title: string;
    url: string;
  }[];
  status?: 'not-started' | 'in-progress' | 'completed';
}

interface FilterState {
  priority: string;
  category: string;
  timeframe: string;
  effort: string;
  status: string;
}

const SupplyChainRecommendations = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { assessments, loading, error, storageWarning } = useSupplyChainAssessments();
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    priority: 'all',
    category: 'all',
    timeframe: 'all',
    effort: 'all',
    status: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [completedRecommendations, setCompletedRecommendations] = useState<Set<string>>(new Set());

  // Generate recommendations based on assessment results
  useEffect(() => {
    if (!loading && assessments.length > 0) {
      const completedAssessment = assessments.find(a => a.status === 'completed');
      
      if (completedAssessment && completedAssessment.section_scores) {
        const sectionScores = completedAssessment.section_scores as unknown as SectionScore[];
        const generatedRecommendations = generateRecommendations(sectionScores);
        setRecommendations(generatedRecommendations);
      } else {
        setRecommendations(enhancedMockRecommendations);
      }
    } else if (!loading) {
      setRecommendations(enhancedMockRecommendations);
    }
  }, [assessments, loading]);

  // Map section titles to recommendation categories and types
  const mapSectionToRecommendations = (section: SectionScore): RecommendationItem[] => {
    const recommendations: RecommendationItem[] = [];
    const titleLower = section.title.toLowerCase();
    const score = section.percentage;
    
    // Determine priority based on score
    let priority: 'critical' | 'high' | 'medium' | 'low' = 'low';
    if (score < 30) priority = 'critical';
    else if (score < 50) priority = 'high';
    else if (score < 70) priority = 'medium';
    else priority = 'low';
    
    // Determine timeframe based on priority
    let timeframe: 'immediate' | 'short-term' | 'medium-term' | 'long-term' = 'medium-term';
    if (priority === 'critical') timeframe = 'immediate';
    else if (priority === 'high') timeframe = 'short-term';
    else if (priority === 'medium') timeframe = 'medium-term';
    else timeframe = 'long-term';
    
    // Determine effort based on score gap
    const gap = 100 - score;
    let effort: 'minimal' | 'moderate' | 'significant' = 'moderate';
    if (gap > 60) effort = 'significant';
    else if (gap > 30) effort = 'moderate';
    else effort = 'minimal';
    
    // Map sections to specific recommendations
    if (titleLower.includes('supplier') || titleLower.includes('vendor') || titleLower.includes('third-party')) {
      recommendations.push({
        ...enhancedMockRecommendations[0],
        id: `rec-supplier-${section.title.replace(/\s+/g, '-').toLowerCase()}`,
        priority,
        timeframe,
        effort,
        description: `Based on your ${section.title} score of ${score}%, implement a comprehensive supplier risk management program to address identified gaps.`,
        impact: `Improving ${section.title} from ${score}% to 80%+ will significantly reduce supply chain risk and improve overall security posture.`
      });
      
      if (score < 50) {
        recommendations.push({
          ...enhancedMockRecommendations[3],
          id: `rec-contract-${section.title.replace(/\s+/g, '-').toLowerCase()}`,
          priority: score < 30 ? 'critical' : 'high',
          timeframe: score < 30 ? 'immediate' : 'short-term',
          effort,
          description: `Establish contractual security requirements for suppliers based on your ${section.title} assessment findings.`,
          impact: `Contractual requirements provide legal leverage and ensure suppliers meet minimum security standards.`
        });
      }
    }
    
    if (titleLower.includes('incident') || titleLower.includes('response') || titleLower.includes('breach')) {
      recommendations.push({
        ...enhancedMockRecommendations[1],
        id: `rec-incident-${section.title.replace(/\s+/g, '-').toLowerCase()}`,
        priority,
        timeframe,
        effort,
        description: `Develop supply chain incident response procedures based on your ${section.title} score of ${score}%.`,
        impact: `Improving incident response capabilities will reduce mean time to detect and respond to supply chain security incidents.`
      });
    }
    
    if (titleLower.includes('vulnerability') || titleLower.includes('patch') || titleLower.includes('software') || titleLower.includes('component')) {
      recommendations.push({
        ...enhancedMockRecommendations[2],
        id: `rec-vuln-${section.title.replace(/\s+/g, '-').toLowerCase()}`,
        priority,
        timeframe,
        effort,
        description: `Implement software component analysis to address vulnerabilities identified in your ${section.title} assessment (score: ${score}%).`,
        impact: `Automated vulnerability detection will help identify and remediate security issues in third-party software components.`
      });
    }
    
    if (titleLower.includes('access') || titleLower.includes('authentication') || titleLower.includes('authorization')) {
      recommendations.push({
        ...enhancedMockRecommendations[4],
        id: `rec-access-${section.title.replace(/\s+/g, '-').toLowerCase()}`,
        priority,
        timeframe,
        effort,
        description: `Enhance supplier remote access controls based on your ${section.title} assessment findings (score: ${score}%).`,
        impact: `Secured supplier access reduces the risk of unauthorized access through trusted third-party connections.`
      });
    }
    
    if (titleLower.includes('continuity') || titleLower.includes('disaster') || titleLower.includes('recovery') || titleLower.includes('resilience')) {
      recommendations.push({
        ...enhancedMockRecommendations[5],
        id: `rec-continuity-${section.title.replace(/\s+/g, '-').toLowerCase()}`,
        priority,
        timeframe,
        effort,
        description: `Develop supplier contingency plans to address gaps identified in your ${section.title} assessment (score: ${score}%).`,
        impact: `Supplier contingency planning improves organizational resilience and reduces the impact of supply chain disruptions.`
      });
    }
    
    if (titleLower.includes('governance') || titleLower.includes('policy') || titleLower.includes('management') || titleLower.includes('oversight')) {
      recommendations.push({
        ...enhancedMockRecommendations[3],
        id: `rec-governance-${section.title.replace(/\s+/g, '-').toLowerCase()}`,
        priority,
        timeframe,
        effort,
        description: `Strengthen supply chain governance and policy framework based on your ${section.title} assessment (score: ${score}%).`,
        impact: `Strong governance ensures consistent security practices across all supplier relationships.`
      });
    }
    
    if (titleLower.includes('intelligence') || titleLower.includes('threat') || titleLower.includes('monitoring') || titleLower.includes('sharing')) {
      recommendations.push({
        ...enhancedMockRecommendations[6],
        id: `rec-intel-${section.title.replace(/\s+/g, '-').toLowerCase()}`,
        priority,
        timeframe,
        effort,
        description: `Establish threat intelligence sharing with suppliers based on your ${section.title} assessment findings (score: ${score}%).`,
        impact: `Collaborative threat intelligence sharing improves detection and prevention capabilities across the supply chain.`
      });
    }
    
    if (titleLower.includes('software') || titleLower.includes('delivery') || titleLower.includes('integrity') || titleLower.includes('verification')) {
      recommendations.push({
        ...enhancedMockRecommendations[7],
        id: `rec-software-${section.title.replace(/\s+/g, '-').toLowerCase()}`,
        priority,
        timeframe,
        effort,
        description: `Implement secure software delivery verification to address gaps in your ${section.title} assessment (score: ${score}%).`,
        impact: `Software verification reduces the risk of compromised or tampered code entering the environment.`
      });
    }
    
    // If no specific match, create a generic recommendation
    if (recommendations.length === 0 && score < 70) {
      recommendations.push({
        id: `rec-generic-${section.title.replace(/\s+/g, '-').toLowerCase()}`,
        title: `Improve ${section.title} Capabilities`,
        description: `Your ${section.title} assessment scored ${score}%, indicating areas for improvement. Develop a comprehensive improvement plan to address identified gaps and strengthen this area of your supply chain security program.`,
        priority,
        category: 'General',
        effort,
        timeframe,
        impact: `Improving ${section.title} from ${score}% to 80%+ will enhance your overall supply chain security posture and reduce risk exposure.`,
        steps: [
          `Review the ${section.title} assessment results to identify specific gaps`,
          `Prioritize improvements based on risk and business impact`,
          `Develop an implementation plan with clear milestones`,
          `Allocate resources and assign ownership for improvements`,
          `Implement improvements systematically`,
          `Monitor progress and measure effectiveness`,
          `Conduct follow-up assessments to validate improvements`
        ],
        references: [
          {
            title: 'NIST SP 800-161r1 - Supply Chain Risk Management Practices',
            url: 'https://csrc.nist.gov/publications/detail/sp/800-161/rev-1/final'
          }
        ],
        status: 'not-started'
      });
    }
    
    return recommendations;
  };

  // Generate recommendations based on section scores
  const generateRecommendations = (sectionScores: SectionScore[]): RecommendationItem[] => {
    const generatedRecommendations: RecommendationItem[] = [];
    const seenIds = new Set<string>();
    
    // Generate recommendations for all sections with scores below 80%
    sectionScores
      .filter(section => section.percentage < 80)
      .sort((a, b) => a.percentage - b.percentage) // Sort by score (lowest first = highest priority)
      .forEach(section => {
        const sectionRecommendations = mapSectionToRecommendations(section);
        
        sectionRecommendations.forEach(rec => {
          // Avoid duplicates
          if (!seenIds.has(rec.id)) {
            seenIds.add(rec.id);
            generatedRecommendations.push(rec);
          }
        });
      });
    
    // If no recommendations were generated (all scores >= 80%), return a success message
    if (generatedRecommendations.length === 0) {
      return [{
        id: 'rec-excellent',
        title: 'Excellent Supply Chain Security Posture',
        description: 'Congratulations! Your assessment shows strong supply chain security practices across all areas. Continue maintaining these high standards and consider periodic reassessments to stay current with evolving threats.',
        priority: 'low',
        category: 'General',
        effort: 'minimal',
        timeframe: 'long-term',
        impact: 'Maintaining strong security practices helps ensure continued protection against supply chain risks.',
        steps: [
          'Continue monitoring supply chain security practices',
          'Stay updated with latest threat intelligence',
          'Conduct periodic reassessments',
          'Share best practices with suppliers'
        ],
        references: [
          {
            title: 'NIST SP 800-161r1 - Supply Chain Risk Management Practices',
            url: 'https://csrc.nist.gov/publications/detail/sp/800-161/rev-1/final'
          }
        ],
        status: 'not-started'
      }];
    }
    
    // Sort by priority and score
    return generatedRecommendations.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return 0;
    });
  };

  // Filter and search recommendations
  const filteredRecommendations = useMemo(() => {
    return recommendations.filter(rec => {
      const matchesSearch = rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           rec.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           rec.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPriority = filters.priority === 'all' || rec.priority === filters.priority;
      const matchesCategory = filters.category === 'all' || rec.category === filters.category;
      const matchesTimeframe = filters.timeframe === 'all' || rec.timeframe === filters.timeframe;
      const matchesEffort = filters.effort === 'all' || rec.effort === filters.effort;
      const matchesStatus = filters.status === 'all' || (rec.status || 'not-started') === filters.status;
      
      return matchesSearch && matchesPriority && matchesCategory && matchesTimeframe && matchesEffort && matchesStatus;
    });
  }, [recommendations, searchTerm, filters]);

  // Get unique filter options
  const filterOptions = useMemo(() => {
    return {
      priorities: [...new Set(recommendations.map(r => r.priority))],
      categories: [...new Set(recommendations.map(r => r.category))],
      timeframes: [...new Set(recommendations.map(r => r.timeframe))],
      efforts: [...new Set(recommendations.map(r => r.effort))]
    };
  }, [recommendations]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = recommendations.length;
    const critical = recommendations.filter(r => r.priority === 'critical').length;
    const completed = recommendations.filter(r => completedRecommendations.has(r.id)).length;
    const inProgress = recommendations.filter(r => (r.status || 'not-started') === 'in-progress').length;
    
    return { total, critical, completed, inProgress };
  }, [recommendations, completedRecommendations]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await generateRecommendationsPdf(
        t('supplyChainRecommendations.title'),
        filteredRecommendations,
        new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        'supply-chain-recommendations.pdf'
      );
    } catch (err) {
      logger.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleRecommendationStatus = (id: string) => {
    setCompletedRecommendations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertCircle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <Target className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  if (loading) {
    return (
      <WorkspacePageShell title={t('supplyChainRecommendations.title')} description={t('supplyChainRecommendations.subtitle')}>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-8" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </WorkspacePageShell>
    );
  }

  if (error) {
    return (
      <WorkspacePageShell title={t('supplyChainRecommendations.title')} description={t('supplyChainRecommendations.subtitle')}>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('supplyChainRecommendations.errors.loadingError')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 bg-vendortal-navy text-white rounded-md hover:bg-vendortal-navy/90 transition-colors"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            {t('supplyChainRecommendations.actions.retry')}
          </button>
        </div>
      </WorkspacePageShell>
    );
  }

  return (
    <WorkspacePageShell
      title={t('supplyChainRecommendations.title')}
      description={t('supplyChainRecommendations.subtitle')}
      descriptionExtra={
        <button
          onClick={() => navigate('/supply-chain-results')}
          className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded focus:outline-none focus:ring-2 focus:ring-vendortal-navy focus:ring-offset-2"
          aria-label={t('supplyChainRecommendations.navigation.backToResults')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t('supplyChainRecommendations.navigation.backToResults')}
        </button>
      }
      stats={[
        { label: t('supplyChainRecommendations.stats.totalRecommendations'), value: stats.total },
        { label: t('supplyChainRecommendations.stats.criticalPriority'), value: stats.critical },
        { label: t('supplyChainRecommendations.stats.inProgress'), value: stats.inProgress },
        { label: t('supplyChainRecommendations.stats.completed'), value: stats.completed },
      ]}
      headerActionsSlot={
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Filter className="h-4 w-4 mr-1.5" />
            {t('supplyChainRecommendations.actions.filters')}
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || filteredRecommendations.length === 0}
            className="inline-flex items-center px-3 py-1.5 text-sm bg-vendortal-navy text-white rounded-md hover:bg-vendortal-navy/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className={`h-4 w-4 mr-1.5 ${isExporting ? 'animate-spin' : ''}`} />
            {isExporting ? t('supplyChainRecommendations.actions.exporting') : t('supplyChainRecommendations.actions.exportPdf')}
          </button>
        </div>
      }
    >
      {storageWarning ? (
        <StatusBanner tone="warning" className="mb-6" title="Local workspace storage warning">
          {storageWarning}
        </StatusBanner>
      ) : null}

          {/* Search and Filters - Optimized */}
          <div className="space-y-3 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('supplyChainRecommendations.search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-vendortal-navy focus:border-transparent transition-colors"
              />
            </div>

            {showFilters && (
              <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                  <div>
                    <label htmlFor="filter-priority" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('supplyChainRecommendations.filters.priority')}</label>
                    <select
                      id="filter-priority"
                      value={filters.priority}
                      onChange={(e) => setFilters({...filters, priority: e.target.value})}
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-vendortal-navy focus:border-transparent"
                    >
                      <option value="all">{t('supplyChainRecommendations.filters.allPriorities')}</option>
                      {filterOptions.priorities.map(priority => (
                        <option key={priority} value={priority} className="capitalize">{t(`supplyChainRecommendations.priorities.${priority}`)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="filter-category" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('supplyChainRecommendations.filters.category')}</label>
                    <select
                      id="filter-category"
                      value={filters.category}
                      onChange={(e) => setFilters({...filters, category: e.target.value})}
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-vendortal-navy focus:border-transparent"
                    >
                      <option value="all">{t('supplyChainRecommendations.filters.allCategories')}</option>
                      {filterOptions.categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="filter-timeframe" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('supplyChainRecommendations.filters.timeframe')}</label>
                    <select
                      id="filter-timeframe"
                      value={filters.timeframe}
                      onChange={(e) => setFilters({...filters, timeframe: e.target.value})}
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-vendortal-navy focus:border-transparent"
                    >
                      <option value="all">{t('supplyChainRecommendations.filters.allTimeframes')}</option>
                      {filterOptions.timeframes.map(timeframe => (
                        <option key={timeframe} value={timeframe} className="capitalize">{t(`supplyChainRecommendations.timeframes.${timeframe.replace('-', '')}`)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="filter-effort" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('supplyChainRecommendations.filters.effort')}</label>
                    <select
                      id="filter-effort"
                      value={filters.effort}
                      onChange={(e) => setFilters({...filters, effort: e.target.value})}
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-vendortal-navy focus:border-transparent"
                    >
                      <option value="all">{t('supplyChainRecommendations.filters.allEffortLevels')}</option>
                      {filterOptions.efforts.map(effort => (
                        <option key={effort} value={effort} className="capitalize">{t(`supplyChainRecommendations.efforts.${effort}`)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="filter-status" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('supplyChainRecommendations.filters.status')}</label>
                    <select
                      id="filter-status"
                      value={filters.status}
                      onChange={(e) => setFilters({...filters, status: e.target.value})}
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-vendortal-navy focus:border-transparent"
                    >
                      <option value="all">{t('supplyChainRecommendations.filters.allStatuses')}</option>
                      <option value="not-started">{t('supplyChainRecommendations.statuses.notStarted')}</option>
                      <option value="in-progress">{t('supplyChainRecommendations.statuses.inProgress')}</option>
                      <option value="completed">{t('supplyChainRecommendations.statuses.completed')}</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => setFilters({
                      priority: 'all',
                      category: 'all',
                      timeframe: 'all',
                      effort: 'all',
                      status: 'all'
                    })}
                    className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {t('supplyChainRecommendations.filters.clearAll')}
                  </button>
                </div>
              </div>
            )}
          </div>

        <WorkspaceSection title="Recommendations backlog" description="This is the action layer connected to your assessment results.">
        {/* Recommendations List - Optimized spacing */}
        <div className="space-y-4">
          {filteredRecommendations.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-1.5">{t('supplyChainRecommendations.emptyState.noRecommendations')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('supplyChainRecommendations.emptyState.tryDifferentFilters')}</p>
            </div>
          ) : (
            filteredRecommendations.map((recommendation) => (
              <div
                key={recommendation.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start gap-2 mb-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(recommendation.priority)}`}>
                          {getPriorityIcon(recommendation.priority)}
                          <span className="ml-1 capitalize">{t(`supplyChainRecommendations.priorities.${recommendation.priority}`)}</span>
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                          {recommendation.category}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 leading-tight">
                        {recommendation.title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                        {recommendation.description}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleRecommendationStatus(recommendation.id)}
                      className={`flex-shrink-0 inline-flex items-center px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-vendortal-navy focus:ring-offset-2 ${
                        completedRecommendations.has(recommendation.id)
                          ? 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                      {completedRecommendations.has(recommendation.id) 
                        ? t('supplyChainRecommendations.actions.completed') 
                        : t('supplyChainRecommendations.actions.markComplete')
                      }
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 text-xs sm:text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 flex-shrink-0" />
                      <span className="font-medium">{t('supplyChainRecommendations.labels.timeframe')}:</span>
                      <span className="ml-1 capitalize truncate">{t(`supplyChainRecommendations.timeframes.${recommendation.timeframe.replace('-', '')}`)}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 flex-shrink-0" />
                      <span className="font-medium">{t('supplyChainRecommendations.labels.effort')}:</span>
                      <span className="ml-1 capitalize truncate">{t(`supplyChainRecommendations.efforts.${recommendation.effort}`)}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 flex-shrink-0" />
                      <span className="font-medium">{t('supplyChainRecommendations.labels.impact')}:</span>
                      <span className="ml-1 truncate">{t('supplyChainRecommendations.impactLevels.high')}</span>
                    </div>
                  </div>

                  <details className="group">
                    <summary className="cursor-pointer text-sm text-vendortal-navy hover:text-vendortal-navy/80 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-vendortal-navy focus:ring-offset-2 rounded py-1">
                      {t('supplyChainRecommendations.actions.viewSteps')}
                    </summary>
                    <div className="mt-3 pl-3 sm:pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                      <div className="mb-3">
                        <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-1.5">{t('supplyChainRecommendations.labels.expectedImpact')}:</h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{recommendation.impact}</p>
                      </div>
                      <div className="mb-3">
                        <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-1.5">{t('supplyChainRecommendations.labels.implementationSteps')}:</h4>
                        <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          {recommendation.steps.map((step, index) => (
                            <li key={index} className="leading-relaxed">{step}</li>
                          ))}
                        </ol>
                      </div>
                      {recommendation.references.length > 0 && (
                        <div>
                          <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-1.5">{t('supplyChainRecommendations.labels.references')}:</h4>
                          <ul className="space-y-1 text-xs sm:text-sm">
                            {recommendation.references.map((ref, index) => (
                              <li key={index}>
                                <a
                                  href={ref.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-vendortal-navy hover:text-vendortal-navy/80 hover:underline transition-colors break-words"
                                >
                                  {ref.title}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Show results count - More compact */}
        {filteredRecommendations.length > 0 && (
          <div className="mt-6 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {t('supplyChainRecommendations.resultsCount', { 
              filtered: filteredRecommendations.length, 
              total: recommendations.length 
            })}
          </div>
        )}
        </WorkspaceSection>
    </WorkspacePageShell>
  );
};

// Enhanced mock recommendations with status
const enhancedMockRecommendations: RecommendationItem[] = [
  {
    id: "sc1",
    title: "Implement Supplier Risk Tiering System",
    description: "Develop a formal risk-based tiering system for suppliers to prioritize assessment and monitoring activities based on criticality and access to sensitive data or systems.",
    priority: "critical",
    category: "Supplier Risk Management",
    effort: "moderate",
    timeframe: "short-term",
    impact: "A structured supplier tiering system enables efficient allocation of resources to the most critical supplier relationships and helps focus security requirements proportional to risk.",
    steps: [
      "Define criteria for supplier categorization (e.g., access to sensitive data, operational importance, ease of replacement)",
      "Develop a scoring methodology to determine supplier tier assignment",
      "Classify all existing suppliers according to the new system",
      "Document differentiated security requirements for each tier",
      "Implement tier-specific assessment and monitoring processes"
    ],
    references: [
      {
        title: "NIST SP 800-161r1 - Supply Chain Risk Management Practices",
        url: "https://csrc.nist.gov/publications/detail/sp/800-161/rev-1/final"
      },
      {
        title: "ISO 28001:2007 Security management systems for the supply chain",
        url: "https://www.iso.org/standard/45654.html"
      }
    ],
    status: "not-started"
  },
  {
    id: "sc2",
    title: "Establish Supply Chain Incident Response Procedures",
    description: "Develop specific incident response procedures for supply chain security incidents, including third-party breaches, compromised software components, and hardware tampering.",
    priority: "high",
    category: "Incident Response",
    effort: "significant",
    timeframe: "short-term",
    impact: "Dedicated supply chain incident procedures reduce response time and improve coordination during incidents that involve suppliers or third parties.",
    steps: [
      "Identify supply chain incident scenarios specific to your organization",
      "Define roles and responsibilities for supply chain incident response",
      "Establish communication protocols with key suppliers",
      "Create playbooks for common supply chain incident types",
      "Conduct tabletop exercises to test procedures",
      "Document recovery and continuity procedures for critical supplier disruptions"
    ],
    references: [
      {
        title: "NIST SP 800-161r1 - Appendix C: Supply Chain Threat Scenarios",
        url: "https://csrc.nist.gov/publications/detail/sp/800-161/rev-1/final"
      },
      {
        title: "CISA Cyber Supply Chain Risk Management",
        url: "https://www.cisa.gov/cyber-supply-chain-risk-management"
      }
    ],
    status: "in-progress"
  },
  {
    id: "sc3",
    title: "Implement Software Component Analysis",
    description: "Deploy automated tools to inventory and analyze software dependencies, libraries, and components used in applications to identify potential security vulnerabilities in the software supply chain.",
    priority: "high",
    category: "Vulnerability Management",
    effort: "moderate",
    timeframe: "short-term",
    impact: "Software component analysis enables early identification of vulnerable dependencies and reduces the risk of supply chain compromises through third-party code.",
    steps: [
      "Select and implement a software composition analysis (SCA) tool",
      "Integrate SCA into development and build pipelines",
      "Generate a software bill of materials (SBOM) for all applications",
      "Establish a process to review and remediate identified vulnerabilities",
      "Document acceptable risk thresholds for different component types",
      "Implement continuous monitoring for newly discovered vulnerabilities"
    ],
    references: [
      {
        title: "NIST SP 800-218 - Secure Software Development Framework",
        url: "https://csrc.nist.gov/publications/detail/sp/800-218/final"
      },
      {
        title: "NTIA Software Bill of Materials",
        url: "https://www.ntia.gov/sbom"
      }
    ],
    status: "not-started"
  },
  {
    id: "sc4",
    title: "Implement Vendor Security Requirements in Contracts",
    description: "Develop standardized security language for supplier contracts that clearly defines security requirements, assessment rights, incident notification, and compliance expectations.",
    priority: "high",
    category: "Governance",
    effort: "moderate",
    timeframe: "medium-term",
    impact: "Contractual security requirements establish clear expectations and provide leverage to enforce security practices across the supply chain.",
    steps: [
      "Work with legal and procurement teams to develop standard security clauses",
      "Define tiered security requirements based on supplier criticality",
      "Include requirements for incident notification, right-to-audit, and vulnerability disclosure",
      "Establish consequences for non-compliance with security requirements",
      "Implement a review process for security terms in all new contracts",
      "Develop a roadmap for updating existing contracts"
    ],
    references: [
      {
        title: "NIST IR 8276 - Key Practices in Cyber Supply Chain Risk Management",
        url: "https://csrc.nist.gov/publications/detail/nistir/8276/final"
      },
      {
        title: "Cloud Security Alliance - Consensus Assessments Initiative Questionnaire",
        url: "https://cloudsecurityalliance.org/research/guidance/"
      }
    ],
    status: "not-started"
  },
  {
    id: "sc5",
    title: "Create Secure Supplier Remote Access Controls",
    description: "Implement enhanced security controls for supplier remote access to internal systems, including dedicated access pathways, MFA, and granular monitoring.",
    priority: "critical",
    category: "Access Control",
    effort: "significant",
    timeframe: "immediate",
    impact: "Secured supplier access reduces the risk of unauthorized access through trusted third-party connections, a common attack vector in supply chain compromises.",
    steps: [
      "Inventory all supplier remote access connections",
      "Implement dedicated access methods (e.g., VPNs, secure gateways) for supplier connections",
      "Require MFA for all supplier remote access",
      "Implement just-in-time and just-enough access principles",
      "Deploy enhanced monitoring and logging for supplier activities",
      "Establish regular access review processes for supplier accounts"
    ],
    references: [
      {
        title: "NIST SP 800-207 - Zero Trust Architecture",
        url: "https://csrc.nist.gov/publications/detail/sp/800-207/final"
      },
      {
        title: "NSA/CISA Guidance for Securing Remote Access",
        url: "https://www.cisa.gov/publication/securing-remote-access-software"
      }
    ],
    status: "not-started"
  },
  {
    id: "sc6",
    title: "Develop Supplier Contingency Plans",
    description: "Create contingency plans for critical supplier disruptions, including identification of alternate suppliers, service continuity procedures, and emergency response actions.",
    priority: "medium",
    category: "Business Continuity",
    effort: "moderate",
    timeframe: "medium-term",
    impact: "Supplier contingency planning improves organizational resilience and reduces the impact of supply chain disruptions.",
    steps: [
      "Identify single points of failure in the supply chain",
      "Qualify alternate suppliers for critical components",
      "Develop continuity procedures for supplier disruptions",
      "Create emergency acquisition procedures",
      "Establish inventory management strategies for critical components",
      "Test contingency plans through tabletop exercises"
    ],
    references: [
      {
        title: "NIST SP 800-34r1 - Contingency Planning Guide",
        url: "https://csrc.nist.gov/publications/detail/sp/800-34/rev-1/final"
      },
      {
        title: "ISO 22301 - Business Continuity Management",
        url: "https://www.iso.org/standard/75106.html"
      }
    ],
    status: "not-started"
  },
  {
    id: "sc7",
    title: "Establish Threat Intelligence Sharing with Suppliers",
    description: "Create a framework for sharing relevant threat intelligence with key suppliers and receiving intelligence about supply chain threats from partners.",
    priority: "medium",
    category: "Information Sharing",
    effort: "moderate",
    timeframe: "medium-term",
    impact: "Collaborative threat intelligence sharing improves detection and prevention capabilities across the supply chain ecosystem.",
    steps: [
      "Identify the types of threat intelligence relevant to share with suppliers",
      "Establish secure channels for intelligence exchange",
      "Develop information sharing agreements with key suppliers",
      "Implement automated threat intelligence sharing where possible",
      "Join relevant information sharing communities like ISACs",
      "Create processes to act on received intelligence"
    ],
    references: [
      {
        title: "NIST SP 800-150 - Guide to Cyber Threat Information Sharing",
        url: "https://csrc.nist.gov/publications/detail/sp/800-150/final"
      },
      {
        title: "CISA Information Sharing and Awareness",
        url: "https://www.cisa.gov/information-sharing-and-awareness"
      }
    ],
    status: "not-started"
  },
  {
    id: "sc8",
    title: "Implement Secure Software Delivery Verification",
    description: "Establish processes to verify the integrity and authenticity of software delivered through the supply chain using code signing, checksum verification, and secure delivery methods.",
    priority: "low",
    category: "Software Security",
    effort: "moderate",
    timeframe: "medium-term",
    impact: "Software verification reduces the risk of compromised or tampered code entering the environment through trusted supply chain channels.",
    steps: [
      "Require suppliers to implement code signing for all software deliverables",
      "Establish secure hash verification procedures",
      "Document secure software delivery and verification processes",
      "Train relevant staff on verification procedures",
      "Implement automated verification where possible",
      "Establish incident procedures for failed verifications"
    ],
    references: [
      {
        title: "NIST SP 800-218 - Secure Software Development Framework",
        url: "https://csrc.nist.gov/publications/detail/sp/800-218/final"
      },
      {
        title: "SLSA Framework for Supply Chain Integrity",
        url: "https://slsa.dev/"
      }
    ],
    status: "not-started"
  }
];

export default SupplyChainRecommendations;
