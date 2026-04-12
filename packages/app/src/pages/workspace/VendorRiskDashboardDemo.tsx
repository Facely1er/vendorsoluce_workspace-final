/**
 * Demo version of the Vendor Risk Dashboard for unauthenticated users.
 * Shows sample data and CTAs to sign in or start trial.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import VendorRiskTable from '../../components/vendor/VendorRiskTable';
import { VendorRisk } from '../types';
import Button from '../../components/ui/Button';
import { useTranslation } from 'react-i18next';
import { BarChart3, Zap, Shield, Brain, Eye, Lock, User } from 'lucide-react';
import RadarWidget from '../../components/dashboard/RadarWidget';
import UnifiedQuickActions from '../../components/dashboard/UnifiedQuickActions';
import WorkspacePageShell from '../../components/vendorsoluce-intelligence/WorkspacePageShell';

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

  return (
    <WorkspacePageShell eyebrow="Demonstration workspace" title={t('vendorRisk.title')} description={`${t('vendorRisk.description')} This demo uses sample data and follows the same polished shell as the authenticated workspace.`} stats={[{ label: 'Demo vendors', value: DEMO_VENDORS.length, hint: 'Sample portfolio' }, { label: 'High exposure', value: riskCounts.high, hint: 'Critical + high sample vendors' }]}>
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
            <Link to="/trial" className="text-sm text-yellow-700 dark:text-yellow-400 hover:underline font-medium">
              Try with your data →
            </Link>
            <Link to="/signin">
              <Button variant="outline" size="sm" className="border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30">
                Sign In
              </Button>
            </Link>
            <Link to="/checkout?plan=professional">
              <Button variant="primary" size="sm">Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
          {t('vendorRisk.title')}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
          {t('vendorRisk.description')} This demo shows sample data. Sign in for full access.
        </p>
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

      <div className="space-y-8">
        {activeView === 'dashboard' && (
          <div id="dashboard-panel" role="tabpanel" className="space-y-8">
            {/* KPI-style stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="px-6 py-5">
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
                </CardContent>
              </Card>
              <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="px-6 py-5">
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
                </CardContent>
              </Card>
              <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="px-6 py-5">
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
                </CardContent>
              </Card>
            </div>

            {/* Radar + Quick Actions + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RadarWidget
                  vendors={DEMO_VENDORS}
                  onVendorClick={(v) => navigate(`/vendor-risk-radar?vendor=${v.id}`)}
                />
              </div>
              <div className="space-y-6">
                <UnifiedQuickActions
                  onAddVendor={() => navigate('/signin')}
                  onCreateAssessment={() => navigate('/signin')}
                />
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Recent activity</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {DEMO_RECENT_ACTIVITY.map((item, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex justify-between gap-2">
                          <span>{item.label}</span>
                          <span className="text-xs text-gray-500 shrink-0">{item.time}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Vendor table (read-only demo) */}
            <Card className="overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('vendorRisk.vendorOverview')}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Sample vendors. Sign in to add and manage your own.</p>
              </div>
              <VendorRiskTable
                vendors={DEMO_VENDORS}
                onRefresh={() => {}}
                onView={(v) => navigate(`/vendor-risk-radar?vendor=${v.id}`)}
              />
            </Card>

            {/* CTA strip */}
            <div className="bg-gradient-to-r from-vendorsoluce-navy to-vendorsoluce-teal text-white rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-lg">Ready to manage your vendor risk?</p>
                <p className="text-white/90 text-sm mt-1">Sign in or start a free trial to add vendors, run assessments, and generate reports.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/signin">
                  <Button variant="secondary" size="lg" className="bg-white text-vendorsoluce-navy hover:bg-gray-100">
                    <User className="h-5 w-5 mr-2" />
                    Sign In
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

        {activeView !== 'dashboard' && (
          <Card className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">This section is available with a full account.</p>
            <Link to="/signin">
              <Button variant="primary">Sign In to Continue</Button>
            </Link>
          </Card>
        )}
      </div>
    </WorkspacePageShell>
  );
};

export default VendorRiskDashboardDemo;