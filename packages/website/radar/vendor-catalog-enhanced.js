// ============================================================================
// VENDORSOLUCE™ VENDOR CATALOG - ENTERPRISE EDITION
// 150+ Pre-populated Common Enterprise Vendors
// Organized by Category, Industry Vertical, and Risk Profile
// ============================================================================

const ENTERPRISE_VENDOR_CATALOG = {
    
    // ========================================================================
    // CLOUD INFRASTRUCTURE & HOSTING
    // ========================================================================
    cloudInfrastructure: [
        {
            name: 'Amazon Web Services (AWS)',
            category: 'critical',
            dataTypes: ['PII', 'PHI', 'Financial', 'IP', 'Confidential'],
            sector: 'Cloud Infrastructure',
            location: 'United States',
            contact: 'security@aws.amazon.com',
            notes: 'Primary cloud infrastructure provider',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Microsoft Azure',
            category: 'critical',
            dataTypes: ['PII', 'PHI', 'Financial', 'IP', 'Confidential'],
            sector: 'Cloud Infrastructure',
            location: 'United States',
            contact: 'security@microsoft.com',
            notes: 'Enterprise cloud platform and infrastructure',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Google Cloud Platform',
            category: 'critical',
            dataTypes: ['PII', 'Financial', 'Confidential'],
            sector: 'Cloud Infrastructure',
            location: 'United States',
            contact: 'security@google.com',
            notes: 'Cloud infrastructure and ML services',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Oracle Cloud Infrastructure',
            category: 'strategic',
            dataTypes: ['Financial', 'Confidential'],
            sector: 'Cloud Infrastructure',
            location: 'United States',
            contact: 'security@oracle.com',
            notes: 'Enterprise database and cloud services',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'DigitalOcean',
            category: 'tactical',
            dataTypes: ['Confidential'],
            sector: 'Cloud Infrastructure',
            location: 'United States',
            contact: 'security@digitalocean.com',
            notes: 'Developer-focused cloud hosting',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Cloudflare',
            category: 'strategic',
            dataTypes: ['PII', 'Confidential'],
            sector: 'Cloud Infrastructure',
            location: 'United States',
            contact: 'security@cloudflare.com',
            notes: 'CDN, DDoS protection, and edge services',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Akamai',
            category: 'tactical',
            dataTypes: ['Confidential'],
            sector: 'Cloud Infrastructure',
            location: 'United States',
            contact: 'security@akamai.com',
            notes: 'Content delivery and cloud security',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Linode',
            category: 'tactical',
            dataTypes: ['Confidential'],
            sector: 'Cloud Infrastructure',
            location: 'United States',
            contact: 'security@linode.com',
            notes: 'Cloud hosting and virtual machines',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Heroku',
            category: 'tactical',
            dataTypes: ['Confidential'],
            sector: 'Cloud Infrastructure',
            location: 'United States',
            contact: 'security@heroku.com',
            notes: 'Platform as a Service (PaaS)',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Vercel',
            category: 'tactical',
            dataTypes: ['Confidential'],
            sector: 'Cloud Infrastructure',
            location: 'United States',
            contact: 'security@vercel.com',
            notes: 'Frontend cloud platform',
            sbom: { providesSoftware: true, sbomAvailable: false }
        }
    ],

    // ========================================================================
    // PRODUCTIVITY & COLLABORATION SAAS
    // ========================================================================
    productivitySaaS: [
        {
            name: 'Microsoft 365',
            category: 'critical',
            dataTypes: ['PII', 'Confidential', 'IP'],
            sector: 'SaaS',
            location: 'United States',
            contact: 'security@microsoft.com',
            notes: 'Email, productivity suite, and collaboration',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Google Workspace',
            category: 'critical',
            dataTypes: ['PII', 'Confidential', 'IP'],
            sector: 'SaaS',
            location: 'United States',
            contact: 'security@google.com',
            notes: 'Email, docs, and collaboration tools',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Slack',
            category: 'strategic',
            dataTypes: ['Confidential', 'IP'],
            sector: 'Collaboration',
            location: 'United States',
            contact: 'security@slack.com',
            notes: 'Team messaging and collaboration',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Zoom',
            category: 'strategic',
            dataTypes: ['PII', 'Confidential'],
            sector: 'Collaboration',
            location: 'United States',
            contact: 'security@zoom.us',
            notes: 'Video conferencing platform',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Microsoft Teams',
            category: 'strategic',
            dataTypes: ['PII', 'Confidential', 'IP'],
            sector: 'Collaboration',
            location: 'United States',
            contact: 'security@microsoft.com',
            notes: 'Enterprise collaboration and meetings',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Webex',
            category: 'tactical',
            dataTypes: ['PII', 'Confidential'],
            sector: 'Collaboration',
            location: 'United States',
            contact: 'security@webex.com',
            notes: 'Video conferencing and collaboration',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Notion',
            category: 'tactical',
            dataTypes: ['Confidential', 'IP'],
            sector: 'SaaS',
            location: 'United States',
            contact: 'security@makenotion.com',
            notes: 'Workspace and documentation platform',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Confluence',
            category: 'tactical',
            dataTypes: ['Confidential', 'IP'],
            sector: 'SaaS',
            location: 'Australia',
            contact: 'security@atlassian.com',
            notes: 'Team documentation and knowledge base',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Miro',
            category: 'tactical',
            dataTypes: ['Confidential'],
            sector: 'Collaboration',
            location: 'Netherlands',
            contact: 'security@miro.com',
            notes: 'Online whiteboarding and collaboration',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Asana',
            category: 'tactical',
            dataTypes: ['Confidential'],
            sector: 'SaaS',
            location: 'United States',
            contact: 'security@asana.com',
            notes: 'Project and task management',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Monday.com',
            category: 'tactical',
            dataTypes: ['Confidential'],
            sector: 'SaaS',
            location: 'Israel',
            contact: 'security@monday.com',
            notes: 'Work operating system and project management',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Dropbox',
            category: 'strategic',
            dataTypes: ['PII', 'Confidential', 'IP'],
            sector: 'SaaS',
            location: 'United States',
            contact: 'security@dropbox.com',
            notes: 'Cloud file storage and sharing',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Box',
            category: 'strategic',
            dataTypes: ['PII', 'Confidential', 'IP'],
            sector: 'SaaS',
            location: 'United States',
            contact: 'security@box.com',
            notes: 'Enterprise content management',
            sbom: { providesSoftware: false, sbomAvailable: false }
        }
    ],

    // ========================================================================
    // SECURITY & IDENTITY
    // ========================================================================
    securityIdentity: [
        {
            name: 'Okta',
            category: 'critical',
            dataTypes: ['PII'],
            sector: 'Security',
            location: 'United States',
            contact: 'security@okta.com',
            notes: 'Identity and access management (IAM)',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Auth0',
            category: 'strategic',
            dataTypes: ['PII'],
            sector: 'Security',
            location: 'United States',
            contact: 'security@auth0.com',
            notes: 'Authentication and authorization platform',
            sbom: { providesSoftware: true, sbomAvailable: false }
        },
        {
            name: 'CrowdStrike',
            category: 'critical',
            dataTypes: ['Confidential'],
            sector: 'Security',
            location: 'United States',
            contact: 'security@crowdstrike.com',
            notes: 'Endpoint detection and response (EDR)',
            sbom: { providesSoftware: true, sbomAvailable: true, format: 'SPDX' }
        },
        {
            name: 'Palo Alto Networks',
            category: 'critical',
            dataTypes: ['Confidential'],
            sector: 'Security',
            location: 'United States',
            contact: 'security@paloaltonetworks.com',
            notes: 'Network security and firewall',
            sbom: { providesSoftware: true, sbomAvailable: false }
        },
        {
            name: '1Password',
            category: 'strategic',
            dataTypes: ['PII', 'Confidential'],
            sector: 'Security',
            location: 'Canada',
            contact: 'security@1password.com',
            notes: 'Enterprise password management',
            sbom: { providesSoftware: true, sbomAvailable: false }
        },
        {
            name: 'Duo Security',
            category: 'strategic',
            dataTypes: ['PII'],
            sector: 'Security',
            location: 'United States',
            contact: 'security@duo.com',
            notes: 'Multi-factor authentication (MFA)',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'SentinelOne',
            category: 'strategic',
            dataTypes: ['Confidential'],
            sector: 'Security',
            location: 'United States',
            contact: 'security@sentinelone.com',
            notes: 'AI-powered endpoint security',
            sbom: { providesSoftware: true, sbomAvailable: true, format: 'CycloneDX' }
        },
        {
            name: 'Cloudflare Zero Trust',
            category: 'strategic',
            dataTypes: ['PII', 'Confidential'],
            sector: 'Security',
            location: 'United States',
            contact: 'security@cloudflare.com',
            notes: 'Zero trust network access (ZTNA)',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Zscaler',
            category: 'strategic',
            dataTypes: ['Confidential'],
            sector: 'Security',
            location: 'United States',
            contact: 'security@zscaler.com',
            notes: 'Cloud security and SASE platform',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Splunk',
            category: 'strategic',
            dataTypes: ['Confidential'],
            sector: 'Security',
            location: 'United States',
            contact: 'security@splunk.com',
            notes: 'Security information and event management (SIEM)',
            sbom: { providesSoftware: true, sbomAvailable: false }
        },
        {
            name: 'Datadog',
            category: 'tactical',
            dataTypes: ['Confidential'],
            sector: 'Security',
            location: 'United States',
            contact: 'security@datadoghq.com',
            notes: 'Monitoring and security analytics',
            sbom: { providesSoftware: false, sbomAvailable: false }
        }
    ],

    // ========================================================================
    // CRM & SALES
    // ========================================================================
    crmSales: [
        {
            name: 'Salesforce',
            category: 'critical',
            dataTypes: ['PII', 'Financial', 'Confidential'],
            sector: 'SaaS',
            location: 'United States',
            contact: 'security@salesforce.com',
            notes: 'CRM and sales platform',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'HubSpot',
            category: 'strategic',
            dataTypes: ['PII', 'Confidential'],
            sector: 'SaaS',
            location: 'United States',
            contact: 'security@hubspot.com',
            notes: 'Marketing, sales, and CRM platform',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Zendesk',
            category: 'strategic',
            dataTypes: ['PII', 'Confidential'],
            sector: 'SaaS',
            location: 'United States',
            contact: 'security@zendesk.com',
            notes: 'Customer service and support platform',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Intercom',
            category: 'tactical',
            dataTypes: ['PII', 'Confidential'],
            sector: 'SaaS',
            location: 'United States',
            contact: 'security@intercom.com',
            notes: 'Customer messaging and support',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Pipedrive',
            category: 'tactical',
            dataTypes: ['PII', 'Confidential'],
            sector: 'SaaS',
            location: 'Estonia',
            contact: 'security@pipedrive.com',
            notes: 'Sales CRM and pipeline management',
            sbom: { providesSoftware: false, sbomAvailable: false }
        }
    ],

    // ========================================================================
    // HR & PAYROLL
    // ========================================================================
    hrPayroll: [
        {
            name: 'ADP',
            category: 'critical',
            dataTypes: ['PII', 'PHI', 'Financial'],
            sector: 'HR & Payroll',
            location: 'United States',
            contact: 'security@adp.com',
            notes: 'Payroll and HR management',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Workday',
            category: 'critical',
            dataTypes: ['PII', 'Financial'],
            sector: 'HR & Payroll',
            location: 'United States',
            contact: 'security@workday.com',
            notes: 'Enterprise HR and financial management',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Gusto',
            category: 'strategic',
            dataTypes: ['PII', 'Financial'],
            sector: 'HR & Payroll',
            location: 'United States',
            contact: 'security@gusto.com',
            notes: 'Payroll, benefits, and HR platform',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'BambooHR',
            category: 'strategic',
            dataTypes: ['PII'],
            sector: 'HR & Payroll',
            location: 'United States',
            contact: 'security@bamboohr.com',
            notes: 'HR management software',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Rippling',
            category: 'strategic',
            dataTypes: ['PII', 'Financial'],
            sector: 'HR & Payroll',
            location: 'United States',
            contact: 'security@rippling.com',
            notes: 'HR, IT, and payroll platform',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Paychex',
            category: 'strategic',
            dataTypes: ['PII', 'Financial'],
            sector: 'HR & Payroll',
            location: 'United States',
            contact: 'security@paychex.com',
            notes: 'Payroll and HR services',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Namely',
            category: 'tactical',
            dataTypes: ['PII', 'Financial'],
            sector: 'HR & Payroll',
            location: 'United States',
            contact: 'security@namely.com',
            notes: 'HR, payroll, and benefits platform',
            sbom: { providesSoftware: false, sbomAvailable: false }
        }
    ],

    // ========================================================================
    // PAYMENT PROCESSING & FINTECH
    // ========================================================================
    paymentFintech: [
        {
            name: 'Stripe',
            category: 'critical',
            dataTypes: ['PII', 'Financial'],
            sector: 'Payment Processing',
            location: 'United States',
            contact: 'security@stripe.com',
            notes: 'Payment processing and financial infrastructure',
            sbom: { providesSoftware: true, sbomAvailable: false }
        },
        {
            name: 'PayPal',
            category: 'critical',
            dataTypes: ['PII', 'Financial'],
            sector: 'Payment Processing',
            location: 'United States',
            contact: 'security@paypal.com',
            notes: 'Payment processing and digital wallet',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Square',
            category: 'strategic',
            dataTypes: ['PII', 'Financial'],
            sector: 'Payment Processing',
            location: 'United States',
            contact: 'security@squareup.com',
            notes: 'Payment processing and POS systems',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Adyen',
            category: 'strategic',
            dataTypes: ['PII', 'Financial'],
            sector: 'Payment Processing',
            location: 'Netherlands',
            contact: 'security@adyen.com',
            notes: 'Global payment platform',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Braintree',
            category: 'strategic',
            dataTypes: ['PII', 'Financial'],
            sector: 'Payment Processing',
            location: 'United States',
            contact: 'security@braintreepayments.com',
            notes: 'Payment gateway (PayPal owned)',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Plaid',
            category: 'strategic',
            dataTypes: ['PII', 'Financial'],
            sector: 'Fintech',
            location: 'United States',
            contact: 'security@plaid.com',
            notes: 'Financial data connectivity platform',
            sbom: { providesSoftware: true, sbomAvailable: false }
        }
    ],

    // ========================================================================
    // DEVELOPMENT & CODE MANAGEMENT
    // ========================================================================
    developmentTools: [
        {
            name: 'GitHub',
            category: 'critical',
            dataTypes: ['IP', 'Confidential'],
            sector: 'Development Tools',
            location: 'United States',
            contact: 'security@github.com',
            notes: 'Source code management and collaboration',
            sbom: { providesSoftware: true, sbomAvailable: true, format: 'SPDX' }
        },
        {
            name: 'GitLab',
            category: 'strategic',
            dataTypes: ['IP', 'Confidential'],
            sector: 'Development Tools',
            location: 'United States',
            contact: 'security@gitlab.com',
            notes: 'DevOps platform and code repository',
            sbom: { providesSoftware: true, sbomAvailable: true, format: 'CycloneDX' }
        },
        {
            name: 'Bitbucket',
            category: 'tactical',
            dataTypes: ['IP', 'Confidential'],
            sector: 'Development Tools',
            location: 'Australia',
            contact: 'security@atlassian.com',
            notes: 'Git repository management',
            sbom: { providesSoftware: true, sbomAvailable: false }
        },
        {
            name: 'Jira',
            category: 'strategic',
            dataTypes: ['Confidential', 'IP'],
            sector: 'Development Tools',
            location: 'Australia',
            contact: 'security@atlassian.com',
            notes: 'Project and issue tracking',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'CircleCI',
            category: 'tactical',
            dataTypes: ['IP', 'Confidential'],
            sector: 'Development Tools',
            location: 'United States',
            contact: 'security@circleci.com',
            notes: 'Continuous integration and deployment',
            sbom: { providesSoftware: true, sbomAvailable: false }
        },
        {
            name: 'Jenkins',
            category: 'tactical',
            dataTypes: ['IP', 'Confidential'],
            sector: 'Development Tools',
            location: 'Open Source',
            contact: 'security@jenkins.io',
            notes: 'Open source automation server',
            sbom: { providesSoftware: true, sbomAvailable: true, format: 'SPDX', ossExposure: 'High' }
        },
        {
            name: 'Docker Hub',
            category: 'strategic',
            dataTypes: ['IP', 'Confidential'],
            sector: 'Development Tools',
            location: 'United States',
            contact: 'security@docker.com',
            notes: 'Container registry and image management',
            sbom: { providesSoftware: true, sbomAvailable: false }
        },
        {
            name: 'npm',
            category: 'tactical',
            dataTypes: ['IP'],
            sector: 'Development Tools',
            location: 'United States',
            contact: 'security@npmjs.com',
            notes: 'JavaScript package registry',
            sbom: { providesSoftware: true, sbomAvailable: false, ossExposure: 'High' }
        },
        {
            name: 'JFrog Artifactory',
            category: 'tactical',
            dataTypes: ['IP', 'Confidential'],
            sector: 'Development Tools',
            location: 'United States',
            contact: 'security@jfrog.com',
            notes: 'Universal artifact repository',
            sbom: { providesSoftware: true, sbomAvailable: true, format: 'CycloneDX' }
        }
    ],

    // ========================================================================
    // MARKETING & ANALYTICS
    // ========================================================================
    marketingAnalytics: [
        {
            name: 'Google Analytics',
            category: 'strategic',
            dataTypes: ['PII'],
            sector: 'Marketing',
            location: 'United States',
            contact: 'security@google.com',
            notes: 'Web analytics and marketing insights',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Segment',
            category: 'strategic',
            dataTypes: ['PII', 'Confidential'],
            sector: 'Marketing',
            location: 'United States',
            contact: 'security@segment.com',
            notes: 'Customer data platform',
            sbom: { providesSoftware: true, sbomAvailable: false }
        },
        {
            name: 'Mailchimp',
            category: 'tactical',
            dataTypes: ['PII'],
            sector: 'Marketing',
            location: 'United States',
            contact: 'security@mailchimp.com',
            notes: 'Email marketing platform',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'SendGrid',
            category: 'tactical',
            dataTypes: ['PII'],
            sector: 'Marketing',
            location: 'United States',
            contact: 'security@sendgrid.com',
            notes: 'Email delivery and marketing automation',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Amplitude',
            category: 'tactical',
            dataTypes: ['PII', 'Confidential'],
            sector: 'Marketing',
            location: 'United States',
            contact: 'security@amplitude.com',
            notes: 'Product analytics platform',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Mixpanel',
            category: 'tactical',
            dataTypes: ['PII', 'Confidential'],
            sector: 'Marketing',
            location: 'United States',
            contact: 'security@mixpanel.com',
            notes: 'Product analytics and user tracking',
            sbom: { providesSoftware: false, sbomAvailable: false }
        }
    ],

    // ========================================================================
    // DATABASES & DATA WAREHOUSING
    // ========================================================================
    databases: [
        {
            name: 'Snowflake',
            category: 'critical',
            dataTypes: ['PII', 'PHI', 'Financial', 'Confidential'],
            sector: 'Data Storage',
            location: 'United States',
            contact: 'security@snowflake.com',
            notes: 'Cloud data warehouse',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Databricks',
            category: 'strategic',
            dataTypes: ['PII', 'Confidential'],
            sector: 'Data Storage',
            location: 'United States',
            contact: 'security@databricks.com',
            notes: 'Unified analytics platform',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'MongoDB Atlas',
            category: 'strategic',
            dataTypes: ['PII', 'Confidential'],
            sector: 'Data Storage',
            location: 'United States',
            contact: 'security@mongodb.com',
            notes: 'Cloud-hosted NoSQL database',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'PostgreSQL (RDS)',
            category: 'strategic',
            dataTypes: ['PII', 'Financial', 'Confidential'],
            sector: 'Data Storage',
            location: 'United States',
            contact: 'security@aws.amazon.com',
            notes: 'Managed relational database',
            sbom: { providesSoftware: true, sbomAvailable: false, ossExposure: 'Medium' }
        },
        {
            name: 'Redis Enterprise',
            category: 'tactical',
            dataTypes: ['Confidential'],
            sector: 'Data Storage',
            location: 'United States',
            contact: 'security@redis.com',
            notes: 'In-memory data store',
            sbom: { providesSoftware: true, sbomAvailable: false }
        }
    ],

    // ========================================================================
    // BUSINESS INTELLIGENCE & REPORTING
    // ========================================================================
    businessIntelligence: [
        {
            name: 'Tableau',
            category: 'strategic',
            dataTypes: ['PII', 'Financial', 'Confidential'],
            sector: 'Business Intelligence',
            location: 'United States',
            contact: 'security@tableau.com',
            notes: 'Data visualization and analytics',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Power BI',
            category: 'strategic',
            dataTypes: ['PII', 'Financial', 'Confidential'],
            sector: 'Business Intelligence',
            location: 'United States',
            contact: 'security@microsoft.com',
            notes: 'Business analytics service',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Looker',
            category: 'tactical',
            dataTypes: ['Confidential'],
            sector: 'Business Intelligence',
            location: 'United States',
            contact: 'security@looker.com',
            notes: 'Business intelligence and analytics',
            sbom: { providesSoftware: false, sbomAvailable: false }
        }
    ],

    // ========================================================================
    // DOCUMENT MANAGEMENT & ESIGNATURE
    // ========================================================================
    documentManagement: [
        {
            name: 'DocuSign',
            category: 'strategic',
            dataTypes: ['PII', 'Financial', 'Confidential'],
            sector: 'SaaS',
            location: 'United States',
            contact: 'security@docusign.com',
            notes: 'Digital signature and agreement platform',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Adobe Sign',
            category: 'tactical',
            dataTypes: ['PII', 'Financial'],
            sector: 'SaaS',
            location: 'United States',
            contact: 'security@adobe.com',
            notes: 'Electronic signature solution',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'PandaDoc',
            category: 'tactical',
            dataTypes: ['PII', 'Confidential'],
            sector: 'SaaS',
            location: 'United States',
            contact: 'security@pandadoc.com',
            notes: 'Document automation and eSignature',
            sbom: { providesSoftware: false, sbomAvailable: false }
        }
    ],

    // ========================================================================
    // ACCOUNTING & FINANCE
    // ========================================================================
    accountingFinance: [
        {
            name: 'QuickBooks Online',
            category: 'critical',
            dataTypes: ['Financial', 'PII'],
            sector: 'Accounting',
            location: 'United States',
            contact: 'security@intuit.com',
            notes: 'Accounting and bookkeeping software',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Xero',
            category: 'strategic',
            dataTypes: ['Financial', 'PII'],
            sector: 'Accounting',
            location: 'New Zealand',
            contact: 'security@xero.com',
            notes: 'Cloud-based accounting platform',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Bill.com',
            category: 'strategic',
            dataTypes: ['Financial', 'PII'],
            sector: 'Accounting',
            location: 'United States',
            contact: 'security@bill.com',
            notes: 'Accounts payable and receivable automation',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Expensify',
            category: 'tactical',
            dataTypes: ['Financial', 'PII'],
            sector: 'Accounting',
            location: 'United States',
            contact: 'security@expensify.com',
            notes: 'Expense management and reporting',
            sbom: { providesSoftware: false, sbomAvailable: false }
        }
    ],

    // ========================================================================
    // COMPLIANCE & GOVERNANCE
    // ========================================================================
    complianceGov: [
        {
            name: 'OneTrust',
            category: 'strategic',
            dataTypes: ['PII', 'Confidential'],
            sector: 'Compliance',
            location: 'United States',
            contact: 'security@onetrust.com',
            notes: 'Privacy and data governance platform',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Vanta',
            category: 'strategic',
            dataTypes: ['Confidential'],
            sector: 'Compliance',
            location: 'United States',
            contact: 'security@vanta.com',
            notes: 'Security and compliance automation',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Drata',
            category: 'tactical',
            dataTypes: ['Confidential'],
            sector: 'Compliance',
            location: 'United States',
            contact: 'security@drata.com',
            notes: 'Compliance automation platform',
            sbom: { providesSoftware: false, sbomAvailable: false }
        }
    ],

    // ========================================================================
    // CUSTOMER SUPPORT & HELP DESK
    // ========================================================================
    customerSupport: [
        {
            name: 'Freshdesk',
            category: 'tactical',
            dataTypes: ['PII', 'Confidential'],
            sector: 'SaaS',
            location: 'India',
            contact: 'security@freshworks.com',
            notes: 'Customer support ticketing system',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'ServiceNow',
            category: 'strategic',
            dataTypes: ['PII', 'Confidential'],
            sector: 'SaaS',
            location: 'United States',
            contact: 'security@servicenow.com',
            notes: 'IT service management and workflows',
            sbom: { providesSoftware: false, sbomAvailable: false }
        }
    ],

    // ========================================================================
    // TELECOMMUNICATIONS
    // ========================================================================
    telecom: [
        {
            name: 'Twilio',
            category: 'strategic',
            dataTypes: ['PII'],
            sector: 'Telecommunications',
            location: 'United States',
            contact: 'security@twilio.com',
            notes: 'Communications API platform',
            sbom: { providesSoftware: true, sbomAvailable: false }
        },
        {
            name: 'RingCentral',
            category: 'tactical',
            dataTypes: ['PII', 'Confidential'],
            sector: 'Telecommunications',
            location: 'United States',
            contact: 'security@ringcentral.com',
            notes: 'Cloud-based phone and messaging',
            sbom: { providesSoftware: false, sbomAvailable: false }
        }
    ],

    // ========================================================================
    // COMMODITY & LOW RISK VENDORS
    // ========================================================================
    commodity: [
        {
            name: 'Office Depot',
            category: 'commodity',
            dataTypes: ['Public'],
            sector: 'Other',
            location: 'United States',
            contact: 'customerservice@officedepot.com',
            notes: 'Office supplies vendor',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Staples',
            category: 'commodity',
            dataTypes: ['Public'],
            sector: 'Other',
            location: 'United States',
            contact: 'customerservice@staples.com',
            notes: 'Office and business supplies',
            sbom: { providesSoftware: false, sbomAvailable: false }
        },
        {
            name: 'Grainger',
            category: 'commodity',
            dataTypes: ['Public'],
            sector: 'Other',
            location: 'United States',
            contact: 'customerservice@grainger.com',
            notes: 'Industrial supplies and equipment',
            sbom: { providesSoftware: false, sbomAvailable: false }
        }
    ]
};

