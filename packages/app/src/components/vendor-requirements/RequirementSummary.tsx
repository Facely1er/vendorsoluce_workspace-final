/**
 * Requirement Summary Component
 * Displays summary statistics for vendor requirements
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { BarChart3 } from 'lucide-react';
import type { RequirementSummary as RequirementSummaryType, RiskTier } from '../../types/requirements';

interface RequirementSummaryProps {
  summary: RequirementSummaryType;
  showDetails?: boolean;
}

const RequirementSummary: React.FC<RequirementSummaryProps> = ({
  summary,
  showDetails = true
}) => {
  const getTierColor = (tier: RiskTier) => {
    switch (tier) {
      case 'Critical': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'High': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'Low': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    }
  };

  const getComplianceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-vendorsoluce-green" />
          <CardTitle>Requirements Summary</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {summary.totalVendors}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Vendors</div>
          </div>
          <div className="text-center p-4 bg-vendorsoluce-pale-green dark:bg-vendorsoluce-green/10 rounded-lg">
            <div className="text-2xl font-bold text-vendorsoluce-green">
              {summary.totalRequirements}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Requirements</div>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {summary.totalGaps}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Gaps</div>
          </div>
          <div className={`text-center p-4 rounded-lg ${getComplianceColor(summary.complianceRate)} bg-opacity-10`}>
            <div className={`text-2xl font-bold ${getComplianceColor(summary.complianceRate)}`}>
              {summary.complianceRate}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Compliance Rate</div>
          </div>
        </div>

        {showDetails && (
          <>
            {/* Vendors by Tier */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Vendors by Risk Tier
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['Critical', 'High', 'Medium', 'Low'] as RiskTier[]).map(tier => (
                  <div key={tier} className={`p-3 rounded-lg ${getTierColor(tier)}`}>
                    <div className="text-lg font-bold">{summary.vendorsByTier[tier]}</div>
                    <div className="text-xs opacity-80">{tier} Risk</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements by Tier */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Requirements by Risk Tier
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['Critical', 'High', 'Medium', 'Low'] as RiskTier[]).map(tier => (
                  <div key={tier} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {summary.requirementsByTier[tier]}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{tier} Tier</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gaps by Tier */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Gaps by Risk Tier
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['Critical', 'High', 'Medium', 'Low'] as RiskTier[]).map(tier => (
                  <div key={tier} className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                    <div className="text-lg font-bold text-orange-600">
                      {summary.gapsByTier[tier]}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{tier} Tier</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RequirementSummary;
