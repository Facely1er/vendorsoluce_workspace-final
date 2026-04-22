/**
 * Demo version of the Vendor Risk Dashboard for unauthenticated users.
 * Shows sample data and CTAs to sign in or start trial.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import VendorRiskTable from '../../components/vendor/VendorRiskTable';
import { VendorRisk } from '../types';
import Button from '../../components/ui/Button';
import { useTranslation } from 'react-i18next';
import { BarChart3, Zap, Shield, Brain, Eye, Lock, User, Plus, RefreshCw } from 'lucide-react';
import RadarWidget from '../../components/dashboard/RadarWidget';
import UnifiedQuickActions from '../../components/dashboard/UnifiedQuickActions';
import WorkspacePageShell, { WORKSPACE_PAGE_BODY_STACK_LOOSE_CLASS } from '../../components/vendorsoluce-intelligence/WorkspacePageShell';
import WorkflowAutomation from '../../components/vendor/WorkflowAutomation';
import ThreatIntelligenceFeed from '../../components/vendor/ThreatIntelligenceFeed';
import PredictiveAnalytics from '../../components/analytics/PredictiveAnalytics';

const DEMO_WORKFLOW_STATS = {
  activeTasks: 5,
  completedTasks: 24,
  overdueTasks: 1,
  automationRules: 4,
};

const DEMO_THREAT_STATS = {
  activeSources: 4,
  threatsToday: 12,
  coverage: 87,
  lastUpdated: new Date().toISOString(),
};

const DEMO_VENDORS: VendorRisk[] = [
  { id: 'demo-1', name: 'CloudSecure Inc', industry: 'Technology', riskScore: 72, riskLevel: 'Low', complianceStatus: 'Compliant', lastAssessment: '2024-01-15' },
  { id: 'demo-2', name: 'DataFlow Analytics', industry: 'Software', riskScore: 58, riskLevel: 'Medium', complianceStatus: 'Partial', lastAssessment: '2024-01-10' },
  { id: 'demo-3', name: 'Global Logistics Co', industry: 'Logistics', riskScore: 41, riskLevel: 'High', complianceStatus: 'Non-Compliant', lastAssessment: '2023-12-01' },
  { id: 'demo-4', name: 'SecurePay Systems', industry: 'FinTech', riskScore: 85, riskLevel: 'Low', complianceStatus: 'Compliant', lastAssessment: '2024-01-20' },
  { id: 'demo-5', name: 'TechVendor Ltd', industry: 'Technology', riskScore: 35, riskLevel: 'Critical', complianceStatus: 'Non-Compliant', lastAssessment: 'Never' },
];

const DEMO_RECENT_ACTIVITY = [
  { label: 'NIST SP 800-161 assessment completed', time: '2 hours ago', type: 'success' },
  { label: 'Added vendor: CloudSecure Inc', time: '1 day ago', type: 'info' },
  { label: 'SBOM analysis completed', time: '2 days ago', type: 'success' },
  { label: 'Vendor risk score updated', time: '3 days ago', type: 'info' },
];

const VendorRiskDashboardDemo: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'dashboard' | 'workflows' | 'intelligence' | 'analytics'>('dashboard');

  const riskCounts = {
    high: DEMO_VENDORS.filter(v => v.riskLevel === 'Critical' || v.riskLevel === 'High').length,
    medium: DEMO_VENDORS.filter(v => v.riskLevel === 'Medium').length,
    low: DEMO_VENDORS.filter(v => v.riskLevel === 'Low').length,
  };

  const complianceCounts = {
    compliant: DEMO_VENDORS.filter(v => v.complianceStatus === 'Compliant').length,
    partial: DEMO_VENDORS.filter(v => v.complianceStatus === 'Partial').length,
    nonCompliant: DEMO_VENDORS.filter(v => v.complianceStatus === 'Non-Compliant').length,
  };

  const handleViewChange = (view: 'dashboard' | 'workflows' | 'intelligence' | 'analytics') => {
    setActiveView(view);
  };

  const demoVendorIds = DEMO_VENDORS.map((v) => v.id);

  const handleCreateWorkflow = () => {
    navigate('/vendor-activity-catalog');
  };

  const handleManageAutomation = () => {
    navigate('/vendor-activity-catalog');
  };

  const handleExportAnalyticsDemo = () => {
    navigate('/vendor-risk-reports');
  };

  return (
    <WorkspacePageShell title={t('vendorRisk.title')} description={`${t('vendorRisk.description')} This demo uses sample data and follows the same polished shell as the authenticated workspace.`} stats={[{ label: 'Demo vendors', value: DEMO_VENDORS.length, hint: 'Sample portfolio' }, { label: 'High exposure', value: riskCounts.high, hint: 'Critical + high sample vendors' }]}>
      {/* Demo Banner - non-sticky so it does not interfere with breadcrumbs positioning */}
      <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0" />
            <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
              DEMO MODE – Sample vendor data. Sign in to manage your own vendors.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/vendor-risk-radar" className="text-sm text-yellow-700 dark:text-yellow-400 hover:underline font-medium">
              Try with your data →
            </Link>
            <Link to="/vendors">
              <Button variant="outline" size="sm" className="border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30">
                Open workspace
              </Button>
            </Link>
            <Link to="/checkout?plan=professional">
              <Button variant="primary" size="sm">Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700" role="tablist" aria-label="Dashboard sections">
          <div className="flex flex-wrap -mb-px">
            {[
              { id: 'dashboard', label: 'Overview Dashboard', icon: BarChart3 },
              { id: 'workflows', label: 'Workflow Automation', icon: Zap },
              { id: 'intelligence', label: 'Threat Intelligence', icon: Shield },
              { id: 'analytics', label: 'Predictive Analytics', icon: Brain },
            ].map(({ id, label, icon: Icon }) => {
              const isSelected = activeView === id;
              const tabClassName = isSelected
                ? 'border-vendorsoluce-green text-vendorsoluce-green'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white';
              return isSelected ? (
                <button
                  key={id}
                  onClick={() => handleViewChange(id as typeof activeView)}
                  className={`flex items-center px-4 py-3 mr-2 text-sm font-medium border-b-2 rounded-t-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-vendorsoluce-navy focus:ring-offset-2 ${tabClassName}`}
                  role="tab"
                  aria-selected="true"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{label.split(' ')[0]}</span>
                </button>
              ) : (
                <button
                  key={id}
                  onClick={() => handleViewChange(id as typeof activeView)}
                  className={`flex items-center px-4 py-3 mr-2 text-sm font-medium border-b-2 rounded-t-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-vendorsoluce-navy focus:ring-offset-2 ${tabClassName}`}
                  role="tab"
                  aria-selected="false"
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

      <div className={WORKSPACE_PAGE_BODY_STACK_LOOSE_CLASS}>
        {activeView === 'dashboard' && (
          <div id="dashboard-panel" role="tabpanel" className="space-y-8">
            {/* KPI-style stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 dark:border-gray-700 dark:bg-gray-800">
                <div className="px-6 py-5">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-snug min-w-0 pr-2">
                        {t('vendorRisk.totalVendors')}
                      </p>
                      <div className="p-2.5 rounded-xl bg-vendorsoluce-teal/10 shrink-0 flex items-center justify-center" aria-hidden>
                        <BarChart3 className="h-6 w-6 text-vendorsoluce-teal" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold tabular-nums text-gray-900 dark:text-white leading-none">
                      {DEMO_VENDORS.length}
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

            {/* Radar + Quick Actions + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 min-w-0">
                <RadarWidget
                  vendors={DEMO_VENDORS}
                  onVendorClick={(v) => navigate(`/vendor-risk-radar?vendor=${v.id}`)}
                />
              </div>
              <div className="space-y-6 lg:col-span-5 min-w-0">
                <UnifiedQuickActions
                  onAddVendor={() => navigate('/vendors')}
                  onCreateAssessment={() => navigate('/vendor-assessments')}
                />
                <div className="rounded-xl border border-gray-200/70 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <div className="p-4 pb-2">
                    <div className="text-base font-semibold text-gray-900 dark:text-white">Recent activity</div>
                  </div>
                  <div className="pt-0">
                    <ul className="space-y-2">
                      {DEMO_RECENT_ACTIVITY.map((item, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex justify-between gap-2">
                          <span>{item.label}</span>
                          <span className="text-xs text-gray-500 shrink-0">{item.time}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Vendor table (read-only demo) */}
            <div className="rounded-xl border border-gray-200/70 bg-white overflow-hidden shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('vendorRisk.vendorOverview')}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Sample vendors. Sign in to add and manage your own.</p>
              </div>
              <VendorRiskTable
                vendors={DEMO_VENDORS}
                onRefresh={() => {}}
                onView={(v) => navigate(`/vendor-risk-radar?vendor=${v.id}`)}
              />
            </div>

            {/* CTA strip */}
            <div className="bg-gradient-to-r from-vendorsoluce-navy to-vendorsoluce-teal text-white rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-lg">Ready to manage your vendor risk?</p>
                <p className="text-white/90 text-sm mt-1">Use offline mode to add vendors, run assessments, and generate reports in this browser.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/vendors">
                  <Button variant="secondary" size="lg" className="bg-white text-vendorsoluce-navy hover:bg-gray-100">
                    <User className="h-5 w-5 mr-2" />
                    Open workspace
                  </Button>
                </Link>
                <Link to="/checkout?plan=professional">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/20">
                    <Lock className="h-5 w-5 mr-2" />
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeView === 'workflows' && (
          <div id="workflows-panel" role="tabpanel" className="space-y-6">
            <div className="rounded-xl border border-gray-200/70 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between mb-6">
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Workflow Automation</h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">Automate your vendor risk management processes</p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
                    Demo: sample tasks and templates. Sign in to create and save workflows for your organization.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{DEMO_WORKFLOW_STATS.activeTasks}</div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">Active Tasks</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{DEMO_WORKFLOW_STATS.completedTasks}</div>
                      <div className="text-sm text-green-600 dark:text-green-400">Completed</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">{DEMO_WORKFLOW_STATS.overdueTasks}</div>
                      <div className="text-sm text-red-600 dark:text-red-400">Overdue</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{DEMO_WORKFLOW_STATS.automationRules}</div>
                      <div className="text-sm text-purple-600 dark:text-purple-400">Automation Rules</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
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

        {activeView === 'intelligence' && (
          <div id="intelligence-panel" role="tabpanel" className="space-y-6">
            <div className="rounded-xl border border-gray-200/70 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Threat Intelligence</h2>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">Monitor security threats affecting your vendors</p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
                      Demo feed uses sample indicators. Sign in to connect live sources and scope alerts to your portfolio.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" type="button" onClick={() => navigate('/vendor-risk-radar')} aria-label="Refresh threat data">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{DEMO_THREAT_STATS.activeSources}</div>
                    <div className="text-sm text-green-600 dark:text-green-400">Active Sources</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Last updated: {new Date(DEMO_THREAT_STATS.lastUpdated).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{DEMO_THREAT_STATS.threatsToday}</div>
                    <div className="text-sm text-orange-600 dark:text-orange-400">Threats Today</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sample monitoring cadence</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{DEMO_THREAT_STATS.coverage}%</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Coverage</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Illustrative coverage score</div>
                  </div>
                </div>
              </div>
              <ThreatIntelligenceFeed vendorIds={demoVendorIds} />
            </div>
            <div className="rounded-xl border border-gray-200/70 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="p-4 pb-2">
                <div className="font-semibold text-gray-900 dark:text-white">Threat Intelligence Sources</div>
              </div>
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{DEMO_THREAT_STATS.activeSources}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Active Sources</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">CVE Database, ThreatFox, MISP</div>
                  </div>
                  <div className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{DEMO_THREAT_STATS.threatsToday}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Threats Today</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Real-time threat indicators (demo)</div>
                  </div>
                  <div className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{DEMO_THREAT_STATS.coverage}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Coverage</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Comprehensive threat landscape (demo)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'analytics' && (
          <div id="analytics-panel" role="tabpanel" className="space-y-6">
            <div className="rounded-xl border border-gray-200/70 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Predictive Analytics</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1">AI-powered insights and risk predictions</p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
                  Demo: illustrative forecasts. Sign in to align predictions with your assessments and SBOM history.
                </p>
              </div>
              <PredictiveAnalytics />
            </div>
            <div className="rounded-xl border border-gray-200/70 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Export Analytics Report</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                    Generate a comprehensive report of your analytics insights
                  </p>
                </div>
                <Button variant="primary" onClick={handleExportAnalyticsDemo}>
                  <Plus className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </WorkspacePageShell>
  );
};

export default VendorRiskDashboardDemo;