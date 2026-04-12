import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, FileText, CheckCircle, ArrowRight, Clock, Upload,
  ChevronDown, ChevronUp, Lock, AlertCircle, Package,
} from 'lucide-react';
import { usePortalSEO } from '../../hooks/usePortalSEO';
const PREP_CHECKLIST = [
  { label: 'Information security policy', note: 'Signed and dated, version-controlled', time: '~5 min if existing' },
  { label: 'Access control policy / procedure', note: 'Covers MFA, least privilege, offboarding', time: '~5 min if existing' },
  { label: 'Most recent penetration test report or summary', note: 'Full report or executive summary acceptable', time: '~2 min to locate' },
  { label: 'Business continuity / disaster recovery plan', note: 'Or RTO/RPO summary if full plan is confidential', time: '~5 min' },
  { label: 'ISO 27001 or SOC 2 certificate (if applicable)', note: 'Current certificate, not expired', time: '~1 min' },
  { label: 'Vendor / subprocessor list', note: 'For data processor assessments', time: '~10 min to compile' },
  { label: 'Encryption standards document', note: 'Key management approach, algorithms in use', time: '~5 min if existing' },
  { label: 'Incident response procedure', note: 'Contact, escalation, notification timeline', time: '~5 min if existing' },
];

const FAQ_ITEMS = [
  {
    q: 'Do I need to create an account on this portal?',
    a: 'No. You access the assessment using the unique assessment ID from your invitation email. No account, no password, no portal subscription required.',
  },
  {
    q: 'Can I save progress and return later?',
    a: 'Yes. Your progress is saved automatically as you complete each section. You can close the browser and return using the same assessment ID link.',
  },
  {
    q: 'What file formats are accepted for evidence uploads?',
    a: 'PDF, Word (docx), Excel (xlsx), PNG, and JPEG. Maximum 25 MB per file. If you have a large audit report, you can upload an executive summary — the buyer will see what you have uploaded.',
  },
  {
    q: 'What if a question does not apply to our organization?',
    a: 'You can mark any question as "not applicable" and provide a short justification. This is recorded in the assessment and reviewed by the buyer. Unanswered questions with no N/A justification will be flagged as gaps.',
  },
  {
    q: 'Will my documents be shared with other organizations?',
    a: 'No. Your evidence is scoped to the assessment it was submitted for — the specific buyer that requested it. It is not shared with other buyers or organizations on the platform.',
  },
  {
    q: 'I receive similar questionnaires from multiple organizations. Can this reduce that burden?',
    a: 'If your organization or multiple buyers use the VendorSoluce platform, your submitted evidence can be referenced across renewal cycles, reducing the need to re-upload the same documents. The scope of sharing is always controlled by you and the requesting buyer.',
  },
  {
    q: 'What happens after I submit?',
    a: 'The buyer reviews your responses and uploaded documents in their evidence vault. You will receive a confirmation email when submission is complete. If the buyer needs additional information on a specific control, they can send a targeted evidence request — you won\'t need to redo the full assessment.',
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

const PortalForVendors: React.FC = () => {
  usePortalSEO({
    title: 'For Vendors',
    description: 'What to expect when completing a vendor security assessment — step-by-step guide, preparation checklist, and FAQs for security respondents.',
    path: '/for-vendors',
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">

      {/* Header */}
      <section className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-vendorsoluce-pale-green dark:bg-vendorsoluce-green/20 text-vendorsoluce-green dark:text-vendorsoluce-light-green text-xs font-medium mb-4">
            <Shield className="w-3 h-3" /> For vendors and security respondents
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            What to expect — and how to prepare
          </h1>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base">
            This portal is used by organizations that have asked you to complete a vendor security assessment.
            Here is what happens at each step and how to prepare efficiently.
          </p>
        </div>
      </section>

      {/* Why this exists */}
      <section className="py-12 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Why a structured portal instead of an email questionnaire</h2>
          <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-orange-800 dark:text-orange-300 mb-1">The security questionnaire problem</p>
                <p className="text-sm text-orange-700 dark:text-orange-400 leading-relaxed">
                  The average vendor receives 5–10 security questionnaires per year from different customers, each in a different format, covering similar but not identical topics.
                  Responding to each takes 4–20 hours. Many vendors maintain a "questionnaire library" — a document where staff manually copy and paste answers.
                  This is slow, error-prone, and rarely results in structured, verifiable evidence.
                </p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            This portal addresses that problem in a few ways:
          </p>
          <div className="space-y-3">
            {[
              {
                icon: FileText,
                title: 'Structured format with referenced controls',
                desc: 'Every question references the specific control (e.g. NIST 800-161 AC-2) being evaluated. You know exactly what is being asked and why — no interpretation needed.',
              },
              {
                icon: Upload,
                title: 'Evidence once, reviewed centrally',
                desc: 'Upload a document once per assessment. It is attached to the relevant control in the buyer\'s evidence vault. You do not re-answer the same question in a different format next time — the evidence is already recorded.',
              },
              {
                icon: Clock,
                title: 'Light mode for proportionate requests',
                desc: 'Lower-risk assessments use assertion-based questions — simple yes/no confirmations with an optional single document per domain. Typically 10–15 minutes for 7–10 assertions.',
              },
              {
                icon: Shield,
                title: 'Targeted re-requests instead of full repeats',
                desc: 'If a buyer needs one additional document after review, they send a targeted evidence request — not a new full questionnaire. You upload the one document needed.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-800">
                <div className="w-9 h-9 rounded-lg bg-vendorsoluce-pale-green dark:bg-vendorsoluce-green/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-vendorsoluce-green" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Step by step */}
      <section className="py-12 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">The vendor experience — step by step</h2>
          <div className="space-y-6">
            {[
              {
                step: '1', icon: Lock,
                title: 'You receive an invitation email',
                desc: 'The email from your customer includes a short description of the assessment scope, the assessment ID, and a direct link to this portal. No registration required.',
              },
              {
                step: '2', icon: FileText,
                title: 'Open the assessment',
                desc: 'Enter the assessment ID (or click the link in the email). You will see the full list of security domains and controls in scope — upfront, before you answer anything. This lets you forward the right sections to the right internal teams.',
              },
              {
                step: '3', icon: CheckCircle,
                title: 'Complete each section',
                desc: 'For each control, provide a response (yes/no/partial) and optionally upload supporting evidence. Mark anything out of scope as "not applicable" with a brief justification. Progress saves automatically.',
              },
              {
                step: '4', icon: Upload,
                title: 'Upload supporting documents',
                desc: 'Attach one or more documents per question — policies, certificates, audit reports. The upload goes directly to the buyer\'s evidence vault tied to that specific control.',
              },
              {
                step: '5', icon: Package,
                title: 'Submit and download your report',
                desc: 'Once all required questions are answered, submit the assessment. You can download a PDF compliance report summarizing your responses — useful for your own records or to share with other customers.',
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-vendorsoluce-green text-white text-sm font-bold flex items-center justify-center">{step}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-vendorsoluce-green" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preparation checklist */}
      <section className="py-12 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Preparation checklist</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            For a full assessment (High or Critical tier), having these documents ready before you start will significantly reduce the time required.
            Not all will apply to every assessment — check the control list in the portal for your specific scope.
          </p>
          <div className="space-y-2">
            {PREP_CHECKLIST.map((item) => (
              <div key={item.label} className="flex items-start gap-3 p-3.5 border border-gray-100 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-800">
                <div className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.note}</p>
                  <p className="text-xs text-vendorsoluce-green dark:text-vendorsoluce-light-green mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />{item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            For light mode assessments, no documents are required — you will only confirm assertions and optionally attach a single document per domain.
          </p>
        </div>
      </section>

      {/* What if I don't have these documents */}
      <section className="py-12 border-b border-gray-100 dark:border-gray-800 bg-vendorsoluce-pale-green/30 dark:bg-vendorsoluce-green/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">What if I don't have these documents?</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            Not every organization has formal policies for every domain. Here's how the assessment handles that:
          </p>
          <div className="space-y-3">
            {[
              { title: 'Mark the control as "Partial" or "N/A"', desc: 'If a formal document doesn\'t exist, mark the control honestly and add a justification. Buyers see your response in context and can request further detail if needed.' },
              { title: 'Describe informal practices', desc: 'If you enforce MFA but don\'t have a written access control policy, describe the practice in the free-text field. Many buyers accept documented practices over formal policies for lower-tier assessments.' },
              { title: 'Use the assessment as a gap analysis', desc: 'The PDF compliance report generated at submission serves as a structured snapshot of your current posture. Some vendors use it internally to prioritize which policies to formalize next.' },
              { title: 'Ask the buyer for clarification', desc: 'If a question is ambiguous or doesn\'t apply to your service, mark it N/A with a note. The buyer can follow up with a targeted evidence request rather than requiring you to guess.' },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map(({ q, a }) => <FAQItem key={q} q={q} a={a} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap gap-4 items-center">
          <Link
            to="/#assess"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-vendorsoluce-green text-white rounded-lg text-sm font-medium hover:bg-vendorsoluce-dark-green transition-colors"
          >
            Open your assessment <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/security" className="text-sm text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline">
            How your data is protected →
          </Link>
        </div>
      </section>

    </div>
  );
};

export default PortalForVendors;
