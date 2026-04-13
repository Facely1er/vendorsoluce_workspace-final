import type { TFunction } from 'i18next';
import type { MenuItem } from '../types';
import { MR, WR } from 'shared/constants/routes';

export interface NavSection {
  id: string;
  label: string;
  items: MenuItem[];
}

export function getWorkspaceSections(t: TFunction): NavSection[] {
  return [
    {
      id: 'vendors',
      label: t('navigation.vendorsAndAssets', 'Vendors & assets'),
      items: [
        { label: t('navigation.vendorPortfolio', 'Vendor Portfolio'), href: WR.VENDOR_PORTFOLIO },
        { label: t('navigation.portfolio', 'Portfolio'), href: WR.VENDOR_INTELLIGENCE },
        { label: t('navigation.importVendors', 'Import vendors'), href: WR.VENDOR_GRAPH_IMPORT },
        { label: t('navigation.vendorOnboarding', 'Vendor onboarding'), href: MR.VENDOR_ONBOARDING },
        { label: t('navigation.requirements', 'Requirements'), href: '/vendor-requirements' },
        { label: t('navigation.assetManagement', 'Assets'), href: WR.ASSET_MANAGEMENT },
      ],
    },
    {
      id: 'assessments',
      label: t('navigation.assessments', 'Assessments'),
      items: [
        { label: t('navigation.supplyChainAssessment', 'Supply chain'), href: '/supply-chain-assessment' },
        { label: t('navigation.vendorAssessments', 'Security assessments'), href: '/vendor-assessments' },
        { label: t('navigation.fedRampAssessment', 'FedRAMP / FISMA'), href: '/fedramp-assessment' },
      ],
    },
    {
      id: 'risk',
      label: t('navigation.riskAndReporting', 'Risk & reporting'),
      items: [
        { label: t('navigation.vendorRiskRadar', 'Risk radar'), href: '/vendor-risk-radar' },
        { label: t('navigation.vendorRiskReports', 'Risk reports'), href: '/vendor-risk-reports' },
        { label: t('navigation.viraIntake', 'VIRA intake'), href: '/tools/vendor-risk-calculator' },
        { label: t('navigation.viraReports', 'VIRA reports'), href: '/vira-reports' },
        { label: t('navigation.complianceRoadmap', 'Compliance roadmap'), href: WR.COMPLIANCE_ROADMAP },
      ],
    },
    {
      id: 'programs',
      label: t('navigation.programs', 'Programs'),
      items: [
        { label: t('navigation.nistImplementationWorkflow', 'NIST C-SCRM'), href: '/program/nist-implementation' },
        { label: t('navigation.viraDueDiligenceWorkflow', 'VIRA due diligence'), href: '/program/vira-due-diligence' },
        { label: t('navigation.activityCatalog', 'Activity catalog'), href: '/vendor-activity-catalog' },
      ],
    },
    {
      id: 'team',
      label: t('navigation.team', 'Team'),
      items: [
        { label: t('navigation.collaborativeAssessments', 'Collaborative assessments'), href: WR.TEAM_COLLABORATE },
        { label: t('navigation.raciMatrix', 'RACI matrix'), href: WR.TEAM_RACI },
        { label: t('navigation.stakeholders', 'Stakeholders'), href: WR.TEAM_STAKEHOLDERS },
      ],
    },
  ];
}

export function getSupplyChainToolItems(t: TFunction): MenuItem[] {
  return getWorkspaceSections(t).flatMap((section) => section.items);
}

export function getSolutionsMenuItems(t: TFunction): MenuItem[] {
  return getSupplyChainToolItems(t);
}
