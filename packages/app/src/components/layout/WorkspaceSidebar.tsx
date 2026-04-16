import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  FileCheck,
  ClipboardList,
  Radar,
  Calculator,
  Shield,
  Layers,
  ListTree,
  Target,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  LayoutDashboard,
  FileSearch,
  FolderOpen,
  FileText,
  CalendarDays,
  Settings,
  Upload,
  Building2,
  UserPlus,
  ListChecks,
  Users,
} from 'lucide-react';
import { getWorkspaceSections } from '../../navigation/supplyChainSolutionsNav';
import { MR, WR } from 'shared/constants/routes';
import { useAuth } from '../../context/AuthContext';

/** Map well-known hrefs to an icon for richer sidebar rendering. */
const HREF_ICON: Record<string, React.ReactNode> = {
  [WR.VENDOR_INTELLIGENCE]: <LayoutDashboard className="h-4 w-4 flex-shrink-0" />,
  [WR.PLATFORM_SETUP]: <Settings className="h-4 w-4 flex-shrink-0" />,
  [WR.ONBOARDING]: <ClipboardList className="h-4 w-4 flex-shrink-0" />,
  [WR.VENDOR_GRAPH_IMPORT]: <Upload className="h-4 w-4 flex-shrink-0" />,
  [MR.VENDOR_ONBOARDING]: <UserPlus className="h-4 w-4 flex-shrink-0" />,
  [WR.TEAM_COLLABORATE]: <Users className="h-4 w-4 flex-shrink-0" />,
  [WR.TEAM_RACI]: <ListChecks className="h-4 w-4 flex-shrink-0" />,
  [WR.TEAM_STAKEHOLDERS]: <Building2 className="h-4 w-4 flex-shrink-0" />,
  '/supply-chain-assessment': <FileCheck className="h-4 w-4 flex-shrink-0" />,
  '/vendors': <Users className="h-4 w-4 flex-shrink-0" />,
  '/vendor-requirements': <ListChecks className="h-4 w-4 flex-shrink-0" />,
  '/vendor-assessments': <FileSearch className="h-4 w-4 flex-shrink-0" />,
  '/vendor-risk-radar': <Radar className="h-4 w-4 flex-shrink-0" />,
  '/vendor-risk-reports': <FileText className="h-4 w-4 flex-shrink-0" />,
  '/tools/vendor-risk-calculator': <Calculator className="h-4 w-4 flex-shrink-0" />,
  '/tools/nist-checklist': <Shield className="h-4 w-4 flex-shrink-0" />,
  '/asset-management': <FolderOpen className="h-4 w-4 flex-shrink-0" />,
  '/vendor-activity-catalog': <Layers className="h-4 w-4 flex-shrink-0" />,
  '/program/nist-implementation': <Shield className="h-4 w-4 flex-shrink-0" />,
  '/program/vira-due-diligence': <Target className="h-4 w-4 flex-shrink-0" />,
  [WR.COMPLIANCE_ROADMAP]: <CalendarDays className="h-4 w-4 flex-shrink-0" />,
};

const SECTION_ICON: Record<string, React.ReactNode> = {
  vendors: <Building2 className="h-3.5 w-3.5" />,
  assessments: <BarChart3 className="h-3.5 w-3.5" />,
  risk: <Radar className="h-3.5 w-3.5" />,
  programs: <ListTree className="h-3.5 w-3.5" />,
  team: <Users className="h-3.5 w-3.5" />,
};

export interface WorkspaceSidebarProps {
  className?: string;
  /** When false, sidebar shows icon rail only (md+ fixed rail). */
  expanded?: boolean;
  onToggleExpanded?: () => void;
}

