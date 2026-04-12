import React from 'react';
import {
  Lock, Shield, Database, Eye, FileText, CheckCircle, AlertCircle, ArrowRight, Globe, Server, HardDrive, ShieldCheck,
} from 'lucide-react';
import { usePortalSEO } from '../../hooks/usePortalSEO';
const PortalSecurity: React.FC = () => {
  usePortalSEO({
    title: 'Security & Privacy',
    description: 'How vendor assessment data is handled, who can access what, and the design principles behind the portal privacy model. Encryption, audit trails, and data isolation.',
    path: '/security',
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">

      {/* Header */}
      <section className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium mb-4">
            <Lock className="w-3 h-3" /> Security & Privacy
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Security and privacy approach
          </h1>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base">
            A vendor risk portal handles sensitive security documentation. This page explains how data is handled,
            who can access what, and the design principles behind the portal's privacy model.
          </p>
        </div>
      </section>

      {/* Data handling */}
      <section className="py-12 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">What data is collected and how it is used</h2>
          <div className="space-y-5">
            {[
              {
                icon: FileText, title: 'Assessment responses',
                desc: 'Vendor questionnaire responses are stored in the buyer\'s assessment record. They are accessible only to the buyer organization that issued the assessment and the vendor respondent during the active assessment window.',
              },
              {
                icon: Database, title: 'Uploaded documents',
                desc: 'Evidence files are stored in encrypted object storage. Each file is scoped to the assessment it was submitted for. Files are not indexed, analyzed, or processed beyond storage and access-controlled retrieval. The file name, upload timestamp, and file type are stored as metadata for audit purposes.',
              },
              {
                icon: Eye, title: 'Access logs',
                desc: 'Portal access events (assessment opened, section completed, file uploaded, submission time) are logged for audit and compliance purposes. These logs are accessible to the buyer organization and, upon request, to the vendor for their own submissions.',
              },
              {
                icon: Globe, title: 'IP and browser data',
                desc: 'Standard server-side access logs are retained for a limited period for security and infrastructure monitoring purposes. These are not linked to assessment content or shared.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Access model */}
      <section className="py-12 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Access model — who can see what</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Party</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Can access</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Cannot access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                {[
                  {
                    party: 'Vendor respondent',
                    can: 'Their own active assessment, uploaded documents, submitted PDF',
                    cannot: 'Other vendor assessments, buyer\'s vendor portfolio, other assessments under the same buyer',
                  },
                  {
                    party: 'Buyer organization',
                    can: 'All assessments issued by their org, responses, uploaded evidence, gap analysis',
                    cannot: 'Other buyers\' assessments of the same vendor, VendorSoluce internal logs',
                  },
                  {
                    party: 'VendorSoluce platform',
                    can: 'Infrastructure-level access for support and security monitoring (audited, logged)',
                    cannot: 'Evidence document content is encrypted — content cannot be accessed by platform staff in normal operations',
                  },
                  {
                    party: 'Other organizations',
                    can: 'Nothing. Data is not shared across organizations.',
                    cannot: 'All assessment data, evidence, and responses',
                  },
                ].map(({ party, can, cannot }) => (
                  <tr key={party}>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white text-xs align-top">{party}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 align-top">{can}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-500 align-top">{cannot}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Technical security */}
      <section className="py-12 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Technical security measures</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: Lock, label: 'Encryption in transit and at rest',
                desc: 'All data is transmitted over TLS 1.2+. Evidence files are stored with server-side encryption.',
              },
              {
                icon: Shield, label: 'Assessment ID as access token',
                desc: 'The assessment ID functions as a time-limited single-use access token. It is not reusable across sessions after submission and has a configurable expiry.',
              },
              {
                icon: CheckCircle, label: 'Row-level security',
                desc: 'Database access policies enforce that each assessment record is only accessible to the issuing buyer. No cross-tenant data leakage by design.',
              },
              {
                icon: Eye, label: 'Audit trail',
                desc: 'All write operations (answer saves, file uploads, submissions) are logged with timestamps. The audit log is immutable and accessible to the buyer.',
              },
              {
                icon: AlertCircle, label: 'No third-party analytics on vendor data',
                desc: 'Vendor assessment responses and uploaded evidence are not processed by third-party analytics or machine-learning pipelines.',
              },
              {
                icon: FileText, label: 'Minimal data collection',
                desc: 'The portal collects only what is required for the assessment. Vendor email, name, and organization are provided by the buyer — the portal itself does not request personal information beyond what the assessment requires.',
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

      {/* Infrastructure and architecture */}
      <section className="py-12 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Infrastructure and architecture</h2>
          <div className="space-y-4 mb-6">
            {[
              { icon: Server, title: 'Hosting', desc: 'Application and database hosted on Supabase (built on AWS). Data processed and stored in secured cloud infrastructure with automated failover.' },
              { icon: HardDrive, title: 'Data residency', desc: 'Primary data storage in the hosting region configured per deployment. Organizations requiring specific data residency can discuss options during onboarding.' },
              { icon: Database, title: 'Backups', desc: 'Automated daily backups with point-in-time recovery. Evidence files stored in encrypted object storage with cross-region redundancy.' },
              { icon: Shield, title: 'Network security', desc: 'All traffic encrypted via TLS 1.2+. Row-level security enforced at the database layer. API endpoints protected by rate limiting and authentication.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-vendorsoluce-pale-green dark:bg-vendorsoluce-green/10 border border-vendorsoluce-light-green/30 rounded-xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-vendorsoluce-green flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-vendorsoluce-green dark:text-vendorsoluce-light-green mb-1">Compliance posture</p>
              <p className="text-xs text-vendorsoluce-green/80 dark:text-vendorsoluce-light-green/80 leading-relaxed">
                VendorSoluce implements controls aligned with SOC 2 Type II Trust Services Criteria and ISO 27001:2022 Annex A. Penetration testing is conducted annually by an independent third party. A summary of current certifications and attestations is available upon request.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy principles */}
      <section className="py-12 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Privacy design principles</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            The portal's privacy approach is based on minimal collection, strict scoping, and proportionate evidence requests.
          </p>
          <div className="space-y-4">
            {[
              {
                title: 'Collect the minimum necessary',
                desc: 'Light mode assessments request metadata confirmations — yes/no assertions — rather than full document uploads for lower-risk vendors. You are not asked for a penetration test report if the assessment tier does not require one.',
              },
              {
                title: 'Evidence purpose is documented',
                desc: 'Each evidence request specifies the control it satisfies. Vendors and buyers can see why a document is requested. There is no open-ended "please share all security documentation" requests.',
              },
              {
                title: 'Scoped access, not platform-wide sharing',
                desc: 'Evidence submitted to a specific buyer stays scoped to that buyer-vendor relationship. It is not accessible to VendorSoluce as a service platform for indexing, benchmarking, or any other use.',
              },
              {
                title: 'Data retention aligned with assessment lifecycle',
                desc: 'When an assessment expires, evidence can be scheduled for deletion per the buyer\'s data retention policy. The platform does not retain vendor evidence indefinitely without a defined retention rule.',
              },
            ].map(({ title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-vendorsoluce-green flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legal links */}
      <section className="py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Full legal documentation is available on the VendorSoluce website:
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="https://www.vendorsoluce.com/legal/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline">
              Privacy Policy <ArrowRight className="w-4 h-4" />
            </a>
            <a href="https://www.vendorsoluce.com/legal/terms.html" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline">
              Terms of Service <ArrowRight className="w-4 h-4" />
            </a>
            <a href="https://www.vendorsoluce.com/contact.html" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline">
              Data Processing Agreement (request via contact) <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default PortalSecurity;
