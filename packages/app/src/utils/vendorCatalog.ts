// Vendor Catalog - Pre-populated enterprise vendors
import type { VendorBase } from '../types/vendorRadar';

export const ENTERPRISE_VENDOR_CATALOG: VendorBase[] = [
  // Cloud Infrastructure
  {
    name: 'Amazon Web Services (AWS)',
    category: 'critical',
    dataTypes: ['PII', 'PHI', 'Financial', 'IP', 'Confidential'],
    sector: 'Cloud Infrastructure',
    location: 'United States',
    contact: 'security@aws.amazon.com',
    notes: 'Primary cloud infrastructure provider',
    sbomProfile: { providesSoftware: false, sbomAvailable: false }
  },
  {
    name: 'Microsoft Azure',
    category: 'critical',
    dataTypes: ['PII', 'PHI', 'Financial', 'IP', 'Confidential'],
    sector: 'Cloud Infrastructure',
    location: 'United States',
    contact: 'security@microsoft.com',
    notes: 'Enterprise cloud platform and infrastructure',
    sbomProfile: { providesSoftware: false, sbomAvailable: false }
  },
  {
    name: 'Google Cloud Platform',
    category: 'critical',
    dataTypes: ['PII', 'Financial', 'Confidential'],
    sector: 'Cloud Infrastructure',
    location: 'United States',
    contact: 'security@google.com',
    notes: 'Cloud infrastructure and ML services',
    sbomProfile: { providesSoftware: false, sbomAvailable: false }
  },
  {
    name: 'Oracle Cloud Infrastructure',
    category: 'strategic',
    dataTypes: ['Financial', 'Confidential'],
    sector: 'Cloud Infrastructure',
    location: 'United States',
    contact: 'security@oracle.com',
    notes: 'Enterprise database and cloud services',
    sbomProfile: { providesSoftware: false, sbomAvailable: false }
  },
  {
    name: 'Cloudflare',
    category: 'strategic',
    dataTypes: ['PII', 'Confidential'],
    sector: 'Cloud Infrastructure',
    location: 'United States',
    contact: 'security@cloudflare.com',
    notes: 'CDN, DDoS protection, and edge services',
    sbomProfile: { providesSoftware: false, sbomAvailable: false }
  },
  
  // Productivity & Collaboration
  {
    name: 'Microsoft 365',
    category: 'critical',
    dataTypes: ['PII', 'Confidential', 'IP'],
    sector: 'SaaS',
    location: 'United States',
    contact: 'security@microsoft.com',
    notes: 'Email, productivity suite, and collaboration',
    sbomProfile: { providesSoftware: false, sbomAvailable: false }
  },
  {
    name: 'Google Workspace',
    category: 'critical',
    dataTypes: ['PII', 'Confidential', 'IP'],
    sector: 'SaaS',
    location: 'United States',
    contact: 'security@google.com',
    notes: 'Email, docs, and collaboration tools',
    sbomProfile: { providesSoftware: false, sbomAvailable: false }
  },
  {
    name: 'Slack',
    category: 'strategic',
    dataTypes: ['Confidential', 'IP'],
    sector: 'Collaboration',
    location: 'United States',
    contact: 'security@slack.com',
    notes: 'Team messaging and collaboration',
    sbomProfile: { providesSoftware: false, sbomAvailable: false }
  },
  {
    name: 'Zoom',
    category: 'strategic',
    dataTypes: ['PII', 'Confidential'],
    sector: 'Collaboration',
    location: 'United States',
    contact: 'security@zoom.us',
    notes: 'Video conferencing platform',
    sbomProfile: { providesSoftware: false, sbomAvailable: false }
  },
  {
    name: 'Microsoft Teams',
    category: 'strategic',
    dataTypes: ['PII', 'Confidential', 'IP'],
    sector: 'Collaboration',
    location: 'United States',
    contact: 'security@microsoft.com',
    notes: 'Enterprise collaboration and meetings',
    sbomProfile: { providesSoftware: false, sbomAvailable: false }
  },
  {
    name: 'Dropbox',
    category: 'strategic',
    dataTypes: ['PII', 'Confidential', 'IP'],
    sector: 'SaaS',
    location: 'United States',
    contact: 'security@dropbox.com',
    notes: 'Cloud file storage and sharing',
    sbomProfile: { providesSoftware: false, sbomAvailable: false }
  },
  {
    name: 'Box',
    category: 'strategic',
    dataTypes: ['PII', 'Confidential', 'IP'],
    sector: 'SaaS',
    location: 'United States',
    contact: 'security@box.com',
    notes: 'Enterprise content management',
    sbomProfile: { providesSoftware: false, sbomAvailable: false }
  },
  
  // Security & Identity
  {
    name: 'Okta',
    category: 'critical',
    dataTypes: ['PII'],
    sector: 'Security',
    location: 'United States',
    contact: 'security@okta.com',
    notes: 'Identity and access management (IAM)',
    sbomProfile: { providesSoftware: false, sbomAvailable: false }
  },
  {
    name: 'CrowdStrike',
    category: 'critical',
    dataTypes: ['Confidential'],
    sector: 'Security',
    location: 'United States',
    contact: 'security@crowdstrike.com',
    notes: 'Endpoint detection and response (EDR)',
    sbomProfile: { providesSoftware: true, sbomAvailable: true, sbomFormat: 'SPDX' }
  },
  {
    name: 'Palo Alto Networks',
    category: 'critical',
    dataTypes: ['Confidential'],
    sector: 'Security',
    location: 'United States',
    contact: 'security@paloaltonetworks.com',
    notes: 'Network security and firewall',
    sbomProfile: { providesSoftware: true, sbomAvailable: false }
  },
  {
    name: '1Password',
    category: 'strategic',
    dataTypes: ['PII', 'Confidential'],
    sector: 'Security',
    location: 'Canada',
    contact: 'security@1password.com',
    notes: 'Enterprise password management',
    sbomProfile: { providesSoftware: true, sbomAvailable: false }
  },
  {
    name: 'SentinelOne',
    category: 'strategic',
    dataTypes: ['Confidential'],
    sector: 'Security',
    location: 'United States',
    contact: 'security@sentinelone.com',
    notes: 'AI-powered endpoint security',
    sbomProfile: { providesSoftware: true, sbomAvailable: true, sbomFormat: 'CycloneDX' }
  },
  {
    name: 'Splunk',
    category: 'strategic',
    dataTypes: ['Confidential'],
    sector: 'Security',
    location: 'United States',
    contact: 'security@splunk.com',
    notes: 'Security information and event management (SIEM)',
    sbomProfile: { providesSoftware: true, sbomAvailable: false }
  },
  
  // CRM & Sales
  {
    name: 'Salesforce',
    category: 'critical',
    dataTypes: ['PII', 'Financial', 'Confidential'],
    sector: 'SaaS',
    location: 'United States',
    contact: 'security@salesforce.com',
    notes: 'CRM and sales platform',
    sbomProfile: { providesSoftware: false, sbomAvailable: false }
  },
  {
    name: 'HubSpot',
    category: 'strategic',
    dataTypes: ['PII', 'Confidential'],
    sector: 'SaaS',
    location: 'United States',
    contact: 'security@hubspot.com',
    notes: 'Marketing, sales, and CRM platform',
    sbomProfile: { providesSoftware: false, sbomAvailable: false }
  },
  {
    name: 'Zendesk',
    category: 'strategic',
    dataTypes: ['PII', 'Confidential'],
    sector: 'SaaS',
    location: 'United States',
    contact: 'security@zendesk.com',
    notes: 'Customer service and support platform',
    sbomProfile: { providesSoftware: false, sbomAvailable: false }
  },
  
  // HR & Payroll
  {
    name: 'ADP',
    category: 'critical',
    dataTypes: ['PII', 'PHI', 'Financial'],
    sector: 'HR & Payroll',
    location: 'United States',
    contact: 'security@adp.com',
    notes: 'Payroll and HR management',
    sbomProfile: { providesSoftware: false, sbomAvailable: false }
  },
  {
    name: 'Workday',
    category: 'critical',
    dataTypes: ['PII', 'Financial'],
    sector: 'HR & Payroll',
    location: 'United States',
    contact: 'security@workday.com',
    notes: 'Enterprise HR and financial management',
    sbomProfile: { providesSoftware: false, sbomAvailable: false }
  },
  {
    name: 'Gusto',
    category: 'strategic',
    dataTypes: ['PII', 'Financial'],
    sector: 'HR & Payroll',
    location: 'United States',
    contact: 'security@gusto.com',
    notes: 'Payroll, benefits, and HR platform',
    sbomProfile: { providesSoftware: false, sbomAvailable: false }
  },
  {
    name: 'BambooHR',
    category: 'strategic',
    dataTypes: ['PII'],
    sector: 'HR & Payroll',
    location: 'United States',
    contact: 'security@bamboohr.com',
    notes: 'HR management software',
    sbomProfile: { providesSoftware: false, sbomAvailable: false }
  },
  
  // Payment Processors
  {
    name: 'Stripe',
    category: 'critical',
    dataTypes: ['PII', 'Financial'],
    sector: 'Payment Processing',
    location: 'United States',
    contact: 'security@stripe.com',
    notes: 'Payment processing platform',
    sbomProfile: { providesSoftware: true, sbomAvailable: false }
  },
  {
    name: 'PayPal',
    category: 'critical',
    dataTypes: ['PII', 'Financial'],
    sector: 'Payment Processing',
    location: 'United States',
    contact: 'security@paypal.com',
    notes: 'Online payment system',
    sbomProfile: { providesSoftware: false, sbomAvailable: false }
  },
  {
    name: 'Square',
    category: 'strategic',
    dataTypes: ['PII', 'Financial'],
    sector: 'Payment Processing',
    location: 'United States',
    contact: 'security@square.com',
    notes: 'Payment and point-of-sale solutions',
    sbomProfile: { providesSoftware: false, sbomAvailable: false }
  },
  
  // Analytics & Marketing
  {
    name: 'Google Analytics',
    category: 'tactical',
    dataTypes: ['PII'],
    sector: 'Analytics',
    location: 'United States',
    contact: 'security@google.com',
    notes: 'Web analytics and tracking',
    sbomProfile: { providesSoftware: false, sbomAvailable: false }
  },
  {
    name: 'Adobe Analytics',
    category: 'strategic',
    dataTypes: ['PII', 'Confidential'],
    sector: 'Analytics',
    location: 'United States',
    contact: 'security@adobe.com',
    notes: 'Digital analytics platform',
    sbomProfile: { providesSoftware: false, sbomAvailable: false }
  },
  {
    name: 'Segment',
    category: 'tactical',
    dataTypes: ['PII'],
    sector: 'Analytics',
    location: 'United States',
    contact: 'security@segment.com',
    notes: 'Customer data platform',
    sbomProfile: { providesSoftware: true, sbomAvailable: false }
  },
  
  // Development Tools
  {
    name: 'GitHub',
    category: 'strategic',
    dataTypes: ['IP', 'Confidential'],
    sector: 'Development',
    location: 'United States',
    contact: 'security@github.com',
    notes: 'Code repository and version control',
    sbomProfile: { providesSoftware: true, sbomAvailable: true, sbomFormat: 'SPDX' }
  },
  {
    name: 'GitLab',
    category: 'strategic',
    dataTypes: ['IP', 'Confidential'],
    sector: 'Development',
    location: 'United States',
    contact: 'security@gitlab.com',
    notes: 'DevOps platform and code repository',
    sbomProfile: { providesSoftware: true, sbomAvailable: true, sbomFormat: 'SPDX' }
  },
  {
    name: 'Atlassian (Jira/Confluence)',
    category: 'strategic',
    dataTypes: ['IP', 'Confidential'],
    sector: 'Development',
    location: 'Australia',
    contact: 'security@atlassian.com',
    notes: 'Project management and collaboration',
    sbomProfile: { providesSoftware: false, sbomAvailable: false }
  },
  {
    name: 'Vercel',
    category: 'tactical',
    dataTypes: ['Confidential'],
    sector: 'Cloud Infrastructure',
    location: 'United States',
    contact: 'security@vercel.com',
    notes: 'Frontend cloud platform',
    sbomProfile: { providesSoftware: true, sbomAvailable: false }
  }
];

// Get vendors by category
export const getVendorsByCategory = (category: string): VendorBase[] => {
  if (category === 'all') return ENTERPRISE_VENDOR_CATALOG;
  return ENTERPRISE_VENDOR_CATALOG.filter(v => v.category === category);
};

// Search vendors
export const searchVendors = (searchTerm: string): VendorBase[] => {
  const term = searchTerm.toLowerCase();
  return ENTERPRISE_VENDOR_CATALOG.filter(v =>
    v.name.toLowerCase().includes(term) ||
    v.sector?.toLowerCase().includes(term) ||
    v.location?.toLowerCase().includes(term)
  );
};