const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  className = '',
  expanded = true,
  onToggleExpanded,
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { profile } = useAuth();
  const sections = getWorkspaceSections(t);
  const showOnboarding = profile?.onboarding_completed === false;

  /** Track which sections are collapsed; all open by default. */
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  /** Exact match or nested route (e.g. assessment result IDs). */
  const isRouteActive = (href: string) => {
    const p = location.pathname;
    if (p === href) return true;
    // Treat the vendor portfolio as exact-match only (avoid highlighting both
    // `/workspace/vendors` and nested tools like `/workspace/vendors/import`).
    if (href === WR.VENDOR_INTELLIGENCE) return false;
    if (href !== '/' && p.startsWith(`${href}/`)) return true;
    return false;
  };

  /** Workspace home (`/dashboard`) */
  const isMainDashboardActive = location.pathname === MR.DASHBOARD;

  const isParentActive = (hrefs: string[]) =>
    hrefs.some((h) => location.pathname === h || location.pathname.startsWith(`${h}/`));

  const iconRailLinkClass = (active: boolean) =>
    `flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors mx-auto ${
      active
        ? 'text-vendorsoluce-green dark:text-white bg-vendorsoluce-green/10 dark:bg-vendorsoluce-green/20'
        : 'text-gray-600 dark:text-gray-400 hover:text-vendorsoluce-green hover:bg-gray-50 dark:hover:bg-gray-800'
    }`;

  const collapseLabel = expanded
    ? t('navigation.collapseSidebar', 'Collapse sidebar')
    : t('navigation.expandSidebar', 'Expand sidebar');

  const widthClass = expanded ? 'w-64' : 'w-14';

  return (
    <aside
      className={`flex flex-col h-full ${widthClass} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700/80 ${className}`}
      aria-label="Workspace navigation"
    >
      {expanded ? (
        <>
          <div className="flex items-center gap-1 px-2 pt-3 pb-2">
            <Link
              to={MR.DASHBOARD}
              className={`flex min-w-0 flex-1 items-center gap-2 px-2 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isMainDashboardActive
                  ? 'text-vendorsoluce-green bg-vendorsoluce-green/10 dark:bg-vendorsoluce-green/20'
                  : 'text-gray-700 dark:text-gray-300 hover:text-vendorsoluce-green hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
              {t('navigation.dashboard', 'Dashboard')}
            </Link>
            {onToggleExpanded && (
              <button
                type="button"
                onClick={onToggleExpanded}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                aria-label={collapseLabel}
                title={collapseLabel}
              >
                <ChevronsLeft className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 space-y-1" aria-label="Workspace sections">
            {sections.map((section) => {
              const sectionActive = isParentActive(section.items.filter((i) => !i.external).map((i) => i.href));
              const isCollapsed = !!collapsed[section.id];

              return (
                <div key={section.id}>
                  <button
                    type="button"
                    onClick={() => toggle(section.id)}
                    className={`w-full flex items-start justify-between gap-1.5 px-1.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-colors select-none text-left ${
                      sectionActive
                        ? 'text-vendorsoluce-green dark:text-vendorsoluce-light-green'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                    {...(isCollapsed ? { 'aria-expanded': 'false' as const } : { 'aria-expanded': 'true' as const })}
                  >
                    <span className="flex min-w-0 flex-1 items-start gap-1.5 leading-tight">
                      <span className="mt-0.5 shrink-0">{SECTION_ICON[section.id] ?? <Layers className="h-3.5 w-3.5" />}</span>
                      <span className="min-w-0 break-words">{section.label}</span>
                    </span>
                    <ChevronDown
                      className={`h-3 w-3 shrink-0 opacity-60 transition-transform mt-0.5 ${isCollapsed ? '-rotate-90' : ''}`}
                      aria-hidden
                    />
                  </button>

                  {!isCollapsed && (
                    <ul className="mt-0.5 space-y-px" role="list">
                      {section.items.map((item) =>
                        item.external ? (
                          <li key={item.href}>
                            <a
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-start gap-2 px-2 py-1.5 rounded-lg text-[11px] leading-snug text-gray-600 dark:text-gray-400 hover:text-vendorsoluce-green hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              <span className="mt-0.5 shrink-0">{HREF_ICON[item.href] ?? <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />}</span>
                              <span className="min-w-0 flex-1 break-words">{item.label}</span>
                              <ExternalLink className="h-3 w-3 shrink-0 opacity-40 mt-0.5" aria-hidden />
                            </a>
                          </li>
                        ) : (
                          <li key={item.href}>
                            <Link
                              to={item.href}
                              title={item.description ? `${item.label} — ${item.description}` : item.label}
                              className={`flex items-start gap-2 px-2 py-1.5 rounded-lg text-[11px] leading-snug transition-colors ${
                                isRouteActive(item.href)
                                  ? 'text-vendorsoluce-green dark:text-white bg-vendorsoluce-green/10 dark:bg-vendorsoluce-green/20 font-medium'
                                  : 'text-gray-600 dark:text-gray-400 hover:text-vendorsoluce-green hover:bg-gray-50 dark:hover:bg-gray-800'
                              }`}
                            >
                              <span className="mt-0.5 shrink-0">{HREF_ICON[item.href] ?? <span className="block h-3.5 w-3.5 flex-shrink-0" />}</span>
                              <span className="min-w-0 flex-1 break-words">
                                <span className="block">{item.label}</span>
                                {item.description ? (
                                  <span className="mt-0.5 block font-normal text-[10px] leading-snug text-gray-500 dark:text-gray-500">
                                    {item.description}
                                  </span>
                                ) : null}
                              </span>
                            </Link>
                          </li>
                        )
                      )}
                    </ul>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="px-2 pb-3 pt-1 space-y-1">
            <Link
              to={WR.PLATFORM_SETUP}
              className="flex items-center justify-center rounded-lg h-10 w-10 mx-auto text-gray-600 dark:text-gray-400 hover:text-vendorsoluce-green hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              title={t('navigation.platformSetup', 'Platform setup')}
              aria-label={t('navigation.platformSetup', 'Platform setup')}
            >
              {HREF_ICON[WR.PLATFORM_SETUP]}
            </Link>
            {showOnboarding ? (
              <Link
                to={WR.ONBOARDING}
                className="flex items-center justify-center rounded-lg h-10 w-10 mx-auto text-gray-600 dark:text-gray-400 hover:text-vendorsoluce-green hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                title={t('navigation.workspaceOnboarding', 'Workspace onboarding')}
                aria-label={t('navigation.workspaceOnboarding', 'Workspace onboarding')}
              >
                {HREF_ICON[WR.ONBOARDING]}
              </Link>
            ) : null}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col items-center gap-1 px-2 pt-3 pb-2">
            {onToggleExpanded && (
              <button
                type="button"
                onClick={onToggleExpanded}
                className="flex h-9 w-full max-w-[2.25rem] items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                aria-label={collapseLabel}
                title={collapseLabel}
              >
                <ChevronsRight className="h-4 w-4" aria-hidden />
              </button>
            )}
            <Link
              to={MR.DASHBOARD}
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                isMainDashboardActive
                  ? 'text-vendorsoluce-green bg-vendorsoluce-green/10 dark:bg-vendorsoluce-green/20'
                  : 'text-gray-700 dark:text-gray-300 hover:text-vendorsoluce-green hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              title={t('navigation.dashboard', 'Dashboard')}
              aria-label={t('navigation.dashboard', 'Dashboard')}
            >
              <LayoutDashboard className="h-4 w-4" />
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5" aria-label="Workspace sections">
            {sections.map((section) => (
              <div key={section.id} className="space-y-0.5 border-t border-gray-100 pt-2 first:border-0 first:pt-0 dark:border-gray-700/80">
                {section.items.map((item) =>
                  item.external ? (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 mx-auto items-center justify-center rounded-lg text-gray-600 dark:text-gray-400 hover:text-vendorsoluce-green hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      title={item.label}
                      aria-label={item.label}
                    >
                      {HREF_ICON[item.href] ?? <ExternalLink className="h-4 w-4 flex-shrink-0" />}
                    </a>
                  ) : (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={iconRailLinkClass(isRouteActive(item.href))}
                      title={item.label}
                      aria-label={item.label}
                    >
                      {HREF_ICON[item.href] ?? <span className="h-4 w-4 flex-shrink-0" />}
                    </Link>
                  )
                )}
              </div>
            ))}
          </nav>

          <div className="px-2 pb-3 pt-1 space-y-0.5">
            <Link
              to={WR.PLATFORM_SETUP}
              className={iconRailLinkClass(isRouteActive(WR.PLATFORM_SETUP))}
              title={t('navigation.platformSetup', 'Platform setup')}
              aria-label={t('navigation.platformSetup', 'Platform setup')}
            >
              {HREF_ICON[WR.PLATFORM_SETUP]}
            </Link>
            {showOnboarding ? (
              <Link
                to={WR.ONBOARDING}
                className={iconRailLinkClass(isRouteActive(WR.ONBOARDING))}
                title={t('navigation.workspaceOnboarding', 'Workspace onboarding')}
                aria-label={t('navigation.workspaceOnboarding', 'Workspace onboarding')}
              >
                {HREF_ICON[WR.ONBOARDING]}
              </Link>
            ) : null}
          </div>
        </>
      )}
    </aside>
  );
};

export default WorkspaceSidebar;
