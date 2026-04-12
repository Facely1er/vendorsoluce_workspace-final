import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart2, Shield, FileText, Database, CheckCircle, ArrowRight, AlertCircle,
  ChevronDown, ChevronUp, Users, Lock, Zap, Package, Layers,
} from 'lucide-react';
import { usePortalSEO } from '../../hooks/usePortalSEO';
import { RISK_SCORING_DIMENSIONS, SBOM_CAPABILITIES } from '../../data/portalFrameworkData';

// ─── Risk tier table ───────────────────────────────────────────────────────────

const TIERS = [
  {
    tier: 'Critical', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    examples: 'Cloud infrastructure, identity providers, core business SaaS',
    mode: 'Full assessment', domains: '8–12 domains', cycle: 'Annual',
  },
  {
    tier: 'High', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    examples: 'Managed services, data processors, in-scope sub-processors',
    mode: 'Full assessment', domains: '6–8 domains', cycle: 'Annual',
  },
  {
    tier: 'Medium', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    examples: 'Professional services with limited data access, SaaS (non-critical)',
    mode: 'Light assessment', domains: '4–6 domains', cycle: 'Biennial',
  },
  {
    tier: 'Low', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    examples: 'Office supplies, non-digital services, isolated tools',
    mode: 'Self-declaration or evidence request', domains: '1–3 domains', cycle: 'As needed',
  },
];

// ─── FAQ accordion ─────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: 'Can I define custom control sets instead of using the generated defaults?',
    a: 'Yes. The platform generates a default control list from the risk tier mapping, but buyers can add, remove, or substitute controls before sending the assessment. Removed controls are logged with a rationale field for audit purposes.',
  },
  {
    q: 'How is the evidence vault different from just receiving files by email?',
    a: 'Evidence is attached to the specific control it satisfies, stored per-vendor per-assessment, and tracked for expiry. Gaps are surfaced automatically. Email attachments have no structure — finding which document covered which control two years later is not practical.',
  },
  {
    q: 'What happens if a vendor does not respond?',
    a: 'The platform tracks response status and sends configurable reminder notifications. You can view open/overdue assessments in the dashboard and escalate from there. If the deadline passes, the assessment is marked overdue and the risk record reflects that.',
  },
  {
    q: 'Can I request additional evidence on a specific control after review?',
    a: 'Yes. After reviewing a vendor submission, buyers can flag individual controls as "insufficient evidence" and request a targeted re-upload. The vendor receives a focused evidence request — only the specific document needed, not a new full questionnaire.',
  },
  {
    q: 'Is assessment data shared between buyer organizations?',
    a: 'No. Vendor assessment data is scoped to your organization. If two different buyers assess the same vendor, neither can see the other\'s data or responses. The vendor\'s evidence is stored per-buyer.',
  },
];

const FAQItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-medium text-gray-900 dark:text-white pr-4">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 bg-white dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const PortalForBuyers: React.FC = () => {
  usePortalSEO({
    title: 'For Buyers & Security Teams',
    description: 'Structured vendor due diligence workflow — risk scoring, framework-aligned assessments, evidence vault, and gap tracking for security teams.',
    path: '/for-buyers',
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">

      {/* Header */}
      <section className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-medium mb-4">
            <Users className="w-3 h-3" /> For buyers and security teams
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Structured vendor due diligence — without the spreadsheet
          </h1>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base">
            Define what you need from each vendor based on actual risk. Send structured assessments. Collect evidence in one place.
            Identify and track gaps — not just once, but as part of an ongoing vendor risk program.
          </p>
        </div>
      </section>

      {/* Core workflow */}
      <section className="py-12 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Your workflow</h2>
          <div className="space-y-6">
            {[
              {
                icon: BarChart2, iconColor: 'text-blue-600', iconBg: 'bg-blue-50 dark:bg-blue-900/20',
                step: '1', title: 'Score vendor risk',
                body: `Evaluate each vendor across four dimensions: service category, data access level, operational criticality, and compliance scope. The scoring model maps your inputs to a risk tier (Critical, High, Medium, Low) aligned with NIST SP 800-161.

You can input service types when adding a vendor — for example, "cloud data storage, financial data, 24/7 operational dependency" — and the platform derives the tier and suggests the appropriate control set.`,
              },
              {
                icon: Shield, iconColor: 'text-vendorsoluce-green', iconBg: 'bg-vendorsoluce-pale-green dark:bg-vendorsoluce-green/20',
                step: '2', title: 'Review and adjust requirements',
                body: `The platform generates a prioritized list of security controls for the vendor's risk tier. You review the list, adjust if needed (e.g. remove controls outside scope, add sector-specific ones), then confirm.

Frameworks supported: NIST SP 800-161 r1, CMMC Level 2, ISO/IEC 27001, SOC 2 Type II. Custom control libraries can be added.`,
              },
              {
                icon: Lock, iconColor: 'text-purple-600', iconBg: 'bg-purple-50 dark:bg-purple-900/20',
                step: '3', title: 'Send via portal link',
                body: `A unique, time-limited portal URL is generated for the vendor contact. No vendor account, no portal subscription required. They receive an email, open the portal, enter the assessment ID, and complete the questionnaire.

You can monitor status in real time from the platform dashboard.`,
              },
              {
                icon: Database, iconColor: 'text-orange-600', iconBg: 'bg-orange-50 dark:bg-orange-900/20',
                step: '4', title: 'Review evidence — close gaps',
                body: `Once submitted, vendor responses and supporting documents appear in the evidence vault, mapped to the controls they satisfy. Each control shows its status: documented, insufficient, pending, or accepted.

Flag controls as insufficient and issue a targeted evidence request — the vendor receives a focused request for the one document you need, without repeating the full assessment.`,
              },
            ].map(({ icon: Icon, iconColor, iconBg, step, title, body }) => (
              <div key={step} className="flex gap-5">
                <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-medium text-gray-400">Step {step}</span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed space-y-2">
                    {body.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Risk tier table */}
      <section className="py-12 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Risk tiers and assessment modes</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Each tier maps to a proportionate assessment mode. Not every vendor needs a full questionnaire.
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Tier</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Typical vendor examples</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Default mode</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Cycle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                {TIERS.map(({ tier, color, examples, mode, cycle }) => (
                  <tr key={tier}>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>{tier}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{examples}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-xs font-medium">{mode}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{cycle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            Tiers, modes, and review cycles are configurable per organization. Defaults align with NIST SP 800-161 r1 recommended practices.
          </p>
        </div>
      </section>

      {/* Evidence vault */}
      <section className="py-12 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Evidence vault</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            All documents submitted by vendors are organized in the vault — not in an email folder or shared drive.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: FileText, label: 'Control-mapped storage',
                desc: 'Each document is attached to the control it satisfies, not just a folder per vendor.',
              },
              {
                icon: AlertCircle, label: 'Gap tracking',
                desc: 'Controls with missing or insufficient evidence are flagged automatically. No manual audit required.',
              },
              {
                icon: Zap, label: 'Targeted re-requests',
                desc: 'Request one specific document without repeating the full assessment.',
              },
              {
                icon: CheckCircle, label: 'Expiry tracking',
                desc: 'ISO certificates, audit reports, and policies have validity periods. The vault tracks and alerts on expiry.',
              },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-800">
                <Icon className="w-5 h-5 text-vendorsoluce-green mb-3" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{label}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How risk tiers are derived */}
      <section className="py-12 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-5 h-5 text-vendorsoluce-green" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">How risk tiers are derived</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Risk tiers are computed from a weighted scoring model. Each vendor is evaluated across {RISK_SCORING_DIMENSIONS.length} dimensions.
            Dimension scores are multiplied by their weight, summed, and normalized to a 0–100 scale.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
            Methodology aligned with <span className="font-medium text-gray-700 dark:text-gray-300">NIST SP 800-161 r1 Section 2.2</span> — Cybersecurity Supply Chain Risk Assessment.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {RISK_SCORING_DIMENSIONS.map(({ name, weight, description, examples }) => (
              <div key={name} className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{name}</h3>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                    Weight: {weight}×
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{description}</p>
                <ul className="space-y-1">
                  {examples.map((ex) => (
                    <li key={ex} className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1.5">
                      <span className="text-gray-300 dark:text-gray-600 mt-0.5">•</span>
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Score thresholds</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { tier: 'Critical', range: '≥ 80', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
                { tier: 'High', range: '60 – 79', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
                { tier: 'Medium', range: '40 – 59', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
                { tier: 'Low', range: '< 40', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
              ].map(({ tier, range, color }) => (
                <div key={tier} className="text-center">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${color} mb-1`}>{tier}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{range}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              Composite scores are on a 0–100 scale. Thresholds are configurable per organization.
            </p>
          </div>
        </div>
      </section>

      {/* Supply chain transparency */}
      <section className="py-12 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-vendorsoluce-green" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Supply chain transparency</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Executive Order 14028 (May 2021) mandates software supply chain security for federal suppliers. The NTIA published
            minimum elements every SBOM must contain. The platform operationalizes both requirements.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
            See how these capabilities map to supported frameworks on the{' '}
            <Link to="/frameworks" className="text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline">frameworks page</Link>.
          </p>

          <div className="space-y-4">
            {SBOM_CAPABILITIES.map(({ title, description, standard }) => (
              <div key={title} className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-2">{description}</p>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  <FileText className="w-3 h-3" /> {standard}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Common questions</h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map(({ q, a }) => <FAQItem key={q} q={q} a={a} />)}
          </div>
        </div>
      </section>

      {/* CTAs */}
      <section className="py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap gap-4 items-center">
          <a
            href="https://www.platform.vendorsoluce.com/signin"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-vendorsoluce-green text-white rounded-lg text-sm font-medium hover:bg-vendorsoluce-dark-green transition-colors"
          >
            Go to platform <ArrowRight className="w-4 h-4" />
          </a>
          <Link to="/demo" className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Try interactive demo <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/security" className="text-sm text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline">
            Security & privacy approach →
          </Link>
          <Link to="/frameworks" className="text-sm text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline">
            Supported frameworks →
          </Link>
        </div>
      </section>

    </div>
  );
};

export default PortalForBuyers;
