import React, { useMemo } from 'react';
import { Button } from '../../components/ui/Button';
import {
  Activity,
  Clock,
  Award,
  Target,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Shield,
  ExternalLink,
  Inbox,
} from 'lucide-react';
import WorkspacePageShell, { WORKSPACE_PAGE_BODY_GRID_CLASS } from '../../components/vendorsoluce-intelligence/WorkspacePageShell';
import PanelCard from '../../components/vendorsoluce-intelligence/PanelCard';
import { ProgressBarFill } from '../../components/ui/ProgressBarFill';
import { Link } from 'react-router-dom';
import { WR, MR } from 'shared/constants/routes';
import { useAuth } from '../../context/AuthContext';
import { useVendors } from '../../hooks/useVendors';
import { useSupplyChainAssessments } from '../../hooks/useSupplyChainAssessments';

const UserDashboard: React.FC = () => {
  const { profile } = useAuth();
  const { vendors } = useVendors();
  const { assessments } = useSupplyChainAssessments();

  // Compute the average risk score from real vendor data. Returns null when no vendors exist.
  const avgRiskScore = useMemo(() => {
    const vendorsWithScore = vendors.filter((v) => typeof v.risk_score === 'number');
    if (vendorsWithScore.length === 0) return null;
    const sum = vendorsWithScore.reduce((acc, v) => acc + (v.risk_score ?? 0), 0);
    return Math.round(sum / vendorsWithScore.length);
  }, [vendors]);

  // Compute profile completion percentage from fields actually present.
  const profileCompletion = useMemo(() => {
    const fields = [
      !!profile?.full_name,
      !!profile?.email,
      !!profile?.company,
      !!profile?.role,
      !!profile?.avatar_url,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  // Build activity feed from real assessment and vendor data. Returns empty array when nothing has happened yet.
  const recentActivity = useMemo(() => {
    const items: { id: string; action: string; timestamp: string; icon: React.ReactNode }[] = [];

    // Most-recent completed assessments (up to 2)
    const completed = assessments
      .filter((a) => a.status === 'completed')
      .sort((a, b) => new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime())
      .slice(0, 2);
    for (const a of completed) {
      items.push({
        id: `assessment-${a.id}`,
        action: `Completed: ${a.assessment_name || 'Supply Chain Assessment'}`,
        timestamp: a.updated_at ? new Date(a.updated_at).toLocaleDateString() : 'Recently',
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      });
    }

    // Most-recently added vendors (up to 2)
    const recentVendors = [...vendors]
      .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
      .slice(0, 2);
    for (const v of recentVendors) {
      items.push({
        id: `vendor-${v.id}`,
        action: `Vendor added: ${v.name}`,
        timestamp: v.created_at ? new Date(v.created_at).toLocaleDateString() : 'Recently',
        icon: <Target className="h-4 w-4 text-blue-500" />,
      });
    }

    return items.slice(0, 4);
  }, [assessments, vendors]);

  const achievements = useMemo(
    () => [
      {
        id: 1,
        title: 'Risk Assessment Expert',
        description: 'Completed 5 supply chain assessments',
        icon: <Award className="h-6 w-6 text-yellow-500" />,
        earned: assessments.filter((a) => a.status === 'completed').length >= 5,
      },
      {
        id: 2,
        title: 'Assessment Expert',
        description: 'Completed 10 vendor assessments',
        icon: <Shield className="h-6 w-6 text-blue-500" />,
        earned: assessments.length >= 10,
      },
      {
        id: 3,
        title: 'Vendor Manager',
        description: 'Managed 25+ vendor relationships',
        icon: <Target className="h-6 w-6 text-green-500" />,
        earned: vendors.length >= 25,
      },
      {
        id: 4,
        title: 'Compliance Champion',
        description: 'Maintained 90%+ compliance score',
        icon: <CheckCircle className="h-6 w-6 text-purple-500" />,
        earned: false,
      },
    ],
    [assessments, vendors],
  );

  const quickStats = useMemo(
    () => [
      {
        label: 'Vendors Managed',
        value: vendors.length,
        change: vendors.length > 0 ? 'In your portfolio' : 'Add your first vendor',
      },
      {
        label: 'Assessments Completed',
        value: assessments.filter((a) => a.status === 'completed').length,
        change: assessments.length > 0 ? `${assessments.length} total record(s)` : 'Run your first assessment',
      },
      {
        label: 'Avg Risk Score',
        value: avgRiskScore !== null ? `${avgRiskScore}%` : '—',
        change: avgRiskScore !== null ? 'Across scored vendors' : 'No scores yet',
      },
    ],
    [vendors, assessments, avgRiskScore],
  );

  return (
    <WorkspacePageShell
      title={`Welcome back, ${profile?.full_name || 'User'}!`}
      description={`${profile?.role || 'Security Professional'} at ${profile?.company || 'Your Organization'}`}
      actions={[
        { label: 'Edit profile', to: WR.PROFILE, variant: 'outline' },
        { label: 'Account settings', to: WR.ACCOUNT, variant: 'outline' }
      ]}
      stats={quickStats.map((s)=>({label:s.label,value:s.value,hint:s.change}))}
    >
      <div className={WORKSPACE_PAGE_BODY_GRID_CLASS}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Activity & Quick Actions */}
          <div className="space-y-6 lg:col-span-2">
            <PanelCard
              title={<span className="flex items-center gap-2"><Activity className="h-5 w-5 text-vendorsoluce-green" />Recent Activity</span>}
              description="Latest events from your workspace — vendors and assessments."
            >
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <Inbox className="h-8 w-8 text-gray-400" aria-hidden />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No activity yet. Add vendors or run an assessment to see events here.
                    </p>
                  </div>
                ) : (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 rounded-xl border border-gray-200/70 p-3 dark:border-gray-800">
                      <div className="mt-1 flex-shrink-0">
                        {activity.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{activity.action}</p>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="h-3 w-3" />
                          {activity.timestamp}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-800">
                <Link to={WR.USER_ACTIVITY}>
                  <Button variant="outline" className="w-full">
                    View All Activity
                  </Button>
                </Link>
              </div>
            </PanelCard>

            <PanelCard
              title="Quick Actions"
              description="Jump to common tasks and workflows."
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Link to={WR.VENDOR_INTELLIGENCE}>
                  <div className="rounded-xl border border-gray-200/70 p-4 transition-colors hover:border-vendorsoluce-green hover:bg-emerald-50/60 dark:border-gray-800 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/20">
                    <div className="flex items-center gap-3">
                      <Target className="h-6 w-6 text-vendorsoluce-green" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Add Vendor</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Add a new vendor to your portfolio</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link to="/supply-chain-assessment">
                  <div className="rounded-xl border border-gray-200/70 p-4 transition-colors hover:border-vendorsoluce-green hover:bg-emerald-50/60 dark:border-gray-800 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/20">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-6 w-6 text-vendorsoluce-green" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Run Assessment</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Start a new risk assessment</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link to="/tools/nist-checklist">
                  <div className="rounded-xl border border-gray-200/70 p-4 transition-colors hover:border-vendorsoluce-green hover:bg-emerald-50/60 dark:border-gray-800 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/20">
                    <div className="flex items-center gap-3">
                      <Shield className="h-6 w-6 text-vendorsoluce-green" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">NIST Checklist</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Run NIST SP 800-161 compliance check</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <a href={MR.TEMPLATES} target="_blank" rel="noopener noreferrer">
                  <div className="rounded-xl border border-gray-200/70 p-4 transition-colors hover:border-vendorsoluce-green hover:bg-emerald-50/60 dark:border-gray-800 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/20">
                    <div className="flex items-center gap-3">
                      <ExternalLink className="h-6 w-6 text-vendorsoluce-green" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Download Templates</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Opens the templates library (external)</p>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            </PanelCard>
          </div>

          {/* Sidebar: Achievements & Profile Completion */}
          <div className="space-y-6">
            <PanelCard
              title={<span className="flex items-center gap-2"><Award className="h-5 w-5 text-yellow-500" />Achievements</span>}
              description="Track your progress and milestones."
            >
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`rounded-xl border p-3 ${
                      achievement.earned
                        ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                        : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={achievement.earned ? 'text-yellow-500' : 'text-gray-400'}>
                        {achievement.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className={`font-medium ${
                          achievement.earned
                            ? 'text-yellow-800 dark:text-yellow-300'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {achievement.title}
                        </h4>
                        <p className={`text-sm ${
                          achievement.earned
                            ? 'text-yellow-700 dark:text-yellow-400'
                            : 'text-gray-500 dark:text-gray-500'
                        }`}>
                          {achievement.description}
                        </p>
                      </div>
                      {achievement.earned && (
                        <CheckCircle className="h-4 w-4 flex-shrink-0 text-yellow-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </PanelCard>

            <PanelCard
              title="Profile Completion"
              description="Complete your profile to unlock all features."
            >
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Profile completed</span>
                  <span className="font-medium text-gray-900 dark:text-white">{profileCompletion}%</span>
                </div>
                <ProgressBarFill percent={profileCompletion} fillClassName="fill-vendorsoluce-green" />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span>Basic information completed</span>
                  </div>
                  {!profile?.avatar_url && (
                    <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Add a profile picture</span>
                    </div>
                  )}
                  {!profile?.company && (
                    <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Add your company name</span>
                    </div>
                  )}
                  {!profile?.role && (
                    <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Add your role</span>
                    </div>
                  )}
                </div>
                <Link to="/profile">
                  <Button variant="outline" size="sm" className="w-full">
                    Complete Profile
                  </Button>
                </Link>
              </div>
            </PanelCard>
          </div>
        </div>
      </div>
    </WorkspacePageShell>
  );
};

export default UserDashboard;
