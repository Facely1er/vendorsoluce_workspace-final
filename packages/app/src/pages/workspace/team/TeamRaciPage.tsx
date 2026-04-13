import { useMemo, useState } from 'react';
import { ShieldCheck, FileSearch, Scale, Package, UserCog, Eye } from 'lucide-react';
import WorkspacePageShell from '../../../components/vendorsoluce-intelligence/WorkspacePageShell';
import PanelCard from '../../../components/vendorsoluce-intelligence/PanelCard';

type RaciValue = 'R' | 'A' | 'C' | 'I';

interface RaciEntry {
  activity: string;
  category: string;
  vendorRiskManager: RaciValue;
  procurement: RaciValue;
  legal: RaciValue;
  ciso: RaciValue;
  businessOwner: RaciValue;
  executiveSponsor?: RaciValue;
}

const raciMatrix: RaciEntry[] = [
  { activity: 'Vendor Onboarding Risk Assessment', category: 'Onboarding', vendorRiskManager: 'R', procurement: 'A', legal: 'C', ciso: 'C', businessOwner: 'I', executiveSponsor: 'I' },
  { activity: 'SBOM Collection & Analysis', category: 'Onboarding', vendorRiskManager: 'R', procurement: 'C', legal: 'I', ciso: 'A', businessOwner: 'I', executiveSponsor: 'I' },
  { activity: 'Contract Security Requirements Review', category: 'Onboarding', vendorRiskManager: 'C', procurement: 'R', legal: 'A', ciso: 'C', businessOwner: 'I', executiveSponsor: 'I' },
  { activity: 'Periodic Vendor Risk Re-assessment', category: 'Assessment', vendorRiskManager: 'R', procurement: 'I', legal: 'I', ciso: 'A', businessOwner: 'C', executiveSponsor: 'I' },
  { activity: 'Security Questionnaire Review', category: 'Assessment', vendorRiskManager: 'R', procurement: 'C', legal: 'I', ciso: 'A', businessOwner: 'C', executiveSponsor: 'I' },
  { activity: 'Supply Chain Risk Analysis', category: 'Assessment', vendorRiskManager: 'R', procurement: 'C', legal: 'C', ciso: 'A', businessOwner: 'I', executiveSponsor: 'I' },
  { activity: 'Fourth-Party Risk Identification', category: 'Assessment', vendorRiskManager: 'R', procurement: 'I', legal: 'I', ciso: 'A', businessOwner: 'C', executiveSponsor: 'I' },
  { activity: 'Vendor Risk Policy Development', category: 'Governance', vendorRiskManager: 'R', procurement: 'C', legal: 'R', ciso: 'C', businessOwner: 'I', executiveSponsor: 'A' },
  { activity: 'Vendor Classification & Tiering', category: 'Governance', vendorRiskManager: 'A', procurement: 'R', legal: 'I', ciso: 'C', businessOwner: 'C', executiveSponsor: 'I' },
  { activity: 'Risk Appetite Definition', category: 'Governance', vendorRiskManager: 'C', procurement: 'I', legal: 'C', ciso: 'C', businessOwner: 'I', executiveSponsor: 'A' },
  { activity: 'Vendor Remediation Planning', category: 'Remediation', vendorRiskManager: 'A', procurement: 'C', legal: 'I', ciso: 'R', businessOwner: 'C', executiveSponsor: 'I' },
  { activity: 'Issue Tracking & Follow-up', category: 'Remediation', vendorRiskManager: 'R', procurement: 'C', legal: 'I', ciso: 'A', businessOwner: 'I', executiveSponsor: 'I' },
  { activity: 'Escalation for High-Risk Vendors', category: 'Remediation', vendorRiskManager: 'R', procurement: 'C', legal: 'C', ciso: 'C', businessOwner: 'I', executiveSponsor: 'A' },
  { activity: 'Vendor Incident Notification', category: 'Incident', vendorRiskManager: 'A', procurement: 'I', legal: 'C', ciso: 'R', businessOwner: 'I', executiveSponsor: 'I' },
  { activity: 'Supply Chain Breach Response', category: 'Incident', vendorRiskManager: 'C', procurement: 'I', legal: 'A', ciso: 'R', businessOwner: 'C', executiveSponsor: 'I' },
  { activity: 'Executive Risk Reporting', category: 'Reporting', vendorRiskManager: 'R', procurement: 'I', legal: 'I', ciso: 'C', businessOwner: 'I', executiveSponsor: 'A' },
  { activity: 'Compliance Audit Support', category: 'Reporting', vendorRiskManager: 'R', procurement: 'C', legal: 'A', ciso: 'C', businessOwner: 'I', executiveSponsor: 'I' },
];

