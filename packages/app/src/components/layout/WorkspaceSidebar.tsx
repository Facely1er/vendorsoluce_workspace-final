import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  FileCheck,
  Users,
  ClipboardList,
  Radar,
  Calculator,
  Shield,
  Layers,
  ListTree,
  Target,
  ChevronDown,
  ExternalLink,
  LayoutDashboard,
  FileSearch,
  FolderOpen,
  FileText,
} from 'lucide-react';
import { getWorkspaceSections } from '../../navigation/supplyChainSolutionsNav';
import { WR } from 'shared/constants/routes';

/** Map well-known hrefs to an icon for richer sidebar rendering. */
const HREF_ICON: Record<string, React.ReactNode> = {
  [WR.VENDOR_INTELLIGENCE]: <LayoutDashboard className="h-4 w-4 flex-shrink-0" />,
  '/supply-chain-assessment': <FileCheck className="h-4 w-4 flex-shrink-0" />,
  '/vendors': <Users className="h-4 w-4 flex-shrink-0" />,
  '/vendor-requirements': <ClipboardList className="h-4 w-4 flex-shrink-0" />,
  '/vendor-assessments': <FileSearch className="h-4 w-4 flex-shrink-0" />,
  '/vendor-risk-radar': <Radar className="h-4 w-4 flex-shrink-0" />,
  '/vira-reports': <FileText className="h-4 w-4 flex-shrink-0" />,
  '/tools/vendor-risk-calculator': <Calculator className="h-4 w-4 flex-shrink-0" />,
  '/tools/nist-checklist': <Shield className="h-4 w-4 flex-shrink-0" />,
  '/asset-management': <FolderOpen className="h-4 w-4 flex-shrink-0" />,
  '/vendor-activity-catalog': <Layers className="h-4 w-4 flex-shrink-0" />,
  '/program/nist-implementation': <Shield className="h-4 w-4 flex-shrink-0" />,
  '/program/vira-due-diligence': <Target className="h-4 w-4 flex-shrink-0" />,
};

const SECTION_ICON: Record<string, React.ReactNode> = {
  overview: <LayoutDashboard className="h-3.5 w-3.5" />,
  assessments: <BarChart3 className="h-3.5 w-3.5" />,
  analysis: <Radar className="h-3.5 w-3.5" />,
  actions: <ListTree className="h-3.5 w-3.5" />,
};

export interface WorkspaceSidebarProps {
  className?: string;
}

const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const sections = getWorkspaceSections(t);

  /** Track which sections are collapsed; all open by default. */
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  const isActive = (href: string) => location.pathname === href;
  const isParentActive = (hrefs: string[]) => hrefs.some((h) => location.pathname === h || location.pathname.startsWith(h + '/'));

  return (
    <aside
      className={`flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700/80 ${className}`}
      aria-label="Workspace navigation"
    >
      {/* Dashboard link */}
      <div className="px-3 pt-4 pb-2">
        <Link
          to={WR.VENDOR_INTELLIGENCE}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
            isActive(WR.VENDOR_INTELLIGENCE)
              ? 'text-vendorsoluce-green bg-vendorsoluce-green/10 dark:bg-vendorsoluce-green/20'
              : 'text-gray-700 dark:text-gray-300 hover:text-vendorsoluce-green hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
          {t('navigation.dashboard', 'Dashboard')}
        </Link>
      </div>

      {/* Workspace sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1" aria-label="Workspace sections">
        {sections.map((section) => {
          const sectionActive = isParentActive(section.items.filter((i) => !i.external).map((i) => i.href));
          const isCollapsed = !!collapsed[section.id];

          return (
            <div key={section.id}>
              <button
                type="button"
                onClick={() => toggle(section.id)}
                className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest transition-colors select-none ${
                  sectionActive
                    ? 'text-vendorsoluce-green dark:text-vendorsoluce-light-green'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
                {...(isCollapsed ? { 'aria-expanded': 'false' as const } : { 'aria-expanded': 'true' as const })}
              >
                <span className="flex items-center gap-1.5">
                  {SECTION_ICON[section.id]}
                  {section.label}
                </span>
                <ChevronDown
                  className={`h-3 w-3 opacity-60 transition-transform flex-shrink-0 ${isCollapsed ? '-rotate-90' : ''}`}
                  aria-hidden
                />
              </button>

              {!isCollapsed && (
                <ul className="mt-0.5 space-y-0.5 pl-1" role="list">
                  {section.items.map((item) =>
                    item.external ? (
                      <li key={item.href}>
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-vendorsoluce-green hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          {HREF_ICON[item.href] ?? <ExternalLink className="h-4 w-4 flex-shrink-0" />}
                          <span className="min-w-0 truncate">{item.label}</span>
                          <ExternalLink className="h-3 w-3 shrink-0 opacity-40 ml-auto" aria-hidden />
                        </a>
                      </li>
                    ) : (
                      <li key={item.href}>
                        <Link
                          to={item.href}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                            isActive(item.href)
                              ? 'text-vendorsoluce-green dark:text-white bg-vendorsoluce-green/10 dark:bg-vendorsoluce-green/20 font-medium'
                              : 'text-gray-600 dark:text-gray-400 hover:text-vendorsoluce-green hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          {HREF_ICON[item.href] ?? <span className="h-4 w-4 flex-shrink-0" />}
                          <span className="min-w-0 truncate">{item.label}</span>
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
    </aside>
  );
};

export default WorkspaceSidebar;
