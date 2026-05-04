import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';

const MasterPrivacyPolicy: React.FC = () => {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">MASTER PRIVACY POLICY</h1>
        <p className="text-gray-600 dark:text-gray-400">
          <strong>Effective Date:</strong> October 31, 2025<br />
          <strong>Last Updated:</strong> December 13, 2025
        </p>
      </div>
      
      <Card className="p-8 mb-8">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          ERMITS LLC ("ERMITS," "we," "our," or "us") is committed to protecting your privacy through a Privacy-First Architecture that ensures you maintain control over your data. This Privacy Policy explains how we collect, use, disclose, and safeguard information when you use our Services across all ERMITS product lines.
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          By using our Services, you consent to the data practices described in this policy. If you do not agree with this Privacy Policy, please do not use our Services.
        </p>
      </Card>

      <Card className="p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. SCOPE AND APPLICABILITY</h2>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">1.1 Services Covered</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">This Privacy Policy applies to all ERMITS products and services, including:</p>
        
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">Asset Intelligence:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-3 pl-4">
            <li>Enhanced Asset Inventory Management Platform</li>
            <li>Dependency-aware visibility into asset inventory</li>
            <li>Focus signals for attention areas</li>
            <li>Service funneling guidance toward appropriate ERMITS services</li>
          </ul>
          
          <p className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">SocialCaution:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-3 pl-4">
            <li>Personalized privacy platform</li>
            <li>AI-powered persona detection</li>
            <li>Privacy exposure index and risk scoring</li>
            <li>Service catalog with privacy risk profiles</li>
          </ul>
          
          <p className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">TechnoSoluce™:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-3 pl-4">
            <li>SBOM (Software Bill of Materials) Analyzer</li>
            <li>Software supply chain security and vulnerability analysis</li>
            <li>Client-side SBOM processing</li>
          </ul>
          
          <p className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">CyberCertitude™:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-3 pl-4">
            <li>CMMC 2.0 Level 1 Implementation Suite</li>
            <li>CMMC 2.0 Level 2 Compliance Platform</li>
            <li>NIST SP 800-171 assessment and compliance tools</li>
            <li>Original Toolkit (localStorage-based compliance management)</li>
          </ul>
          
          <p className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">VendorSoluce™:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-3 pl-4">
            <li>Supply Chain Risk Management Platform</li>
            <li>Vendor assessment and monitoring</li>
            <li>Third-party risk evaluation</li>
          </ul>
          
          <p className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">CyberCorrect™:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-3 pl-4">
            <li>Privacy Portal (workplace privacy compliance)</li>
            <li>Privacy Platform (multi-regulation privacy management)</li>
            <li>Data subject rights management</li>
          </ul>
          
          <p className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">CyberCaution™:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-3 pl-4">
            <li>RansomCheck (ransomware readiness assessment)</li>
            <li>Security Toolkit (comprehensive cybersecurity assessments)</li>
            <li>RiskProfessional (CISA-aligned security assessments)</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">1.2 Geographic Scope</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">This Privacy Policy applies to users worldwide and complies with:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li>General Data Protection Regulation (GDPR) - European Union, United Kingdom, Switzerland</li>
          <li>California Consumer Privacy Act (CCPA) / California Privacy Rights Act (CPRA)</li>
          <li>Personal Information Protection and Electronic Documents Act (PIPEDA) - Canada</li>
          <li>Lei Geral de Proteção de Dados (LGPD) - Brazil</li>
          <li>Other applicable privacy and data protection laws</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8">2. PRIVACY-FIRST ARCHITECTURE OVERVIEW</h2>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">2.1 Core Privacy Principles</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">ERMITS implements Privacy-First Architecture built on five fundamental principles that distinguish our approach:</p>
        
        <p className="mb-2"><strong>1. Client-Side Processing</strong></p>
        <p className="text-gray-600 dark:text-gray-300 mb-3">All core computational functions are performed locally within your browser or self-managed environment whenever technically feasible:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li><strong>Security Assessments:</strong> CMMC, cybersecurity assessments processed in your browser</li>
          <li><strong>Asset Inventory:</strong> Inventory data processed client-side</li>
          <li><strong>SBOM Analysis:</strong> TechnoSoluce processes SBOM files entirely client-side</li>
          <li><strong>Risk Scoring:</strong> All risk calculations performed locally</li>
          <li><strong>Compliance Evaluations:</strong> Assessment scoring and gap analysis done in your browser</li>
          <li><strong>Privacy Analysis:</strong> SocialCaution persona detection runs entirely client-side</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 italic mb-4"><strong>Your data remains under your control throughout the analysis process.</strong></p>

        <p className="mb-2"><strong>2. Data Sovereignty Options</strong></p>
        <p className="text-gray-600 dark:text-gray-300 mb-3">You choose where your data resides:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li><strong>Local-Only Mode:</strong> All data stored exclusively in your browser (IndexedDB, localStorage)</li>
          <li><strong>Self-Managed Cloud:</strong> Deploy to your own cloud infrastructure with full control (AWS, Azure, GCP)</li>
          <li><strong>ERMITS-Managed Cloud:</strong> Optional encrypted cloud synchronization with zero-knowledge architecture</li>
          <li><strong>Hybrid Deployment:</strong> Local processing with selective encrypted cloud backup</li>
          <li><strong>On-Premises:</strong> Enterprise customers can deploy on their own infrastructure</li>
        </ul>

        <p className="mb-2"><strong>3. Zero-Knowledge Encryption</strong></p>
        <p className="text-gray-600 dark:text-gray-300 mb-3">When using ERMITS-managed cloud features with encryption enabled:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li>Data is encrypted client-side using <strong>AES-256-GCM</strong> before transmission</li>
          <li>Encryption keys are <strong>derived from your credentials</strong> using PBKDF2 and never transmitted to ERMITS</li>
          <li>ERMITS <strong>cannot decrypt, access, or view</strong> your encrypted data</li>
          <li>You are <strong>solely responsible</strong> for maintaining access to encryption keys</li>
          <li><strong>Lost keys = permanent data loss</strong> (we cannot recover your data)</li>
        </ul>

        <p className="mb-2"><strong>4. Data Minimization</strong></p>
        <p className="text-gray-600 dark:text-gray-300 mb-3">We collect only the minimum data necessary for service functionality:</p>
        <p className="mb-2"><strong>Never Collected:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li>Raw SBOM files, component lists, dependency graphs</li>
          <li>Assessment content, responses, or findings</li>
          <li>Vulnerability scan results or CVE data</li>
          <li>Compliance documentation (SSPs, POA&Ms, evidence)</li>
          <li>CUI (Controlled Unclassified Information)</li>
          <li>FCI (Federal Contract Information)</li>
          <li>PHI (Protected Health Information)</li>
          <li>Proprietary business data or trade secrets</li>
        </ul>
        <p className="mb-2"><strong>Optionally Collected:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li>Account information (name, email, company) - only when you create an account</li>
          <li>Pseudonymized telemetry (anonymous performance metrics) - opt-in only</li>
          <li>Encrypted user data (if cloud sync enabled) - we cannot decrypt</li>
        </ul>

        <p className="mb-2"><strong>5. Transparency and Control</strong></p>
        <p className="text-gray-600 dark:text-gray-300 mb-3">You have complete control over your data:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-6 pl-4">
          <li><strong>Export</strong> all data at any time in standard formats (JSON, CSV, PDF)</li>
          <li><strong>Delete</strong> all data permanently with one click</li>
          <li><strong>Opt in or opt out</strong> of telemetry collection anytime</li>
          <li><strong>Choose</strong> your deployment and storage model</li>
          <li><strong>Review</strong> detailed data flow documentation for each product</li>
        </ul>
      </Card>

      <Card className="p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. INFORMATION WE COLLECT</h2>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">3.1 Information You Provide Directly</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>Account Information (Optional):</strong></p>
        <p className="text-gray-600 dark:text-gray-300 mb-2">When you create an account or subscribe to paid features, we collect:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li><strong>Name:</strong> Your full name or preferred name</li>
          <li><strong>Email Address:</strong> For authentication, communications, and billing</li>
          <li><strong>Company Name and Job Title:</strong> Optional, for business context</li>
          <li><strong>Billing Information:</strong> Processed by Stripe, Inc. (our payment processor)
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mt-1 pl-4">
              <li>ERMITS does not store complete payment card information</li>
              <li>We receive only: transaction status, last 4 digits of card, billing address</li>
            </ul>
          </li>
          <li><strong>Password:</strong> Cryptographically hashed using bcrypt, never stored in plaintext</li>
        </ul>

        <p className="text-gray-600 dark:text-gray-300 mb-2 mt-4"><strong>User-Generated Content:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-6 pl-4">
          <li><strong>Support Requests:</strong> Questions, issues, or feedback sent to support@ermits.com</li>
          <li><strong>Survey Responses:</strong> Feedback provided through user surveys</li>
          <li><strong>Customization Preferences:</strong> UI preferences, notification settings, feature preferences</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">3.2 Information We Do NOT Collect</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>ERMITS explicitly does NOT collect, access, store, or transmit:</strong></p>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>Assessment and Analysis Data:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li>Security assessment responses or scores</li>
          <li>CMMC compliance assessments or documentation</li>
          <li>Asset inventory data and dependency information</li>
          <li>Cybersecurity evaluation results</li>
          <li>Privacy assessments or persona analysis results</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>Technical Data:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li>SBOM (Software Bill of Materials) files or contents</li>
          <li>Software component lists or dependency graphs</li>
          <li>Vulnerability scan results or CVE findings</li>
          <li>Package metadata or software inventories</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>Compliance and Regulatory Data:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li>System Security Plans (SSPs)</li>
          <li>Plans of Action and Milestones (POA&Ms)</li>
          <li>Compliance evidence or audit documentation</li>
          <li>Certification materials or assessment reports</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>Controlled Information:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li>CUI (Controlled Unclassified Information)</li>
          <li>FCI (Federal Contract Information)</li>
          <li>PHI (Protected Health Information) under HIPAA</li>
          <li>PCI data (payment card information) except via Stripe</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>Business Data:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-6 pl-4">
          <li>Trade secrets or proprietary information</li>
          <li>Confidential business strategies</li>
          <li>Financial records (except billing data)</li>
          <li>Customer lists or business relationships</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">3.3 Automatically Collected Information</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>Pseudonymized Telemetry (Optional - Opt-In Required):</strong></p>
        <p className="text-gray-600 dark:text-gray-300 mb-2">With your explicit consent, we collect anonymous, aggregated performance data:</p>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>What We Collect:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li>Feature usage statistics (which tools are used, how often)</li>
          <li>Performance metrics (page load times, API response times)</li>
          <li>Error reports (crash logs, exceptions) with PII automatically scrubbed by Sentry</li>
          <li>Browser and device information (browser type/version, OS, screen resolution)</li>
          <li>Session metadata (session duration, navigation paths, timestamps)</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>Privacy Protections:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li><strong>Irreversible Pseudonymization:</strong> User identifiers are cryptographically hashed (SHA-256) and cannot be reverse-engineered</li>
          <li><strong>No Content Data:</strong> Telemetry never includes file contents, assessment results, or user inputs</li>
          <li><strong>Differential Privacy:</strong> PostHog analytics use differential privacy techniques to prevent individual identification</li>
          <li><strong>Opt-Out Available:</strong> You can disable telemetry at any time in account settings with retroactive deletion</li>
          <li><strong>Aggregate Only:</strong> Data used only in aggregate; individual user behavior cannot be identified</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>Technical and Security Data:</strong></p>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>IP Addresses:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li>Collected for: Security monitoring, rate limiting, geolocation for service delivery</li>
          <li>Not linked to: User accounts or identifiable information</li>
          <li>Retention: 90 days in server logs, then automatically deleted</li>
          <li>Use: Fraud prevention, DDoS protection, regional service optimization</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>Server Logs:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-6 pl-4">
          <li>Standard web server access logs (timestamp, HTTP method, endpoint, status code, IP)</li>
          <li>Error logs for debugging and system monitoring</li>
          <li>Retention: 90 days, then automatically deleted</li>
          <li>Access: Restricted to security and engineering teams only</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">3.4 Information from Third Parties</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>Authentication Providers (OAuth):</strong></p>
        <p className="text-gray-600 dark:text-gray-300 mb-2">If you use OAuth for authentication (Google, Microsoft, GitHub), we receive:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li>Name and email address from the provider</li>
          <li>Profile information you choose to share with the provider's permission</li>
          <li>Provider's unique identifier for your account (for account linking)</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>We do not:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li>Access your contacts, files, or other data from these providers</li>
          <li>Request more permissions than necessary for authentication</li>
          <li>Share your ERMITS data back to these providers</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>Payment Processor (Stripe):</strong></p>
        <p className="text-gray-600 dark:text-gray-300 mb-2">Stripe provides us with:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li>Payment success/failure status</li>
          <li>Subscription status and billing cycle information</li>
          <li>Last 4 digits of payment method (for your reference)</li>
          <li>Billing address (for tax compliance)</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>We do not:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-6 pl-4">
          <li>Receive or store complete payment card numbers</li>
          <li>Process payments directly (all payment processing via Stripe)</li>
          <li>Have access to your full financial information</li>
        </ul>
      </Card>

      <Card className="p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. HOW WE USE INFORMATION</h2>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">4.1 Service Delivery and Operation</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">We use collected information to:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li><strong>Provide Services:</strong> Deliver SocialCaution, TechnoSoluce, CyberCertitude, VendorSoluce™, CyberCorrect, and CyberCaution services</li>
          <li><strong>Process Transactions:</strong> Handle subscriptions, billing, and payment confirmations</li>
          <li><strong>Authenticate Users:</strong> Verify identity and maintain account security</li>
          <li><strong>Enable Features:</strong> Provide cloud synchronization, multi-device access, collaboration features (when opted-in)</li>
          <li><strong>Customer Support:</strong> Respond to inquiries, troubleshoot issues, provide technical assistance</li>
        </ul>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">4.2 Service Improvement and Analytics</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">We use pseudonymized, aggregate data to:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li><strong>Analyze Usage Patterns:</strong> Understand which features are used and how often (aggregate only)</li>
          <li><strong>Identify Issues:</strong> Detect and fix bugs, errors, and performance problems</li>
          <li><strong>Develop Features:</strong> Plan and build new features based on anonymized usage trends</li>
          <li><strong>Conduct Research:</strong> Perform security and privacy research using aggregated, anonymous data</li>
          <li><strong>Benchmark Performance:</strong> Measure and improve service performance and reliability</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>We do NOT:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li>Analyze your individual assessment results or SBOM data</li>
          <li>Use your data to train AI models or machine learning systems</li>
          <li>Profile users for behavioral targeting or marketing</li>
          <li>Sell or monetize your data in any way</li>
        </ul>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">4.3 Communication</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">We use your contact information to:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li><strong>Service Announcements:</strong> Notify you of system updates, maintenance, or service changes</li>
          <li><strong>Security Alerts:</strong> Send critical security notifications or breach notifications</li>
          <li><strong>Support Responses:</strong> Reply to your support requests and feedback</li>
          <li><strong>Transactional Emails:</strong> Send receipts, invoices, account confirmations</li>
          <li><strong>Product Updates:</strong> Inform you of new features or product launches (opt-in only)</li>
          <li><strong>Marketing Communications:</strong> Send promotional content only with your explicit consent (easy opt-out)</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>You control communications:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li>Opt out of marketing emails anytime via unsubscribe link</li>
          <li>Cannot opt out of critical service/security notifications</li>
          <li>Manage preferences in Account Settings → Notifications</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">4.3.1 CAN-SPAM Act Compliance</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">ERMITS complies with the CAN-SPAM Act for all commercial email communications:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li><strong>Opt-Out Processing:</strong> Opt-out requests are processed within 10 business days as required by the CAN-SPAM Act</li>
          <li><strong>Unsubscribe Links:</strong> All marketing emails include clear and conspicuous unsubscribe links</li>
          <li><strong>Accurate Subject Lines:</strong> Email subject lines accurately reflect the content of the message</li>
          <li><strong>Clear Sender Identification:</strong> All emails clearly identify ERMITS LLC as the sender</li>
          <li><strong>No Deceptive Practices:</strong> We do not use deceptive headers, subject lines, or sender information</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>How to Unsubscribe:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li>Click the unsubscribe link in any marketing email</li>
          <li>Manage email preferences in Account Settings → Notifications</li>
          <li>Email us at <Link to="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">contact form</Link> with subject "Unsubscribe Request"</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          <strong>Note:</strong> Transactional emails (receipts, account confirmations, security alerts) are not subject to CAN-SPAM opt-out requirements and may continue to be sent for account management purposes.
        </p>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">4.4 Security and Fraud Prevention</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">We use technical data to:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li><strong>Detect Threats:</strong> Identify and prevent security threats, attacks, and abuse</li>
          <li><strong>Monitor Security:</strong> Track unauthorized access attempts or account compromise</li>
          <li><strong>Enforce Policies:</strong> Ensure compliance with Terms of Service and Acceptable Use Policy</li>
          <li><strong>Prevent Fraud:</strong> Detect fraudulent transactions, account creation, or service abuse</li>
          <li><strong>Protect Users:</strong> Safeguard ERMITS, our users, and third parties from harm</li>
        </ul>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">4.5 Legal and Compliance</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">We process information as required to:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li><strong>Comply with Laws:</strong> Fulfill legal obligations and respond to lawful requests</li>
          <li><strong>Enforce Rights:</strong> Protect ERMITS' legal rights and enforce agreements</li>
          <li><strong>Liability Protection:</strong> Defend against legal claims or liability</li>
          <li><strong>Audits:</strong> Conduct internal audits and maintain business records</li>
          <li><strong>Regulatory Compliance:</strong> Meet requirements under GDPR, CCPA, HIPAA, and other laws</li>
        </ul>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">4.6 What We Do NOT Do</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>ERMITS does NOT:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-6 pl-4">
          <li><strong>Sell or rent</strong> your personal information to third parties</li>
          <li><strong>Use your data for advertising</strong> or marketing to others</li>
          <li><strong>Share your User Data</strong> with third parties except as disclosed in Section 5</li>
          <li><strong>Train AI models</strong> on your User Data or assessment content</li>
          <li><strong>Analyze your results</strong> for any purpose (we cannot access encrypted data)</li>
          <li><strong>Profile users</strong> for behavioral targeting or manipulation</li>
          <li><strong>Monitor your activity</strong> beyond aggregate, anonymous metrics</li>
        </ul>
      </Card>

      <Card className="p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. INFORMATION SHARING AND DISCLOSURE</h2>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">5.1 Service Providers (Sub-Processors)</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">We share limited data with trusted third-party service providers who assist in delivering the Services. All sub-processors are contractually required to use data only for specified purposes, implement appropriate security measures, comply with applicable privacy laws, and delete data when no longer needed.</p>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>Key Service Providers:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li><strong>Supabase, Inc.:</strong> Database and authentication (United States / EU - customer choice)</li>
          <li><strong>Stripe, Inc.:</strong> Payment processing (United States)</li>
          <li><strong>Sentry (Functional Software):</strong> Error monitoring (United States)</li>
          <li><strong>PostHog, Inc.:</strong> Analytics with differential privacy (United States / EU)</li>
          <li><strong>Vercel, Inc.:</strong> Hosting and CDN (Global CDN)</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">5.2 Legal Requirements</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">We may disclose information if required by law or in response to:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li>Court orders, subpoenas, search warrants, or judicial orders</li>
          <li>Government requests from law enforcement or regulatory investigations</li>
          <li>Lawful requests under applicable legal authority</li>
          <li>National security threats (where legally required)</li>
        </ul>

        <p className="text-gray-600 dark:text-gray-300 mb-2 mt-4"><strong>Our Commitments When Legally Required to Disclose:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li>Notify affected users of legal requests before disclosure (when legally permitted)</li>
          <li>Challenge requests that are overly broad, improper, or unlawful</li>
          <li>Provide only minimum information required by law</li>
          <li>Seek confidentiality for user information disclosed</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">5.3 Business Transfers</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">If ERMITS is involved in a merger, acquisition, asset sale, or bankruptcy:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li>User information may be transferred as part of business assets</li>
          <li><strong>We will provide notice</strong> before information is transferred to a new entity</li>
          <li>The <strong>successor entity will be bound</strong> by this Privacy Policy</li>
          <li>You will have the <strong>option to delete your data</strong> before transfer (minimum 30 days notice)</li>
        </ul>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">5.4 Consent-Based Sharing</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">We may share information with your explicit consent for purposes such as:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li>Third-party integrations you authorize (HRIS, GRC platforms, etc.)</li>
          <li>Organization administrators (Enterprise accounts)</li>
          <li>Testimonials (with your approval)</li>
          <li>Case studies (with explicit written permission)</li>
          <li>Research participation (with explicit opt-in consent)</li>
        </ul>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">5.5 Aggregated and Anonymous Data</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">We may share aggregated, anonymous data that <strong>cannot identify you</strong>:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-6 pl-4">
          <li>Industry benchmarks and comparative statistics</li>
          <li>Research publications on cybersecurity trends</li>
          <li>Public reports and trend analysis</li>
          <li>Product insights and feature adoption rates</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Data is irreversibly anonymized using differential privacy techniques and cannot be reverse-engineered to identify individuals or organizations.</p>
      </Card>

      <Card className="p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. DATA SECURITY MEASURES</h2>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">6.1 Encryption</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>Data in Transit:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li><strong>TLS 1.3</strong> encryption for all data transmission (minimum TLS 1.2 for legacy systems)</li>
          <li><strong>HTTPS required</strong> for all web traffic</li>
          <li><strong>Certificate Pinning</strong> for critical connections</li>
          <li><strong>Perfect Forward Secrecy (PFS)</strong> enabled to protect past sessions</li>
          <li><strong>Strong Cipher Suites</strong> only (AES-256-GCM, ChaCha20-Poly1305)</li>
        </ul>

        <p className="text-gray-600 dark:text-gray-300 mb-2 mt-4"><strong>Data at Rest:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li><strong>AES-256-GCM</strong> encryption for cloud-stored data</li>
          <li><strong>Client-Side Encryption</strong> with user-controlled keys (zero-knowledge architecture)</li>
          <li><strong>Encrypted Database Backups</strong> with separate encryption keys</li>
          <li><strong>Secure Key Management</strong> using industry-standard HSMs and key rotation</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">6.2 Access Controls</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>Authentication:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li><strong>Multi-Factor Authentication (MFA)</strong> available for all accounts, required for administrators</li>
          <li><strong>Strong Password Requirements:</strong> Minimum 12 characters, complexity requirements</li>
          <li><strong>Password Breach Detection:</strong> Checking against known compromised password databases</li>
          <li><strong>Session Management:</strong> Automatic timeout after 4 hours idle, 12 hours maximum</li>
          <li><strong>OAuth 2.0 Integration</strong> with trusted providers (Google, Microsoft, GitHub)</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>Authorization:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li><strong>Row-Level Security (RLS):</strong> Database-level policies ensure users can only access their own data</li>
          <li><strong>Role-Based Access Control (RBAC):</strong> Granular permissions (Admin, Editor, Viewer, etc.)</li>
          <li><strong>Principle of Least Privilege:</strong> Users and systems granted minimum necessary permissions</li>
        </ul>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">6.3 Infrastructure Security</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>Cloud Security:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li><strong>Secure Hosting:</strong> Enterprise-grade infrastructure (Supabase on AWS, Vercel on AWS/GCP)</li>
          <li><strong>Network Segmentation:</strong> Isolated production, staging, and development environments</li>
          <li><strong>DDoS Protection:</strong> Distributed denial-of-service attack mitigation</li>
          <li><strong>Web Application Firewall (WAF):</strong> Protection against common web attacks</li>
          <li><strong>Intrusion Detection/Prevention (IDS/IPS):</strong> 24/7 monitoring for suspicious activity</li>
          <li><strong>Regular Vulnerability Scanning:</strong> Automated and manual security assessments</li>
          <li><strong>Penetration Testing:</strong> Annual third-party security audits</li>
        </ul>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">6.4 Security Incident Response</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">In the event of a data breach or security incident:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-6 pl-4">
          <li><strong>Detection:</strong> 24/7 security monitoring and alerting systems</li>
          <li><strong>Containment:</strong> Immediate action to isolate affected systems</li>
          <li><strong>Investigation:</strong> Forensic analysis to determine scope and impact</li>
          <li><strong>Notification:</strong> Users notified within 72 hours of breach discovery (GDPR requirement)</li>
          <li><strong>Remediation:</strong> Implement fixes to prevent recurrence</li>
        </ul>
      </Card>

      <Card className="p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. DATA RETENTION</h2>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">7.1 Active Account Data</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">We retain your data for as long as your account is active or as needed to provide Services. Account information is retained for the duration of the account plus 30 days after termination. User-generated content is user-controlled and can be deleted anytime; deleted 30 days after account termination (90 days for backups).</p>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">7.2 Deleted Accounts</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">When you delete your account or request data deletion:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li><strong>Immediate (within 24 hours):</strong> Account access disabled, data marked for deletion, stop all processing</li>
          <li><strong>Within 30 days:</strong> User Data permanently deleted from production systems</li>
          <li><strong>Within 90 days:</strong> Backup copies permanently deleted</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>Exceptions (data retained longer):</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-6 pl-4">
          <li><strong>Financial Records:</strong> 7 years (tax and audit requirements - IRS, SOX)</li>
          <li><strong>Legal Hold Data:</strong> Retained as required by litigation or investigation</li>
          <li><strong>Pseudonymized Analytics:</strong> Indefinite (anonymous, cannot identify individuals)</li>
          <li><strong>Aggregated Statistics:</strong> Indefinite (cannot be reverse-engineered to identify you)</li>
        </ul>
      </Card>

      <Card className="p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. YOUR PRIVACY RIGHTS</h2>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">8.1 Universal Rights (All Users)</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">All users have the following rights regardless of location:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li><strong>Right to Access:</strong> Request a copy of all personal data we hold about you</li>
          <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete personal data</li>
          <li><strong>Right to Deletion (Right to be Forgotten):</strong> Request deletion of your personal data</li>
          <li><strong>Right to Data Portability:</strong> Export your data in machine-readable formats (JSON, CSV, PDF)</li>
          <li><strong>Right to Restriction of Processing:</strong> Request limitation of processing in certain circumstances</li>
          <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">8.2 Additional Rights for EU/UK/Swiss Users (GDPR)</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">If you are located in the European Economic Area, United Kingdom, or Switzerland, you have additional rights:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time (does not affect prior processing)</li>
          <li><strong>Right to Lodge a Complaint:</strong> File complaint with your local data protection authority (DPA)</li>
          <li><strong>Right to Data Protection Impact Assessment (DPIA):</strong> Request information about DPIAs conducted for high-risk processing</li>
          <li><strong>Right to Human Review:</strong> Right not to be subject to automated decision-making with legal/significant effects</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">8.3 Additional Rights for California Residents (CCPA/CPRA)</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">If you are a California resident, you have additional rights under CCPA and CPRA:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li><strong>Right to Know:</strong> Request information about categories and specific pieces of personal information collected</li>
          <li><strong>Right to Delete:</strong> Request deletion of personal information (subject to legal exceptions)</li>
          <li><strong>Right to Opt-Out of Sale:</strong> ERMITS does not sell personal information</li>
          <li><strong>Right to Correct:</strong> Request correction of inaccurate personal information</li>
          <li><strong>Right to Non-Discrimination:</strong> Equal service and pricing regardless of privacy rights exercise</li>
        </ul>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">8.4 Exercising Your Rights</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>How to Submit Requests:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li><strong>Email:</strong> <Link to="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">contact form</Link> (Subject: "Privacy Rights Request - [Type]")</li>
          <li><strong>Online Form:</strong> <a href="https://www.ermits.com/privacy-request" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">www.ermits.com/privacy-request</a></li>
          <li><strong>In-App:</strong> Navigate to Account Settings → Privacy Rights</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>Response Timeline:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-6 pl-4">
          <li><strong>Initial Response:</strong> Within 10 business days acknowledging receipt of request</li>
          <li><strong>Complete Response:</strong> Within 45 days (may extend 45 days with notice for complex requests)</li>
          <li><strong>GDPR Requests:</strong> Within 30 days (may extend 60 days with justification)</li>
          <li><strong>Free of Charge:</strong> First two requests per year are free</li>
        </ul>
      </Card>

      <Card className="p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. INTERNATIONAL DATA TRANSFERS</h2>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">9.1 Data Processing Locations</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">ERMITS is based in the United States. If you access Services from outside the U.S., your data may be transferred to, stored, and processed in the United States or other countries where our service providers operate.</p>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>Primary Data Locations:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li><strong>United States:</strong> Primary data processing and storage (Supabase US, Vercel US)</li>
          <li><strong>European Union:</strong> Optional data residency for EU customers (Supabase EU region - Frankfurt)</li>
          <li><strong>Global CDN:</strong> Content delivery network nodes worldwide (Vercel Edge Network)</li>
        </ul>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">9.2 Safeguards for International Transfers</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">For data transfers from the EEA, UK, or Switzerland to the United States:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li><strong>Standard Contractual Clauses (SCCs):</strong> European Commission-approved Standard Contractual Clauses (Decision 2021/914)</li>
          <li><strong>UK International Data Transfer Addendum:</strong> UK Addendum to EU SCCs for UK data transfers</li>
          <li><strong>Swiss Data Transfer Mechanisms:</strong> Swiss-adapted Standard Contractual Clauses</li>
          <li><strong>Additional Safeguards:</strong> Encryption in transit and at rest, access controls, regular security assessments</li>
        </ul>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">9.3 Data Residency Options</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>EU Data Residency (Available Now):</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li>Supabase EU region (Frankfurt, Germany)</li>
          <li>All data stored and processed within EU</li>
          <li>EU-based backups and disaster recovery</li>
          <li>Request at signup or contact: <Link to="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">contact form</Link></li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>Self-Managed Infrastructure (Enterprise):</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-6 pl-4">
          <li>Deploy to your own cloud environment (AWS, Azure, GCP)</li>
          <li>Choose any geographic region</li>
          <li>Complete control over data location</li>
        </ul>
      </Card>

      <Card className="p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. CHILDREN'S PRIVACY</h2>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">10.1 Age Restrictions</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4"><strong>The Services are not intended for children under 18 years of age.</strong> We do not knowingly collect personal information from children under 18.</p>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">10.2 Parental Rights</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">If we learn that we have collected personal information from a child under 18 without verified parental consent:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-6 pl-4">
          <li>We will <strong>delete the information as quickly as possible</strong></li>
          <li>Parents may contact us to request deletion: <Link to="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">contact form</Link></li>
          <li>Parents have the right to review, request deletion, refuse further collection, and receive information about our data practices</li>
        </ul>
      </Card>

      <Card className="p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. PRODUCT-SPECIFIC PRIVACY CONSIDERATIONS</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">Each ERMITS product has specific privacy considerations. Key highlights:</p>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>TechnoSoluce™ (SBOM Analyzer):</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li>SBOM files or contents are NOT collected (processed 100% client-side)</li>
          <li>Only component identifiers (public package names, versions) sent to vulnerability databases</li>
          <li>Results stored locally in your browser only</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>SocialCaution:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li>Privacy assessment responses processed 100% client-side</li>
          <li>No persona data or assessment responses transmitted to ERMITS servers</li>
          <li>All assessment data stored locally in your browser (IndexedDB, localStorage)</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>CyberCertitude™ (CMMC Compliance):</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-6 pl-4">
          <li>Toolkit: 100% local storage in browser, no data collected</li>
          <li>Level 1 & Level 2 Platform: Encrypted compliance data (if cloud sync enabled) with zero-knowledge E2EE</li>
          <li>ERMITS cannot decrypt your compliance data</li>
        </ul>
      </Card>

      <Card className="p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">12. SPECIAL CONSIDERATIONS</h2>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">12.1 Federal Contractor Privacy</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">For users handling Controlled Unclassified Information (CUI) or Federal Contract Information (FCI):</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li>CUI/FCI processed client-side; never transmitted to ERMITS</li>
          <li>Zero-knowledge encryption ensures ERMITS cannot access CUI/FCI</li>
          <li>You are solely responsible for detecting and reporting cyber incidents involving CUI/FCI</li>
          <li>Report to DoD via <a href="https://dibnet.dod.mil" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">dibnet.dod.mil</a> within 72 hours</li>
        </ul>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">12.2 Healthcare Privacy (HIPAA)</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">For healthcare organizations subject to HIPAA:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li><strong>Business Associate Agreement (BAA) Available:</strong> Required for healthcare customers processing PHI</li>
          <li>Contact: <Link to="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">contact form</Link> to execute BAA</li>
          <li>Unencrypted PHI is processed client-side; ERMITS cannot access encrypted PHI</li>
          <li>Recommended: Use local-only storage for all PHI</li>
        </ul>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">12.3 Financial Services Privacy</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">For financial institutions subject to GLBA, SOX, or PCI-DSS:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-6 pl-4">
          <li>SOC 2 Type II certification (in progress)</li>
          <li>Encryption and access controls exceed industry standards</li>
          <li>Do not process payment card information (PCI data) through Services</li>
          <li>Use Stripe integration for payment processing only</li>
        </ul>
      </Card>

      <Card className="p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">13. UPDATES TO THIS PRIVACY POLICY</h2>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">13.1 Policy Updates</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">We may update this Privacy Policy periodically to reflect changes in data practices, new product launches, legal or regulatory developments, technological improvements, and user feedback.</p>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">13.2 Notification of Changes</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>Material Changes:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li><strong>30 Days' Advance Notice:</strong> Email notification and in-app announcement</li>
          <li><strong>Prominent Display:</strong> Notice displayed on website and in Services</li>
          <li><strong>Opt-Out Option:</strong> Option to export data and close account before changes take effect</li>
          <li><strong>Continued Use:</strong> Continued use after effective date constitutes acceptance</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>Non-Material Changes:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-6 pl-4">
          <li>Update "Last Updated" date at top of policy</li>
          <li>Changes effective immediately upon posting</li>
          <li>No advance notice required</li>
        </ul>
      </Card>

      <Card className="p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">14. CONTACT INFORMATION</h2>
        
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-4">
          <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>ERMITS LLC</strong></p>
          <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>Email:</strong> <Link to="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">contact form</Link></p>
          <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>Website:</strong> <a href="https://www.ermits.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">www.ermits.com/privacy</a></p>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">14.1 Privacy Inquiries</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>General Privacy Questions:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li>Email: <Link to="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">contact form</Link></li>
          <li>Subject: "Privacy Inquiry"</li>
        </ul>

        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>Data Rights Requests:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li>Email: <Link to="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">contact form</Link></li>
          <li>Subject: "Privacy Rights Request - [Type]"</li>
          <li>Online Form: <a href="https://www.ermits.com/privacy-request" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">www.ermits.com/privacy-request</a></li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">14.2 Jurisdiction-Specific Contacts</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>Data Protection Officer (EU/UK/Swiss):</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li>Email: <Link to="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">contact form</Link></li>
          <li>Subject: "GDPR Inquiry - DPO"</li>
          <li>Handles: GDPR, UK GDPR, Swiss FADP matters</li>
        </ul>

        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>California Privacy Requests (CCPA/CPRA):</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4 pl-4">
          <li>Email: <Link to="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">contact form</Link></li>
          <li>Subject: "CCPA Request"</li>
          <li>Handles: California consumer privacy rights</li>
        </ul>

        <p className="text-gray-600 dark:text-gray-300 mb-2"><strong>HIPAA Privacy Officer (Healthcare):</strong></p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-6 pl-4">
          <li>Email: <Link to="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">contact form</Link></li>
          <li>Subject: "HIPAA Privacy Matter"</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">14.3 Security Concerns</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          <Link to="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">Contact form (Security)</Link><br />
          Subject: "Security Issue - [Urgent/Non-Urgent]"
        </p>
      </Card>

      <Card className="p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">15. EFFECTIVE DATE AND ACCEPTANCE</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4"><strong>Effective Date:</strong> October 31, 2025</p>
        <p className="text-gray-600 dark:text-gray-300 mb-4"><strong>Last Updated:</strong> December 13, 2025</p>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          <strong>By using ERMITS Services, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.</strong>
        </p>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          If you do not agree with this Privacy Policy, you must discontinue use of all ERMITS Services immediately.
        </p>
      </Card>
    </div>
  );
};

export default MasterPrivacyPolicy;

