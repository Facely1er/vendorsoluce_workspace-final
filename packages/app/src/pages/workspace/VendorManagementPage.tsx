import React, { useEffect, useMemo, useState } from 'react';
import { Building, Eye, Edit, RefreshCw, Search, Trash2, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import VendorVerification from '../../components/vendor/VendorVerification';
import type { VendorProfile } from '../../services/vendorService';
import WorkspacePageShell from '../../components/vendorsoluce-intelligence/WorkspacePageShell';
import PanelCard from '../../components/vendorsoluce-intelligence/PanelCard';
import { logger } from '../../utils/logger';

interface VendorStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  averageRiskScore: number;
  complianceBreakdown: { compliant: number; 'non-compliant': number; partial: number };
}

const VendorManagementPage: React.FC = () => {
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [selectedVendor, setSelectedVendor] = useState<VendorProfile | null>(null);
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadVendors();
    loadStats();
  }, []);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const mockVendors: VendorProfile[] = [
        { id: '1', company_name: 'TechCorp Solutions', legal_name: 'TechCorp Solutions Inc.', website: 'https://techcorp.com', industry: 'Technology', company_size: 'large', founded_year: 2010, headquarters: 'San Francisco, CA, USA', description: 'Leading technology solutions provider', status: 'pending', risk_score: 75, compliance_status: 'compliant', created_at: '2024-01-15T10:00:00Z', updated_at: '2024-01-15T10:00:00Z', user_id: 'user-1' },
        { id: '2', company_name: 'SecureData Ltd', legal_name: 'SecureData Limited', website: 'https://securedata.com', industry: 'Cybersecurity', company_size: 'medium', founded_year: 2015, headquarters: 'London, UK', description: 'Cybersecurity and data protection services', status: 'approved', risk_score: 85, compliance_status: 'compliant', created_at: '2024-01-10T14:30:00Z', updated_at: '2024-01-12T09:15:00Z', user_id: 'user-2' },
        { id: '3', company_name: 'CloudSoft Inc', legal_name: 'CloudSoft Incorporated', website: 'https://cloudsoft.com', industry: 'Cloud Services', company_size: 'small', founded_year: 2020, headquarters: 'Austin, TX, USA', description: 'Cloud infrastructure and software services', status: 'rejected', risk_score: 45, compliance_status: 'non-compliant', created_at: '2024-01-08T16:45:00Z', updated_at: '2024-01-09T11:20:00Z', user_id: 'user-3' },
      ];
      setVendors(mockVendors);
    } catch (error) { logger.error('Error loading vendors:', error); }
    finally { setLoading(false); }
  };

  const loadStats = async () => {
    try {
      setStats({ total: 25, pending: 8, approved: 15, rejected: 2, averageRiskScore: 72.5, complianceBreakdown: { compliant: 15, 'non-compliant': 5, partial: 5 } });
    } catch (error) { logger.error('Error loading stats:', error); }
  };

  const filteredVendors = useMemo(() => vendors.filter((vendor) => {
    const matchesSearch = vendor.company_name.toLowerCase().includes(searchTerm.toLowerCase()) || vendor.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
    const matchesIndustry = industryFilter === 'all' || vendor.industry === industryFilter;
    return matchesSearch && matchesStatus && matchesIndustry;
  }), [vendors, searchTerm, statusFilter, industryFilter]);

  const paginatedVendors = filteredVendors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300';
      case 'rejected': return 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950/40 dark:text-red-300';
      case 'pending': return 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300';
      case 'under-review': return 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-300';
      default: return 'bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getRiskLevel = (score: number) => score >= 80 ? { level: 'Low', color: 'text-emerald-600 dark:text-emerald-400' } : score >= 60 ? { level: 'Medium', color: 'text-amber-600 dark:text-amber-400' } : { level: 'High', color: 'text-red-600 dark:text-red-400' };

  const handleVendorVerified = (vendorId: string, status: 'approved' | 'rejected') => {
    setVendors((prev) => prev.map((vendor) => (vendor.id === vendorId ? { ...vendor, status } : vendor)));
    setSelectedVendor(null);
  };

  if (selectedVendor) return <VendorVerification vendorId={selectedVendor.id} onVendorVerified={handleVendorVerified} />;

  if (loading) return <WorkspacePageShell eyebrow="VendorSoluce workspace" title="Vendor management" description="Review vendor intake, status, and verification decisions from one operational view."><PanelCard title="Loading vendor inventory"><div className="flex min-h-[240px] items-center justify-center"><div className="flex flex-col items-center gap-3 text-sm text-gray-500 dark:text-gray-400"><RefreshCw className="h-5 w-5 animate-spin" /><span>Loading vendor records…</span></div></div></PanelCard></WorkspacePageShell>;

  return (
    <WorkspacePageShell
      eyebrow="VendorSoluce workspace"
      title="Vendor management"
      description="Operate your vendor portfolio with a cleaner review surface for search, verification status, and risk context."
      actions={[{ label: 'Refresh', onClick: loadVendors, variant: 'outline' }, { label: 'Add vendor', onClick: () => logger.log('Add vendor action'), variant: 'primary' }]}
      stats={stats ? [{ label: 'Total vendors', value: stats.total, hint: 'Tracked in the workspace portfolio' }, { label: 'Pending review', value: stats.pending, hint: 'Awaiting verification or decision' }, { label: 'Approved', value: stats.approved, hint: 'Active and accepted' }, { label: 'Average risk score', value: stats.averageRiskScore, hint: 'Current portfolio baseline' }] : []}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <PanelCard title={`Vendor registry (${filteredVendors.length})`} description="Search, filter, and review vendors without switching layouts or losing portfolio context.">
          <div className="space-y-5">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
              <label className="relative block"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search vendors or industries" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-emerald-400 dark:border-gray-800 dark:bg-gray-950 dark:text-white" /></label>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} aria-label="Filter by status" className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-emerald-400 dark:border-gray-800 dark:bg-gray-950 dark:text-white"><option value="all">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="under-review">Under review</option></select>
              <select value={industryFilter} onChange={(e) => { setIndustryFilter(e.target.value); setCurrentPage(1); }} aria-label="Filter by industry" className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-emerald-400 dark:border-gray-800 dark:bg-gray-950 dark:text-white"><option value="all">All industries</option><option value="Technology">Technology</option><option value="Cybersecurity">Cybersecurity</option><option value="Cloud Services">Cloud Services</option><option value="Healthcare">Healthcare</option><option value="Financial">Financial</option></select>
            </div>
            <div className="overflow-hidden rounded-2xl border border-gray-200/70 dark:border-gray-800"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800"><thead className="bg-gray-50/80 dark:bg-gray-900/60"><tr>{['Company', 'Industry', 'Status', 'Risk', 'Compliance', 'Created', 'Actions'].map((heading, i) => <th key={heading} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 ${i === 6 ? 'text-right' : 'text-left'}`}>{heading}</th>)}</tr></thead><tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">{paginatedVendors.map((vendor) => { const riskLevel = vendor.risk_score ? getRiskLevel(vendor.risk_score) : null; return <tr key={vendor.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-900/50"><td className="px-4 py-4 align-top"><div className="min-w-[220px]"><div className="font-medium text-gray-950 dark:text-white">{vendor.company_name}</div><div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{vendor.headquarters}</div></div></td><td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">{vendor.industry}</td><td className="px-4 py-4"><Badge className={`ring-1 ring-inset ${getStatusColor(vendor.status)}`}>{vendor.status}</Badge></td><td className="px-4 py-4">{vendor.risk_score ? <div><div className={`text-sm font-semibold ${riskLevel?.color}`}>{vendor.risk_score}</div><div className="text-xs text-gray-500 dark:text-gray-400">{riskLevel?.level} risk</div></div> : <span className="text-sm text-gray-500 dark:text-gray-400">Not assessed</span>}</td><td className="px-4 py-4"><Badge className={`ring-1 ring-inset ${getStatusColor(vendor.compliance_status)}`}>{vendor.compliance_status}</Badge></td><td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">{new Date(vendor.created_at).toLocaleDateString()}</td><td className="px-4 py-4"><div className="flex items-center justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => setSelectedVendor(vendor)}><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="sm" onClick={() => logger.log('Edit vendor', vendor.id)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => logger.log('Delete vendor', vendor.id)}><Trash2 className="h-4 w-4" /></Button></div></td></tr>; })}</tbody></table></div></div>
            {filteredVendors.length > itemsPerPage && <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between"><div>Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredVendors.length)} of {filteredVendors.length} vendors</div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1}>Previous</Button><Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => prev + 1)} disabled={currentPage * itemsPerPage >= filteredVendors.length}>Next</Button></div></div>}
          </div>
        </PanelCard>
        <div className="space-y-6">
          <PanelCard title="Portfolio signals" description="Keep the review queue and risk posture visible while operating vendor workflows."><div className="grid gap-3"><Card className="rounded-xl border border-gray-200/70 shadow-none dark:border-gray-800"><CardContent className="flex items-center gap-3 p-4"><div className="rounded-xl bg-emerald-50 p-2.5 dark:bg-emerald-950/40"><Building className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div><div><div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Active records</div><div className="text-lg font-semibold text-gray-950 dark:text-white">{vendors.length}</div></div></CardContent></Card><Card className="rounded-xl border border-gray-200/70 shadow-none dark:border-gray-800"><CardContent className="flex items-center gap-3 p-4"><div className="rounded-xl bg-amber-50 p-2.5 dark:bg-amber-950/40"><AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" /></div><div><div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Pending decisions</div><div className="text-lg font-semibold text-gray-950 dark:text-white">{stats?.pending ?? 0}</div></div></CardContent></Card><Card className="rounded-xl border border-gray-200/70 shadow-none dark:border-gray-800"><CardContent className="flex items-center gap-3 p-4"><div className="rounded-xl bg-purple-50 p-2.5 dark:bg-purple-950/40"><TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" /></div><div><div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Average score</div><div className="text-lg font-semibold text-gray-950 dark:text-white">{stats?.averageRiskScore ?? '—'}</div></div></CardContent></Card></div></PanelCard>
          <PanelCard title="Operational guidance" description="Use this page for verification and disposition. Use the intelligence views for dependency-driven cascade analysis."><div className="space-y-3 text-sm text-gray-600 dark:text-gray-300"><p>Verification decisions made here should stay consistent with the graph-backed intelligence records introduced in the portfolio and detail views.</p><p>Keep vendor naming normalized before import so identity joins remain stable across assessment, graph, and reporting modules.</p><div className="flex gap-2 pt-2"><Button variant="outline" size="sm" onClick={() => logger.log('Go to intelligence portfolio')}>Open intelligence portfolio</Button><Button variant="outline" size="sm" onClick={loadVendors}><RefreshCw className="mr-2 h-4 w-4" />Refresh data</Button></div></div></PanelCard>
        </div>
      </div>
    </WorkspacePageShell>
  );
};

export default VendorManagementPage;