const roles = [
  { key: 'vendorRiskManager', name: 'Risk Mgr', fullName: 'Vendor Risk Manager', icon: ShieldCheck, color: 'text-blue-600 dark:text-blue-400' },
  { key: 'procurement', name: 'Procurement', fullName: 'Procurement', icon: Package, color: 'text-orange-600 dark:text-orange-400' },
  { key: 'legal', name: 'Legal', fullName: 'Legal Counsel', icon: Scale, color: 'text-purple-600 dark:text-purple-400' },
  { key: 'ciso', name: 'CISO', fullName: 'CISO / Security', icon: Eye, color: 'text-red-600 dark:text-red-400' },
  { key: 'businessOwner', name: 'Biz Owner', fullName: 'Business Owner', icon: UserCog, color: 'text-green-600 dark:text-green-400' },
  { key: 'executiveSponsor', name: 'Executive', fullName: 'Executive Sponsor', icon: FileSearch, color: 'text-indigo-600 dark:text-indigo-400' },
] as const;

const raciDefinitions = {
  R: 'Responsible — Does the work',
  A: 'Accountable — Signs off',
  C: 'Consulted — Provides input',
  I: 'Informed — Kept up-to-date',
};

const getRaciColor = (value: RaciValue) => {
  switch (value) {
    case 'R': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 font-bold';
    case 'A': return 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300 font-bold';
    case 'C': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300';
    case 'I': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
  }
};

const categories = ['all', 'Onboarding', 'Assessment', 'Governance', 'Remediation', 'Incident', 'Reporting'];

export default function TeamRaciPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filtered = useMemo(() => selectedCategory === 'all' ? raciMatrix : raciMatrix.filter((e) => e.category === selectedCategory), [selectedCategory]);

  const handleExport = () => {
    const header = ['Activity', 'Category', ...roles.map((r) => r.fullName)].join(',');
    const rows = raciMatrix.map((entry) => [`"${entry.activity}"`, entry.category, ...roles.map((r) => entry[r.key as keyof RaciEntry] || '')].join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vendorsoluce-raci-matrix.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <WorkspacePageShell
      title="Team RACI matrix"
      description="Define ownership across onboarding, assessments, and governance."
      actions={[{ label: 'Export CSV', onClick: handleExport, variant: 'outline' }]}
      stats={[
        { label: 'Activities', value: raciMatrix.length, hint: 'Tracked governance and operating tasks' },
        { label: 'Roles', value: roles.length, hint: 'Core stakeholders represented in the matrix' },
        { label: 'Selected scope', value: selectedCategory === 'all' ? 'All' : selectedCategory, hint: 'Current filter applied to the matrix' },
      ]}
    >
      <PanelCard title="RACI definitions" description="Use the same responsibility language across governance pages, collaborative assessments, and execution workflows.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(raciDefinitions).map(([key, def]) => (
            <div key={key} className="flex items-start gap-3 rounded-2xl border border-gray-200/70 p-4 dark:border-gray-800">
              <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm ${getRaciColor(key as RaciValue)}`}>{key}</span>
              <span className="text-sm leading-6 text-gray-600 dark:text-gray-300">{def}</span>
            </div>
          ))}
        </div>
      </PanelCard>

      <PanelCard title="Matrix view" description="Filter by operating category without changing the page structure or losing responsibility context.">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition ${selectedCategory === cat ? 'bg-emerald-600 text-white shadow-sm' : 'border border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:bg-emerald-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/20'}`}
              >
                {cat === 'all' ? 'All activities' : cat}
              </button>
            ))}
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200/70 dark:border-gray-800">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 dark:bg-gray-900/60">
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 min-w-[240px]">Activity</th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Category</th>
                    {roles.map((role) => (
                      <th key={role.key} className="min-w-[92px] p-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <role.icon className={`h-5 w-5 ${role.color}`} />
                          <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{role.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
                  {filtered.map((entry, index) => (
                    <tr key={index} className="hover:bg-gray-50/70 dark:hover:bg-gray-900/40">
                      <td className="p-3 text-sm font-medium text-gray-950 dark:text-white">{entry.activity}</td>
                      <td className="p-3"><span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">{entry.category}</span></td>
                      {roles.map((role) => {
                        const val = entry[role.key as keyof RaciEntry] as RaciValue | undefined;
                        return (
                          <td key={role.key} className="p-3 text-center">
                            {val ? <span className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm ${getRaciColor(val)}`}>{val}</span> : <span className="text-xs text-gray-300 dark:text-gray-600">—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </PanelCard>
    </WorkspacePageShell>
  );
}
