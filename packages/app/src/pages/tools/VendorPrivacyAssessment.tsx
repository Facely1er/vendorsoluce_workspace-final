import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileSearch, Users, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react';

/**
 * Vendor Privacy Assessment hub for VendorSoluce.
 * Guides users through assessing a vendor's privacy posture:
 * data processor obligations, sub-processor risk, GDPR transfers.
 * Feature flag: PRIVACY_COMPLIANCE
 */

const steps = [
  {
    step: '01',
    icon: FileSearch,
    title: 'Vendor Security Assessment',
    description:
      'Start with a full vendor security assessment to establish baseline risk before evaluating privacy-specific controls.',
    href: '/vendor-assessments',
    cta: 'Start Assessment',
  },
  {
    step: '02',
    icon: ShieldCheck,
    title: 'Supply Chain Risk',
    description:
      'Evaluate supply chain risks including sub-processors, data sharing agreements, and third-party dependencies.',
    href: '/supply-chain-assessment',
    cta: 'Run Supply Chain Check',
  },
  {
    step: '03',
    icon: Users,
    title: 'Vendor Requirements',
    description:
      'Define and track contractual privacy requirements — DPA clauses, SCCs, data deletion obligations.',
    href: '/vendor-requirements',
    cta: 'Define Requirements',
  },
  {
    step: '04',
    icon: AlertTriangle,
    title: 'DPIA for Vendor Processing',
    description:
      'Generate a Data Protection Impact Assessment for this vendor engagement. Powered by CyberCorrect.',
    href: '/tools/dpia',
    cta: 'Create DPIA',
    internal: true,
  },
];

export default function VendorPrivacyAssessment() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-blue-500/10">
            <ShieldCheck className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Vendor Privacy Assessment</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          Assess a vendor's data privacy posture: processor obligations, sub-processor chain, cross-border
          transfers, and GDPR Article 28 compliance. Follow the steps below in order.
        </p>
      </div>

      <div className="space-y-4">
        {steps.map(({ step, icon: Icon, title, description, href, cta, internal: _internal }) => (
          <div
            key={step}
            className="flex gap-5 rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-sm transition-all duration-200"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{step}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                <h2 className="font-semibold text-sm">{title}</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{description}</p>
              <Link
                to={href}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline underline-offset-2"
              >
                {cta} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-muted/40 p-6">
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Need full GDPR compliance tooling?</strong>{' '}
          VendorSoluce focuses on vendor risk. For complete privacy program management — consent
          records, DSR tracking, breach notification — use{' '}
          <a
            href="https://cybercorrect.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:opacity-80 inline-flex items-center gap-1"
          >
            CyberCorrect <ExternalLink className="w-3 h-3" />
          </a>
          .
        </p>
      </div>
    </div>
  );
}
