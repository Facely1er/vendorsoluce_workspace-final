import type { VendorSupplyPhaseId } from '../catalog/vendorSupplyChainSipocCatalog';

export type VendorProgramWorkflowId = 'nist-implementation' | 'vira-due-diligence';

export type VendorProgramToolLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type VendorProgramDeliverable = {
  id: string;
  label: string;
  /** In-app route or external URL */
  href?: string;
};

export type VendorProgramWorkflowStep = {
  id: string;
  n: number;
  title: string;
  description: string;
  /** Display-only typical duration (e.g. "2–4 wks") */
  durationLabel: string;
  roles: string[];
  /** SIPOC phases whose activities count toward this step's "Activities" metric */
  sipocPhaseIds: readonly VendorSupplyPhaseId[];
  /** NIST checklist control IDs covered in this step (SP 800-161 C-SCRM style) */
  nistChecklistControls?: string;
  keyActivities: string[];
  deliverables: VendorProgramDeliverable[];
  tools: VendorProgramToolLink[];
};

export type VendorProgramWorkflowDefinition = {
  id: VendorProgramWorkflowId;
  steps: readonly VendorProgramWorkflowStep[];
};
