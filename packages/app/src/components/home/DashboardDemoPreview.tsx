/**
 * Shortened dashboard demo for the unauthenticated platform landing page.
 * Full interactive page: `MR.DASHBOARD_DEMO` (/dashboard-demo).
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Eye,
  FileText,
  Shield,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { MR } from 'shared/constants/routes';

const DEMO_METRICS = [
  {
    labelKey: 'home.platformLanding.demoMetricVendors',
    labelDefault: 'Vendors tracked',
    value: 47,
    delta: '+12 this month',
    icon: Users,
    accent: 'text-emerald-700 dark:text-emerald-300',
    soft: 'bg-emerald-50 ring-emerald-600/10 dark:bg-emerald-950/40 dark:ring-emerald-500/20',
  },
  {
    labelKey: 'home.platformLanding.demoMetricElevated',
    labelDefault: 'Elevated risk',
    value: 8,
    delta: '3 resolved recently',
    icon: AlertTriangle,
    accent: 'text-amber-800 dark:text-amber-200',
    soft: 'bg-amber-50 ring-amber-600/10 dark:bg-amber-950/35 dark:ring-amber-500/20',
  },
  {
    labelKey: 'home.platformLanding.demoMetricAssessments',
    labelDefault: 'Assessments',
    value: 23,
    delta: '+5 completed',
    icon: FileText,
    accent: 'text-vendorsoluce-navy dark:text-gray-200',
    soft: 'bg-gray-100 ring-gray-400/15 dark:bg-gray-900 dark:ring-gray-600/30',
  },
  {
    labelKey: 'home.platformLanding.demoMetricSbom',
    labelDefault: 'SBOM reviews',
    value: 15,
    delta: '+7 this week',
    icon: Shield,
    accent: 'text-vendorsoluce-teal dark:text-vendorsoluce-teal',
    soft: 'bg-teal-50/80 ring-vendorsoluce-teal/20 dark:bg-vendorsoluce-teal/15 dark:ring-vendorsoluce-teal/30',
  },
] as const;

const PORTFOLIO_ROWS = [
  { label: 'Low risk', count: '31 vendors', widthClass: 'w-[66%]', bar: 'bg-vendorsoluce-green' },
  { label: 'Medium risk', count: '8 vendors', widthClass: 'w-[17%]', bar: 'bg-amber-400' },
  { label: 'High risk', count: '8 vendors', widthClass: 'w-[17%]', bar: 'bg-orange-500' },
] as const;

const DashboardDemoPreview: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full" aria-labelledby="dashboard-demo-preview-heading">
      <div className="mb-5 text-center lg:text-left">
        <p className="text-xs font-semibold uppercase tracking-widest text-vendorsoluce-green dark:text-vendorsoluce-light-green">
          {t('home.platformLanding.demoEyebrow', 'Preview')}
        </p>
        <h2
          id="dashboard-demo-preview-heading"
          className="mt-1 text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl"
        >
          {t('home.platformLanding.demoTitle', 'Dashboard snapshot')}
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-600 dark:text-gray-400 lg:mx-0">
          {t(
            'home.platformLanding.demoSubtitle',
            'Illustrative metrics—open the full demo for charts, activity, and next actions.',
          )}
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200/90 bg-white/90 p-4 shadow-card backdrop-blur-sm dark:border-gray-700/60 dark:bg-gray-800/80 sm:p-5">
        <div className="mb-4 flex flex-col gap-2 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900/50 dark:bg-amber-950/20">
          <div className="flex items-start gap-2 sm:items-center">
            <Eye className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400 sm:mt-0" aria-hidden />
            <p className="text-xs font-medium leading-snug text-amber-950 dark:text-amber-100 sm:text-sm">
              {t('home.platformLanding.demoDisclaimer', 'Figures below are illustrative.')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {DEMO_METRICS.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card
                key={metric.labelKey}
                className="relative overflow-hidden rounded-xl border-gray-200/70 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <CardContent className="p-3 sm:p-4">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ring-1 ${metric.soft} sm:h-10 sm:w-10`}>
                    <Icon className={`h-4 w-4 ${metric.accent} sm:h-5 sm:w-5`} aria-hidden />
                  </div>
                  <p className="mt-2 text-xl font-semibold tabular-nums tracking-tight text-gray-950 dark:text-white sm:text-2xl">
                    {metric.value}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t(metric.labelKey, metric.labelDefault)}
                  </p>
                  <p className="mt-1 text-[10px] font-medium text-vendorsoluce-green dark:text-vendorsoluce-light-green sm:text-xs">
                    {metric.delta}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-4 rounded-xl border-gray-200/70 shadow-sm dark:border-gray-800">
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-tight sm:text-base">
              <BarChart3 className="h-4 w-4 shrink-0 text-vendorsoluce-green sm:h-5 sm:w-5" aria-hidden />
              {t('home.platformLanding.demoPortfolioTitle', 'Portfolio mix (sample)')}
            </CardTitle>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {t('home.platformLanding.demoPortfolioHint', 'Risk tier distribution—demo data.')}
            </p>
          </CardHeader>
          <CardContent className="space-y-3 pb-4 pt-0">
            {PORTFOLIO_ROWS.map((row) => (
              <div key={row.label}>
                <div className="mb-1.5 flex items-center justify-between gap-2 text-xs sm:text-sm">
                  <span className="font-medium text-gray-800 dark:text-gray-200">{row.label}</span>
                  <span className="shrink-0 font-semibold tabular-nums text-gray-600 dark:text-gray-400">
                    {row.count}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div className={`${row.bar} ${row.widthClass} h-1.5 rounded-full`} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="mt-4 flex justify-center border-t border-gray-200/80 pt-4 dark:border-gray-700/80 lg:justify-start">
          <Link
            to={MR.DASHBOARD_DEMO}
            className="inline-flex items-center gap-2 text-sm font-semibold text-vendorsoluce-green transition-colors hover:text-vendorsoluce-dark-green dark:text-vendorsoluce-light-green dark:hover:text-white"
          >
            {t('home.platformLanding.demoOpenFull', 'Open full dashboard demo')}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardDemoPreview;
