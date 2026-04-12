# Stage 2 Implementation Plan: Vendor Requirements Definition

**Date:** January 2025  
**Purpose:** Detailed plan for implementing the missing Stage 2 component that defines vendor-specific requirements based on risk tiers

---

## Overview

Stage 2 will allow users to:
1. Import vendors from Stage 1 (Vendor Risk Radar)
2. View vendor risk tiers (Critical, High, Medium, Low)
3. Automatically generate vendor-specific control requirements based on risk tiers
4. Use NIST SP 800-161 as the framework for control mapping
5. Identify gaps (required vs. current controls)
6. Store requirements for use in Stage 3 (Vendor Portal)

---

## Architecture

### Component Structure

```
src/
├── pages/
│   └── VendorRequirementsDefinition.tsx    # Main Stage 2 page
├── components/
│   └── vendor-requirements/
│       ├── VendorRequirementsList.tsx       # List of vendors with requirements
│       ├── RequirementMapping.tsx          # Risk tier → Requirements mapping
│       ├── RequirementCard.tsx             # Individual requirement display
│       ├── GapAnalysis.tsx                 # Gap identification component
│       └── RequirementSummary.tsx          # Summary view
├── hooks/
│   └── useVendorRequirements.ts            # Requirements management hook
├── services/
│   └── requirementService.ts               # API service for requirements
├── utils/
│   └── requirementMapping.ts               # Risk tier → NIST controls mapping
└── types/
    └── requirements.ts                     # TypeScript types for requirements
```

---

## Data Models

### TypeScript Types

```typescript
// src/types/requirements.ts

export type RiskTier = 'Critical' | 'High' | 'Medium' | 'Low';

export interface VendorRequirement {
  id: string;
  vendorId: string;
  vendorName: string;
  riskTier: RiskTier;
  riskScore: number;
  requirements: ControlRequirement[];
  gaps: RequirementGap[];
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface ControlRequirement {
  id: string;
  controlId: string; // NIST SP 800-161 control ID
  controlName: string;
  description: string;
  category: 'Security' | 'Compliance' | 'Operational' | 'Technical';
  required: boolean;
  evidenceType: 'Document' | 'Attestation' | 'Assessment' | 'Certificate';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  nistReference: string; // e.g., "NIST SP 800-161 2.2.1"
}

export interface RequirementGap {
  requirementId: string;
  controlId: string;
  controlName: string;
  status: 'missing' | 'partial' | 'compliant';
  evidenceRequired: string[];
  notes?: string;
}

export interface RequirementMapping {
  riskTier: RiskTier;
  requirements: ControlRequirement[];
  description: string;
}
```

### Database Schema (Supabase)

```sql
-- Vendor Requirements Table
CREATE TABLE IF NOT EXISTS vendor_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_tier TEXT NOT NULL CHECK (risk_tier IN ('Critical', 'High', 'Medium', 'Low')),
  risk_score INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  requirements JSONB NOT NULL, -- Array of ControlRequirement
  gaps JSONB DEFAULT '[]'::jsonb, -- Array of RequirementGap
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_vendor_requirements_vendor_id ON vendor_requirements(vendor_id);
CREATE INDEX idx_vendor_requirements_user_id ON vendor_requirements(user_id);
CREATE INDEX idx_vendor_requirements_risk_tier ON vendor_requirements(risk_tier);

-- RLS Policies
ALTER TABLE vendor_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vendor requirements"
  ON vendor_requirements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vendor requirements"
  ON vendor_requirements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vendor requirements"
  ON vendor_requirements FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vendor requirements"
  ON vendor_requirements FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Requirement Mapping Logic

### Risk Tier → NIST SP 800-161 Controls

```typescript
// src/utils/requirementMapping.ts

import type { RequirementMapping, ControlRequirement, RiskTier } from '../types/requirements';

