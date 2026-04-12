import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Laptop, Database, Puzzle, Check, Shield, Crown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { DEPLOYMENT_TRACK_IDS, type DeploymentTrackId } from '../../config/deploymentOfferings';

const ICONS = [Laptop, Database, Puzzle] as const;
const ACCENTS = [
  'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10',
  'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10',
  'border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-900/10',
] as const;

function getHighlights(t: (key: string, options?: { returnObjects?: boolean }) => unknown, id: DeploymentTrackId): string[] {
  const raw = t(`deployment.tracks.${id}.highlights`, { returnObjects: true });
  return Array.isArray(raw) ? (raw as string[]) : [];
}

function primaryHref(id: DeploymentTrackId, clientBackendPlanHref: string): string {
  if (id === 'standalone_no_backend') return '/trial';
  if (id === 'client_backend') return clientBackendPlanHref;
  return '/contact';
}

function secondaryHref(id: DeploymentTrackId): string | undefined {
  if (id === 'standalone_no_backend') return '/download';
  if (id === 'client_backend') return '/integration-guides';
  if (id === 'custom_integration') return '/download';
  return undefined;
}

function isSamePageHash(href: string): boolean {
  return href.startsWith('#');
}

export interface DeploymentModelsSectionProps {
  variant?: 'full' | 'compact';
  /** `#choose-plan` on Pricing; `/pricing#choose-plan` on other pages */
  clientBackendPlanHref: string;
  className?: string;
}

export const DeploymentModelsSection: React.FC<DeploymentModelsSectionProps> = ({
  variant = 'full',
  clientBackendPlanHref,
  className = '',
}) => {
  const { t } = useTranslation();
  const showTrust = variant === 'full';
  const isCompact = variant === 'compact';

  return (
    <div className={className}>
      <div className={`text-center ${isCompact ? 'mb-6' : 'mb-10'} max-w-3xl mx-auto`}>
        <h2 className={`font-bold text-gray-900 dark:text-white ${isCompact ? 'text-2xl mb-2' : 'text-3xl mb-3'}`}>
          {t('deployment.sectionTitle')}
        </h2>
        <p className={`text-gray-600 dark:text-gray-400 ${isCompact ? 'text-sm' : ''}`}>
          {t('deployment.sectionSubtitle')}
        </p>
      </div>
      <div className={`grid grid-cols-1 ${isCompact ? 'lg:grid-cols-3 gap-4' : 'lg:grid-cols-3 gap-8'} max-w-6xl mx-auto`}>
        {DEPLOYMENT_TRACK_IDS.map((id, index) => {
          const Icon = ICONS[index] ?? Laptop;
          const accent = ACCENTS[index] ?? ACCENTS[0];
          const highlights = getHighlights(t, id);
          const primary = primaryHref(id, clientBackendPlanHref);
          const secondary = secondaryHref(id);
          const primaryLabel = t(`deployment.tracks.${id}.ctaPrimary`);
          const secondaryLabel = secondary ? t(`deployment.tracks.${id}.ctaSecondary`) : '';

          const primaryButton = (
            <Button variant="primary" className="w-full bg-vendorsoluce-green hover:bg-vendorsoluce-dark-green text-white">
              {primaryLabel}
            </Button>
          );

          return (
            <Card key={id} className={`h-full flex flex-col border-2 ${accent}`}>
              <CardHeader className={isCompact ? 'pb-2 pt-4 px-4' : 'pb-2'}>
                <div
                  className={`rounded-lg bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center mb-3 ${
                    isCompact ? 'w-10 h-10' : 'w-12 h-12'
                  }`}
                >
                  <Icon
                    className={`text-vendorsoluce-navy dark:text-vendorsoluce-light-green ${
                      isCompact ? 'h-5 w-5' : 'h-6 w-6'
                    }`}
                  />
                </div>
                <CardTitle className={`text-gray-900 dark:text-white ${isCompact ? 'text-lg' : 'text-xl'}`}>
                  {t(`deployment.tracks.${id}.title`)}
                </CardTitle>
                <p
                  className={`text-gray-600 dark:text-gray-400 mt-2 leading-relaxed ${
                    isCompact ? 'text-xs line-clamp-4' : 'text-sm'
                  }`}
                >
                  {t(`deployment.tracks.${id}.tagline`)}
                </p>
              </CardHeader>
              <CardContent className={`flex-1 flex flex-col pt-0 ${isCompact ? 'px-4 pb-4' : ''}`}>
                {!isCompact && (
                  <>
                    <div className="mb-4 p-3 rounded-md bg-white/80 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        {t('deployment.tierDefinitionLabel')}
                      </p>
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        {t(`deployment.tracks.${id}.tierDefinition`)}
                      </p>
                    </div>
                    <ul className="space-y-2 mb-4 flex-1">
                      {highlights.map((line) => (
                        <li key={line} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <Check className="h-4 w-4 text-vendorsoluce-green flex-shrink-0 mt-0.5" />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 border-t border-gray-200 dark:border-gray-700 pt-3">
                      <span className="font-medium text-gray-600 dark:text-gray-300">
                        {t('deployment.bestForPrefix')}{' '}
                      </span>
                      {t(`deployment.tracks.${id}.bestFor`)}
                    </p>
                  </>
                )}
                <div className="flex flex-col gap-2 mt-auto">
                  {isSamePageHash(primary) ? (
                    <a href={primary} className="w-full">
                      {primaryButton}
                    </a>
                  ) : (
                    <Link to={primary} className="w-full">
                      {primaryButton}
                    </Link>
                  )}
                  {secondary ? (
                    <Link to={secondary} className="w-full">
                      <Button
                        variant="outline"
                        className={`w-full ${isCompact ? 'text-xs py-2' : ''}`}
                      >
                        {secondaryLabel}
                      </Button>
                    </Link>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {showTrust && (
        <div className="max-w-4xl mx-auto mt-10 flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-500" />
            <span>{t('deployment.trust.security')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span>{t('deployment.trust.trial')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-purple-500" />
            <span>{t('deployment.trust.annual')}</span>
          </div>
        </div>
      )}
    </div>
  );
};
