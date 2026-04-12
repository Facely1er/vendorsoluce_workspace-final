import type { TFunction } from 'i18next';
import type { MenuItem } from '../types';
import { WR } from 'shared/constants/routes';
import { isFeatureEnabled, getDefaultFeaturesForProduct, FEATURE_IDS } from '../lib/ermits-template';

const vendorSoluceFeatures = getDefaultFeaturesForProduct('vendorsoluce');

export interface NavSection {
  id: string;
  label: string;
  items: MenuItem[];
}

export function getWorkspaceSections(t: TFunction): NavSection[] {
  return [
    {
      id: 'overview',
      label: t('navigation.overview', 'Overview'),
      items: [
        { label: t('navigation.vendorRiskAndManagement', 'Vendor Portfolio'), href: WR.VENDOR_INTELLIGENCE },
      ],
    },
    {
      id: 'assessments',
      label: t('navigation.assessments', 'Assessments'),
      items: [
        { label: t('navigation.supplyChainAssessment', 'Supply Chain Assessment'), href: '/supply-chain-assessment' },
        { label: t('navigation.vendorAssessments', 'Vendor Assessments'), href: '/vendor-assessments' },
        { label: t('navigation.vendorRequirements', 'Vendor Requirements'), href: '/vendor-requirements' },
        { label: t('navigation.fedRampAssessment', 'FedRAMP/FISMA Evidence'), href: '/fedramp-assessment' },
      ],
    },
    {
      id: 'analysis',
      label: t('navigation.analysis', 'Analysis'),
      items: [
        { label: t('navigation.vendorRiskRadar', 'Vendor Risk Radar'), href: '/vendor-risk-radar' },
        { label: t('navigation.viraReports', 'VIRA Reports'), href: '/vira-reports' },
        { label: t('navigation.riskCalculator', 'Risk calculator'), href: '/tools/vendor-risk-calculator' },
        { label: t('navigation.assetManagement', 'Asset management'), href: '/asset-management' },
        { label: t('navigation.activityCatalog', 'Activity catalog'), href: '/vendor-activity-catalog' },
      ],
    },
    {
      id: 'actions',
      label: t('navigation.actions', 'Actions'),
      items: [
        { label: t('navigation.nistImplementationWorkflow', 'NIST implementation workflow'), href: '/program/nist-implementation' },
        { label: t('navigation.viraDueDiligenceWorkflow', 'VIRA due diligence workflow'), href: '/program/vira-due-diligence' },
      ],
    },
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
