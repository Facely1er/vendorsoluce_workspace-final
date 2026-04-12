import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Shield, CheckCircle, ArrowRight, ChevronRight,
  BarChart2, Database, Upload, Package, AlertCircle, Zap, Eye,
} from 'lucide-react';
import { usePortalSEO } from '../../hooks/usePortalSEO';
import { SHELL_CLASSES } from '../../layout/shell';
import { CONTROL_MAPPINGS, FRAMEWORKS, TIER_COLORS, type RiskTier, type FrameworkId } from '../../data/portalFrameworkData';
// ─── Types ─────────────────────────────────────────────────────────────────────

type ServiceType =
  | 'cloud-infra'
  | 'saas-data'
  | 'managed-security'
  | 'professional-services'
  | 'payroll-hr'
  | 'marketing-tools'
  | 'office-logistics';

interface ServiceOption {
  id: ServiceType;
  label: string;
  hint: string;
}

interface GeneratedRequirement {
  domain: string;
  control: string;
  rationale: string;
  weight: 'required' | 'recommended';
}

interface VendorQuestion {
  domain: string;
  question: string;
  type: 'assertion' | 'evidence';
  evidenceHint?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const SERVICE_OPTIONS: ServiceOption[] = [
  { id: 'cloud-infra', label: 'Cloud infrastructure / IaaS / PaaS', hint: 'Compute, storage, networking — operational criticality' },
  { id: 'saas-data', label: 'SaaS — processes or stores sensitive data', hint: 'CRM, ERP, data warehouses, file sharing with PII/confidential' },
  { id: 'managed-security', label: 'Managed security / SOC / MDR', hint: 'Has privileged access to internal systems or logs' },
  { id: 'professional-services', label: 'Professional services with system access', hint: 'Consultants, IT integrators with VPN / internal access' },
  { id: 'payroll-hr', label: 'Payroll / HR / financial processing', hint: 'Handles employee PII, payroll, financial transactions' },
  { id: 'marketing-tools', label: 'Marketing tools / analytics', hint: 'Limited PII, no operational system access' },
  { id: 'office-logistics', label: 'Office supplies / logistics / non-digital', hint: 'No data access, no system integration' },
];

interface TierResult {
  tier: RiskTier;
  rationale: string;
  mode: string;
  modeNote: string;
  domains: number;
  estimatedTime: string;
}

function deriveTier(selected: Set<ServiceType>): TierResult {
  if (selected.has('cloud-infra') || selected.has('managed-security')) {
    return {
      tier: 'Critical',
      rationale: 'Operational dependency or privileged access to internal systems requires maximum assurance.',
      mode: 'Full assessment',
      modeNote: '8–12 security domains, evidence uploads per question, audit-ready PDF.',
      domains: 10,
      estimatedTime: '1–3 hours',
    };
  }
  if (selected.has('saas-data') || selected.has('payroll-hr')) {
    return {
      tier: 'High',
      rationale: 'Sensitive data access (PII, financial records) in scope for compliance and breach notification obligations.',
      mode: 'Full assessment',
      modeNote: '6–8 security domains, evidence uploads, PDF report.',
      domains: 7,
      estimatedTime: '45 min – 2 hours',
    };
  }
  if (selected.has('professional-services')) {
    return {
      tier: 'Medium',
      rationale: 'Temporary system access requires proportionate verification of access controls and incident response capability.',
      mode: 'Light assessment',
      modeNote: '4–5 domains, assertion-based with optional upload per domain.',
      domains: 4,
      estimatedTime: '15–30 minutes',
    };
  }
  if (selected.has('marketing-tools')) {
    return {
      tier: 'Medium',
      rationale: 'Limited PII and no operational criticality. Proportionate due diligence via light assessment.',
      mode: 'Light assessment',
      modeNote: '3–4 domains, assertion-based.',
      domains: 3,
      estimatedTime: '~15 minutes',
    };
  }
  return {
    tier: 'Low',
    rationale: 'No sensitive data access, no system integration. Basic self-declaration sufficient.',
    mode: 'Self-declaration or targeted evidence request',
    modeNote: '1–2 assertions. Minimal record.',
    domains: 1,
    estimatedTime: '~5 minutes',
  };
}

function deriveRequirements(selected: Set<ServiceType>): GeneratedRequirement[] {
  const reqs: GeneratedRequirement[] = [];
  if (selected.has('cloud-infra') || selected.has('managed-security') || selected.has('saas-data') || selected.has('payroll-hr')) {
    reqs.push(
      { domain: 'Access Management', control: 'AC-2', rationale: 'Account management, MFA enforcement, least privilege', weight: 'required' },
      { domain: 'Access Management', control: 'AC-6', rationale: 'Privileged access restrictions', weight: 'required' },
      { domain: 'Incident Response', control: 'IR-4', rationale: 'Incident handling procedures and notification timeline', weight: 'required' },
      { domain: 'Cryptography', control: 'SC-8', rationale: 'Encryption of data in transit and at rest', weight: 'required' },
      { domain: 'Audit & Accountability', control: 'AU-12', rationale: 'Audit logging for access and operations', weight: 'required' },
    );
  }
  if (selected.has('cloud-infra') || selected.has('managed-security')) {
    reqs.push(
      { domain: 'Physical Security', control: 'PE-3', rationale: 'Physical access controls to data centre / infrastructure', weight: 'required' },
      { domain: 'Continuity', control: 'CP-9', rationale: 'Backup and recovery procedures with tested RTO/RPO', weight: 'required' },
      { domain: 'Secure Development', control: 'SA-11', rationale: 'Penetration testing and vulnerability disclosure programme', weight: 'required' },
      { domain: 'Supply Chain Risk', control: 'SR-6', rationale: 'Sub-supplier / sub-processor list and risk management', weight: 'recommended' },
    );
  }
  if (selected.has('professional-services')) {
    reqs.push(
      { domain: 'Access Management', control: 'AC-17', rationale: 'Remote access controls and VPN policy', weight: 'required' },
      { domain: 'Personnel Security', control: 'PS-7', rationale: 'Third-party personnel security screening and agreements', weight: 'recommended' },
    );
  }
  if (selected.has('marketing-tools')) {
    reqs.push(
      { domain: 'Privacy', control: 'PT-2', rationale: 'PII processing purpose limitation and consent management', weight: 'required' },
      { domain: 'Data Management', control: 'SI-12', rationale: 'Data retention and disposal procedures', weight: 'recommended' },
    );
  }
  if (reqs.length === 0) {
    reqs.push(
      { domain: 'General', control: 'PM-1', rationale: 'Information security programme policy confirmation', weight: 'required' },
    );
  }
  return reqs;
}

function deriveVendorQuestions(tier: RiskTier): VendorQuestion[] {
  if (tier === 'Low') {
    return [
      { domain: 'General', question: 'Does your organization maintain a documented information security policy?', type: 'assertion' },
    ];
  }
  if (tier === 'Medium') {
    return [
      { domain: 'Access Management', question: 'Is multi-factor authentication enforced for all user accounts with access to customer data?', type: 'assertion', evidenceHint: 'Optional: MFA configuration screenshot or policy excerpt' },
      { domain: 'Incident Response', question: 'Does your organization have a documented incident response procedure with a defined customer notification timeline?', type: 'assertion', evidenceHint: 'Optional: IR policy excerpt' },
      { domain: 'Cryptography', question: 'Is data encrypted in transit (TLS 1.2+) and at rest?', type: 'assertion' },
      { domain: 'Privacy', question: 'Is a current privacy policy and data processing agreement available?', type: 'assertion', evidenceHint: 'Optional: DPA or privacy notice link / document' },
    ];
  }
  return [
    { domain: 'Access Management', question: 'Describe your account lifecycle management process, including MFA enforcement and access removal on offboarding. Upload your access control policy.', type: 'evidence', evidenceHint: 'Access control policy (PDF/DOCX)' },
    { domain: 'Cryptography', question: 'What encryption standards are used for data at rest and in transit? Upload your cryptographic standards document.', type: 'evidence', evidenceHint: 'Encryption standards or policy document' },
    { domain: 'Incident Response', question: 'Upload your incident response procedure. Include the customer notification timeline (SLA for breach notification).', type: 'evidence', evidenceHint: 'IR policy / procedure document' },
    { domain: 'Penetration Testing', question: 'Upload your most recent penetration test executive summary or full report (within 24 months).', type: 'evidence', evidenceHint: 'Pentest executive summary (PDF)' },
    { domain: 'Continuity', question: 'What are your documented RTO and RPO targets? Upload your BC/DR plan or executive summary.', type: 'evidence', evidenceHint: 'BC/DR plan or RTO/RPO documentation' },
  ];
}

// ─── Component ─────────────────────────────────────────────────────────────────

type DemoView = 'buyer-select' | 'buyer-requirements' | 'vendor-respond' | 'vendor-submit' | 'buyer-vault';

const PortalDemo: React.FC = () => {
  const [view, setView] = useState<DemoView>('buyer-select');
  const [selectedServices, setSelectedServices] = useState<Set<ServiceType>>(new Set());
  const [vendorAnswers, setVendorAnswers] = useState<Record<number, 'yes' | 'partial' | 'no' | null>>({});
  const [expandedControl, setExpandedControl] = useState<number | null>(null);
  const [selectedFramework, setSelectedFramework] = useState<FrameworkId>('nist-800-161');

  usePortalSEO({
    title: 'Interactive Demo',
    description: 'Step through the full vendor risk assessment workflow — from buyer risk scoring to vendor submission and evidence review.',
    path: '/demo',
  });

  const tierResult = deriveTier(selectedServices);
  const requirements = deriveRequirements(selectedServices);
  const vendorQuestions = deriveVendorQuestions(tierResult.tier);

  const toggleService = (id: ServiceType) => {
    const next = new Set(selectedServices);
    if (next.has(id)) { next.delete(id); } else { next.add(id); }
    setSelectedServices(next);
  };

  const answeredCount = Object.values(vendorAnswers).filter(v => v !== null).length;
  const canSubmit = answeredCount >= Math.min(vendorQuestions.length, 3);

  const steps: Array<{ id: DemoView; label: string; role: string }> = [
    { id: 'buyer-select', label: 'Buyer: define vendor', role: 'buyer' },
    { id: 'buyer-requirements', label: 'Buyer: review requirements', role: 'buyer' },
    { id: 'vendor-respond', label: 'Vendor: complete assessment', role: 'vendor' },
    { id: 'vendor-submit', label: 'Vendor: submit', role: 'vendor' },
    { id: 'buyer-vault', label: 'Buyer: review evidence', role: 'buyer' },
  ];

  const stepIndex = steps.findIndex(s => s.id === view);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">

      {/* Header */}
      <section className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Interactive demo</h1>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Step through the full workflow — from buyer vendor risk scoring to vendor assessment submission and evidence review.
            Select different service types at Step 1 to see how requirements change.
          </p>
        </div>
      </section>

      {/* Progress stepper */}
      <div className={`border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky z-40 ${SHELL_CLASSES.stickyHeaderOffset}`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center overflow-x-auto py-3 gap-0 scrollbar-hide">
            {steps.map(({ id, label, role }, i) => {
              const active = id === view;
              const done = i < stepIndex;
              return (
                <React.Fragment key={id}>
                  <button
                    onClick={() => {
                      if (done || active) setView(id);
                      if (id === 'buyer-requirements' && selectedServices.size === 0) return;
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                      active
                        ? role === 'buyer'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-vendorsoluce-pale-green text-vendorsoluce-green dark:bg-vendorsoluce-green/20 dark:text-vendorsoluce-light-green'
                        : done
                        ? 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        : 'text-gray-400 dark:text-gray-600 cursor-default'
                    }`}
                    disabled={!done && !active}
                  >
                    {done ? (
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    ) : (
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                        active ? (role === 'buyer' ? 'bg-blue-600 text-white' : 'bg-vendorsoluce-green text-white') : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}>{i + 1}</span>
                    )}
                    {label}
                  </button>
                  {i < steps.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-700 flex-shrink-0" />}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step panels */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Step 1: Buyer select services ── */}
        {view === 'buyer-select' && (
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-medium mb-4">
              <Users className="w-3 h-3" /> Buyer view
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Step 1 — Define vendor service types</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Select the service types that describe this vendor. The platform will derive the risk tier and generate the appropriate assessment requirements.
              Select multiple if the vendor provides more than one type of service.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {SERVICE_OPTIONS.map(({ id, label, hint }) => {
                const selected = selectedServices.has(id);
                return (
                  <button
                    key={id}
                    onClick={() => toggleService(id)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      selected
                        ? 'border-vendorsoluce-green bg-vendorsoluce-pale-green dark:border-vendorsoluce-light-green dark:bg-vendorsoluce-green/10'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                        selected ? 'border-vendorsoluce-green bg-vendorsoluce-green' : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selected && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{hint}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedServices.size > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Derived risk tier</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${TIER_COLORS[tierResult.tier]}`}>
                    {tierResult.tier}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{tierResult.rationale}</p>
                <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span><span className="font-medium text-gray-700 dark:text-gray-300">Mode:</span> {tierResult.mode}</span>
                  <span><span className="font-medium text-gray-700 dark:text-gray-300">Domains:</span> ~{tierResult.domains}</span>
                  <span><span className="font-medium text-gray-700 dark:text-gray-300">Time for vendor:</span> {tierResult.estimatedTime}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setView('buyer-requirements')}
              disabled={selectedServices.size === 0}
              className="px-5 py-2.5 bg-vendorsoluce-green text-white rounded-lg text-sm font-medium hover:bg-vendorsoluce-dark-green disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              Generate requirements <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Step 2: Buyer reviews requirements ── */}
        {view === 'buyer-requirements' && (
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-medium mb-4">
              <Users className="w-3 h-3" /> Buyer view
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Step 2 — Review generated requirements</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Based on the service types you selected, the following controls have been mapped from NIST SP 800-161 r1.
              Review the list, then send the assessment to the vendor.
            </p>
            <div className="flex items-center gap-3 mb-6">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${TIER_COLORS[tierResult.tier]}`}>
                {tierResult.tier} tier
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{tierResult.mode} · ~{tierResult.estimatedTime} for vendor</span>
            </div>

            {/* Framework selector pills */}
            <div className="mb-5">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">View mappings for:</p>
              <div className="flex flex-wrap gap-1.5">
                {FRAMEWORKS.map((fw) => {
                  const active = selectedFramework === fw.id;
                  return (
                    <button
                      key={fw.id}
                      onClick={() => setSelectedFramework(fw.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        active
                          ? `${fw.bgColor} ${fw.color} ring-1 ring-current`
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {fw.shortName}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 mb-6">
              {requirements
                .filter((req) => {
                  if (selectedFramework === 'nist-800-161') return true;
                  const mapping = CONTROL_MAPPINGS[req.control];
                  if (!mapping) return false;
                  const fwKey = selectedFramework === 'cmmc-l2' ? 'cmmc' : selectedFramework === 'iso-27001' ? 'iso' : 'soc2';
                  return !!mapping[fwKey];
                })
                .map((req, i) => {
                  const mapping = CONTROL_MAPPINGS[req.control];
                  const fwKey = selectedFramework === 'cmmc-l2' ? 'cmmc' : selectedFramework === 'iso-27001' ? 'iso' : 'soc2';
                  const fwControlId = selectedFramework !== 'nist-800-161' && mapping ? mapping[fwKey] : undefined;

                  return (
                    <div key={req.control} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between px-4 py-3.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-left"
                        onClick={() => setExpandedControl(expandedControl === i ? null : i)}
                      >
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${
                            req.weight === 'required'
                              ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}>{req.control}</span>
                          {fwControlId && (
                            <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400">
                              {fwControlId}
                            </span>
                          )}
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {mapping ? mapping.nistTitle : req.domain}
                          </span>
                          <span className={`text-xs ${req.weight === 'required' ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`}>
                            {req.weight}
                          </span>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${expandedControl === i ? 'rotate-90' : ''}`} />
                      </button>
                      {expandedControl === i && (
                        <div className="px-4 pb-3 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800">
                          {mapping && (
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 pt-3 mb-1">
                              {mapping.nistFamily} — {mapping.objective}
                            </p>
                          )}
                          <p className="text-xs text-gray-600 dark:text-gray-400 pt-1">{req.rationale}</p>
                          {mapping && (
                            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-500 dark:text-gray-400">
                              {mapping.cmmc && (
                                <span><span className="font-semibold text-indigo-600 dark:text-indigo-400">CMMC L2:</span> {mapping.cmmc}</span>
                              )}
                              {mapping.iso && (
                                <span>{mapping.cmmc && '|'} <span className="font-semibold text-emerald-600 dark:text-emerald-400">ISO 27001:</span> {mapping.iso}</span>
                              )}
                              {mapping.soc2 && (
                                <span>{(mapping.cmmc || mapping.iso) && '|'} <span className="font-semibold text-purple-600 dark:text-purple-400">SOC 2:</span> {mapping.soc2}</span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                In the platform, you can add, remove, or substitute controls before sending. Removed controls are logged with your rationale for audit purposes. Click any control to expand its description.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setView('buyer-select')} className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                ← Back
              </button>
              <button
                onClick={() => setView('vendor-respond')}
                className="px-5 py-2.5 bg-vendorsoluce-green text-white rounded-lg text-sm font-medium hover:bg-vendorsoluce-dark-green transition-colors flex items-center gap-2"
              >
                Send to vendor <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Vendor responds ── */}
        {view === 'vendor-respond' && (
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-vendorsoluce-pale-green dark:bg-vendorsoluce-green/20 text-vendorsoluce-green dark:text-vendorsoluce-light-green text-xs font-medium mb-4">
              <Shield className="w-3 h-3" /> Vendor view
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Step 3 — Vendor completes the assessment</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              The vendor has opened the portal using the assessment ID from the invitation email. They see the questions below.
              {tierResult.tier === 'Medium' || tierResult.tier === 'Low'
                ? ' This is a light assessment — assertion-based questions with optional evidence upload.'
                : ' This is a full assessment — structured questions with evidence upload per domain.'}
            </p>

            <div className="space-y-4 mb-6">
              {vendorQuestions.map((q, i) => (
                <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{q.domain}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${q.type === 'evidence' ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                      {q.type === 'evidence' ? 'Evidence upload' : 'Assertion'}
                    </span>
                  </div>
                  <div className="px-5 py-4">
                    <p className="text-sm text-gray-900 dark:text-white mb-4 leading-relaxed">{q.question}</p>
                    {q.type === 'assertion' ? (
                      <div className="flex gap-2">
                        {(['yes', 'partial', 'no'] as const).map(val => (
                          <button
                            key={val}
                            onClick={() => setVendorAnswers(prev => ({ ...prev, [i]: val }))}
                            className={`px-4 py-2 rounded-lg text-xs font-medium border-2 transition-colors capitalize ${
                              vendorAnswers[i] === val
                                ? val === 'yes' ? 'border-green-500 bg-green-50 text-green-700 dark:border-green-400 dark:bg-green-900/20 dark:text-green-400'
                                  : val === 'partial' ? 'border-yellow-500 bg-yellow-50 text-yellow-700 dark:border-yellow-400 dark:bg-yellow-900/20 dark:text-yellow-400'
                                  : 'border-red-500 bg-red-50 text-red-700 dark:border-red-400 dark:bg-red-900/20 dark:text-red-400'
                                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                            }`}
                          >
                            {val === 'yes' ? '✓ Yes' : val === 'partial' ? '◑ Partial' : '✗ No / N/A'}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div>
                        <div className="flex gap-2 mb-3">
                          {(['yes', 'partial', 'no'] as const).map(val => (
                            <button
                              key={val}
                              onClick={() => setVendorAnswers(prev => ({ ...prev, [i]: val }))}
                              className={`px-4 py-2 rounded-lg text-xs font-medium border-2 transition-colors capitalize ${
                                vendorAnswers[i] === val
                                  ? val === 'yes' ? 'border-green-500 bg-green-50 text-green-700 dark:border-green-400 dark:bg-green-900/20 dark:text-green-400'
                                    : val === 'partial' ? 'border-yellow-500 bg-yellow-50 text-yellow-700 dark:border-yellow-400 dark:bg-yellow-900/20 dark:text-yellow-400'
                                    : 'border-red-500 bg-red-50 text-red-700 dark:border-red-400 dark:bg-red-900/20 dark:text-red-400'
                                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                              }`}
                            >
                              {val === 'yes' ? '✓ Confirmed' : val === 'partial' ? '◑ Partial' : '✗ N/A'}
                            </button>
                          ))}
                        </div>
                        {q.evidenceHint && (
                          <div className="flex items-center gap-2 px-3 py-2.5 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <Upload className="w-4 h-4" />
                            <span>{q.evidenceHint}</span>
                            <span className="ml-auto text-gray-400">(demo — not uploaded)</span>
                          </div>
                        )}
                      </div>
                    )}
                    {vendorAnswers[i] && (
                      <div className="mt-3">
                        <textarea
                          placeholder="Optional: add a note or clarification…"
                          rows={2}
                          className="w-full text-xs px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:ring-1 focus:ring-vendorsoluce-green focus:border-transparent resize-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setView('buyer-requirements')} className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                ← Back
              </button>
              <button
                onClick={() => setView('vendor-submit')}
                disabled={!canSubmit}
                className="px-5 py-2.5 bg-vendorsoluce-green text-white rounded-lg text-sm font-medium hover:bg-vendorsoluce-dark-green disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                Preview submission <ArrowRight className="w-4 h-4" />
              </button>
              {!canSubmit && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Answer at least {Math.min(vendorQuestions.length, 3)} questions to continue
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Step 4: Vendor submit ── */}
        {view === 'vendor-submit' && (
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-vendorsoluce-pale-green dark:bg-vendorsoluce-green/20 text-vendorsoluce-green dark:text-vendorsoluce-light-green text-xs font-medium mb-4">
              <Shield className="w-3 h-3" /> Vendor view
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Step 4 — Review and submit</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              The vendor reviews their responses, then submits. A compliance PDF is generated and available for download.
            </p>

            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-6">
              <div className="px-5 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Assessment summary</h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {vendorQuestions.map((q, i) => {
                  const ans = vendorAnswers[i];
                  if (!ans) return null;
                  return (
                    <div key={i} className="px-5 py-3 flex items-center justify-between bg-white dark:bg-gray-900">
                      <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{q.domain}</span>
                        <p className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-sm">{q.question.substring(0, 60)}…</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        ans === 'yes' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : ans === 'partial' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {ans === 'yes' ? 'Confirmed' : ans === 'partial' ? 'Partial' : 'N/A'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-vendorsoluce-pale-green dark:bg-vendorsoluce-green/10 border border-vendorsoluce-light-green/30 rounded-xl p-4 mb-6 flex items-start gap-3">
              <Package className="w-5 h-5 text-vendorsoluce-green flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-vendorsoluce-green dark:text-vendorsoluce-light-green mb-1">Compliance PDF available on submission</p>
                <p className="text-xs text-vendorsoluce-green/80 dark:text-vendorsoluce-light-green/80">
                  A PDF summarizing your responses, uploaded evidence references, and the control set covered will be generated. Use it as a record for your own audit trail.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setView('vendor-respond')} className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                ← Back to edit
              </button>
              <button
                onClick={() => setView('buyer-vault')}
                className="px-5 py-2.5 bg-vendorsoluce-green text-white rounded-lg text-sm font-medium hover:bg-vendorsoluce-dark-green transition-colors flex items-center gap-2"
              >
                Submit assessment <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 5: Buyer vault ── */}
        {view === 'buyer-vault' && (
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-medium mb-4">
              <Users className="w-3 h-3" /> Buyer view
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Step 5 — Evidence vault and gap analysis</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              The buyer reviews the vendor's submission in the evidence vault. Each control shows its status. Gaps are tracked automatically.
            </p>

            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-6">
              <div className="px-5 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Control status</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${TIER_COLORS[tierResult.tier]}`}>{tierResult.tier} tier</span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {requirements.map((req, i) => {
                  const ans = vendorAnswers[i % vendorQuestions.length];
                  const status = ans === 'yes' ? 'documented' : ans === 'partial' ? 'insufficient' : 'gap';
                  return (
                    <div key={i} className="px-5 py-3.5 flex items-center justify-between bg-white dark:bg-gray-900">
                      <div className="flex items-center gap-3">
                        <span className="px-1.5 py-0.5 rounded text-xs font-mono font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">{req.control}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{req.domain}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{req.rationale}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          status === 'documented' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : status === 'insufficient' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {status === 'documented' ? '✓ Documented' : status === 'insufficient' ? '⚠ Insufficient' : '✗ Gap'}
                        </span>
                        {status !== 'documented' && (
                          <button className="text-xs text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline whitespace-nowrap">
                            Request evidence
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Documented', count: requirements.filter((_, i) => vendorAnswers[i % vendorQuestions.length] === 'yes').length, color: 'text-green-600 dark:text-green-400' },
                { label: 'Insufficient', count: requirements.filter((_, i) => vendorAnswers[i % vendorQuestions.length] === 'partial').length, color: 'text-yellow-600 dark:text-yellow-400' },
                { label: 'Gaps', count: requirements.filter((_, i) => !vendorAnswers[i % vendorQuestions.length] || vendorAnswers[i % vendorQuestions.length] === 'no').length, color: 'text-red-600 dark:text-red-400' },
              ].map(({ label, count, color }) => (
                <div key={label} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800 text-center">
                  <p className={`text-2xl font-bold ${color}`}>{count}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3 mb-6">
              <Eye className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                For controls marked "insufficient" or "gap", you can issue a targeted evidence request — the vendor will receive a focused request for one specific document, without redoing the full assessment.
              </p>
            </div>

            <div className="bg-vendorsoluce-pale-green dark:bg-vendorsoluce-green/10 border border-vendorsoluce-light-green/30 rounded-xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-vendorsoluce-green" />
                <h3 className="text-sm font-semibold text-vendorsoluce-green dark:text-vendorsoluce-light-green">Demo complete</h3>
              </div>
              <p className="text-xs text-vendorsoluce-green/80 dark:text-vendorsoluce-light-green/80 leading-relaxed">
                You have stepped through the full workflow: vendor risk scoring → requirements generation → assessment → submission → evidence vault.
                Go back to Step 1 and select different service types to see how the tier and requirements change.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => { setView('buyer-select'); setSelectedServices(new Set()); setVendorAnswers({}); setExpandedControl(null); }}
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                ← Start over with different services
              </button>
              <Link
                to="/"
                className="px-5 py-2.5 bg-vendorsoluce-green text-white rounded-lg text-sm font-medium hover:bg-vendorsoluce-dark-green transition-colors flex items-center gap-2"
              >
                Open your assessment <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* Side notes about demo */}
      <section className="border-t border-gray-100 dark:border-gray-800 py-10 bg-gray-50 dark:bg-gray-800/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap gap-6">
          {[
            { icon: Zap, label: 'No backend required', desc: 'This demo runs fully in the browser.' },
            { icon: Database, label: 'Real assessments use Supabase', desc: 'Live assessments have encrypted evidence storage and audit logs.' },
            { icon: BarChart2, label: 'Requirements vary by tier', desc: 'Go back to Step 1 and try Critical vs. Low tier service types.' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-2 max-w-xs">
              <Icon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default PortalDemo;
