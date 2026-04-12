import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileText, Code, Package, ArrowRight, Server, Download, AlertCircle, CheckCircle, Radar, Users, ClipboardCheck } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';
import { DeploymentModelsSection } from '../../components/deployment/DeploymentModelsSection';
import { config } from '../../utils/config';
import { isLicenseMode } from '../../config/license';
import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';

const INPUT_CLASS =
  'w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-vendorsoluce-green focus:border-vendorsoluce-green bg-white dark:bg-gray-800 dark:text-white';

const DownloadsPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const enterpriseDownloadUrl = config.app.enterpriseDownloadUrl;
  const licenseMode = isLicenseMode();

  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestData, setRequestData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    hosting: '',
    storage: '',
    iam: '',
    additional: '',
    terms: false,
  });

  useEffect(() => {
    if (location.hash === '#request') {
      const el = document.getElementById('request');
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [location.hash]);

  const handleRequestChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setRequestData((prev) => ({ ...prev, [id]: value }));
  };
  const handleRequestCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRequestData((prev) => ({ ...prev, terms: e.target.checked }));
  };

  const buildRequestMessage = () => {
    const parts = [
      requestData.hosting && `Hosting: ${requestData.hosting}`,
      requestData.storage && `Storage: ${requestData.storage}`,
      requestData.iam && `IAM/SSO: ${requestData.iam}`,
      requestData.additional && `Additional: ${requestData.additional}`,
    ].filter(Boolean);
    return parts.length ? parts.join('\n\n') : 'No specific requirements provided.';
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError(null);
    if (!requestData.firstName || !requestData.lastName || !requestData.email) {
      setRequestError(t('downloads.requestForm.validationRequired'));
      return;
    }
    if (!requestData.terms) {
      setRequestError(t('downloads.requestForm.validationTerms'));
      return;
    }
    if (!config.supabase.enabled) {
      setRequestError(t('contact.form.validation.submitError'));
      return;
    }
    setRequestSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('contact-form', {
        body: {
          firstName: requestData.firstName,
          lastName: requestData.lastName,
          email: requestData.email,
          phone: requestData.phone || null,
          company: requestData.company || null,
          topic: 'Enterprise build request',
          message: buildRequestMessage(),
        },
      });
      if (error) throw error;
      setRequestSubmitted(true);
    } catch (err: unknown) {
      logger.error('Download request submit error:', err);
      setRequestError(err instanceof Error ? err.message : t('contact.form.validation.submitError'));
    } finally {
      setRequestSubmitting(false);
    }
  };

  const enterpriseHref = enterpriseDownloadUrl || (licenseMode ? '/pricing' : '/contact');
  const enterpriseCta = enterpriseDownloadUrl
    ? t('downloads.sections.enterpriseBuild.ctaDownload', 'Download')
    : licenseMode
      ? t('downloads.sections.enterpriseBuild.ctaContactSales', 'Contact sales')
      : t('downloads.sections.enterpriseBuild.ctaContact', 'Get download');

  const sections = [
    {
      id: 'enterprise-build',
      title: t('downloads.sections.enterpriseBuild.title', 'Enterprise (On-Premise) Build'),
      description: t('downloads.sections.enterpriseBuild.description', 'Full VendorSoluce platform and VendorSoluce Portal (vendor assurance & due diligence) as a downloadable package. No Stripe—license key activation. Deploy in your own environment for air-gapped or self-hosted use.'),
      icon: <Server className="h-10 w-10 text-vendorsoluce-green" />,
      href: enterpriseHref,
      external: Boolean(enterpriseDownloadUrl),
      cta: enterpriseCta,
    },
    {
      id: 'vendor-threat-radar',
      title: t('downloads.sections.vendorThreatRadar.title', 'Vendor Threat Radar'),
      description: t('downloads.sections.vendorThreatRadar.description', 'Map and prioritize vendors by exposure and risk. Use the interactive radar in the platform or try it on the website—no login required.'),
      icon: <Radar className="h-10 w-10 text-vendorsoluce-green" />,
      href: '/vendor-risk-radar',
      external: false,
      cta: t('downloads.sections.vendorThreatRadar.cta', 'Open Radar'),
    },
    {
      id: 'vendor-portal',
      title: t('downloads.sections.vendorPortal.title', 'VendorSoluce Portal'),
      description: t('downloads.sections.vendorPortal.description', 'The VendorSoluce Portal is the vendor-facing experience for assurance, due diligence, and assessments—questionnaires, evidence, and status in one workflow. Open the overview and share links with your vendors.'),
      icon: <Users className="h-10 w-10 text-vendorsoluce-green" />,
      href: '/vendor-portal',
      external: false,
      cta: t('downloads.sections.vendorPortal.cta', 'Portal overview'),
    },
    {
      id: 'templates',
      title: t('downloads.sections.templates.title', 'Templates'),
      description: t('downloads.sections.templates.description', 'Assessment questionnaires, risk registers, NIST SP 800-161 templates, and compliance guides.'),
      icon: <FileText className="h-10 w-10 text-vendorsoluce-green" />,
      href: '/templates',
      external: false,
      cta: t('downloads.sections.templates.cta', 'Browse Templates'),
    },
    {
      id: 'platform-tools',
      title: t('downloads.sections.platformTools.title', 'NIST & Risk Tools'),
      description: t('downloads.sections.platformTools.description', 'NIST SP 800-161 checklist, vendor risk calculator, and risk radar—run assessments and track compliance in the platform.'),
      icon: <ClipboardCheck className="h-10 w-10 text-vendorsoluce-green" />,
      href: '/tools/nist-checklist',
      external: false,
      cta: t('downloads.sections.platformTools.cta', 'Open tools'),
    },
    {
      id: 'api-docs',
      title: t('downloads.sections.apiDocs.title', 'API Documentation'),
      description: t('downloads.sections.apiDocs.description', 'REST API reference, authentication, endpoints, and integration examples for developers.'),
      icon: <Code className="h-10 w-10 text-vendorsoluce-green" />,
      href: '/api-docs',
      external: false,
      cta: t('downloads.sections.apiDocs.cta', 'View API Docs'),
    },
    {
      id: 'download-package',
      title: t('downloads.sections.downloadPackage.title', 'Download Package'),
      description: t('downloads.sections.downloadPackage.description', 'SDKs, CLI tools, and integration guides for automating vendor risk workflows.'),
      icon: <Package className="h-10 w-10 text-vendorsoluce-green" />,
      href: '/integration-guides',
      external: false,
      cta: t('downloads.sections.downloadPackage.cta', 'Get SDKs & Guides'),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-10">
        {/* Page header — same positioning as Pricing / How it works */}
        <div className="mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 break-words">
            {t('downloads.title', 'Downloads')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
            {t('downloads.description', 'Templates, API documentation, and developer tools to accelerate your supply chain risk management program.')}
          </p>
        </div>

        <DeploymentModelsSection
          variant="compact"
          clientBackendPlanHref="/pricing#choose-plan"
          className="mb-10 sm:mb-12"
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-3xl">
          <Trans
            i18nKey="deployment.downloadsPage.footer"
            components={[
              <Link
                key="pricing"
                to="/pricing"
                className="text-vendorsoluce-green dark:text-vendorsoluce-light-green font-medium hover:underline"
              />,
            ]}
          />
        </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {sections.map((section) => {
          const radarWebsiteUrl = section.id === 'vendor-threat-radar'
            ? `${(config.app.websiteUrl || 'https://www.vendorsoluce.com').replace(/\/$/, '')}/radar/vendor-threat-radar.html`
            : null;
          const hasSecondaryLink = Boolean(radarWebsiteUrl);
          const cardContent = (
            <Card className="h-full p-6 hover:shadow-xl transition-all duration-300 hover:border-vendorsoluce-green/30 group">
              <div className="flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-vendorsoluce-green/10 dark:bg-vendorsoluce-green/20 flex items-center justify-center group-hover:bg-vendorsoluce-green/20 transition-colors">
                    {section.icon}
                  </div>
                  {section.id === 'enterprise-build' && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-vendorsoluce-green/20 text-vendorsoluce-dark-green dark:text-vendorsoluce-light-green">
                      <Download className="h-3.5 w-3.5 mr-1" />
                      {section.cta}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {section.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 flex-1 leading-relaxed">
                  {section.description}
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  {hasSecondaryLink ? (
                    <Link to={section.href} className="flex items-center text-vendorsoluce-green dark:text-vendorsoluce-light-green font-medium w-fit">
                      <span>{section.cta}</span>
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ) : (
                    <div className="flex items-center text-vendorsoluce-green dark:text-vendorsoluce-light-green font-medium">
                      <span>{section.cta}</span>
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                  {radarWebsiteUrl && (
                    <a
                      href={radarWebsiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-vendorsoluce-green dark:hover:text-vendorsoluce-light-green w-fit"
                    >
                      Try on website →
                    </a>
                  )}
                </div>
              </div>
            </Card>
          );
          if (hasSecondaryLink) {
            return <div key={section.id} className="block">{cardContent}</div>;
          }
          return section.external ? (
            <a key={section.id} href={section.href} target="_blank" rel="noopener noreferrer" className="block">
              {cardContent}
            </a>
          ) : (
            <Link key={section.id} to={section.href}>
              {cardContent}
            </Link>
          );
        })}
      </div>

      {/* Request customized enterprise build */}
      <section id="request" className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('downloads.requestForm.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-3xl">
          {t('downloads.requestForm.description')}
        </p>

        {!config.supabase.enabled ? (
          <Card className="p-6 max-w-xl">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t('downloads.requestForm.contactFallback')}
            </p>
            <Link to="/contact">
              <Button variant="primary">{t('contact.title')}</Button>
            </Link>
          </Card>
        ) : requestSubmitted ? (
          <Card className="p-8 max-w-xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t('downloads.requestForm.successTitle')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('downloads.requestForm.successMessage')}
              </p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => {
                  setRequestSubmitted(false);
                  setRequestData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    company: '',
                    phone: '',
                    hosting: '',
                    storage: '',
                    iam: '',
                    additional: '',
                    terms: false,
                  });
                }}
              >
                {t('contact.form.success.sendAnother')}
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-8 max-w-3xl">
            {requestError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-red-600 dark:text-red-400">{requestError}</p>
              </div>
            )}
            <form onSubmit={handleRequestSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('contact.form.fields.firstName')}<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={requestData.firstName}
                    onChange={handleRequestChange}
                    className={INPUT_CLASS}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('contact.form.fields.lastName')}<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={requestData.lastName}
                    onChange={handleRequestChange}
                    className={INPUT_CLASS}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('contact.form.fields.email')}<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={requestData.email}
                    onChange={handleRequestChange}
                    className={INPUT_CLASS}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('contact.form.fields.phone')}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={requestData.phone}
                    onChange={handleRequestChange}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
              <div className="mb-6">
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('contact.form.fields.company')}
                </label>
                <input
                  type="text"
                  id="company"
                  value={requestData.company}
                  onChange={handleRequestChange}
                  className={INPUT_CLASS}
                />
              </div>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="hosting" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('downloads.requestForm.hosting')}
                  </label>
                  <Link
                    to="/hosting-options"
                    className="text-xs text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline flex items-center gap-1"
                  >
                    {t('downloads.requestForm.hostingLearnMore', 'Compare hosting options')}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <select
                  id="hosting"
                  value={requestData.hosting}
                  onChange={handleRequestChange}
                  className={INPUT_CLASS}
                >
                  <option value="">{t('downloads.requestForm.hostingPlaceholder')}</option>
                  <option value="Cloud (AWS, Azure, GCP)">{t('downloads.requestForm.hostingCloud')}</option>
                  <option value="On-premise">{t('downloads.requestForm.hostingOnPrem')}</option>
                  <option value="Air-gapped / disconnected">{t('downloads.requestForm.hostingAirGapped')}</option>
                  <option value="Hybrid">{t('downloads.requestForm.hostingHybrid')}</option>
                  <option value="Other">{t('downloads.requestForm.hostingOther')}</option>
                </select>
              </div>
              <div className="mb-6">
                <label htmlFor="storage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('downloads.requestForm.storage')}
                </label>
                <input
                  type="text"
                  id="storage"
                  value={requestData.storage}
                  onChange={handleRequestChange}
                  className={INPUT_CLASS}
                  placeholder={t('downloads.requestForm.storagePlaceholder')}
                />
              </div>
              <div className="mb-6">
                <label htmlFor="iam" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('downloads.requestForm.iam')}
                </label>
                <textarea
                  id="iam"
                  rows={2}
                  value={requestData.iam}
                  onChange={handleRequestChange}
                  className={INPUT_CLASS}
                  placeholder={t('downloads.requestForm.iamPlaceholder')}
                />
              </div>
              <div className="mb-6">
                <label htmlFor="additional" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('downloads.requestForm.additional')}
                </label>
                <textarea
                  id="additional"
                  rows={2}
                  value={requestData.additional}
                  onChange={handleRequestChange}
                  className={INPUT_CLASS}
                  placeholder={t('downloads.requestForm.additionalPlaceholder')}
                />
              </div>
              <div className="mb-6">
                <div className="flex items-start">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={requestData.terms}
                    onChange={handleRequestCheckbox}
                    className="h-4 w-4 text-vendorsoluce-green focus:ring-vendorsoluce-green border-gray-300 dark:border-gray-600 rounded mt-1"
                    required
                  />
                  <label htmlFor="terms" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    {t('contact.form.fields.termsPrefix')}{' '}
                    <Link to="/privacy" className="text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline">
                      {t('contact.form.fields.privacyPolicy')}
                    </Link>{' '}
                    {t('contact.form.fields.termsSuffix')}
                  </label>
                </div>
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={requestSubmitting}
              >
                {requestSubmitting ? t('contact.form.submitting') : t('downloads.requestForm.submit')}
              </Button>
            </form>
          </Card>
        )}
      </section>
      </div>
    </div>
  );
};

export default DownloadsPage;
