/**
 * Platform landing for unauthenticated users.
 * Complements the marketing website: no duplicate hero/value/features.
 * Journey: Website (learn) → Platform (sign in / get started) → Dashboard.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, ArrowRight, ExternalLink, Zap } from 'lucide-react';
import Button from '../ui/Button';
import { config } from '../../utils/config';

const PlatformLanding: React.FC = () => {
  const { t } = useTranslation();
  const websiteUrl = config.app.websiteUrl || 'https://www.vendorsoluce.com';

  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden py-12 sm:py-16">
      {/* Background: gradient + subtle pattern */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-br from-gray-50 via-vendorsoluce-pale-green/30 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-vendorsoluce-dark-green/10"
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10 opacity-[0.4] dark:opacity-[0.08] [background-image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:32px_32px] text-gray-400 dark:text-gray-600"
        aria-hidden
      />
      {/* Soft accent orbs */}
      <div
        className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-vendorsoluce-green/5 dark:bg-vendorsoluce-light-green/5 blur-3xl -z-10"
        aria-hidden
      />
      <div
        className="absolute bottom-1/4 -right-32 w-72 h-72 rounded-full bg-vendorsoluce-teal/5 dark:bg-vendorsoluce-teal/10 blur-3xl -z-10"
        aria-hidden
      />

      <div className="relative mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:items-center lg:gap-12">
        <div className="text-center lg:text-left">
          <div className="mb-8 flex flex-col items-center lg:items-start">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-card ring-2 ring-vendorsoluce-green/10 dark:border-gray-700/50 dark:bg-gray-800/80 dark:ring-vendorsoluce-light-green/20">
              <img
                src="/vendorsoluce.png"
                alt={t('home.platformLanding.logoAlt', 'VendorSoluce')}
                className="h-12 w-12 object-contain"
              />
            </div>
            <span className="mt-3 text-xs font-medium uppercase tracking-widest text-vendorsoluce-green dark:text-vendorsoluce-light-green">
              Platform
            </span>
          </div>

          <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-[2.5rem]">
            {t('home.platformLanding.title', 'VendorSoluce Platform')}
          </h1>
          <p className="mx-auto max-w-xl text-lg leading-relaxed text-gray-600 dark:text-gray-300 lg:mx-0">
            {t('home.platformLanding.tagline', 'Vendor risk made defensible. Sign in or create an account to continue.')}
          </p>

          <p className="mx-auto mt-8 max-w-xl text-sm text-gray-500 dark:text-gray-400 lg:mx-0">
            {t('home.platformLanding.newHere', 'New here?')}{' '}
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-vendorsoluce-green hover:underline dark:text-vendorsoluce-light-green"
            >
              {t('home.platformLanding.learnMore', 'Learn about VendorSoluce')}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-gray-200/80 bg-white/90 p-6 shadow-card backdrop-blur-sm dark:border-gray-700/60 dark:bg-gray-800/70 sm:p-8">
            <p className="mb-5 text-center text-sm font-medium text-gray-700 dark:text-gray-200 sm:text-base lg:text-left">
              {t('home.platformLanding.accountCardLead', 'Use your organization account for the full workspace.')}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link to="/signin?redirect=/dashboard" className="w-full sm:max-w-[220px] sm:flex-1">
                <Button
                  variant="primary"
                  size="lg"
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold shadow-lg shadow-vendorsoluce-green/20 transition-shadow hover:shadow-vendorsoluce-green/30"
                >
                  <User className="h-5 w-5" />
                  {t('home.platformLanding.signIn', 'Sign in')}
                </Button>
              </Link>
              <Link to="/signin?redirect=/dashboard&mode=signup" className="w-full sm:max-w-[220px] sm:flex-1">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 py-3.5 font-semibold transition-colors hover:bg-vendorsoluce-pale-green/50 dark:hover:bg-vendorsoluce-green/10"
                >
                  {t('home.platformLanding.getStarted', 'Get started')}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-gray-300/90 bg-gray-50/90 p-5 dark:border-gray-600 dark:bg-gray-900/50 sm:p-6">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 lg:text-left">
              {t('home.platformLanding.tryFirstEyebrow', 'No account yet')}
            </p>
            <Link
              to="/supply-chain-assessment"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-vendorsoluce-green/25 hover:bg-vendorsoluce-pale-green/60 hover:text-vendorsoluce-green dark:bg-gray-800 dark:text-gray-200 dark:hover:border-vendorsoluce-light-green/30 dark:hover:bg-vendorsoluce-green/15 dark:hover:text-vendorsoluce-light-green"
            >
              <Zap className="h-4 w-4 shrink-0 text-vendorsoluce-green dark:text-vendorsoluce-light-green" />
              {t('home.platformLanding.tryAssessment', 'Try Supply Chain Assessment without an account')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformLanding;