export const REQUIREMENT_MAPPINGS: Record<RiskTier, RequirementMapping> = {
  Critical: {
    riskTier: 'Critical',
    description: 'Vendors with critical risk require comprehensive security controls and evidence',
    requirements: [
      {
        id: 'req-001',
        controlId: 'NIST-800-161-2.2.1',
        controlName: 'Supplier Security Requirements',
        description: 'Supplier must have documented security requirements and controls',
        category: 'Security',
        required: true,
        evidenceType: 'Document',
        priority: 'Critical',
        nistReference: 'NIST SP 800-161 2.2.1'
      },
      {
        id: 'req-002',
        controlId: 'SOC2-TypeII',
        controlName: 'SOC 2 Type II Certification',
        description: 'Vendor must have current SOC 2 Type II certification',
        category: 'Compliance',
        required: true,
        evidenceType: 'Certificate',
        priority: 'Critical',
        nistReference: 'NIST SP 800-161 2.2.5'
      },
      {
        id: 'req-003',
        controlId: 'CYBER-INSURANCE-5M',
        controlName: 'Cyber Insurance ($5M minimum)',
        description: 'Vendor must maintain minimum $5M cyber liability insurance',
        category: 'Operational',
        required: true,
        evidenceType: 'Certificate',
        priority: 'Critical',
        nistReference: 'NIST SP 800-161 2.2.6'
      },
      {
        id: 'req-004',
        controlId: 'IR-PLAN',
        controlName: 'Incident Response Plan',
        description: 'Vendor must have documented incident response plan',
        category: 'Security',
        required: true,
        evidenceType: 'Document',
        priority: 'Critical',
        nistReference: 'NIST SP 800-161 2.8.4'
      },
      {
        id: 'req-005',
        controlId: 'MFA',
        controlName: 'Multi-Factor Authentication',
        description: 'Vendor must implement MFA for all system access',
        category: 'Technical',
        required: true,
        evidenceType: 'Attestation',
        priority: 'Critical',
        nistReference: 'NIST SP 800-161 3.8.1'
      },
      {
        id: 'req-006',
        controlId: 'SEC-ASSESSMENT',
        controlName: 'Annual Security Assessment',
        description: 'Vendor must undergo annual third-party security assessment',
        category: 'Compliance',
        required: true,
        evidenceType: 'Assessment',
        priority: 'High',
        nistReference: 'NIST SP 800-161 2.7.1'
      }
    ]
  },
  High: {
    riskTier: 'High',
    description: 'Vendors with high risk require significant security controls',
    requirements: [
      {
        id: 'req-101',
        controlId: 'NIST-800-161-2.2.1',
        controlName: 'Supplier Security Requirements',
        description: 'Supplier must have documented security requirements',
        category: 'Security',
        required: true,
        evidenceType: 'Document',
        priority: 'High',
        nistReference: 'NIST SP 800-161 2.2.1'
      },
      {
        id: 'req-102',
        controlId: 'CYBER-INSURANCE-2M',
        controlName: 'Cyber Insurance ($2M minimum)',
        description: 'Vendor must maintain minimum $2M cyber liability insurance',
        category: 'Operational',
        required: true,
        evidenceType: 'Certificate',
        priority: 'High',
        nistReference: 'NIST SP 800-161 2.2.6'
      },
      {
        id: 'req-103',
        controlId: 'SEC-QUESTIONNAIRE',
        controlName: 'Security Questionnaire',
        description: 'Vendor must complete comprehensive security questionnaire',
        category: 'Compliance',
        required: true,
        evidenceType: 'Attestation',
        priority: 'High',
        nistReference: 'NIST SP 800-161 2.2.2'
      },
      {
        id: 'req-104',
        controlId: 'DATA-PROTECTION',
        controlName: 'Data Protection Policy',
        description: 'Vendor must have documented data protection policy',
        category: 'Security',
        required: true,
        evidenceType: 'Document',
        priority: 'High',
        nistReference: 'NIST SP 800-161 3.8.3'
      }
    ]
  },
  Medium: {
    riskTier: 'Medium',
    description: 'Vendors with medium risk require standard security controls',
    requirements: [
      {
        id: 'req-201',
        controlId: 'SEC-QUESTIONNAIRE',
        controlName: 'Security Questionnaire',
        description: 'Vendor must complete basic security questionnaire',
        category: 'Compliance',
        required: true,
        evidenceType: 'Attestation',
        priority: 'Medium',
        nistReference: 'NIST SP 800-161 2.2.2'
      },
      {
        id: 'req-202',
        controlId: 'DATA-PROTECTION',
        controlName: 'Data Protection Policy',
        description: 'Vendor should have data protection policy',
        category: 'Security',
        required: true,
        evidenceType: 'Document',
        priority: 'Medium',
        nistReference: 'NIST SP 800-161 3.8.3'
      }
    ]
  },
  Low: {
    riskTier: 'Low',
    description: 'Vendors with low risk require minimal security controls',
    requirements: [
      {
        id: 'req-301',
        controlId: 'BASIC-ATTESTATION',
        controlName: 'Basic Security Attestation',
        description: 'Vendor must attest to basic security practices',
        category: 'Compliance',
        required: true,
        evidenceType: 'Attestation',
        priority: 'Low',
        nistReference: 'NIST SP 800-161 2.2.1'
      }
    ]
  }
};

