import React from 'react';
import { Building } from 'lucide-react';
import { cn } from '../../utils/cn';
import { vendorOrgService } from '../../services/vendorOrgService';
import type { OrgMembership, ActiveOrg } from '../../services/vendorOrgService';

interface OrgSwitcherProps {
  className?: string;
}

const OrgSwitcher: React.FC<OrgSwitcherProps> = ({ className }) => {
  const [memberships, setMemberships] = React.useState<OrgMembership[]>(() =>
    vendorOrgService.getMemberships(),
  );
  const [activeOrg, setActiveOrg] = React.useState<ActiveOrg | null>(() =>
    vendorOrgService.getActiveOrg(),
  );

  React.useEffect(() => {
    void vendorOrgService.hydrateFromSupabase().then(() => {
      setMemberships(vendorOrgService.getMemberships());
      setActiveOrg(vendorOrgService.getActiveOrg());
    });
  }, []);

  if (memberships.length === 0) return null;

  if (memberships.length === 1) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300',
          className,
        )}
      >
        <Building className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" aria-hidden="true" />
        <span className="font-medium text-gray-900 dark:text-white">{memberships[0].orgName}</span>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = memberships.find((m) => m.orgId === e.target.value);
    if (!selected) return;
    const next: ActiveOrg = { orgId: selected.orgId, orgName: selected.orgName };
    vendorOrgService.setActiveOrg(next);
    setActiveOrg(next);
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        className,
      )}
    >
      <Building className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" aria-hidden="true" />
      <select
        value={activeOrg?.orgId ?? ''}
        onChange={handleChange}
        aria-label="Switch organization"
        className="rounded-xl border border-gray-200/70 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-900/60"
      >
        {memberships.map((m) => (
          <option key={m.orgId} value={m.orgId}>
            {m.orgName}
          </option>
        ))}
      </select>
    </div>
  );
};

export default OrgSwitcher;
