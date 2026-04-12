/**
 * Three-stage process aligned with website homepage #process: Discover / Understand / Close.
 * Same titles, outcomes, bullets, and CTAs (platform routes).
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Shield, CheckCircle, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';

const steps = [
  {
    id: 'discover',
    title: 'Discover Your Vendor Exposure',
    outcome: 'I know exactly which vendors pose the greatest risk to my organization.',
    body: 'Discover vendor exposure through intake forms, risk signal aggregation, and portfolio analysis. Get instant visibility into which vendors pose the greatest risk to your organization based on data access, business criticality, and compliance requirements.',
    bullets: [
      'Vendor intake with contact information, industry classification, and business context',
      'Risk scoring using weighted factors: data access, criticality, compliance requirements',
      'Vendor classification by risk level: Low, Medium, High, Critical',
      'Portfolio-level risk dashboard for holistic supply chain visibility',
    ],
    cta: 'Start Vendor Risk & Management',
    to: '/vendors',
    icon: Package,
  },
  {
    id: 'understand',
    title: 'Understand Your Compliance Gaps',
    outcome: 'I know exactly which security controls and compliance requirements I need from each vendor based on their risk level.',
    body: 'Define security requirements using NIST SP 800-161, collect evidence, and assess vendor compliance. Generate a risk-informed gap analysis that prioritizes controls based on your specific vendor exposure and business context.',
    bullets: [
      'NIST SP 800-161 aligned assessments: 24 questions across 6 security domains',
      'Evidence collection linked to assessment questions and compliance controls',
      'Vendor questionnaires: send, track, and score vendor-provided responses',
      'Risk-informed prioritization based on vendor exposure and business context',
    ],
    cta: 'Start Supply Chain Assessment',
    to: '/supply-chain-assessment',
    icon: Shield,
  },
  {
    id: 'close',
    title: 'Close the Compliance Gaps',
    outcome: 'I have evidence-based proof of vendor compliance and defensible vendor risk management decisions.',
    body: 'Track vendor compliance, generate procurement-ready reports, and maintain evidence for oversight decisions. Get evidence-based proof of vendor compliance without drowning in email, with complete traceability of every decision.',
    bullets: [
      'Risk-driven remediation roadmap with prioritized actions',
      'Evidence collection aligned to compliance requirements',
      'Procurement-ready and oversight-ready reporting',
      'Complete traceability of vendor risk management decisions',
    ],
    cta: 'Start Vendor Assessments',
    to: '/vendor-assessments',
    icon: CheckCircle,
  },
];

const ProcessSection: React.FC = () => {
  return (
    <section id="process" className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto space-y-12 md:space-y-16">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                <div className="flex items-start gap-4 md:gap-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-xl md:text-2xl font-bold flex-shrink-0 bg-gradient-to-br from-vendorsoluce-green to-vendorsoluce-light-green text-white">
                    <Icon className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                      {step.title}
                    </h2>
                    <div className="bg-vendorsoluce-green/10 dark:bg-vendorsoluce-green/20 border-l-4 border-vendorsoluce-green dark:border-vendorsoluce-light-green p-4 rounded-r mb-4">
                      <p className="text-sm font-semibold text-vendorsoluce-green dark:text-vendorsoluce-light-green">
                        Outcome: &quot;{step.outcome}&quot;
                      </p>
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                      {step.body}
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-300 mb-6 list-none pl-0">
                      {step.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-vendorsoluce-green dark:text-vendorsoluce-light-green font-bold">✓</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to={step.to}>
                      <Button variant="primary" size="lg" className="group">
                        {step.cta}
                        <ArrowRight className="h-5 w-5 ml-2 inline group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex justify-center my-8">
                  <div className="w-8 h-8 text-vendorsoluce-green dark:text-vendorsoluce-light-green opacity-50">
                    <ArrowRight className="w-8 h-8 rotate-90" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ProcessSection;
