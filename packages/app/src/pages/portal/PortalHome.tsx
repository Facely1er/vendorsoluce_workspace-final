import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield, Lock, ArrowRight, AlertCircle, CheckCircle,
  FileText, Users, Zap, Database, ChevronRight,
  BarChart3, ShieldCheck, Package, Layers,
} from 'lucide-react';
import { isSupabaseEnabled } from '../../lib/supabase';
import { fetchPortalAssessmentBundle } from '../../services/portalAssessmentService';
import { logger } from '../../utils/logger';
import { usePortalSEO } from '../../hooks/usePortalSEO';
import { SHELL_CLASSES } from '../../layout/shell';

// ─── Assessment ID entry form ─────────────────────────────────────────────────

const AssessmentForm: React.FC = () => {
  const navigate = useNavigate();
  const [assessmentId, setAssessmentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedId = assessmentId.trim();
    if (!trimmedId) { setError('Please enter your assessment ID.'); return; }

    if (!uuidRegex.test(trimmedId)) {
      setError('Enter a valid UUID-format assessment ID (e.g. xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).');
      return;
    }

    if (!isSupabaseEnabled()) {
      // Demo / no-backend mode: navigate directly
      navigate(`/vendor-assessments/${trimmedId}`);
      return;
    }

    setLoading(true);
    try {
      const bundle = await fetchPortalAssessmentBundle(trimmedId);
      if (!bundle || bundle.assessment.status === 'cancelled') {
        setError('Assessment not found or no longer active. Check your invitation email.');
      } else {
        navigate(`/vendor-assessments/${trimmedId}`);
      }
    } catch (err) {
      logger.error('Assessment lookup error:', err);
      setError('Could not verify the assessment ID. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label htmlFor="assess-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Assessment ID
      </label>
      <div className="flex gap-2">
        <input
          id="assess-id"
          type="text"
          value={assessmentId}
          onChange={e => { setAssessmentId(e.target.value); setError(null); }}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-vendorsoluce-green focus:border-transparent text-sm"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !assessmentId.trim()}
          className="px-5 py-3 bg-vendorsoluce-green text-white rounded-lg font-medium text-sm hover:bg-vendorsoluce-dark-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Checking…</>
          ) : (
            <>Open <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </p>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Your assessment ID was included in the invitation email from your organization.
      </p>
    </form>
  );
};

// ─── Assessment comparison table data ─────────────────────────────────────────

const MODE_COMPARISON = [
  { feature: 'Questions', light: '7–10 assertions', full: '15–40 structured questions', evidence: 'None — single upload' },
  { feature: 'Evidence required', light: 'Optional per domain', full: 'Required per control', evidence: '1 specific document' },
  { feature: 'Time estimate', light: '~15 minutes', full: '30 min – 3 hours', evidence: '~5 minutes' },
  { feature: 'Output format', light: 'Status record + PDF', full: 'Audit-ready PDF report', evidence: 'Evidence vault entry' },
  { feature: 'Typical use', light: 'Medium / Low tier vendors', full: 'Critical / High tier vendors', evidence: 'Gap closure after review' },
  { feature: 'Frameworks covered', light: 'NIST 800-161', full: 'NIST, CMMC, ISO, SOC 2', evidence: 'Any single control' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

const PortalHome: React.FC = () => {
  usePortalSEO({
    title: 'Vendor Risk Assessment Portal',
    description: 'Framework-aligned vendor security assessments — proportionate to actual risk. Score vendors, send structured assessments, collect evidence, and track control gaps in one portal.',
    path: '/',
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-gray-100 dark:border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-vendorsoluce-pale-green/40 dark:from-gray-900 dark:via-gray-900 dark:to-vendorsoluce-green/5" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-vendorsoluce-green/[0.03] dark:bg-vendorsoluce-green/[0.02] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

        <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16 ${SHELL_CLASSES.heroTopSpacing}`}>

          {/* Headline + subtitle */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-vendorsoluce-pale-green/60 dark:bg-vendorsoluce-green/15 text-vendorsoluce-green dark:text-vendorsoluce-light-green text-xs font-semibold mb-5 ring-1 ring-vendorsoluce-green/10 dark:ring-vendorsoluce-green/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Vendor Risk Assessment Portal
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-[1.15] tracking-tight mb-4">
              Framework-aligned vendor<br className="hidden sm:block" /> due diligence
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto mb-6">
              Score vendors by actual risk. Generate proportionate assessments mapped to NIST, CMMC, ISO 27001, and SOC 2. Send portal links, track responses, and review evidence — all in one place.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 max-w-xl mx-auto">
              Not every vendor needs a 3-hour questionnaire. The portal derives assessment depth from the vendor's risk tier — so low-risk vendors aren't over-burdened and high-risk vendors are properly examined.
            </p>
          </div>

          {/* Framework trust strip */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mb-12">
            {[
              { label: 'NIST SP 800-161', color: 'text-blue-700 dark:text-blue-400' },
              { label: 'CMMC Level 2', color: 'text-indigo-700 dark:text-indigo-400' },
              { label: 'ISO 27001:2022', color: 'text-emerald-700 dark:text-emerald-400' },
              { label: 'SOC 2 Type II', color: 'text-purple-700 dark:text-purple-400' },
              { label: 'NTIA SBOM', color: 'text-orange-700 dark:text-orange-400' },
            ].map(fw => (
              <div key={fw.label} className="flex items-center gap-1.5">
                <Shield className={`w-3.5 h-3.5 ${fw.color}`} />
                <span className={`text-xs font-semibold ${fw.color}`}>{fw.label}</span>
              </div>
            ))}
          </div>

          {/* Two cards side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

            {/* Left — buyer / platform card */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 shadow-sm hover:shadow-md transition-shadow p-8 flex flex-col">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-medium mb-5 w-fit">
                <Users className="w-3 h-3" /> Buyers & Security Teams
              </div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 leading-snug">
                One platform for third-party risk
              </h2>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  { icon: BarChart3, text: 'Weighted risk scoring across 5 dimensions (NIST SP 800-161 aligned)' },
                  { icon: ShieldCheck, text: 'Cross-framework control mapping: NIST, CMMC L2, ISO 27001, SOC 2' },
                  { icon: Database, text: 'Evidence vault with gap tracking and expiry alerts per vendor' },
                  { icon: Zap, text: 'Proportionate modes: Light, Full, and targeted Evidence Requests' },
                  { icon: Package, text: 'SBOM analysis with NVD/CVE correlation and license compliance' },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-md bg-vendorsoluce-pale-green dark:bg-vendorsoluce-green/15 flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5 text-vendorsoluce-green dark:text-vendorsoluce-light-green" />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-3">
                <a
                  href="https://www.platform.vendorsoluce.com/signin"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-vendorsoluce-green text-white rounded-lg text-sm font-medium hover:bg-vendorsoluce-dark-green transition-colors shadow-sm"
                >
                  Sign in to platform <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Right — vendor assessment entry card */}
            <div id="assess" className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 shadow-sm hover:shadow-md transition-shadow p-8 flex flex-col">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-vendorsoluce-pale-green dark:bg-vendorsoluce-green/20 text-vendorsoluce-green dark:text-vendorsoluce-light-green text-xs font-medium mb-5 w-fit">
                <Lock className="w-3 h-3" /> Vendors
              </div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-snug">
                Complete your vendor security assessment
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm leading-relaxed">
                Enter the assessment ID from your invitation email. No account required — pick up where you left off.
              </p>

              <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-700 p-5 mb-5 flex-1 flex flex-col justify-center">
                <AssessmentForm />
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-vendorsoluce-green" /> No account required</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-vendorsoluce-green" /> Save progress as you go</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-vendorsoluce-green" /> Download PDF on completion</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Social proof / data strip ── */}
      <section className="py-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { stat: '4', label: 'Compliance frameworks supported' },
              { stat: '267+', label: 'NIST controls mapped' },
              { stat: '14', label: 'Cross-mapped control families' },
              { stat: '3', label: 'Assessment modes available' },
            ].map(({ stat, label }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-vendorsoluce-green dark:text-vendorsoluce-light-green">{stat}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works strip ── */}
      <section className="py-14 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How it works</h2>
            <Link to="/how-it-works" className="text-sm text-vendorsoluce-green dark:text-vendorsoluce-light-green font-medium hover:underline flex items-center gap-1">
              Full workflow <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '1', label: 'Buyer scores vendor', detail: 'Risk tier derived from 5 weighted dimensions: data sensitivity, system exposure, access controls, security maturity, and compliance status.', icon: Users },
              { step: '2', label: 'Requirements generated', detail: 'Controls mapped from NIST SP 800-161 by risk tier, with cross-references to CMMC, ISO 27001, and SOC 2. Mode selected automatically.', icon: Shield },
              { step: '3', label: 'Vendor receives link', detail: 'Unique time-limited portal URL sent by email. No vendor account required. Configurable expiry window (default: 30 days).', icon: Lock },
              { step: '4', label: 'Evidence reviewed', detail: 'Buyer reviews responses in the evidence vault. Gaps tracked per control. Targeted re-requests for insufficient evidence — no repeat questionnaires.', icon: FileText },
            ].map(({ step, label, detail, icon: Icon }) => (
              <div key={step} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-vendorsoluce-green text-white text-sm font-bold flex items-center justify-center">{step}</div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="w-4 h-4 text-vendorsoluce-green" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{label}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role CTAs ── */}
      <section className="py-14 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-8">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">For buyers and security teams</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                Understand how vendor risk tiers drive requirements, how assessments are sent, and how evidence is tracked against control gaps.
              </p>
              <Link to="/for-buyers" className="inline-flex items-center gap-1.5 text-sm font-medium text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline">
                Buyer workflow <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-8">
              <div className="w-10 h-10 rounded-lg bg-vendorsoluce-pale-green dark:bg-vendorsoluce-green/20 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-vendorsoluce-green" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">For vendors and security respondents</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                What to expect when completing an assessment, how to prepare in advance, and how this portal reduces the burden of recurring security questionnaires.
              </p>
              <Link to="/for-vendors" className="inline-flex items-center gap-1.5 text-sm font-medium text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline">
                Vendor guide <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Assessment mode comparison ── */}
      <section className="py-14 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Three assessment modes — compared</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              The platform selects a mode based on the vendor's risk tier. Buyers can override. Vendors see only what's relevant to their request.
            </p>
          </div>

          {/* Comparison table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-[180px]">Feature</th>
                  <th className="text-left px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Light</span>
                    </div>
                  </th>
                  <th className="text-left px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-vendorsoluce-pale-green dark:bg-vendorsoluce-green/20 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-green-700 dark:text-green-400" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Full</span>
                    </div>
                  </th>
                  <th className="text-left px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                        <Database className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Evidence Request</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                {MODE_COMPARISON.map(({ feature, light, full, evidence }) => (
                  <tr key={feature} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-5 py-3 text-xs font-semibold text-gray-700 dark:text-gray-300">{feature}</td>
                    <td className="px-5 py-3 text-xs text-gray-600 dark:text-gray-400">{light}</td>
                    <td className="px-5 py-3 text-xs text-gray-600 dark:text-gray-400">{full}</td>
                    <td className="px-5 py-3 text-xs text-gray-600 dark:text-gray-400">{evidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            Not every vendor needs a 3-hour questionnaire. Light mode generates a proportionate due diligence record without over-burdening low-risk vendors.
          </p>
        </div>
      </section>

      {/* ── Frameworks strip ── */}
      <section className="py-10 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Supported frameworks</h2>
            <Link to="/frameworks" className="text-sm text-vendorsoluce-green dark:text-vendorsoluce-light-green font-medium hover:underline flex items-center gap-1">
              Full coverage map <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'NIST SP 800-161 r1', desc: 'Supply chain risk management — 267 controls across all tiers', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { name: 'CMMC Level 2', desc: '110 practices protecting CUI — required for DoD contractors', color: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
              { name: 'ISO 27001:2022', desc: '93 Annex A controls — the global ISMS certification benchmark', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
              { name: 'SOC 2 Type II', desc: '64 Trust Services Criteria — security, availability, confidentiality', color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
            ].map(fw => (
              <Link key={fw.name} to="/frameworks" className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-800 hover:shadow-sm transition-shadow group">
                <div className={`w-8 h-8 rounded-md ${fw.bg} flex items-center justify-center mb-3`}>
                  <Shield className={`w-4 h-4 ${fw.color}`} />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1 group-hover:text-vendorsoluce-green dark:group-hover:text-vendorsoluce-light-green transition-colors">{fw.name}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{fw.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SBOM & Supply Chain Transparency (last before footer) ── */}
      <section className="py-14 pb-16 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Supply chain transparency</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mb-4">
            Beyond questionnaires, the platform analyzes Software Bills of Materials (SBOMs) to identify component-level vulnerabilities, license risks, and supply chain dependencies. Aligned with EO 14028 and NTIA minimum elements.
          </p>
          <p className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-8">
            SBOM analysis is available as a premium add-on (Professional and above; scan limits and overage apply).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {[
              { title: 'CycloneDX & SPDX support', desc: 'Auto-detects and parses both major SBOM formats into a normalized component inventory.', ref: 'NTIA Minimum Elements' },
              { title: 'NVD / CVE correlation', desc: 'Cross-references every component against the NIST National Vulnerability Database and CISA KEV catalog.', ref: 'NIST NVD / CISA KEV' },
              { title: 'License compliance', desc: 'Identifies restrictive or incompatible open-source licenses per component (GPL, AGPL, SSPL flagging).', ref: 'SPDX License List' },
              { title: 'SBOM health score (0–100)', desc: 'Composite score based on CVE severity, component criticality, update availability, and NTIA completeness.', ref: 'EO 14028, Section 4' },
              { title: 'Dependency risk propagation', desc: 'Calculates how vulnerabilities in transitive dependencies propagate risk to the consuming application.', ref: 'NIST SP 800-161 SR-3/SR-6' },
              { title: 'Assessment integration', desc: 'SBOM health scores appear alongside vendor risk tiers, providing a composite view of organizational and technical risk.', ref: 'Platform integration' },
            ].map(({ title, desc, ref }) => (
              <div key={title} className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-800 hover:shadow-sm transition-shadow">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1.5">{title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{desc}</p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 dark:bg-orange-900/10 text-orange-700 dark:text-orange-400 text-xs rounded-full font-medium">
                  <Layers className="w-3 h-3" />{ref}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://www.platform.vendorsoluce.com/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              See pricing
            </a>
            <a
              href="https://www.platform.vendorsoluce.com/signin"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-vendorsoluce-green text-white rounded-lg text-sm font-medium hover:bg-vendorsoluce-dark-green transition-colors shadow-sm"
            >
              Sign in to platform <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default PortalHome;
