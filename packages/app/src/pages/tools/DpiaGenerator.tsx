import React from 'react';
import { FileText, ExternalLink, ArrowRight, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * DPIA Generator entry point for VendorSoluce.
 * VendorSoluce scopes DPIA to vendor processor relationships (Article 28/35).
 * Deep DPIA authoring is in CyberCorrect; this page bridges users to the right tool.
 * Feature flag: PRIVACY_COMPLIANCE
 */

const useCases = [
  {
    title: 'Processor DPIA — New Vendor Engagement',
    description:
      'Required when onboarding a new data processor that handles personal data on your behalf (GDPR Art. 28 + Art. 35).',
    action: 'Start Vendor Assessment first',
    href: '/tools/vendor-privacy-assessment',
    internal: true,
  },
  {
    title: 'Supply Chain Data Flows',
    description:
      'Map data flows through your vendor supply chain to identify where personal data leaves your control.',
    action: 'Run Supply Chain Assessment',
    href: '/supply-chain-assessment',
    internal: true,
  },
  {
    title: 'Full DPIA Authoring (CyberCorrect)',
    description:
      'Create, manage, and track DPIAs with risk matrices, mitigation plans, DPO review workflows, and automated scheduling.',
    action: 'Open CyberCorrect DPIA Tool',
    href: 'https://cybercorrect.app/toolkit/dpia-manager',
    internal: false,
  },
];

export default function DpiaGenerator() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-purple-500/10">
            <FileText className="w-7 h-7 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">DPIA Generator</h1>
        </div>
        <p className="text-muted-foreground max-w-xl leading-relaxed">
          A Data Protection Impact Assessment (DPIA) is required under GDPR Article 35 for high-risk
          processing activities. Select the scenario that matches your situation.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-4 mb-8">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800 dark:text-blue-300">
          VendorSoluce scopes DPIAs to{' '}
          <strong>vendor processor relationships</strong>. For organisation-wide DPIAs covering all
          processing activities, use CyberCorrect.
        </p>
      </div>

      <div className="space-y-4">
        {useCases.map(({ title, description, action, href, internal }) => (
          <div
            key={title}
            className="rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-sm transition-all duration-200"
          >
            <h2 className="font-semibold mb-2">{title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{description}</p>
            {internal ? (
              <Link
                to={href}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline underline-offset-2"
              >
                {action} <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline underline-offset-2"
              >
                {action} <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
