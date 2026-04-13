import React from 'react';
import { Database, ShieldCheck, ArrowRight, ExternalLink, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import WorkspacePageShell from '../../components/vendorsoluce-intelligence/WorkspacePageShell';

/**
 * Data Inventory entry point for VendorSoluce.
 * Vendor-scoped: tracks data shared with or processed by vendors.
 * Full organisational data inventory lives in CyberCorrect.
 * Feature flag: PRIVACY_COMPLIANCE
 */

const sections = [
  {
    icon: Package,
    title: 'Third-Party Vendor Data Flows',
    description:
      'Identify personal data processed by third-party vendors and libraries. Manage vendor data sharing agreements.',
    href: '/vendors',
    cta: 'Open Vendor Portfolio',
    internal: true,
  },
  {
    icon: ShieldCheck,
    title: 'Vendor Data Processing Records',
    description:
      'Record what personal data each vendor processes, under what legal basis, and in which geographies.',
    href: '/vendors',
    cta: 'View Vendor Register',
    internal: true,
  },
  {
    icon: Database,
    title: 'Full Data Inventory (CyberCorrect)',
    description:
      'Maintain a complete Record of Processing Activities (RoPA) across all systems, with sensitivity ratings, retention schedules, and sub-processor mapping.',
    href: 'https://cybercorrect.app/toolkit/data-flow-mapper',
    cta: 'Open CyberCorrect',
    internal: false,
  },
];

export default function DataInventory() {
  return (
    <WorkspacePageShell
      title="Data Inventory"
      description="Track the personal data that flows through your vendor ecosystem — what is shared, with whom, where it is stored, and under what legal basis."
    >
      <div className="max-w-3xl space-y-4">
        {sections.map(({ icon: Icon, title, description, href, cta, internal }) => (
          <div
            key={title}
            className="flex gap-5 rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-sm transition-all duration-200"
          >
            <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10 h-fit">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold mb-1">{title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{description}</p>
              {internal ? (
                <Link
                  to={href}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline underline-offset-2"
                >
                  {cta} <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline underline-offset-2"
                >
                  {cta} <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </WorkspacePageShell>
  );
}
