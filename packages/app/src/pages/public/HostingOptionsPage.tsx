import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Cloud,
  Server,
  WifiOff,
  GitMerge,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Download,
  Shield,
  Database,
  Lock,
  Globe,
  Cpu,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HostingOption {
  id: string;
  label: string;
  iconLg: React.ReactElement;
  iconSm: React.ReactElement;
  accentClass: string;
  tagline: string;
  description: string;
  pros: string[];
  considerations: string[];
  useCases: string[];
  cta: { label: string; href: string; external?: boolean };
  secondaryCta?: { label: string; href: string };
}

const HostingOptionsPage: React.FC = () => {
  const { t } = useTranslation();
  const [active, setActive] = useState<string | null>(null);

  const options: HostingOption[] = [
    {
      id: 'cloud',
      label: t('hostingOptions.cloud.label', 'Cloud (AWS, Azure, GCP)'),
      iconLg: <Cloud className="h-8 w-8" />,
      iconSm: <Cloud className="h-4 w-4" />,
      accentClass: 'border-blue-200 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-900/10',
      tagline: t('hostingOptions.cloud.tagline', 'Deploy on any major cloud provider using your own account and infrastructure.'),
      description: t(
        'hostingOptions.cloud.description',
        'Run VendorSoluce on AWS, Microsoft Azure, or Google Cloud Platform inside your own tenant. You bring the VMs, containers, or managed services; VendorSoluce ships as a static + edge-function bundle that fits any standard web-hosting stack. Supabase (self-hosted or cloud) or a compatible Postgres backend handles persistence.'
      ),
      pros: [
        t('hostingOptions.cloud.pros.0', 'Data stays in your cloud account and region'),
        t('hostingOptions.cloud.pros.1', 'Integrates with your existing IAM, VPC, and logging'),
        t('hostingOptions.cloud.pros.2', 'Scales horizontally with your workload'),
        t('hostingOptions.cloud.pros.3', 'Compatible with cloud-native backup and DR strategies'),
      ],
      considerations: [
        t('hostingOptions.cloud.considerations.0', 'Requires cloud infrastructure setup and maintenance'),
        t('hostingOptions.cloud.considerations.1', 'Outbound internet access needed unless air-gapped config is applied'),
      ],
      useCases: [
        t('hostingOptions.cloud.useCases.0', 'Enterprise teams already on AWS/Azure/GCP'),
        t('hostingOptions.cloud.useCases.1', 'Organisations with existing Terraform or IaC pipelines'),
        t('hostingOptions.cloud.useCases.2', 'Multi-region deployments with cloud-native HA'),
      ],
      cta: { label: t('hostingOptions.cloud.cta', 'View integration guides'), href: '/integration-guides' },
      secondaryCta: { label: t('hostingOptions.shared.contactSales', 'Contact sales for enterprise licensing'), href: '/contact' },
    },
    {
      id: 'on-premise',
      label: t('hostingOptions.onPremise.label', 'On-Premise'),
      iconLg: <Server className="h-8 w-8" />,
      iconSm: <Server className="h-4 w-4" />,
      accentClass: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-900/10',
      tagline: t('hostingOptions.onPremise.tagline', 'Self-host the full platform on your own servers — no external SaaS dependencies.'),
      description: t(
        'hostingOptions.onPremise.description',
        'The enterprise downloadable build runs entirely on your own hardware or virtualised infrastructure. No calls to VendorSoluce-hosted services are required. Tier entitlements ship with the bundle and are activated by a license key, replacing Stripe for billing.'
      ),
      pros: [
        t('hostingOptions.onPremise.pros.0', 'Complete data sovereignty — nothing leaves your network'),
        t('hostingOptions.onPremise.pros.1', 'License-key activation — no Stripe or subscription runtime dependency'),
        t('hostingOptions.onPremise.pros.2', 'Works behind corporate firewalls and proxies'),
        t('hostingOptions.onPremise.pros.3', 'Supports custom SSO/IdP via SAML or OIDC (Enterprise tier)'),
      ],
      considerations: [
        t('hostingOptions.onPremise.considerations.0', 'Your team owns upgrades and patching'),
        t('hostingOptions.onPremise.considerations.1', 'Requires internal Postgres-compatible database'),
      ],
      useCases: [
        t('hostingOptions.onPremise.useCases.0', 'Regulated industries (finance, healthcare, defence)'),
        t('hostingOptions.onPremise.useCases.1', 'Organisations with strict data-residency policies'),
        t('hostingOptions.onPremise.useCases.2', 'Environments that prohibit external SaaS vendors'),
      ],
      cta: { label: t('hostingOptions.onPremise.cta', 'Download enterprise build'), href: 'https://www.vendorsoluce.com/download', external: true },
      secondaryCta: { label: t('hostingOptions.shared.requestBuild', 'Request a customised build'), href: '/download#request' },
    },
    {
      id: 'air-gapped',
      label: t('hostingOptions.airGapped.label', 'Air-Gapped / Disconnected'),
      iconLg: <WifiOff className="h-8 w-8" />,
      iconSm: <WifiOff className="h-4 w-4" />,
      accentClass: 'border-orange-200 dark:border-orange-800 bg-orange-50/40 dark:bg-orange-900/10',
      tagline: t('hostingOptions.airGapped.tagline', 'Fully offline deployment — zero network egress, no external service calls.'),
      description: t(
        'hostingOptions.airGapped.description',
        'For the most sensitive environments, VendorSoluce can be packaged as a fully self-contained bundle delivered via secure media. All assets, fonts, and edge functions are bundled offline. License activation is performed once during setup against an offline key file — no internet connection is ever required after delivery.'
      ),
      pros: [
        t('hostingOptions.airGapped.pros.0', 'Zero network egress — suitable for classified or high-assurance environments'),
        t('hostingOptions.airGapped.pros.1', 'All assets bundled offline including i18n, fonts, and icons'),
        t('hostingOptions.airGapped.pros.2', 'Offline license activation via key file'),
        t('hostingOptions.airGapped.pros.3', 'Meets NIST SP 800-53 SC-7 boundary requirements'),
      ],
      considerations: [
        t('hostingOptions.airGapped.considerations.0', 'Updates require a new package delivery via secure media'),
        t('hostingOptions.airGapped.considerations.1', 'Requires custom delivery engagement — contact sales for scoping'),
      ],
      useCases: [
        t('hostingOptions.airGapped.useCases.0', 'Defence, intelligence, and national security programmes'),
        t('hostingOptions.airGapped.useCases.1', 'Critical infrastructure operators with network isolation requirements'),
        t('hostingOptions.airGapped.useCases.2', 'Secure development or research environments'),
      ],
      cta: { label: t('hostingOptions.airGapped.cta', 'Contact sales for air-gapped delivery'), href: '/contact' },
      secondaryCta: { label: t('hostingOptions.shared.requestBuild', 'Request a customised build'), href: '/download#request' },
    },
    {
      id: 'hybrid',
      label: t('hostingOptions.hybrid.label', 'Hybrid'),
      iconLg: <GitMerge className="h-8 w-8" />,
      iconSm: <GitMerge className="h-4 w-4" />,
      accentClass: 'border-violet-200 dark:border-violet-800 bg-violet-50/40 dark:bg-violet-900/10',
      tagline: t('hostingOptions.hybrid.tagline', 'Split workloads across your own infrastructure and cloud services as your policy allows.'),
      description: t(
        'hostingOptions.hybrid.description',
        'A hybrid deployment keeps sensitive vendor data and assessment records on-premise or in your private cloud, while non-sensitive workloads (static assets, analytics, public portal) may run on a managed edge or CDN. VendorSoluce supports split backends — for example, your own Supabase for persistent data alongside a CDN-deployed frontend.'
      ),
      pros: [
        t('hostingOptions.hybrid.pros.0', 'Balance data sovereignty with cloud performance'),
        t('hostingOptions.hybrid.pros.1', 'Route PII and evidence to your private store; serve UI from edge'),
        t('hostingOptions.hybrid.pros.2', 'Flexible configuration per environment (dev/staging/prod)'),
        t('hostingOptions.hybrid.pros.3', 'Gradual migration path from full on-premise to cloud'),
      ],
      considerations: [
        t('hostingOptions.hybrid.considerations.0', 'More complex network topology to design and document'),
        t('hostingOptions.hybrid.considerations.1', 'Latency between on-premise DB and cloud frontend should be measured'),
      ],
      useCases: [
        t('hostingOptions.hybrid.useCases.0', 'Organisations migrating from fully on-premise to cloud'),
        t('hostingOptions.hybrid.useCases.1', 'Multi-jurisdiction data residency requirements'),
        t('hostingOptions.hybrid.useCases.2', 'Teams wanting CDN performance with private data control'),
      ],
      cta: { label: t('hostingOptions.hybrid.cta', 'View integration guides'), href: '/integration-guides' },
      secondaryCta: { label: t('hostingOptions.shared.contactSales', 'Contact sales for architecture review'), href: '/contact' },
    },
    {
      id: 'other',
      label: t('hostingOptions.other.label', 'Custom / Other'),
      iconLg: <Cpu className="h-8 w-8" />,
      iconSm: <Cpu className="h-4 w-4" />,
      accentClass: 'border-gray-200 dark:border-gray-700 bg-gray-50/40 dark:bg-gray-800/20',
      tagline: t('hostingOptions.other.tagline', "Have a bespoke environment? We'll scope a delivery model that fits."),
      description: t(
        'hostingOptions.other.description',
        "Some deployments don't fit standard categories — private 5G networks, edge devices, mainframe-adjacent environments, or federated multi-tenant architectures. VendorSoluce's custom integration programme covers scoping, architecture review, bespoke packaging, and professional delivery for non-standard hosting requirements."
      ),
      pros: [
        t('hostingOptions.other.pros.0', 'Fully scoped around your existing environment'),
        t('hostingOptions.other.pros.1', 'Co-designed data flows and identity pipelines'),
        t('hostingOptions.other.pros.2', 'Dedicated success engineering and training'),
        t('hostingOptions.other.pros.3', 'Federal / high-assurance packaging and audit support'),
      ],
      considerations: [
        t('hostingOptions.other.considerations.0', 'Requires a scoping conversation and statement of work'),
        t('hostingOptions.other.considerations.1', 'Delivery timeline depends on environment complexity'),
      ],
      useCases: [
        t('hostingOptions.other.useCases.0', 'Federal agencies and high-assurance programmes'),
        t('hostingOptions.other.useCases.1', 'Multi-tenant enterprise platform integrations'),
        t('hostingOptions.other.useCases.2', 'Embedded OEM or white-label deployments'),
      ],
      cta: { label: t('hostingOptions.other.cta', 'Contact sales'), href: '/contact' },
    },
  ];

  const iconColors: Record<string, string> = {
    'cloud': 'text-blue-600 dark:text-blue-400',
    'on-premise': 'text-emerald-600 dark:text-emerald-400',
    'air-gapped': 'text-orange-600 dark:text-orange-400',
    'hybrid': 'text-violet-600 dark:text-violet-400',
    'other': 'text-gray-500 dark:text-gray-400',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-10">
        {/* Header */}
        <div className="mb-10 sm:mb-12">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <Link to="/download" className="hover:text-vendorsoluce-green dark:hover:text-vendorsoluce-light-green transition-colors">
              {t('downloads.title', 'Downloads')}
            </Link>
            <span>/</span>
            <span className="text-gray-700 dark:text-gray-300">{t('hostingOptions.breadcrumb', 'Hosting Options')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('hostingOptions.title', 'Hosting Options')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
            {t(
              'hostingOptions.subtitle',
              'VendorSoluce supports multiple deployment topologies. Choose the model that fits your infrastructure, compliance requirements, and team capability.'
            )}
          </p>
        </div>

        {/* Quick-pick tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setActive(active === opt.id ? null : opt.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                active === opt.id
                  ? 'bg-vendorsoluce-green text-white border-vendorsoluce-green'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-vendorsoluce-green/50'
              }`}
            >
              <span className={active === opt.id ? 'text-white' : iconColors[opt.id]}>
                {opt.iconSm}
              </span>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {options
            .filter((opt) => active === null || opt.id === active)
            .map((opt) => (
              <Card
                key={opt.id}
                id={opt.id}
                className={`border-2 ${opt.accentClass} flex flex-col h-full`}
              >
                <div className="p-6 flex flex-col h-full">
                  {/* Card header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`flex-shrink-0 w-14 h-14 rounded-lg bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center ${iconColors[opt.id]}`}>
                      {opt.iconLg}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{opt.label}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{opt.tagline}</p>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-5">
                    {opt.description}
                  </p>

                  {/* Pros */}
                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                      {t('hostingOptions.prosLabel', 'Advantages')}
                    </h3>
                    <ul className="space-y-1.5">
                      {opt.pros.map((p, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Considerations */}
                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                      {t('hostingOptions.considerationsLabel', 'Considerations')}
                    </h3>
                    <ul className="space-y-1.5">
                      {opt.considerations.map((c, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Use cases */}
                  <div className="mb-5">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      {t('hostingOptions.useCasesLabel', 'Best for')}
                    </h3>
                    <ul className="space-y-1">
                      {opt.useCases.map((u, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex gap-2">
                          <ArrowRight className="h-4 w-4 text-vendorsoluce-green flex-shrink-0 mt-0.5" />
                          <span>{u}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTAs */}
                  <div className="mt-auto flex flex-col gap-2 pt-2">
                    {opt.cta.external ? (
                      <a href={opt.cta.href} target="_blank" rel="noopener noreferrer">
                        <Button variant="primary" className="w-full bg-vendorsoluce-green hover:bg-vendorsoluce-dark-green text-white">
                          <Download className="h-4 w-4 mr-2" />
                          {opt.cta.label}
                        </Button>
                      </a>
                    ) : (
                      <Link to={opt.cta.href}>
                        <Button variant="primary" className="w-full bg-vendorsoluce-green hover:bg-vendorsoluce-dark-green text-white">
                          {opt.cta.label}
                        </Button>
                      </Link>
                    )}
                    {opt.secondaryCta && (
                      <Link to={opt.secondaryCta.href}>
                        <Button variant="outline" className="w-full text-sm">
                          {opt.secondaryCta.label}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            ))}
        </div>

        {/* Trust footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <span>{t('hostingOptions.trust.security', 'Enterprise-grade security across all deployment models')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-500" />
              <span>{t('hostingOptions.trust.dataResidency', 'Data residency in your chosen region or network')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-violet-500" />
              <span>{t('hostingOptions.trust.licenseKey', 'License-key activation — no Stripe runtime required for on-premise')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-orange-500" />
              <span>{t('hostingOptions.trust.globalSupport', 'Global delivery and support available')}</span>
            </div>
          </div>
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t('hostingOptions.notSure', "Not sure which deployment model is right for you?")}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/contact">
                <Button variant="primary" className="bg-vendorsoluce-green hover:bg-vendorsoluce-dark-green text-white">
                  {t('hostingOptions.talkToSales', 'Talk to sales')}
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline">
                  {t('hostingOptions.comparePlans', 'Compare plans & tiers')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostingOptionsPage;
