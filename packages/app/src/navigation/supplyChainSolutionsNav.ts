import type { TFunction } from 'i18next';
import type { MenuItem } from '../types';
import { MR, WR } from 'shared/constants/routes';
import { getActiveTier } from '../lib/licenseActivation';

export interface NavSection {
  id: string;
  label: string;
  items: MenuItem[];
}

export function getWorkspaceSections(t: TFunction): NavSection[] {
  const showActivateLicense = getActiveTier() == null;
  return [
    {
      id: 'vendors',
      label: t('navigation.vendorsAndAssets', 'Vendors & assets'),
      items: [
        { label: t('navigation.portfolio', 'Portfolio'), href: MR.VENDORS },
        { label: t('navigation.vendorIntelligence', 'Portfolio intelligence'), href: WR.VENDOR_INTELLIGENCE },
        { label: t('navigation.vendorPortfolio', 'Vendor portfolio (attestations)'), href: WR.VENDOR_PORTFOLIO },
        { label: t('navigation.importVendors', 'Import vendors'), href: WR.VENDOR_GRAPH_IMPORT },
        { label: t('navigation.vendorOnboarding', 'Vendor onboarding'), href: MR.VENDOR_ONBOARDING },
        { label: t('navigation.requirements', 'Requirements'), href: MR.VENDOR_REQUIREMENTS },
        { label: t('navigation.assetManagement', 'Assets'), href: WR.ASSET_MANAGEMENT },
      ],
    },
    {
      id: 'assessments',
      label: t('navigation.assessments', 'Assessments'),
      items: [
        { label: t('navigation.supplyChainAssessment', 'Supply chain'), href: MR.SUPPLY_CHAIN_ASSESSMENT },
        { label: t('navigation.vendorAssessments', 'Security assessments'), href: MR.VENDOR_ASSESSMENTS },
        { label: t('navigation.fedRampAssessment', 'FedRAMP / FISMA'), href: MR.FEDRAMP_ASSESSMENT },
      ],
    },
    {
      id: 'risk',
      label: t('navigation.riskAndReporting', 'Risk & reporting'),
      items: [
        { label: t('navigation.vendorRiskRadar', 'Risk radar'), href: MR.VENDOR_RISK_RADAR },
        { label: t('navigation.portfolioReports', 'Portfolio reports'), href: MR.VENDOR_RISK_REPORTS },
        { label: t('navigation.viraIntake', 'VIRA intake'), href: MR.VENDOR_RISK_CALCULATOR },
        { label: t('navigation.complianceRoadmap', 'Compliance roadmap'), href: WR.COMPLIANCE_ROADMAP },
      ],
    },
    {
      id: 'programs',
      label: t('navigation.programs', 'Programs'),
      items: [
        { label: t('navigation.nistImplementationWorkflow', 'NIST C-SCRM'), href: MR.PROGRAM_NIST_IMPLEMENTATION },
        { label: t('navigation.viraDueDiligenceWorkflow', 'VIRA due diligence'), href: MR.PROGRAM_VIRA_DUE_DILIGENCE },
        { label: t('navigation.activityCatalog', 'Activity catalog'), href: MR.VENDOR_ACTIVITY_CATALOG },
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
    ...(showActivateLicense
      ? [
          {
            id: 'account',
            label: t('navigation.account', 'Account'),
            items: [{ label: t('navigation.activateLicense', 'Activate License'), href: '/workspace/activate' }],
          },
        ]
      : []),
  ];
}

export function getSupplyChainToolItems(t: TFunction): MenuItem[] {
  return getWorkspaceSections(t).flatMap((section) => section.items);
}

export function getSolutionsMenuItems(t: TFunction): MenuItem[] {
  return getSupplyChainToolItems(t);
}