/**
 * Get requirements for a specific risk tier
 */
export const getRequirementsForTier = (riskTier: RiskTier): ControlRequirement[] => {
  return REQUIREMENT_MAPPINGS[riskTier]?.requirements || [];
};

/**
 * Get risk tier from risk score
 */
export const getRiskTierFromScore = (score: number): RiskTier => {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
};
```

---

## Component Implementation

### Main Page Component

```typescript
// src/pages/VendorRequirementsDefinition.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import JourneyProgress from '../components/journey/JourneyProgress';
import BackToDashboardLink from '../components/common/BackToDashboardLink';
import VendorRequirementsList from '../components/vendor-requirements/VendorRequirementsList';
import RequirementSummary from '../components/vendor-requirements/RequirementSummary';
import { useVendorRequirements } from '../hooks/useVendorRequirements';
import { useVendorPortfolio } from '../pages/tools/VendorRiskRadar/hooks/useVendorPortfolio';
import { getRiskTierFromScore } from '../utils/requirementMapping';
import { Shield, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';

const VendorRequirementsDefinition: React.FC = () => {
  const navigate = useNavigate();
  const { vendors, loading: vendorsLoading } = useVendorPortfolio();
  const {
    requirements,
    generateRequirements,
    saveRequirements,
    loading: requirementsLoading
  } = useVendorRequirements();

  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Auto-generate requirements when vendors are loaded
  useEffect(() => {
    if (vendors.length > 0 && !hasGenerated) {
      const vendorIds = vendors.map(v => v.id);
      setSelectedVendors(vendorIds);
      generateRequirementsForVendors(vendorIds);
    }
  }, [vendors, hasGenerated]);

  const generateRequirementsForVendors = async (vendorIds: string[]) => {
    const vendorsToProcess = vendors.filter(v => vendorIds.includes(v.id));
    
    const newRequirements = vendorsToProcess.map(vendor => {
      const riskScore = vendor.residualRisk || vendor.inherentRisk || 0;
      const riskTier = getRiskTierFromScore(riskScore);
      
      return generateRequirements({
        vendorId: vendor.id,
        vendorName: vendor.name,
        riskTier,
        riskScore
      });
    });

    await saveRequirements(newRequirements);
    setHasGenerated(true);
  };

  const handleContinueToStage3 = () => {
    navigate('/vendor-assessments');
  };

  if (vendorsLoading || requirementsLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vendorsoluce-green"></div>
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackToDashboardLink />
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No Vendors Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You need to add vendors in Stage 1 (Vendor Risk Radar) before defining requirements.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/tools/vendor-risk-radar')}
            >
              Go to Stage 1: Vendor Risk Radar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BackToDashboardLink />
      
      {/* Journey Progress */}
      <JourneyProgress 
        currentStage={2} 
        stage1Complete={vendors.length > 0}
        showNavigation={true}
      />
      
      {/* Stage 2 Header */}
      <div className="mb-6 p-4 bg-vendorsoluce-pale-green dark:bg-vendorsoluce-green/10 rounded-lg border border-vendorsoluce-green/30">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-vendorsoluce-green dark:text-vendorsoluce-light-green uppercase tracking-wide">
            Stage 2 of 3
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
          <span className="text-xs font-semibold text-vendorsoluce-green dark:text-vendorsoluce-light-green">
            Understand Your Gaps
          </span>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Outcome: "I know exactly what controls I need from each vendor"
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Based on your vendor risk analysis from Stage 1, we've automatically generated vendor-specific security requirements using NIST SP 800-161.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Vendors</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{vendors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Critical</div>
            <div className="text-2xl font-bold text-red-600">
              {vendors.filter(v => getRiskTierFromScore(v.residualRisk || v.inherentRisk || 0) === 'Critical').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">High</div>
            <div className="text-2xl font-bold text-orange-600">
              {vendors.filter(v => getRiskTierFromScore(v.residualRisk || v.inherentRisk || 0) === 'High').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Requirements Generated</div>
            <div className="text-2xl font-bold text-vendorsoluce-green">{requirements.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Requirements List */}
      <VendorRequirementsList 
        vendors={vendors}
        requirements={requirements}
        onRequirementUpdate={(vendorId, updatedRequirements) => {
          // Handle requirement updates
        }}
      />

      {/* Continue to Stage 3 */}
      {requirements.length > 0 && (
        <Card className="mt-6 border-l-4 border-l-vendorsoluce-green">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-vendorsoluce-green" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Stage 2 Complete: You Understand Your Gaps
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You've defined requirements for {requirements.length} vendor(s). Continue to Stage 3 to collect evidence from vendors.
                </p>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={handleContinueToStage3}
                className="flex items-center gap-2"
              >
                Continue to Stage 3: Collect Evidence
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VendorRequirementsDefinition;
```

---

## Implementation Steps

### Phase 1: Foundation (Week 1)

1. **Create Type Definitions**
   - [ ] Create `src/types/requirements.ts` with all type definitions
   - [ ] Export types for use across application

2. **Create Requirement Mapping Utility**
   - [ ] Create `src/utils/requirementMapping.ts`
   - [ ] Implement `REQUIREMENT_MAPPINGS` with all risk tiers
   - [ ] Implement helper functions (`getRequirementsForTier`, `getRiskTierFromScore`)

3. **Create Database Schema**
   - [ ] Create migration file for `vendor_requirements` table
   - [ ] Add RLS policies
   - [ ] Create indexes
   - [ ] Test migration

### Phase 2: Core Components (Week 1-2)

4. **Create Hook for Requirements Management**
   - [ ] Create `src/hooks/useVendorRequirements.ts`
   - [ ] Implement functions: `generateRequirements`, `saveRequirements`, `loadRequirements`, `updateRequirements`
   - [ ] Integrate with Supabase

5. **Create Service Layer**
   - [ ] Create `src/services/requirementService.ts`
   - [ ] Implement API calls to Supabase
   - [ ] Handle error cases

6. **Create Main Page Component**
   - [ ] Create `src/pages/VendorRequirementsDefinition.tsx`
   - [ ] Implement vendor import from Stage 1
   - [ ] Implement requirement generation
   - [ ] Add JourneyProgress integration
   - [ ] Add navigation to Stage 3

### Phase 3: UI Components (Week 2)

7. **Create Vendor Requirements List Component**
   - [ ] Create `src/components/vendor-requirements/VendorRequirementsList.tsx`
   - [ ] Display vendors with risk tiers
   - [ ] Show generated requirements per vendor
   - [ ] Add filtering and sorting

8. **Create Requirement Card Component**
   - [ ] Create `src/components/vendor-requirements/RequirementCard.tsx`
   - [ ] Display individual requirement details
   - [ ] Show NIST reference, priority, evidence type
   - [ ] Add edit/remove functionality

9. **Create Gap Analysis Component**
   - [ ] Create `src/components/vendor-requirements/GapAnalysis.tsx`
   - [ ] Identify missing requirements
   - [ ] Show compliance status
   - [ ] Display gap details

10. **Create Requirement Summary Component**
    - [ ] Create `src/components/vendor-requirements/RequirementSummary.tsx`
    - [ ] Show summary statistics
    - [ ] Display requirement breakdown by tier
    - [ ] Show overall compliance status

### Phase 4: Integration (Week 2-3)

11. **Update Routing**
    - [ ] Add route in `src/App.tsx`: `/vendor-requirements`
    - [ ] Update navigation links
    - [ ] Add to JourneyProgress component

12. **Update Stage 1 Navigation**
    - [ ] Add "Continue to Stage 2" button in VendorRiskRadar
    - [ ] Pass vendor data to Stage 2

13. **Update Stage 3 Integration**
    - [ ] Modify VendorSecurityAssessments to import requirements from Stage 2
    - [ ] Pre-populate assessments with Stage 2 requirements
    - [ ] Show requirement compliance status

14. **Update Foundation Track Labeling**
    - [ ] Fix SupplyChainAssessment to remove "Stage 2" labeling
    - [ ] Update messaging to reflect Foundation Track purpose
    - [ ] Remove from JourneyProgress (it's a separate track)

### Phase 5: Testing & Polish (Week 3)

15. **Add Error Handling**
    - [ ] Handle missing vendors gracefully
    - [ ] Handle API errors
    - [ ] Add loading states

16. **Add Internationalization**
    - [ ] Add translations for all text
    - [ ] Update translation files

17. **Add Accessibility**
    - [ ] Add ARIA labels
    - [ ] Ensure keyboard navigation
    - [ ] Test with screen readers

18. **Testing**
    - [ ] Unit tests for requirement mapping
    - [ ] Integration tests for components
    - [ ] E2E tests for workflow

---

## Key Features

### 1. Automatic Requirement Generation
- System automatically generates requirements based on vendor risk tiers
- Uses NIST SP 800-161 as framework
- Requirements are vendor-specific, not generic

### 2. Risk-Based Mapping
- Critical vendors: 6 requirements (SOC 2, $5M insurance, IR plan, MFA, etc.)
- High vendors: 4 requirements (Security questionnaire, $2M insurance, etc.)
- Medium vendors: 2 requirements (Security questionnaire, Data protection)
- Low vendors: 1 requirement (Basic attestation)

### 3. Gap Analysis
- Identifies missing requirements
- Shows compliance status per vendor
- Highlights critical gaps

### 4. Integration with Stage 3
- Requirements stored and accessible in Stage 3
- Assessments pre-populated with requirements
- Evidence collection linked to requirements

---

## Success Criteria

✅ Users can import vendors from Stage 1  
✅ System automatically generates vendor-specific requirements  
✅ Requirements are based on risk tiers (Critical/High/Medium/Low)  
✅ Requirements use NIST SP 800-161 framework  
✅ Gap analysis identifies missing requirements  
✅ Requirements are stored for use in Stage 3  
✅ Navigation flows correctly: Stage 1 → Stage 2 → Stage 3  
✅ Foundation Track is clearly separate from vendor workflow  

---

## Notes

- This implementation follows the workflow defined in `workflow-alignment-analysis.md`
- Stage 2 is vendor-specific, not a general program assessment
- Requirements are automatically generated based on risk tiers
- NIST SP 800-161 is used as the framework for control mapping
- Integration with Stage 1 and Stage 3 is critical for workflow continuity

---

**Next Steps:** Begin Phase 1 implementation
