/**
 * Type definitions for Vendor Requirements (Stage 2)
 * Defines the structure for vendor-specific control requirements
 */

export type RiskTier = 'Critical' | 'High' | 'Medium' | 'Low';

export type RequirementStatus = 'pending' | 'in_progress' | 'completed';

export type RequirementPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type EvidenceType = 'Document' | 'Attestation' | 'Assessment' | 'Certificate';

export type RequirementCategory = 'Security' | 'Compliance' | 'Operational' | 'Technical';

export type GapStatus = 'missing' | 'partial' | 'compliant';

/**
 * Individual control requirement for a vendor
 */
export interface ControlRequirement {
  id: string;
  controlId: string; // NIST SP 800-161 control ID or custom control ID
  controlName: string;
  description: string;
  category: RequirementCategory;
  required: boolean;
  evidenceType: EvidenceType;
  priority: RequirementPriority;
  nistReference: string; // e.g., "NIST SP 800-161 2.2.1"
  evidenceRequired?: string[]; // Specific evidence items needed
}

/**
 * Gap in vendor requirements
 */
export interface RequirementGap {
  requirementId: string;
  controlId: string;
  controlName: string;
  status: GapStatus;
  evidenceRequired: string[];
  notes?: string;
}

/**
 * Complete vendor requirements definition
 */
export interface VendorRequirement {
  id: string;
  vendorId: string;
  vendorName: string;
  riskTier: RiskTier;
  riskScore: number;
  requirements: ControlRequirement[];
  gaps: RequirementGap[];
  status: RequirementStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Requirement mapping configuration for a risk tier
 */
export interface RequirementMapping {
  riskTier: RiskTier;
  requirements: ControlRequirement[];
  description: string;
}

/**
 * Summary statistics for vendor requirements
 */
export interface RequirementSummary {
  totalVendors: number;
  vendorsByTier: Record<RiskTier, number>;
  totalRequirements: number;
  requirementsByTier: Record<RiskTier, number>;
  totalGaps: number;
  gapsByTier: Record<RiskTier, number>;
  complianceRate: number; // Percentage of requirements met
}
