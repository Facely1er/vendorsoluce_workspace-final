/**
 * Gap Analysis Component
 * Displays requirement gaps for a vendor
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { AlertTriangle, CheckCircle, Circle, TrendingUp } from 'lucide-react';
import type { RequirementGap, VendorRequirement } from '../../types/requirements';

interface GapAnalysisProps {
  requirement: VendorRequirement;
  showDetails?: boolean;
}

const GapAnalysis: React.FC<GapAnalysisProps> = ({
  requirement,
  showDetails = true
}) => {
  const gapsByStatus = {
    missing: requirement.gaps.filter(g => g.status === 'missing'),
    partial: requirement.gaps.filter(g => g.status === 'partial'),
    compliant: requirement.gaps.filter(g => g.status === 'compliant')
  };

  const complianceRate = requirement.requirements.length > 0
    ? Math.round((gapsByStatus.compliant.length / requirement.requirements.length) * 100)
    : 0;

  const getStatusIcon = (status: RequirementGap['status']) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'partial': return <Circle className="w-4 h-4 text-yellow-600" />;
      case 'missing': return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
  };

  if (requirement.gaps.length === 0) {
    return (
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">All requirements met - No gaps identified</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            Gap Analysis
          </CardTitle>
          <Badge variant="outline" className="bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
            {requirement.gaps.length} Gap{requirement.gaps.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Compliance Rate */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Compliance Rate
            </span>
            <span className={`text-lg font-bold ${
              complianceRate >= 80 ? 'text-green-600' :
              complianceRate >= 50 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {complianceRate}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                complianceRate >= 80 ? 'bg-green-600' :
                complianceRate >= 50 ? 'bg-yellow-600' :
                'bg-red-600'
              }`}
              style={{ width: `${complianceRate}%` }}
            />
          </div>
        </div>

        {/* Gap Summary */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
            <div className="text-2xl font-bold text-red-600">{gapsByStatus.missing.length}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Missing</div>
          </div>
          <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
            <div className="text-2xl font-bold text-yellow-600">{gapsByStatus.partial.length}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Partial</div>
          </div>
          <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
            <div className="text-2xl font-bold text-green-600">{gapsByStatus.compliant.length}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Compliant</div>
          </div>
        </div>

        {/* Gap Details */}
        {showDetails && (
          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Gap Details
            </div>
            
            {/* Missing Gaps */}
            {gapsByStatus.missing.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">
                  Missing Requirements ({gapsByStatus.missing.length})
                </div>
                <div className="space-y-2">
                  {gapsByStatus.missing.map((gap, index) => (
                    <div key={index} className="p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                      <div className="flex items-start gap-2">
                        {getStatusIcon(gap.status)}
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900 dark:text-white">
                            {gap.controlName}
                          </div>
                          {gap.evidenceRequired.length > 0 && (
                            <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                              <div className="font-medium mb-1">Required Evidence:</div>
                              <ul className="list-disc list-inside space-y-0.5">
                                {gap.evidenceRequired.map((evidence, idx) => (
                                  <li key={idx}>{evidence}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {gap.notes && (
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 italic">
                              {gap.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Partial Gaps */}
            {gapsByStatus.partial.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
                  Partial Compliance ({gapsByStatus.partial.length})
                </div>
                <div className="space-y-2">
                  {gapsByStatus.partial.map((gap, index) => (
                    <div key={index} className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-start gap-2">
                        {getStatusIcon(gap.status)}
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900 dark:text-white">
                            {gap.controlName}
                          </div>
                          {gap.notes && (
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 italic">
                              {gap.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compliant (for reference) */}
            {gapsByStatus.compliant.length > 0 && showDetails && (
              <div>
                <div className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">
                  Compliant Requirements ({gapsByStatus.compliant.length})
                </div>
                <div className="space-y-1">
                  {gapsByStatus.compliant.map((gap, index) => (
                    <div key={index} className="p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(gap.status)}
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {gap.controlName}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GapAnalysis;
