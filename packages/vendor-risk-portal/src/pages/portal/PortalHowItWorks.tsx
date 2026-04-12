import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Lock, FileText, BarChart2, CheckCircle, ArrowRight, Database, Zap, AlertCircle,
} from 'lucide-react';
import { usePortalSEO } from '../../hooks/usePortalSEO';
const STEPS = [
  {
    step: '01',
    actor: 'Buyer',
    actorColor: 'bg-blue-600',
    icon: BarChart2,
    title: 'Risk tier assessment',
    desc: `The buyer organization scores the vendor across four dimensions: service category (e.g. SaaS, infrastructure, professional services), data access level (PII, confidential, none), operational criticality (critical path vs. supplementary), and compliance scope (in-scope for ISO, CMMC, etc.).

From these inputs, the platform assigns a risk tier: Critical, High, Medium, or Low. This tier determines the assessment mode and the set of security controls expected.`,
    note: 'NIST SP 800-161 r1 maps each tier to a prioritized control subset, so requirements are proportionate to actual risk — not a single template applied uniformly.',
  },
  {
    step: '02',
    actor: 'Platform',
    actorColor: 'bg-vendorsoluce-green',
    icon: Shield,
    title: 'Requirements generated',
    desc: `Based on the risk tier, the platform generates a structured set of control expectations across relevant security domains: access management, cryptography, incident response, physical security, secure development, and more.

For Critical and High tiers, a full assessment is issued. Medium tiers may use a light assessment. For targeted gaps, buyers issue focused evidence requests — a single control, a single document.`,
    note: 'Buyers can review and adjust the generated control set before sending. The list of controls is visible to the vendor from the start, so they can prepare.',
  },
  {
    step: '03',
    actor: 'Buyer',
    actorColor: 'bg-blue-600',
    icon: Lock,
    title: 'Vendor invitation sent',
    desc: `A unique, time-limited URL is generated for the vendor contact. The portal link includes the assessment ID — vendors do not need to create an account or install anything.

The invitation email includes the assessment ID, a brief description of the scope and expected time, and a direct link to this portal.`,
    note: 'Links are valid for a configurable window (default: 30 days). Buyers can extend or revoke access at any time from the platform.',
  },
  {
    step: '04',
    actor: 'Vendor',
    actorColor: 'bg-orange-600',
    icon: FileText,
    title: 'Vendor completes assessment',
    desc: `The vendor opens the portal, enters the assessment ID, and works through the structured questionnaire. Each question shows the referenced control so the respondent understands what is being verified.

The vendor can upload supporting evidence per question (policies, certificates, audit reports), add free-text explanations, and flag items as "not applicable" with justification. Progress is saved automatically.`,
    note: 'For light mode, questions are replaced by assertion checkboxes. Vendors confirm yes/no with optional single document upload per domain — typically under 15 minutes.',
  },
  {
    step: '05',
    actor: 'Buyer',
    actorColor: 'bg-blue-600',
    icon: Database,
    title: 'Evidence reviewed — gaps tracked',
    desc: `Once submitted, the buyer reviews vendor responses in the evidence vault. Each control shows its status: documented, insufficient evidence, pending, or accepted. Gaps are tracked per control with the option to request additional evidence.

The platform generates a compliance PDF the vendor can download. The buyer dashboard shows gap distribution across the vendor portfolio.`,
    note: 'Evidence is stored per-vendor per-assessment. Buyers can accept, flag, or request re-submission at the control level.',
  },
  {
    step: '06',
    actor: 'Both',
    actorColor: 'bg-purple-600',
    icon: CheckCircle,
    title: 'Ongoing management',
    desc: `Assessments are not one-time events. The platform tracks expiry per assessment and re-sends invitations when evidence needs renewal. Buyers can set review cycles per risk tier (e.g. annual for High, biennial for Medium).

Vendors can reuse previously uploaded documents across assessment cycles, reducing the burden of repeat submissions.`,
    note: 'A vendor evidence profile builds over time — reducing the effort required for subsequent due diligence requests from any buyer on the platform.',
  },
];

const PortalHowItWorks: React.FC = () => {
  usePortalSEO({
    title: 'How It Works',
    description: 'The vendor risk assessment workflow — from initial risk scoring through evidence review — in six structured steps for both buyers and vendors.',
    path: '/how-it-works',
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">

      {/* Header */}
      <section className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">How it works</h1>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
            The vendor risk assessment workflow — from initial risk scoring to evidence review — in six steps.
            Both buyers and vendors have a defined, structured role at each stage.
          </p>
          <div className="flex justify-center">
            <Link to="/demo" className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-vendorsoluce-green dark:border-vendorsoluce-light-green text-vendorsoluce-green dark:text-vendorsoluce-light-green rounded-lg text-sm font-medium hover:bg-vendorsoluce-pale-green dark:hover:bg-vendorsoluce-green/20 transition-colors">
              Try interactive demo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {STEPS.map(({ step, actor, actorColor, icon: Icon, title, desc, note }) => (
            <div key={step} className="group">
              <div className="flex gap-6">
                {/* Left rail */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{step}</span>
                  </div>
                  <div className="flex-1 w-0.5 bg-gray-100 dark:bg-gray-800 mt-2" />
                </div>

                {/* Content */}
                <div className="pb-10 flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white ${actorColor}`}>
                      {actor}
                    </span>
                    <Icon className="w-4 h-4 text-gray-400" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
                  <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed space-y-3">
                    {desc.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
                  </div>
                  {note && (
                    <div className="mt-4 flex items-start gap-2 bg-vendorsoluce-pale-green dark:bg-vendorsoluce-green/10 rounded-lg px-4 py-3 border border-vendorsoluce-light-green/30">
                      <AlertCircle className="w-4 h-4 text-vendorsoluce-green flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-vendorsoluce-green dark:text-vendorsoluce-light-green leading-relaxed">{note}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Assessment modes summary */}
      <section className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Assessment modes at a glance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20',
                label: 'Light', time: '~15 min',
                points: ['Assertion-based (yes/no)', 'One optional upload per domain', 'Low / Medium tier default'],
              },
              {
                icon: FileText, color: 'text-vendorsoluce-green', bg: 'bg-vendorsoluce-pale-green dark:bg-vendorsoluce-green/20',
                label: 'Full', time: '30 min – 3 hrs',
                points: ['Structured questions per domain', 'Evidence upload per question', 'High / Critical tier default'],
              },
              {
                icon: Database, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20',
                label: 'Evidence request', time: '~5 min',
                points: ['One specific document', 'No questionnaire', 'Closes a targeted gap'],
              },
            ].map(({ icon: Icon, color, bg, label, time, points }) => (
              <div key={label} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">{label}</span>
                  <span className="text-xs text-gray-500">{time}</span>
                </div>
                <ul className="space-y-1">
                  {points.map(pt => (
                    <li key={pt} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />{pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTAs */}
      <section className="py-10 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-center gap-4">
          <Link to="/for-buyers" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-vendorsoluce-green text-white rounded-lg text-sm font-medium hover:bg-vendorsoluce-dark-green transition-colors">
            Buyer workflow <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/for-vendors" className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Vendor guide <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/frameworks" className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Framework coverage <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
};

export default PortalHowItWorks;
