import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Clock,
  Target,
  Shield,
  Settings,
  Search,
  FileText,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Inbox,
} from 'lucide-react';
import WorkspacePageShell, { WORKSPACE_PAGE_BODY_GRID_CLASS } from '../../components/vendorsoluce-intelligence/WorkspacePageShell';
import { MR } from 'shared/constants/routes';
import { useVendors } from '../../hooks/useVendors';
import { useSupplyChainAssessments } from '../../hooks/useSupplyChainAssessments';

interface ActivityItem {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'vendor' | 'assessment' | 'sbom' | 'settings' | 'security' | 'compliance';
  status: 'success' | 'warning' | 'error' | 'info';
  /** Deep link into the relevant workspace surface. */
  href?: string;
}

const UserActivity: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { vendors } = useVendors();
  const { assessments } = useSupplyChainAssessments();

  // Build an activity feed from real workspace data.
  const activities: ActivityItem[] = useMemo(() => {
    const items: ActivityItem[] = [];

    // One entry per completed assessment (most recent first).
    const sortedAssessments = [...assessments].sort(
      (a, b) => new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime(),
    );
    for (const a of sortedAssessments) {
      if (a.status === 'completed') {
        items.push({
          id: `assessment-done-${a.id}`,
          action: `Completed: ${a.assessment_name || 'Supply Chain Assessment'}`,
          details: `${a.framework || 'Assessment'} — score: ${a.overall_score ?? 'N/A'}`,
          timestamp: a.updated_at ?? a.created_at,
          type: 'assessment',
          status: 'success',
          href: MR.SUPPLY_CHAIN_ASSESSMENT,
        });
      } else if (a.status === 'in_progress') {
        items.push({
          id: `assessment-wip-${a.id}`,
          action: `In progress: ${a.assessment_name || 'Supply Chain Assessment'}`,
          details: `${a.framework || 'Assessment'} — started but not yet submitted.`,
          timestamp: a.updated_at ?? a.created_at,
          type: 'assessment',
          status: 'info',
          href: MR.SUPPLY_CHAIN_ASSESSMENT,
        });
      }
    }

    // One entry per vendor (most recently added first).
    const sortedVendors = [...vendors].sort(
      (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime(),
    );
    for (const v of sortedVendors) {
      items.push({
        id: `vendor-${v.id}`,
        action: `Vendor added: ${v.name}`,
        details: `${v.industry} — Risk level: ${v.risk_level ?? 'Not assessed'}`,
        timestamp: v.created_at,
        type: 'vendor',
        status: (v.risk_level === 'High' || v.risk_level === 'Critical') ? 'warning' : 'success',
        href: MR.VENDORS,
      });
    }

    // Sort all items by timestamp descending.
    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return items;
  }, [vendors, assessments]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'vendor': return <Target className="h-5 w-5" />;
      case 'assessment': return <BarChart3 className="h-5 w-5" />;
      case 'sbom': return <Shield className="h-5 w-5" />;
      case 'settings': return <Settings className="h-5 w-5" />;
      case 'security': return <Shield className="h-5 w-5" />;
      case 'compliance': return <FileText className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      case 'warning': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'error': return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      default: return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = filter === 'all' || activity.type === filter;
    const matchesSearch = activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const activityTypes = [
    { value: 'all', label: 'All Activities' },
    { value: 'vendor', label: 'Vendor Management' },
    { value: 'assessment', label: 'Assessments' },
    { value: 'sbom', label: 'SBOM Analysis' },
    { value: 'security', label: 'Security' },
    { value: 'compliance', label: 'Compliance' }
  ];

  return (
    <WorkspacePageShell title="Activity history" description="Review workspace activity across vendors and assessments." actions={[{ label: 'Export activity log', onClick: () => {}, variant: 'outline' }]} stats={[{ label: 'Total activities', value: activities.length, hint: 'Across current log view' }, { label: 'Filtered', value: filteredActivities.length, hint: 'Current search/filter result' }]}>{/* Filters */}
      <div className="mb-6 rounded-xl border border-gray-200/70 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                aria-label="Search activities"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              aria-label="Filter activity type"
            >
              {activityTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border border-gray-200/70 bg-white p-4 shadow-sm text-center dark:border-gray-800 dark:bg-gray-900">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {activities.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Activities</div>
        </div>
        <div className="rounded-xl border border-gray-200/70 bg-white p-4 shadow-sm text-center dark:border-gray-800 dark:bg-gray-900">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {activities.filter(a => a.status === 'success').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Successful Actions</div>
        </div>
        <div className="rounded-xl border border-gray-200/70 bg-white p-4 shadow-sm text-center dark:border-gray-800 dark:bg-gray-900">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {activities.filter(a => a.status === 'warning').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Warnings</div>
        </div>
        <div className="rounded-xl border border-gray-200/70 bg-white p-4 shadow-sm text-center dark:border-gray-800 dark:bg-gray-900">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {activities.filter(a => a.status === 'error').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Errors</div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="rounded-xl border border-gray-200/70 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center p-6 pb-3">
          <Activity className="h-5 w-5 mr-2 text-vendorsoluce-green" />
          <span className="font-semibold text-gray-900 dark:text-white">Activity Timeline</span>
        </div>
        <div className="px-6 pb-6">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {activities.length === 0 ? 'No activity yet' : 'No activities match your search'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {activities.length === 0
                  ? 'Add vendors or run an assessment to see events here.'
                  : 'Try adjusting your search terms or filter.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity) => {
                const body = (
                  <>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {activity.action}
                          </h3>
                          {getStatusIcon(activity.status)}
                          {activity.href ? (
                            <span className="text-xs font-medium text-vendorsoluce-green dark:text-vendorsoluce-light-green">
                              Open related page →
                            </span>
                          ) : null}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {activity.details}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                          <Clock className="h-3 w-3 mr-1 shrink-0" />
                          {formatTimestamp(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                  </>
                );
                return (
                  <div
                    key={activity.id}
                    className={`border-l-4 p-4 rounded-lg ${getStatusColor(activity.status)}`}
                  >
                    {activity.href ? (
                      <Link to={activity.href} className="block outline-none rounded-md focus-visible:ring-2 focus-visible:ring-vendorsoluce-green/60">
                        {body}
                      </Link>
                    ) : (
                      body
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Activity Insights */}
      <div className="mt-6 rounded-xl border border-gray-200/70 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="p-6 pb-3">
          <span className="font-semibold text-gray-900 dark:text-white">Activity Insights</span>
        </div>
        <div className="px-6 pb-6">
          <div className={`${WORKSPACE_PAGE_BODY_GRID_CLASS} md:grid-cols-3`}>
            <div className="text-center">
              <div className="text-2xl font-bold text-vendorsoluce-green mb-2">
                {activities.filter(a => a.type === 'vendor').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Vendor Actions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-vendorsoluce-blue mb-2">
                {activities.filter(a => a.type === 'assessment').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Assessments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-vendorsoluce-teal mb-2">
                {activities.filter(a => a.type === 'sbom').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">SBOM Analyses</div>
            </div>
          </div>
        </div>
      </div>
    </WorkspacePageShell>
  );
};

export default UserActivity;