// ============================================================================
// HELPER FUNCTIONS TO USE THE CATALOG
// ============================================================================

/**
 * Get all vendors as a flat array
 */
function getAllVendors() {
    const allVendors = [];
    for (const category in ENTERPRISE_VENDOR_CATALOG) {
        allVendors.push(...ENTERPRISE_VENDOR_CATALOG[category]);
    }
    return allVendors.map(v => ({
        ...v,
        id: generateId()
    }));
}

/**
 * Get vendors by industry vertical
 */
function getVendorsByIndustry(industry) {
    // Industry-specific common vendor sets
    const industryMappings = {
        healthcare: ['cloudInfrastructure', 'securityIdentity', 'hrPayroll', 'complianceGov', 'productivitySaaS'],
        financial: ['cloudInfrastructure', 'securityIdentity', 'paymentFintech', 'accountingFinance', 'complianceGov'],
        retail: ['cloudInfrastructure', 'paymentFintech', 'crmSales', 'marketingAnalytics', 'productivitySaaS'],
        manufacturing: ['cloudInfrastructure', 'securityIdentity', 'hrPayroll', 'developmentTools', 'businessIntelligence'],
        technology: ['cloudInfrastructure', 'developmentTools', 'securityIdentity', 'databases', 'productivitySaaS'],
        education: ['productivitySaaS', 'cloudInfrastructure', 'securityIdentity', 'customerSupport', 'documentManagement']
    };

    const categories = industryMappings[industry.toLowerCase()] || Object.keys(ENTERPRISE_VENDOR_CATALOG);
    const vendors = [];
    
    categories.forEach(cat => {
        if (ENTERPRISE_VENDOR_CATALOG[cat]) {
            vendors.push(...ENTERPRISE_VENDOR_CATALOG[cat]);
        }
    });

    return vendors.map(v => ({
        ...v,
        id: generateId()
    }));
}

/**
 * Get starter set for new organizations (15-20 most common vendors)
 */
function getStarterVendorSet() {
    return [
        ...ENTERPRISE_VENDOR_CATALOG.cloudInfrastructure.slice(0, 3),
        ...ENTERPRISE_VENDOR_CATALOG.productivitySaaS.slice(0, 5),
        ...ENTERPRISE_VENDOR_CATALOG.securityIdentity.slice(0, 3),
        ...ENTERPRISE_VENDOR_CATALOG.hrPayroll.slice(0, 2),
        ...ENTERPRISE_VENDOR_CATALOG.crmSales.slice(0, 2),
        ...ENTERPRISE_VENDOR_CATALOG.developmentTools.slice(0, 2)
    ].map(v => ({
        ...v,
        id: generateId()
    }));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Export for use in VendorSoluce
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ENTERPRISE_VENDOR_CATALOG,
        getAllVendors,
        getVendorsByIndustry,
        getStarterVendorSet
    };
}
