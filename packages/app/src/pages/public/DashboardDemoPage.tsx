import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Shield,
  Users,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Plus,
  FileText,
  Lock,
  Eye,
  User,
  Activity,
  Database,
  ArrowRight,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  WORKSPACE_PAGE_SHELL_INNER_CLASS,
  WORKSPACE_PAGE_SHELL_OUTER_CLASS,
} from '../../components/vendorsoluce-intelligence/WorkspacePageShell';

const DashboardDemoPage: React.FC = () => {
  useAuth();

  const demoMetrics = [
    {
      label: 'Vendors tracked',
      value: 47,
      delta: '+12 this month',
      icon: Users,
      accent: 'text-emerald-700 dark:text-emerald-300',
      soft: 'bg-emerald-50 ring-emerald-600/10 dark:bg-emerald-950/40 dark:ring-emerald-500/20',
    },
    {
      label: 'Elevated risk',
      value: 8,
      delta: '3 resolved recently',
      icon: AlertTriangle,
      accent: 'text-amber-800 dark:text-amber-200',
      soft: 'bg-amber-50 ring-amber-600/10 dark:bg-amber-950/35 dark:ring-amber-500/20',
    },
    {
      label: 'Assessments',
      value: 23,
      delta: '+5 completed',
      icon: FileText,
      accent: 'text-slate-800 dark:text-slate-200',
      soft: 'bg-slate-100 ring-slate-500/10 dark:bg-slate-900 dark:ring-slate-500/25',
    },
    {
      label: 'SBOM reviews',
      value: 15,
      delta: '+7 this week',
      icon: Shield,
      accent: 'text-teal-800 dark:text-teal-200',
      soft: 'bg-teal-50 ring-teal-600/10 dark:bg-teal-950/40 dark:ring-teal-500/20',
    },
  ];

  const recentActivity = [
    { action: 'NIST SP 800-161 assessment completed', time: '2 hours ago', type: 'success' as const },
    { action: 'Vendor added: CloudSecure Inc.', time: '1 day ago', type: 'info' as const },
    { action: 'SBOM review flagged transitive dependency', time: '2 days ago', type: 'warning' as const },
    { action: 'VIRA portfolio report generated', time: '3 days ago', type: 'success' as const },
  ];

  const quickActions = [
    {
      title: 'Add vendor',
      description: 'Seed the radar with your critical suppliers.',
      icon: Plus,
      href: '/vendor-risk-radar',
    },
    {
      title: 'Run assessment',
      description: 'Walk the supply chain questionnaire—no login for the first pass.',
      icon: BarChart3,
      href: '/supply-chain-assessment',
    },
    {
      title: 'Analyze SBOM',
      description: 'Upload a package manifest and review dependency risk.',
      icon: Database,
      href: '/sbom-analyzer',
    },
    {
      title: 'View reports',
      description: 'Consolidate scores into stakeholder-ready output.',
      icon: FileText,
      href: '/vendor-assessments',
    },
  ];

  const trustPoints = [
    'Evidence-friendly workflows',
    'NIST-aligned structure',
    'Built for defense supply chains',
  ];

  return (
    <div className={WORKSPACE_PAGE_SHELL_OUTER_CLASS}>
      <div className={`${WORKSPACE_PAGE_SHELL_INNER_CLASS} max-w-7xl`}>
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-vendorsoluce-navy via-[#0f2744] to-vendorsoluce-teal text-white shadow-xl ring-1 ring-black/5">
          <div className="relative px-6 py-10 sm:px-10 sm:py-12">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-teal-300/10 blur-2xl" />
            <div className="relative max-w-3xl space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/90">VendorSoluce preview</p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.35rem] lg:leading-tight">
                See supply chain risk the way your program lead does—without the spreadsheet.
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
                Explore sample metrics below, run an assessment without an account, or sign in when you are ready to
                persist vendors, SBOMs, and assessments in your workspace.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link to="/supply-chain-assessment">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="inline-flex items-center gap-2 bg-white font-semibold text-vendorsoluce-navy shadow-lg hover:bg-gray-50"
                  >
                    <Zap className="h-5 w-5" aria-hidden />
                    Try supply chain assessment
                  </Button>
                </Link>
                <Link to="/signin?redirect=/dashboard">
                  <Button
                    variant="outline"
                    size="lg"
                    className="inline-flex items-center gap-2 border-2 border-white/40 bg-white/5 font-medium text-white backdrop-blur hover:bg-white/10"
                  >
                    <User className="h-5 w-5" aria-hidden />
                    Sign in
                  </Button>
                </Link>
                <Link to="/trial" className="text-sm font-medium text-white/90 underline-offset-4 hover:text-white hover:underline">
                  Start free trial
                </Link>
              </div>
              <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-white/75">
                {trustPoints.map((t) => (
                  <li key={t} className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900/60 dark:bg-amber-950/25">
          <div className="flex items-start gap-2.5 sm:items-center">
            <Eye className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400 sm:mt-0" aria-hidden />
            <p className="text-sm font-medium leading-snug text-amber-950 dark:text-amber-100">
              Figures below are illustrative. Sign in or start a trial to connect your real vendor and assessment data.
            </p>
          </div>
          <Link
            to="/signin"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-amber-900 hover:underline dark:text-amber-200"
          >
            Sign in
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {demoMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card
                key={metric.label}
                className="relative overflow-hidden border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${metric.soft}`}>
                      <Icon className={`h-5 w-5 ${metric.accent}`} aria-hidden />
                    </div>
                  </div>
                  <p className="mt-4 text-3xl font-semibold tabular-nums tracking-tight text-gray-950 dark:text-white">
                    {metric.value}
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-400">{metric.label}</p>
                  <p className="mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">{metric.delta}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-gray-200/80 shadow-sm dark:border-gray-800">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                  <BarChart3 className="h-5 w-5 text-vendorsoluce-green" aria-hidden />
                  Portfolio distribution
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sample mix across risk tiers (demo data).</p>
              </CardHeader>
              <CardContent className="space-y-5">
                {[
                  { label: 'Low risk', count: '31 vendors', widthClass: 'w-[66%]', bar: 'bg-emerald-500' },
                  { label: 'Medium risk', count: '8 vendors', widthClass: 'w-[17%]', bar: 'bg-amber-400' },
                  { label: 'High risk', count: '8 vendors', widthClass: 'w-[17%]', bar: 'bg-orange-500' },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-gray-800 dark:text-gray-200">{row.label}</span>
                      <span className="shrink-0 font-semibold tabular-nums text-gray-600 dark:text-gray-400">
                        {row.count}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div className={`${row.bar} ${row.widthClass} h-2 rounded-full transition-all`} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-gray-200/80 shadow-sm dark:border-gray-800">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                  <Zap className="h-5 w-5 text-vendorsoluce-green" aria-hidden />
                  Next actions
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">Jump into the tools that ship with VendorSoluce.</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Link
                        key={action.title}
                        to={action.href}
                        className="group flex flex-col rounded-2xl border border-gray-200/90 bg-gray-50/50 p-4 transition-colors hover:border-emerald-300/80 hover:bg-white dark:border-gray-800 dark:bg-gray-950/30 dark:hover:border-emerald-800 dark:hover:bg-gray-900"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-vendorsoluce-green shadow-sm ring-1 ring-gray-200/80 dark:bg-gray-900 dark:ring-gray-700">
                            <Icon className="h-5 w-5" aria-hidden />
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{action.title}</h3>
                            <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{action.description}</p>
                          </div>
                        </div>
                        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-vendorsoluce-green dark:text-vendorsoluce-light-green">
                          Open
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-l-[3px] border-l-vendorsoluce-green shadow-sm dark:border-gray-800">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-vendorsoluce-green dark:bg-emerald-950/50">
                    <Lock className="h-6 w-6" aria-hidden />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">Use your own data</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    Save vendors, assessments, and SBOM history to your tenant. Same navigation—real persistence.
                  </p>
                  <div className="mt-5 space-y-2">
                    <Link to="/signin" className="block">
                      <Button variant="primary" size="sm" className="w-full justify-center gap-2">
                        <User className="h-4 w-4" aria-hidden />
                        Sign in
                      </Button>
                    </Link>
                    <Link to="/signup" className="block">
                      <Button variant="outline" size="sm" className="w-full">
                        Create account
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200/80 shadow-sm dark:border-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex flex-wrap items-center gap-2 text-base font-semibold tracking-tight">
                  <Activity className="h-5 w-5 text-teal-600 dark:text-teal-400" aria-hidden />
                  Recent activity
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
                    Demo
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <li key={index} className="flex gap-3">
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          activity.type === 'success'
                            ? 'bg-emerald-500'
                            : activity.type === 'warning'
                              ? 'bg-amber-500'
                              : 'bg-sky-500'
                        }`}
                        aria-hidden
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{activity.action}</p>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <section className="rounded-3xl border border-gray-200/80 bg-white px-6 py-10 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">What a full seat unlocks</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              Same workflows you are previewing—plus saved evidence, collaboration, and reporting continuity across teams.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              {
                title: 'Portfolio visibility',
                body: 'One vendor graph feeding radar, assessments, and leadership summaries.',
                icon: BarChart3,
              },
              {
                title: 'NIST-aligned posture',
                body: 'Structure that maps to SP 800-161 expectations without re-inventing templates.',
                icon: Shield,
              },
              {
                title: 'Operational cadence',
                body: 'Prioritized queues so reviews happen on a rhythm—not after an incident.',
                icon: TrendingUp,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-gray-100 bg-gray-50/60 p-6 text-left dark:border-gray-800 dark:bg-gray-950/40"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-vendorsoluce-green shadow-sm ring-1 ring-gray-200/80 dark:bg-gray-900 dark:ring-gray-700">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{item.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        <div className="rounded-3xl bg-gradient-to-r from-vendorsoluce-green to-emerald-600 px-6 py-10 text-center text-white shadow-lg sm:px-10">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Ready to run this on your supply base?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-white/90">
            Create an account to replace demo numbers with your vendors, evidence, and audit trail.
          </p>
          <div className="mt-6 flex justify-center">
            <Link to="/signup">
              <Button variant="secondary" size="lg" className="gap-2 bg-white font-semibold text-emerald-800 hover:bg-gray-50">
                <User className="h-5 w-5" aria-hidden />
                Start free account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardDemoPage;
