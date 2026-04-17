import { useMemo, useState, type FormEvent } from 'react';
import {
  Users, UserCheck, UserX, Clock, Search, Mail,
  Edit, X, ShieldCheck, BarChart3, AlertTriangle, CheckCircle, Filter
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import WorkspacePageShell from '../../../components/vendorsoluce-intelligence/WorkspacePageShell';
import { ProgressBarFill } from '../../../components/ui/ProgressBarFill';
import PanelCard from '../../../components/vendorsoluce-intelligence/PanelCard';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'vendor_risk_manager' | 'procurement' | 'legal' | 'ciso' | 'business_owner' | 'executive' | 'analyst';
  permissions: string[];
  lastAccess?: string;
  status: 'active' | 'suspended' | 'pending';
  vendorCount?: number;
}

const availablePermissions = [
  { id: 'view_vendors', label: 'View Vendors', category: 'vendors' },
  { id: 'manage_vendors', label: 'Manage Vendors', category: 'vendors' },
  { id: 'run_assessments', label: 'Run Assessments', category: 'assessments' },
  { id: 'view_assessments', label: 'View Assessments', category: 'assessments' },
  { id: 'view_sbom', label: 'View SBOM Analysis', category: 'sbom' },
  { id: 'manage_sbom', label: 'Manage SBOM', category: 'sbom' },
  { id: 'view_reports', label: 'View Reports', category: 'reporting' },
  { id: 'export_reports', label: 'Export Reports', category: 'reporting' },
  { id: 'manage_contracts', label: 'Manage Contracts', category: 'contracts' },
  { id: 'admin_settings', label: 'Admin Settings', category: 'admin' },
  { id: 'manage_users', label: 'Manage Users', category: 'admin' },
];

