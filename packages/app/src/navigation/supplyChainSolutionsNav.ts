import type { TFunction } from 'i18next';
import type { MenuItem } from '../types';
import { MR, WR } from 'shared/constants/routes';
import { isFeatureEnabled, getDefaultFeaturesForProduct, FEATURE_IDS } from '../lib/ermits-template';

const vendorSoluceFeatures = getDefaultFeaturesForProduct('vendorsoluce');

export interface NavSection {
  id: string;
  label: string;
  items: MenuItem[];
}

/**
 * Workspace sidebar order follows a typical rollout: initialize the tenant, load vendor data,
 * scope assets and requirements, run assessments, measure residual risk and reporting, then use
 * guided programs (and the activity catalog) for sustained operating rhythm, with planning last.
 */
export function getWorkspaceSections(t: TFunction): NavSection[] {
  return [
    {
      id: 'setup',
      label: t('navigation.navPhaseSetup', 'Workspace setup'),
      items: [
        { label: t('navigation.platformSetup', 'Platform setup'), href: WR.PLATFORM_SETUP },
        { label: t('navigation.workspaceOnboarding', 'Workspace onboarding'), href: WR.ONBOARDING },
      ],
    },
    {
      id: 'intake',
      label: t('navigation.navPhaseIntake', 'Data intake'),
      items: [
        { label: t('navigation.vendorDataImport', 'Import vendor data'), href: WR.VENDOR_GRAPH_IMPORT },
        { label: t('navigation.vendorOnboardingProgram', 'Vendor onboarding'), href: MR.VENDOR_ONBOARDING },
      ],
    },
    {
      id: 'scope',
      label: t('navigation.navPhaseScope', 'Scope & context'),
      items: [
        {
          label: t('navigation.assetManagement', 'Asset management'),
          href: WR.ASSET_MANAGEMENT,
          description: t(
            'navigation.assetManagementSidebarHint',
            'Systems, data, and vendor links that scope and inform assessments.',
          ),
        },
        {
          label: t('navigation.vendorRequirements', 'Vendor requirements'),
          href: '/vendor-requirements',
          description: t(
            'navigation.vendorRequirementsSidebarHint',
            'Define expectations and controls before you run assessments.',
          ),
        },
      ],
    },
    {
      id: 'assessments',
      label: t('navigation.assessments', 'Assessments'),
      items: [
        { label: t('navigation.supplyChainAssessment', 'Supply Chain Assessment'), href: '/supply-chain-assessment' },
        { label: t('navigation.vendorAssessments', 'Vendor Assessments'), href: '/vendor-assessments' },
        { label: t('navigation.fedRampAssessment', 'FedRAMP/FISMA Evidence'), href: '/fedramp-assessment' },
      ],
    },
    {
      id: 'measure',
      label: t('navigation.navPhaseMeasure', 'Measure & report'),
      items: [
        { label: t('navigation.vendorRiskRadar', 'Vendor Risk Radar'), href: '/vendor-risk-radar' },
        { label: t('navigation.viraReports', 'VIRA Reports'), href: '/vira-reports' },
        { label: t('navigation.viraIntake', 'VIRA intake'), href: '/tools/vendor-risk-calculator' },
      ],
    },
    {
      id: 'programs',
      label: t('navigation.navPhasePrograms', 'Programs & catalog'),
      items: [
        { label: t('navigation.nistImplementationWorkflow', 'NIST implementation workflow'), href: '/program/nist-implementation' },
        { label: t('navigation.viraDueDiligenceWorkflow', 'VIRA due diligence workflow'), href: '/program/vira-due-diligence' },
        { label: t('navigation.activityCatalog', 'Activity catalog'), href: '/vendor-activity-catalog' },
      ],
    },
    ...(isFeatureEnabled(vendorSoluceFeatures, FEATURE_IDS.COMPLIANCE_CALENDAR)
      ? [
          {
            id: 'planning',
            label: t('navigation.planning', 'Planning'),
            items: [
              {
                label: t('navigation.roadmapCalendar', 'Roadmap & calendar'),
                href: WR.COMPLIANCE_ROADMAP,
              },
            ],
          } satisfies NavSection,
        ]
      : []),
  ];
}

export function getSupplyChainToolItems(t: TFunction): MenuItem[] {
  return getWorkspaceSections(t).flatMap((section) => section.items);
}

export function getSolutionsMenuItems(t: TFunction): MenuItem[] {
  const items: MenuItem[] = [];

  if (isFeatureEnabled(vendorSoluceFeatures, FEATURE_IDS.VENDORSOLUCE_VENDOR_PORTFOLIO)) {
    items.push({ label: t('navigation.vendorRiskRadar', 'Vendor Risk Radar'), href: '/vendor-risk-radar' });
  }

  if (isFeatureEnabled(vendorSoluceFeatures, FEATURE_IDS.VENDORSOLUCE_ASSESSMENTS)) {
    items.push({ label: t('navigation.supplyChainAssessment', 'Supply Chain Assessment'), href: '/supply-chain-assessment' });
  }

  if (isFeatureEnabled(vendorSoluceFeatures, FEATURE_IDS.VENDORSOLUCE_REPORTS)) {
    items.push({ label: t('navigation.viraReports', 'VIRA Reports'), href: '/vira-reports' });
  }

  if (isFeatureEnabled(vendorSoluceFeatures, FEATURE_IDS.VENDORSOLUCE_PROGRAMS)) {
    items.push({ label: t('navigation.nistImplementationWorkflow', 'NIST implementation workflow'), href: '/program/nist-implementation' });
    items.push({ label: t('navigation.viraDueDiligenceWorkflow', 'VIRA due diligence workflow'), href: '/program/vira-due-diligence' });
  }

  return items;
}
