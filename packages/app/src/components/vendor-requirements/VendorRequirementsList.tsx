/**
 * Vendor Requirements List Component
 * Displays list of vendors with their requirements
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import RequirementCard from './RequirementCard';
import GapAnalysis from './GapAnalysis';
import { 
  ChevronDown, 
  ChevronUp, 
  Shield
} from 'lucide-react';
import type { VendorRequirement } from '../../types/requirements';

interface VendorRequirementsListProps {
  requirements: VendorRequirement[];
  onRequirementUpdate?: (vendorId: string, updatedRequirements: VendorRequirement) => void;
  showGapAnalysis?: boolean;
  showRequirementDetails?: boolean;
}

const VendorRequirementsList: React.FC<VendorRequirementsListProps> = ({
  requirements,
  onRequirementUpdate: _onRequirementUpdate,
  showGapAnalysis = true,
  showRequirementDetails = true
}) => {
  const [expandedVendors, setExpandedVendors] = useState<Set<string>>(new Set());
  const [expandedRequirements, setExpandedRequirements] = useState<Set<string>>(new Set());

  const toggleVendorExpansion = (vendorId: string) => {
    const newExpanded = new Set(expandedVendors);
    if (newExpanded.has(vendorId)) {
      newExpanded.delete(vendorId);
    } else {
      newExpanded.add(vendorId);
    }
    setExpandedVendors(newExpanded);
  };

  const toggleRequirementExpansion = (requirementId: string) => {
    const newExpanded = new Set(expandedRequirements);
    if (newExpanded.has(requirementId)) {
      newExpanded.delete(requirementId);
    } else {
      newExpanded.add(requirementId);
    }
    setExpandedRequirements(newExpanded);
  };

  const getRiskTierColor = (tier: string) => {
    switch (tier) {
      case 'Critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-300';
      case 'High': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-300';
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-300';
    }
  };

  if (requirements.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Requirements Generated
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Requirements will appear here once generated from Stage 1 vendors.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requirements.map((requirement) => {
        const isExpanded = expandedVendors.has(requirement.vendorId);
        const complianceRate = requirement.requirements.length > 0
          ? Math.round((requirement.gaps.filter(g => g.status === 'compliant').length / requirement.requirements.length) * 100)
          : 0;

        return (
          <Card key={requirement.id} className="border-l-4 border-l-vendorsoluce-green">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                      {requirement.vendorName}
                    </CardTitle>
                    <Badge variant="outline" className={getRiskTierColor(requirement.riskTier)}>
                      {requirement.riskTier} Risk
                    </Badge>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Score: {requirement.riskScore}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Requirements</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {requirement.requirements.length}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Gaps</div>
                      <div className="text-lg font-semibold text-orange-600">
                        {requirement.gaps.length}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Compliance</div>
                      <div className={`text-lg font-semibold ${
                        complianceRate >= 80 ? 'text-green-600' :
                        complianceRate >= 50 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {complianceRate}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Status</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                        {requirement.status}
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleVendorExpansion(requirement.vendorId)}
                  className="ml-4"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-1" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
                      Show Details
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0 space-y-4">
                {/* Gap Analysis */}
                {showGapAnalysis && (
                  <GapAnalysis requirement={requirement} showDetails={true} />
                )}

                {/* Requirements List */}
                {showRequirementDetails && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Control Requirements ({requirement.requirements.length})
                      </h4>
                      <Badge variant="outline" className="bg-vendorsoluce-pale-green border-vendorsoluce-green text-vendorsoluce-green">
                        NIST SP 800-161
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {requirement.requirements.map((req) => {
                        const isReqExpanded = expandedRequirements.has(req.id);
                        return (
                          <div key={req.id}>
                            <RequirementCard
                              requirement={req}
                              showDetails={isReqExpanded}
                              onToggleDetails={() => toggleRequirementExpansion(req.id)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default VendorRequirementsList;