const roleColors: Record<string, string> = {
  vendor_risk_manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  procurement: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  legal: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  ciso: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  business_owner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  executive: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  analyst: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const roleLabels: Record<string, string> = {
  vendor_risk_manager: 'Vendor Risk Manager',
  procurement: 'Procurement',
  legal: 'Legal Counsel',
  ciso: 'CISO / Security',
  business_owner: 'Business Owner',
  executive: 'Executive Sponsor',
  analyst: 'Risk Analyst',
};

const initialMembers: TeamMember[] = [
  { id: 'm1', name: 'Alex Chen', email: 'alex.chen@example.com', role: 'vendor_risk_manager', permissions: ['view_vendors', 'manage_vendors', 'run_assessments', 'view_assessments', 'view_sbom', 'manage_sbom', 'view_reports', 'export_reports', 'admin_settings', 'manage_users'], lastAccess: '2025-02-27', status: 'active', vendorCount: 45 },
  { id: 'm2', name: 'Jordan Lee', email: 'jordan.lee@example.com', role: 'analyst', permissions: ['view_vendors', 'run_assessments', 'view_assessments', 'view_sbom', 'view_reports'], lastAccess: '2025-02-26', status: 'active', vendorCount: 30 },
  { id: 'm3', name: 'Sam Rivera', email: 'sam.rivera@example.com', role: 'procurement', permissions: ['view_vendors', 'manage_vendors', 'view_assessments', 'manage_contracts'], lastAccess: '2025-02-25', status: 'active', vendorCount: 20 },
  { id: 'm4', name: 'Morgan Taylor', email: 'morgan.taylor@example.com', role: 'legal', permissions: ['view_vendors', 'view_assessments', 'manage_contracts', 'view_reports'], lastAccess: '2025-02-20', status: 'pending', vendorCount: 0 },
];

const accessLogs = [
  { member: 'Alex Chen', action: 'Completed vendor risk assessment for Acme Corp', timestamp: '2025-02-27 14:30', result: 'Success' },
  { member: 'Jordan Lee', action: 'Uploaded SBOM for CloudBase Inc', timestamp: '2025-02-26 11:15', result: 'Success' },
  { member: 'Sam Rivera', action: 'Exported vendor risk report', timestamp: '2025-02-25 09:45', result: 'Success' },
  { member: 'Unknown', action: 'Attempted unauthorized admin access', timestamp: '2025-02-24 16:20', result: 'Denied' },
];

const statusClasses: Record<TeamMember['status'], string> = {
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
  suspended: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300',
};

const fieldClass =
  'h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-emerald-400 dark:border-gray-800 dark:bg-gray-950 dark:text-white';

function defaultPermissionsForRole(role: TeamMember['role']): string[] {
  switch (role) {
    case 'vendor_risk_manager':
      return ['view_vendors', 'manage_vendors', 'run_assessments', 'view_assessments', 'view_sbom', 'manage_sbom', 'view_reports', 'export_reports'];
    case 'ciso':
      return ['view_vendors', 'run_assessments', 'view_assessments', 'view_sbom', 'manage_sbom', 'view_reports', 'export_reports', 'admin_settings'];
    case 'procurement':
      return ['view_vendors', 'manage_vendors', 'view_assessments', 'manage_contracts'];
    case 'legal':
      return ['view_vendors', 'view_assessments', 'manage_contracts', 'view_reports'];
    case 'business_owner':
      return ['view_vendors', 'view_assessments', 'view_reports'];
    case 'executive':
      return ['view_vendors', 'view_reports', 'export_reports'];
    case 'analyst':
    default:
      return ['view_vendors', 'run_assessments', 'view_assessments', 'view_sbom', 'view_reports'];
  }
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function StakeholderManagementPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'access' | 'permissions' | 'activity'>('overview');
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<TeamMember['role']>('analyst');
  const [newStatus, setNewStatus] = useState<TeamMember['status']>('pending');
  const [addMemberError, setAddMemberError] = useState<string | null>(null);

  const resetAddForm = () => {
    setNewName('');
    setNewEmail('');
    setNewRole('analyst');
    setNewStatus('pending');
    setAddMemberError(null);
  };

  const openAddForm = () => {
    resetAddForm();
    setShowAddForm(true);
  };

  const closeAddForm = () => {
    setShowAddForm(false);
    resetAddForm();
  };

  const handleAddMember = (e: FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    const email = newEmail.trim().toLowerCase();
    if (!name) {
      setAddMemberError("Enter the member's full name.");
      return;
    }
    if (!isValidEmail(email)) {
      setAddMemberError('Enter a valid work email address.');
      return;
    }
    if (members.some((m) => m.email.toLowerCase() === email)) {
      setAddMemberError('A member with this email is already on the roster.');
      return;
    }
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `m-${Date.now()}`;
    const next: TeamMember = {
      id,
      name,
      email: newEmail.trim(),
      role: newRole,
      permissions: defaultPermissionsForRole(newRole),
      status: newStatus,
      vendorCount: newStatus === 'active' ? 0 : undefined,
      lastAccess: newStatus === 'active' ? new Date().toISOString().slice(0, 10) : undefined,
    };
    setMembers((prev) => [...prev, next]);
    closeAddForm();
  };

  const stats = useMemo(() => ({
    total: members.length,
    active: members.filter((m) => m.status === 'active').length,
    pending: members.filter((m) => m.status === 'pending').length,
    suspended: members.filter((m) => m.status === 'suspended').length,
  }), [members]);

  const filtered = useMemo(() => members.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = selectedRole === 'all' || m.role === selectedRole;
    return matchSearch && matchRole;
  }), [members, searchTerm, selectedRole]);

  const handlePermissionChange = (memberId: string, permission: string, granted: boolean) => {
    setMembers((prev) => prev.map((m) => {
      if (m.id !== memberId) return m;
      const permissions = granted ? [...m.permissions, permission] : m.permissions.filter((p) => p !== permission);
      return { ...m, permissions };
    }));
  };

  const handleRevokeAccess = (memberId: string) => {
    setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, status: 'suspended', permissions: [] } : m));
  };

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'access', label: 'Access control' },
    { key: 'permissions', label: 'Permissions' },
    { key: 'activity', label: 'Activity logs' },
  ] as const;

  return (
    <WorkspacePageShell
      title="Stakeholder management"
      description="Manage workspace access and stakeholder roles."
      actions={[
        {
          label: showAddForm ? 'Close add member' : 'Add member',
          onClick: () => (showAddForm ? closeAddForm() : openAddForm()),
          variant: showAddForm ? 'outline' : 'primary',
        },
      ]}
      stats={[
        { label: 'Total members', value: stats.total, hint: 'Current team roster' },
        { label: 'Active', value: stats.active, hint: 'Enabled workspace access' },
        { label: 'Pending', value: stats.pending, hint: 'Awaiting activation' },
        { label: 'Suspended', value: stats.suspended, hint: 'Removed or restricted users' },
      ]}
    >
      <PanelCard title="Governance views" description="Switch between roster, permissions, and audit activity without losing the same page structure.">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition ${activeTab === tab.key ? 'bg-emerald-600 text-white shadow-sm' : 'border border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:bg-emerald-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/20'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </PanelCard>

      {activeTab === 'overview' && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <PanelCard title="Role distribution" description="Check whether the vendor-risk program is staffed with the right balance of operating roles.">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Total members', value: stats.total, icon: Users, tone: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' },
                { label: 'Active', value: stats.active, icon: UserCheck, tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' },
                { label: 'Pending', value: stats.pending, icon: Clock, tone: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' },
                { label: 'Suspended', value: stats.suspended, icon: UserX, tone: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' },
              ].map((card) => (
                <div key={card.label} className="rounded-2xl border border-gray-200/70 p-5 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className={`rounded-xl p-2.5 ${card.tone}`}><card.icon className="h-5 w-5" /></div>
                    <div className="text-2xl font-semibold text-gray-950 dark:text-white">{card.value}</div>
                  </div>
                  <div className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">{card.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-4">
              {Object.entries(roleLabels).map(([key, label]) => {
                const count = members.filter((m) => m.role === key).length;
                const pct = members.length > 0 ? Math.round((count / members.length) * 100) : 0;
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-200">{label}</span>
                      <span className="text-gray-500 dark:text-gray-400">{count} ({pct}%)</span>
                    </div>
                    <ProgressBarFill percent={pct} fillClassName="fill-emerald-600" />
                  </div>
                );
              })}
            </div>
          </PanelCard>
          <PanelCard title="Governance guidance" description="Use the team module as an operating control, not just a user list.">
            <div className="space-y-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
              <div className="flex gap-3"><div className="rounded-xl bg-emerald-50 p-2.5 dark:bg-emerald-950/40"><CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div><p>Keep the same stakeholder names aligned across team, RACI, collaborative assessment, and vendor review flows.</p></div>
              <div className="flex gap-3"><div className="rounded-xl bg-amber-50 p-2.5 dark:bg-amber-950/40"><AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" /></div><p>Pending access should be resolved quickly; lingering pending users usually signals broken onboarding or unclear ownership.</p></div>
              <div className="flex gap-3"><div className="rounded-xl bg-blue-50 p-2.5 dark:bg-blue-950/40"><BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" /></div><p>Use vendor counts and last access as operating signals, not vanity metrics.</p></div>
            </div>
          </PanelCard>
        </div>
      )}

      {activeTab === 'access' && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <PanelCard title="Team access control" description="Search, filter, and operate the roster from one controlled view.">
            <div className="space-y-5">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search members" className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none focus:border-emerald-400 dark:border-gray-800 dark:bg-gray-950 dark:text-white" />
                </label>
                <label className="relative block">
                  <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none focus:border-emerald-400 dark:border-gray-800 dark:bg-gray-950 dark:text-white" aria-label="Filter by role">
                    <option value="all">All roles</option>
                    {Object.entries(roleLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                  </select>
                </label>
              </div>
              <div className="space-y-4">
                {filtered.map((member) => (
                  <div key={member.id} className="rounded-2xl border border-gray-200/70 p-5 dark:border-gray-800">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-emerald-50 p-3 dark:bg-emerald-950/30"><ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium text-gray-950 dark:text-white">{member.name}</h3>
                            <span className={`rounded-full px-2.5 py-1 text-xs ${roleColors[member.role]}`}>{roleLabels[member.role]}</span>
                            <span className={`rounded-full px-2.5 py-1 text-xs ${statusClasses[member.status]}`}>{member.status}</span>
                          </div>
                          <div className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /><span>{member.email}</span></div>
                            {member.lastAccess ? <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /><span>Last access: {member.lastAccess}</span></div> : null}
                            {member.vendorCount !== undefined ? <div className="flex items-center gap-2"><Users className="h-3.5 w-3.5" /><span>{member.vendorCount} vendors managed</span></div> : null}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingId(member.id)}><Edit className="mr-2 h-4 w-4" />Edit</Button>
                        <Button variant="outline" size="sm" onClick={() => handleRevokeAccess(member.id)} className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/20"><X className="mr-2 h-4 w-4" />Revoke</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PanelCard>
          <PanelCard title="Access workflow notes" description="Keep the team roster tight and role-based.">
            <div className="space-y-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
              <p>Assign access based on a documented role, not convenience. The RACI matrix should justify each level of access granted here.</p>
              {!showAddForm ? (
                <p>Open <strong className="font-medium text-gray-800 dark:text-gray-200">Add member</strong> only when role ownership and required permissions are clear. Default permissions follow the role; refine them on the Permissions tab.</p>
              ) : null}
              {editingId ? (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300">
                  Editing member: {members.find((member) => member.id === editingId)?.name}
                </p>
              ) : null}
              {showAddForm ? (
                <form onSubmit={handleAddMember} className="rounded-2xl border border-gray-200/70 p-4 dark:border-gray-800">
                  <div className="text-sm font-medium text-gray-950 dark:text-white">Invite team member</div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    New members receive default permissions for their role. Adjust checks on the Permissions tab after they are added.
                  </p>
                  <div className="mt-4 space-y-3">
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Full name</span>
                      <input
                        value={newName}
                        onChange={(e) => { setNewName(e.target.value); setAddMemberError(null); }}
                        className={fieldClass}
                        placeholder="e.g. Jamie Ortiz"
                        autoComplete="name"
                        aria-invalid={!!addMemberError && !newName.trim()}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Work email</span>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => { setNewEmail(e.target.value); setAddMemberError(null); }}
                        className={fieldClass}
                        placeholder="name@company.com"
                        autoComplete="email"
                        aria-invalid={!!addMemberError}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Role</span>
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value as TeamMember['role'])}
                        className={fieldClass}
                        aria-label="Member role"
                      >
                        {Object.entries(roleLabels).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Initial status</span>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as TeamMember['status'])}
                        className={fieldClass}
                        aria-label="Initial access status"
                      >
                        <option value="pending">Pending (invited)</option>
                        <option value="active">Active</option>
                      </select>
                    </label>
                  </div>
                  {addMemberError ? (
                    <p className="mt-3 text-xs font-medium text-red-600 dark:text-red-400" role="alert">{addMemberError}</p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button type="submit" variant="primary" size="sm">Add to roster</Button>
                    <Button type="button" variant="outline" size="sm" onClick={closeAddForm}>Cancel</Button>
                  </div>
                </form>
              ) : null}
            </div>
          </PanelCard>
        </div>
      )}

      {activeTab === 'permissions' && (
        <PanelCard title="Permission coverage" description="Review permission distribution by person and by control family.">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              {members.map((member) => (
                <div key={member.id} className="rounded-2xl border border-gray-200/70 p-5 dark:border-gray-800">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-gray-950 dark:text-white">{member.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{roleLabels[member.role]}</div>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs ${statusClasses[member.status]}`}>{member.status}</span>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {availablePermissions.map((permission) => {
                      const granted = member.permissions.includes(permission.id);
                      return (
                        <label key={permission.id} className="flex items-center gap-3 rounded-xl border border-gray-200/70 px-3 py-2 text-sm dark:border-gray-800">
                          <input type="checkbox" checked={granted} onChange={(e) => handlePermissionChange(member.id, permission.id, e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-gray-700 dark:text-gray-300">{permission.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-200/70 p-4 dark:border-gray-800">
                <div className="text-sm font-medium text-gray-950 dark:text-white">Category coverage</div>
                <div className="mt-3 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  {Array.from(new Set(availablePermissions.map((permission) => permission.category))).map((category) => {
                    const count = availablePermissions.filter((permission) => permission.category === category).length;
                    return <div key={category} className="flex items-center justify-between"><span className="capitalize">{category}</span><span>{count} permissions</span></div>;
                  })}
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200/70 p-4 dark:border-gray-800 text-sm leading-6 text-gray-600 dark:text-gray-300">
                Permissions in this workspace should remain tied to actual operating roles. Avoid giving administrative access just to bypass process friction.
              </div>
            </div>
          </div>
        </PanelCard>
      )}

      {activeTab === 'activity' && (
        <PanelCard title="Activity log" description="Surface accountability and failed access attempts in the same governance view.">
          <div className="space-y-3">
            {accessLogs.map((log, index) => (
              <div key={index} className="flex flex-col gap-3 rounded-2xl border border-gray-200/70 p-4 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-medium text-gray-950 dark:text-white">{log.member}</div>
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">{log.action}</div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{log.timestamp}</div>
                </div>
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs ${log.result === 'Success' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'}`}>{log.result}</span>
              </div>
            ))}
          </div>
        </PanelCard>
      )}
    </WorkspacePageShell>
  );
}
