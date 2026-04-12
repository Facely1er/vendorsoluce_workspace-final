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
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
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

      <div className="max-w-xl w-full text-center relative">
        {/* Logo + badge */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-white dark:bg-gray-800/80 shadow-card border border-gray-100 dark:border-gray-700/50 ring-2 ring-vendorsoluce-green/10 dark:ring-vendorsoluce-light-green/20">
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

        <h1 className="text-3xl sm:text-4xl lg:text-[2.5rem] font-bold text-gray-900 dark:text-white tracking-tight mb-3">
          {t('home.platformLanding.title', 'VendorSoluce Platform')}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-10 leading-relaxed">
          {t('home.platformLanding.tagline', 'Vendor risk made defensible. Sign in or create an account to continue.')}
        </p>

        {/* CTA card */}
        <div className="rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/80 dark:border-gray-700/60 shadow-card p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signin?redirect=/dashboard" className="w-full sm:flex-1 sm:max-w-[200px]">
              <Button
                variant="primary"
                size="lg"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold shadow-lg shadow-vendorsoluce-green/20 hover:shadow-vendorsoluce-green/30 transition-shadow"
              >
                <User className="h-5 w-5" />
                {t('home.platformLanding.signIn', 'Sign in')}
              </Button>
            </Link>
            <Link to="/signin?redirect=/dashboard&mode=signup" className="w-full sm:flex-1 sm:max-w-[200px]">
              <Button
                variant="outline"
                size="lg"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold border-2 hover:bg-vendorsoluce-pale-green/50 dark:hover:bg-vendorsoluce-green/10 transition-colors"
              >
                {t('home.platformLanding.getStarted', 'Get started')}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          {t('home.platformLanding.newHere', 'New here?')}{' '}
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline font-medium inline-flex items-center gap-1.5"
          >
            {t('home.platformLanding.learnMore', 'Learn about VendorSoluce')}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </p>

        {/* Try assessment CTA */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <Link
            to="/supply-chain-assessment"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100/80 dark:bg-gray-800/80 hover:bg-vendorsoluce-pale-green/80 dark:hover:bg-vendorsoluce-green/20 hover:text-vendorsoluce-green dark:hover:text-vendorsoluce-light-green border border-transparent hover:border-vendorsoluce-green/20 dark:hover:border-vendorsoluce-light-green/30 transition-all"
          >
            <Zap className="h-4 w-4 text-vendorsoluce-green dark:text-vendorsoluce-light-green" />
            {t('home.platformLanding.tryAssessment', 'Try Supply Chain Assessment without an account')}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PlatformLanding;
