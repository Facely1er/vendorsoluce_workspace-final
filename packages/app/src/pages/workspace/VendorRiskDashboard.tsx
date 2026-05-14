import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import VendorRiskTable from '../../components/vendor/VendorRiskTable';
import { VendorRisk } from '../../types';
import Button from '../../components/ui/Button';
import { useTranslation } from 'react-i18next';
import { useVendors } from '../../hooks/useVendors';
import { Plus, RefreshCw, BarChart3, Zap, Shield, Brain, AlertTriangle, Check, Users } from 'lucide-react';
import AddVendorModal from '../../components/vendor/AddVendorModal';
import ScoreVendorModal from '../../components/vendor/ScoreVendorModal';
// import { generateRecommendationsPdf } from '../../utils/generatePdf';
import ThreatIntelligenceFeed from '../../components/vendor/ThreatIntelligenceFeed';
import WorkflowAutomation from '../../components/vendor/WorkflowAutomation';
import CustomizableDashboard from '../../components/dashboard/CustomizableDashboard';
import PredictiveAnalytics from '../../components/analytics/PredictiveAnalytics';
import DataImportExport from '../../components/data/DataImportExport';
import GetStartedWidget from '../../components/onboarding/GetStartedWidget';
import { useSBOMAnalyses } from '../../hooks/useSBOMAnalyses';
import { useSupplyChainAssessments } from '../../hooks/useSupplyChainAssessments';
import { useThreatIntelligence } from '../../hooks/useThreatIntelligence';
import { logger } from '../../utils/logger';
import { getRiskLevel, getComplianceStatus } from '../../utils/riskCalculations';
import RadarWidget from '../../components/dashboard/RadarWidget';
import PortalStatusWidget from '../../components/dashboard/PortalStatusWidget';
import UnifiedQuickActions from '../../components/dashboard/UnifiedQuickActions';
import WorkspacePageShell, { WORKSPACE_PAGE_BODY_STACK_LOOSE_CLASS } from '../../components/vendorsoluce-intelligence/WorkspacePageShell';
import WorkspaceEmptyState from '../../components/common/WorkspaceEmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import StatusBanner from '../../components/vendorsoluce-intelligence/StatusBanner';
import { MR, WR } from 'shared/constants/routes';
const VendorRiskDashboard: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { vendors, loading, error, storageWarning: vendorStorageWarning, refetch } = useVendors();
  const { analyses } = useSBOMAnalyses();
  const { assessments, storageWarning: assessmentStorageWarning } = useSupplyChainAssessments();
  const { stats: threatStats, loading: threatLoading, refresh: refreshThreats } = useThreatIntelligence();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // const workflowStats = {
  //   activeTasks: 0,
  //   completedTasks: 0,
  //   overdueTasks: 0,
  //   automationRules: 3
  // };

  // Auto-open Add Vendor modal if navigated from Get Started widget
  React.useEffect(() => {
    if (location.state?.openAddVendorModal) {
      setShowAddModal(true);
      // Clear the state to prevent modal from reopening on subsequent visits
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location]);

  // Transform vendors data to match VendorRisk interface
  const vendorRiskData: VendorRisk[] = vendors.map((vendor) => {
    const score = vendor.risk_score || 0;
    return {
      id: vendor.id,
      name: vendor.name,
      industry: vendor.industry || 'Unknown',
      riskScore: score,
      lastAssessment: vendor.last_assessment_date || 'Never',
      complianceStatus: getComplianceStatus(score),
      riskLevel: getRiskLevel(score),
    };
  });

  const riskCounts = {
    high: vendorRiskData.filter(v => v.riskLevel === 'Critical' || v.riskLevel === 'High').length,
    medium: vendorRiskData.filter(v => v.riskLevel === 'Medium').length,
    low: vendorRiskData.filter(v => v.riskLevel === 'Low').length,
  };

  const complianceCounts = {
    compliant: vendorRiskData.filter(v => v.complianceStatus === 'Compliant').length,
    partial: vendorRiskData.filter(v => v.complianceStatus === 'Partial').length,
    nonCompliant: vendorRiskData.filter(v => v.complianceStatus === 'Non-Compliant').length,
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetch(), refreshThreats()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const activeView = useMemo(() => {
    const path = location.pathname;
    if (path.endsWith('/workflows')) return 'workflows';
    if (path.endsWith('/intelligence')) return 'intelligence';
    if (path.endsWith('/analytics')) return 'analytics';
    return 'dashboard';
  }, [location.pathname]);

  const handleViewChange = (view: 'dashboard' | 'workflows' | 'intelligence' | 'analytics') => {
    if (view === 'workflows') navigate(WR.VENDORS_WORKFLOWS);
    else if (view === 'intelligence') navigate(WR.VENDORS_INTELLIGENCE);
    else if (view === 'analytics') navigate(WR.VENDORS_ANALYTICS);
    else navigate(WR.VENDORS);
  };
  const storageWarning = vendorStorageWarning ?? assessmentStorageWarning;

  // const handleExportDashboard = async () => {
  //   const recommendations = [
  //     {
  //       id: 'vendor-1',
  //       title: 'Implement Enhanced Vendor Monitoring',
  //       description: 'Establish continuous monitoring for high-risk vendors with automated alerts.',
  //       priority: 'high' as const,
  //       category: 'Vendor Management',
  //       effort: 'moderate' as const,
  //       timeframe: 'short-term' as const,
  //       impact: 'Reduces response time to vendor incidents and improves overall risk visibility.',
  //       steps: [
  //         'Set up automated vendor monitoring dashboard',
  //         'Configure risk threshold alerts',
  //         'Establish escalation procedures',
  //         'Train team on new monitoring tools'
  //       ],
  //       references: [
  //         { title: 'NIST SP 800-161 Vendor Monitoring', url: 'https://csrc.nist.gov/publications/detail/sp/800-161/rev-1/final' }
  //       ]
  //     }
  //   ];
  //   
  //   await generateRecommendationsPdf(
  //     'Vendor Risk Management Recommendations',
  //     recommendations,
  //     new Date().toLocaleDateString(),
  //     'vendor-risk-dashboard-recommendations.pdf'
  //   );
  // };

  // const handleExportDashboard = async () => {
  //   const recommendations = [
  //     {
  //       id: 'vendor-1',
  //       title: 'Implement Enhanced Vendor Monitoring',
  //       description: 'Establish continuous monitoring for high-risk vendors with automated alerts.',
  //       priority: 'high' as const,
  //       category: 'Vendor Management',
  //       effort: 'moderate' as const,
  //       timeframe: 'short-term' as const,
  //       impact: 'Reduces response time to vendor incidents and improves overall risk visibility.',
  //       steps: [
  //         'Set up automated vendor monitoring dashboard',
  //         'Configure risk threshold alerts',
  //         'Establish escalation procedures',
  //         'Train team on new monitoring tools'
  //       ],
  //       references: [
  //         { title: 'NIST SP 800-161 Vendor Monitoring', url: 'https://csrc.nist.gov/publications/detail/sp/800-161/rev-1/final' }
  //       ]
  //     }
  //   ];
  //   
  //   await generateRecommendationsPdf(
  //     'Vendor Risk Management Recommendations',
  //     recommendations,
  //     new Date().toLocaleDateString(),
  //     'vendor-risk-dashboard-recommendations.pdf'
  //   );
  // };

  const handleExportDashboard = async () => {
    try {
      const { generateRecommendationsPdf } = await import('../../utils/generatePdf');
      
      const recommendations = [
        {
          id: 'vendor-1',
          title: 'Vendor Risk Management Summary',
          description: `Comprehensive risk assessment for ${vendorRiskData.length} vendors. Risk distribution: ${riskCounts.high} high-risk, ${riskCounts.medium} medium-risk, ${riskCounts.low} low-risk vendors.`,
          priority: 'high' as const,
          category: 'Vendor Management',
          effort: 'moderate' as const,
          timeframe: 'short-term' as const,
          impact: 'Improves overall vendor risk visibility and enables proactive risk management.',
          steps: [
            'Review high-risk vendor assessments',
            'Implement enhanced monitoring for critical vendors',
            'Schedule follow-up assessments',
            'Update vendor risk profiles'
          ],
          references: [
            { title: 'NIST SP 800-161 Vendor Risk Management', url: 'https://csrc.nist.gov/publications/detail/sp/800-161/rev-1/final' }
          ]
        }
      ];
      
      await generateRecommendationsPdf(
        'Vendor Risk Dashboard Report',
        recommendations,
        new Date().toLocaleDateString(),
        `vendor-risk-dashboard-report-${new Date().toISOString().split('T')[0]}.pdf`
      );
    } catch (error) {
      logger.error('Error exporting dashboard:', error);
      alert('Error generating report. Please try again.');
    }
  };

  const handleCreateWorkflow = () => {
    logger.log('Create workflow functionality');
  };

  const handleManageAutomation = () => {
    logger.log('Manage automation functionality');
  };

  const workflowStats = {
    activeTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    automationRules: 3
  };

  const recentActivity = React.useMemo(() => {
    const items: { label: string; time: string }[] = [];
    assessments.slice(0, 5).forEach((a) => {
      const date = a.completed_at || a.created_at;
      const rel = date ? (() => {
        const d = new Date(date);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return d.toLocaleDateString();
      })() : '—';
      items.push({ label: `Assessment: ${a.assessment_name || 'Supply chain'}`, time: rel });
    });
    if (items.length === 0) items.push({ label: 'No recent activity yet', time: '' });
    return items;
  }, [assessments]);

  if (loading) {
    return (
      <WorkspacePageShell title={t('vendorRisk.title')} description={t('vendorRisk.description')}>
        <LoadingSkeleton variant="dashboard" />
      </WorkspacePageShell>
    );
  }

  if (error) {
    return (<WorkspacePageShell title={t('vendorRisk.title')} description={t('vendorRisk.description')}><div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Error loading vendors: {error}</p>
          <Button 
            onClick={handleRefresh} 
            variant="outline"
            disabled={isRefreshing}
            aria-label="Retry loading vendors"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Retrying...' : 'Retry'}
          </Button>
        </div></WorkspacePageShell>);
  }
  
  return (
    <WorkspacePageShell title={t('vendorRisk.title')} description={t('vendorRisk.description')} actions={[{ label: isRefreshing ? 'Refreshing…' : 'Refresh', onClick: handleRefresh, variant: 'outline' }, { label: 'Add vendor', onClick: () => setShowAddModal(true), variant: 'primary' }]} stats={[{ label: 'Total vendors', value: vendorRiskData.length, hint: 'Tracked in the active portfolio' }, { label: 'High risk', value: riskCounts.high, hint: 'Critical or high vendors' }, { label: 'Assessments', value: assessments.length, hint: 'Completed or in progress' }, { label: 'Threat signals', value: threatLoading ? '…' : (threatStats.threatsToday ?? '—'), hint: 'Current threat feed pressure' }]}>
      {storageWarning ? (
        <StatusBanner tone="warning" className="mb-6" title="Local workspace storage warning">
          {storageWarning}
        </StatusBanner>
      ) : null}
      {/* Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700" role="tablist" aria-label="Dashboard sections">
          <div className="flex flex-wrap -mb-px">
            {[
              { id: 'dashboard', label: 'Overview Dashboard', icon: BarChart3 },
              { id: 'workflows', label: 'Workflow Automation', icon: Zap },
              { id: 'intelligence', label: 'Threat Intelligence', icon: Shield },
              { id: 'analytics', label: 'Predictive Analytics', icon: Brain }
            ].map(({ id, label, icon: Icon }) => {
              const isSelected = activeView === id;
              const panelId: string = `${id}-panel`;
              const tabId = `${id}-tab`;
              return (
              <button
                key={id}
                onClick={() => handleViewChange(id as 'dashboard' | 'workflows' | 'intelligence' | 'analytics')}
                className={`flex items-center px-4 py-3 mr-2 text-sm font-medium border-b-2 rounded-t-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-vendorsoluce-navy focus:ring-offset-2 ${
                  isSelected
                    ? 'border-vendorsoluce-green text-vendorsoluce-green'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                role="tab"
                id={tabId}
                aria-selected={isSelected}
                aria-controls={panelId}
              >
                <Icon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.split(' ')[0]}</span>
              </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Sections with consistent spacing */}
      <div className={WORKSPACE_PAGE_BODY_STACK_LOOSE_CLASS}>
        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <div id="dashboard-panel" role="tabpanel" aria-labelledby="dashboard-tab" className={WORKSPACE_PAGE_BODY_STACK_LOOSE_CLASS}>
            <GetStartedWidget 
              vendorCount={vendors.length}
              assessmentCount={assessments.length}
            />

            {/* Enhanced Dashboard Widget */}
            {(vendors.length > 3 || assessments.length > 2 || analyses.length > 2) && (
              <div className="rounded-xl border border-gray-200/70 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Advanced Dashboard</h2>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleExportDashboard}>
                      <Plus className="h-4 w-4 mr-2" />
                      Export Dashboard
                    </Button>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      View Full Dashboard
                    </Button>
                  </div>
                </div>
                <CustomizableDashboard />
              </div>
            )}

            {/* KPI-style Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 dark:border-gray-700 dark:bg-gray-800">
                <div className="px-6 py-5">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-snug min-w-0 pr-2">
                        {t('vendorRisk.totalVendors')}
                      </p>
                      <div className="p-2.5 rounded-xl bg-vendorsoluce-teal/10 shrink-0 flex items-center justify-center" aria-hidden>
                        <Users className="h-6 w-6 text-vendorsoluce-teal" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold tabular-nums text-gray-900 dark:text-white leading-none">
                      {vendorRiskData.length}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">
                      {t('vendorRisk.monitoredVendors')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 dark:border-gray-700 dark:bg-gray-800">
                <div className="px-6 py-5">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-snug min-w-0 pr-2">
                        {t('vendorRisk.riskOverview')}
                      </p>
                      <div className="p-2.5 rounded-xl bg-vendorsoluce-navy/10 shrink-0 flex items-center justify-center" aria-hidden>
                        <Shield className="h-6 w-6 text-vendorsoluce-navy" />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="text-lg font-bold tabular-nums text-red-600 dark:text-red-400">
                        {riskCounts.high} high
                      </span>
                      <span className="text-lg font-bold tabular-nums text-yellow-600 dark:text-yellow-400">
                        {riskCounts.medium} med
                      </span>
                      <span className="text-lg font-bold tabular-nums text-green-600 dark:text-green-400">
                        {riskCounts.low} low
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 dark:border-gray-700 dark:bg-gray-800">
                <div className="px-6 py-5">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-snug min-w-0 pr-2">
                        {t('vendorRisk.complianceStatus')}
                      </p>
                      <div className="p-2.5 rounded-xl bg-vendorsoluce-green/10 shrink-0 flex items-center justify-center" aria-hidden>
                        <Zap className="h-6 w-6 text-vendorsoluce-green" />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="text-sm font-bold tabular-nums text-green-600 dark:text-green-400">
                        {complianceCounts.compliant} OK
                      </span>
                      <span className="text-sm font-bold tabular-nums text-yellow-600 dark:text-yellow-400">
                        {complianceCounts.partial} partial
                      </span>
                      <span className="text-sm font-bold tabular-nums text-red-600 dark:text-red-400">
                        {complianceCounts.nonCompliant} N/C
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Unified Integration Section: Radar + Portal + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Vendor Risk Radar Widget */}
              <div className="lg:col-span-7 min-w-0">
                <RadarWidget 
                  vendors={vendorRiskData}
                  onVendorClick={(vendor) => {
                    // Navigate to vendor detail or open in radar with vendor selected
                    navigate(`/vendor-risk-radar?vendor=${vendor.id}`);
                  }}
                />
              </div>
              
              {/* Portal Status, Quick Actions, Recent Activity */}
              <div className="space-y-6 lg:col-span-5 min-w-0">
                <PortalStatusWidget 
                  assessments={assessments.map(a => ({
                    id: a.id,
                    vendorName: a.assessment_name || 'Supply chain assessment',
                    status: (a.status === 'pending' || a.status === 'in_progress' || a.status === 'completed' || a.status === 'overdue')
                      ? a.status
                      : 'pending',
                  }))}
                />
                <UnifiedQuickActions
                  onAddVendor={() => setShowAddModal(true)}
                  onScoreVendor={() => setShowScoreModal(true)}
                  onCreateAssessment={() => navigate('/vendor-assessments?action=create')}
                />
                {/* Inherent risk — same weighted factors as radar / VIRA intake */}
                <div className="rounded-xl border border-gray-200/70 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <div className="p-4 pb-2">
                    <div className="text-base font-semibold text-gray-900 dark:text-white">{t('vendorRisk.dashboard.inherentRisk.title')}</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {t('vendorRisk.dashboard.inherentRisk.methodologyNote')}{' '}
                      <Link to="/tools/vendor-risk-calculator" className="text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline">
                        {t('vendorRisk.dashboard.inherentRisk.learnMore')}
                      </Link>
                    </p>
                  </div>
                  <div className="pt-0">
                    <Button variant="outline" className="w-full" onClick={() => setShowScoreModal(true)}>
                      {t('vendorRisk.dashboard.inherentRisk.scoreVendor')}
                    </Button>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200/70 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <div className="p-4 pb-2">
                    <div className="text-base font-semibold text-gray-900 dark:text-white">Recent activity</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Latest assessments and updates</p>
                  </div>
                  <div className="pt-0">
                    <ul className="space-y-2">
                      {recentActivity.map((item, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex justify-between gap-2">
                          <span className="min-w-0 truncate">{item.label}</span>
                          {item.time && <span className="text-xs text-gray-500 shrink-0">{item.time}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Vendor Table Section with Enhanced Integration */}
            <div className="rounded-xl border border-gray-200/70 bg-white overflow-hidden shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('vendorRisk.vendorOverview')}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 break-words">
                      Click vendors to view in Radar • Portal status shown for each vendor
                    </p>
                  </div>
                  <div className="w-full lg:w-auto flex flex-col gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate('/vendor-risk-radar')}
                      className="w-full lg:w-auto"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View in Radar
                    </Button>
                    <div className="w-full lg:w-auto">
                      <DataImportExport
                        dataType="vendors"
                        data={vendors}
                        onImportComplete={(result) => {
                          if (result.success) {
                            handleRefresh();
                          }
                        }}
                        onRefresh={handleRefresh}
                      />
                    </div>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => setShowAddModal(true)}
                      className="w-full lg:w-auto"
                      aria-label="Add new vendor"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t('vendorRisk.addNewVendor')}
                    </Button>
                  </div>
                </div>
              </div>
              
              {vendorRiskData.length > 0 ? (
                <VendorRiskTable 
                  vendors={vendorRiskData}
                  onRefresh={handleRefresh}
                  onView={(vendor) => {
                    // Navigate to radar with vendor selected
                    navigate(`/vendor-risk-radar?vendor=${vendor.id}`);
                  }}
                />
              ) : (
                <WorkspaceEmptyState
                  icon={<Users className="h-6 w-6" />}
                  title="No vendors yet"
                  description="Add your first vendor to start building your risk portfolio."
                  primaryAction={{ label: 'Add vendor', href: WR.VENDOR_GRAPH_IMPORT }}
                  secondaryAction={{ label: 'Learn about vendor onboarding', href: MR.VENDOR_ONBOARDING }}
                />
              )}
            </div>
            
            {/* Risk Information Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="rounded-xl border border-gray-200/70 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{t('vendorRisk.riskScoring.title')}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {t('vendorRisk.riskScoring.description')}
                </p>
                <div className="space-y-4">
                  {[
                    { level: 'lowRisk', color: 'green', widthClass: 'w-full', status: 'excellent' },
                    { level: 'mediumRisk', color: 'yellow', widthClass: 'w-3/4', status: 'acceptable' },
                    { level: 'highRisk', color: 'orange', widthClass: 'w-1/2', status: 'concerning' },
                    { level: 'criticalRisk', color: 'red', widthClass: 'w-1/4', status: 'unacceptable' }
                  ].map(({ level, color, widthClass, status }) => (
                    <div key={level}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t(`vendorRisk.riskScoring.${level}`)}
                        </span>
                        <span className={`text-sm font-medium text-${color}-600 dark:text-${color}-400`}>
                          {t(`vendorRisk.riskScoring.${status}`)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`bg-${color}-500 h-3 rounded-full transition-all duration-500 ease-out ${widthClass}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="rounded-xl border border-gray-200/70 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{t('vendorRisk.actions.title')}</h2>
                <div className="space-y-4">
                  {(
                    [
                      { type: 'criticalRisk' as const, ring: 'bg-red-100 dark:bg-red-900/30', Icon: AlertTriangle, iconClass: 'text-red-600 dark:text-red-400' },
                      { type: 'highRisk' as const, ring: 'bg-orange-100 dark:bg-orange-900/30', Icon: AlertTriangle, iconClass: 'text-orange-600 dark:text-orange-400' },
                      { type: 'mediumRisk' as const, ring: 'bg-yellow-100 dark:bg-yellow-900/30', Icon: AlertTriangle, iconClass: 'text-yellow-600 dark:text-yellow-400' },
                      { type: 'lowRisk' as const, ring: 'bg-green-100 dark:bg-green-900/30', Icon: Check, iconClass: 'text-green-600 dark:text-green-400' },
                    ] as const
                  ).map(({ type, ring, Icon, iconClass }) => (
                    <div key={type} className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 h-6 w-6 rounded-full ${ring} flex items-center justify-center mt-0.5`}>
                        <Icon className={`h-3.5 w-3.5 ${iconClass}`} aria-hidden />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {t(`vendorRisk.actions.${type}.title`)}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {t(`vendorRisk.actions.${type}.description`)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Workflow Automation View */}
        {activeView === 'workflows' && (
          <div id="workflows-panel" role="tabpanel" aria-labelledby="workflows-tab" className="space-y-6">
            <div className="rounded-xl border border-gray-200/70 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Workflow Automation</h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">Automate your vendor risk management processes</p>
                  
                  {/* Workflow Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{workflowStats.activeTasks}</div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">Active Tasks</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{workflowStats.completedTasks}</div>
                      <div className="text-sm text-green-600 dark:text-green-400">Completed</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">{workflowStats.overdueTasks}</div>
                      <div className="text-sm text-red-600 dark:text-red-400">Overdue</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{workflowStats.automationRules}</div>
                      <div className="text-sm text-purple-600 dark:text-purple-400">Automation Rules</div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="primary" size="sm" onClick={handleCreateWorkflow}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Workflow
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleManageAutomation}>
                    <Shield className="h-4 w-4 mr-2" />
                    Manage Automation
                  </Button>
                </div>
              </div>
              <WorkflowAutomation />
            </div>
          </div>
        )}

        {/* Threat Intelligence View */}
        {activeView === 'intelligence' && (
          <div id="intelligence-panel" role="tabpanel" aria-labelledby="intelligence-tab" className="space-y-6">
            <div className="rounded-xl border border-gray-200/70 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Threat Intelligence</h2>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">Monitor security threats affecting your vendors</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshThreats}
                    disabled={threatLoading}
                    aria-label="Refresh threat data"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${threatLoading ? 'animate-spin' : ''}`} />
                    {threatLoading ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </div>
                
                {/* Real-time Threat Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{threatStats.activeSources}</div>
                    <div className="text-sm text-green-600 dark:text-green-400">Active Sources</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Last updated: {new Date(threatStats.lastUpdated).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{threatStats.threatsToday}</div>
                    <div className="text-sm text-orange-600 dark:text-orange-400">Threats Today</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Real-time monitoring
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{threatStats.coverage}%</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Coverage</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Multi-source intelligence
                    </div>
                  </div>
                </div>
              </div>
              <ThreatIntelligenceFeed vendorIds={vendorRiskData.map(v => v.id)} />
            </div>
            
            <div className="rounded-xl border border-gray-200/70 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="p-4 pb-2">
                <div className="font-semibold text-gray-900 dark:text-white">Threat Intelligence Sources</div>
              </div>
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{threatStats.activeSources}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Active Sources</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      CVE Database, ThreatFox, MISP
                    </div>
                  </div>
                  <div className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{threatStats.threatsToday}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Threats Today</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Real-time threat indicators
                    </div>
                  </div>
                  <div className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{threatStats.coverage}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Coverage</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Comprehensive threat landscape
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Predictive Analytics View */}
        {activeView === 'analytics' && (
          <div id="analytics-panel" role="tabpanel" aria-labelledby="analytics-tab" className="space-y-6">
            <div className="rounded-xl border border-gray-200/70 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Predictive Analytics</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1">AI-powered insights and risk predictions</p>
              </div>
              <PredictiveAnalytics />
            </div>
            
            {/* Export Dashboard Button */}
            <div className="rounded-xl border border-gray-200/70 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Export Analytics Report</h3>
                  <p className="text-gray-600 dark:text-gray-300">Generate a comprehensive report of your analytics insights</p>
                </div>
                <Button variant="primary" onClick={handleExportDashboard}>
                  <Plus className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Vendor Modal */}
      {showAddModal && (
        <AddVendorModal 
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            handleRefresh();
          }}
        />
      )}

      {/* Score & add vendor (inherent risk) modal */}
      {showScoreModal && (
        <ScoreVendorModal
          onClose={() => setShowScoreModal(false)}
          onSuccess={() => {
            setShowScoreModal(false);
            handleRefresh();
          }}
        />
      )}
  </WorkspacePageShell>
  );
};

export default VendorRiskDashboard;
