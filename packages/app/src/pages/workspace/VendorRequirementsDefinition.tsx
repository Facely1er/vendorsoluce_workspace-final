/**
 * Vendor Requirements Definition Page (Stage 2)
 * 
 * This page allows users to:
 * 1. Import vendors from Stage 1 (Vendor Risk Radar)
 * 2. View vendor risk tiers
 * 3. Automatically generate vendor-specific control requirements based on risk tiers
 * 4. Use NIST SP 800-161 as the framework for control mapping
 * 5. Identify gaps (required vs. current controls)
 * 6. Store requirements for use in Stage 3 (Vendor Portal)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import WorkspacePageShell from '../../components/vendorsoluce-intelligence/WorkspacePageShell';
import WorkspacePageBody from '../../components/workspace/WorkspacePageBody';
import PanelCard from '../../components/vendorsoluce-intelligence/PanelCard';
import { Badge } from '../../components/ui/Badge';
import VendorRequirementsList from '../../components/vendor-requirements/VendorRequirementsList';
import RequirementSummary from '../../components/vendor-requirements/RequirementSummary';
import { useVendorRequirements } from '../../hooks/useVendorRequirements';
import { useVendorPortfolio } from '../tools/VendorRiskRadar/hooks/useVendorPortfolio';
import { getRiskTierFromScore, getRequirementCountForTier } from '../../utils/requirementMapping';
import type { RequirementSummary as RequirementSummaryType } from '../../types/requirements';
import { 
  AlertTriangle, 
  RefreshCw,
  FileText
} from 'lucide-react';

const VendorRequirementsDefinition: React.FC = () => {
  const navigate = useNavigate();
  const { vendors, loading: vendorsLoading } = useVendorPortfolio();
  const {
    requirements,
    generateAndSaveRequirements,
    loading: requirementsLoading,
    error: requirementsError,
    refetch
  } = useVendorRequirements();

  const [hasGenerated, setHasGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Check if requirements already exist for vendors
  useEffect(() => {
    if (vendors.length > 0 && requirements.length > 0) {
      const vendorsWithRequirements = new Set(requirements.map(r => r.vendorId));
      const allVendorsHaveRequirements = vendors.every(v => vendorsWithRequirements.has(v.id));
      if (allVendorsHaveRequirements) {
        setHasGenerated(true);
      }
    }
  }, [vendors, requirements]);

  // Auto-generate requirements when vendors are loaded (if not already generated)
  useEffect(() => {
    if (vendors.length > 0 && !hasGenerated && !isGenerating && !requirementsLoading) {
      handleGenerateRequirements();
    }
  }, [vendors.length, hasGenerated, isGenerating, requirementsLoading]);

  const handleGenerateRequirements = async () => {
    if (vendors.length === 0 || isGenerating) return;

    setIsGenerating(true);
    try {
      const vendorsToProcess = vendors.map(vendor => ({
        id: vendor.id,
        name: vendor.name,
        riskScore: vendor.residualRisk || vendor.inherentRisk || 0
      }));

      await generateAndSaveRequirements(vendorsToProcess);
      setHasGenerated(true);
      await refetch();
    } catch (error) {
      console.error('Failed to generate requirements:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinueToStage3 = () => {
    navigate('/vendor-assessments');
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const vendorsByTier = {
      Critical: vendors.filter(v => getRiskTierFromScore(v.residualRisk || v.inherentRisk || 0) === 'Critical').length,
      High: vendors.filter(v => getRiskTierFromScore(v.residualRisk || v.inherentRisk || 0) === 'High').length,
      Medium: vendors.filter(v => getRiskTierFromScore(v.residualRisk || v.inherentRisk || 0) === 'Medium').length,
      Low: vendors.filter(v => getRiskTierFromScore(v.residualRisk || v.inherentRisk || 0) === 'Low').length
    };

    const totalGaps = requirements.reduce((sum, req) => sum + req.gaps.length, 0);
    const totalRequirements = requirements.reduce((sum, req) => sum + req.requirements.length, 0);

    return {
      vendorsByTier,
      totalGaps,
      totalRequirements,
      totalVendors: vendors.length
    };
  }, [vendors, requirements]);

  // Calculate requirement summary
  const requirementSummary: RequirementSummaryType = useMemo(() => {
    const vendorsByTier = {
      Critical: requirements.filter(r => r.riskTier === 'Critical').length,
      High: requirements.filter(r => r.riskTier === 'High').length,
      Medium: requirements.filter(r => r.riskTier === 'Medium').length,
      Low: requirements.filter(r => r.riskTier === 'Low').length
    };

    const requirementsByTier = {
      Critical: requirements.filter(r => r.riskTier === 'Critical').reduce((sum, r) => sum + r.requirements.length, 0),
      High: requirements.filter(r => r.riskTier === 'High').reduce((sum, r) => sum + r.requirements.length, 0),
      Medium: requirements.filter(r => r.riskTier === 'Medium').reduce((sum, r) => sum + r.requirements.length, 0),
      Low: requirements.filter(r => r.riskTier === 'Low').reduce((sum, r) => sum + r.requirements.length, 0)
    };

    const gapsByTier = {
      Critical: requirements.filter(r => r.riskTier === 'Critical').reduce((sum, r) => sum + r.gaps.length, 0),
      High: requirements.filter(r => r.riskTier === 'High').reduce((sum, r) => sum + r.gaps.length, 0),
      Medium: requirements.filter(r => r.riskTier === 'Medium').reduce((sum, r) => sum + r.gaps.length, 0),
      Low: requirements.filter(r => r.riskTier === 'Low').reduce((sum, r) => sum + r.gaps.length, 0)
    };

    const totalCompliant = requirements.reduce((sum, req) => 
      sum + req.gaps.filter(g => g.status === 'compliant').length, 0
    );
    const totalReqCount = requirements.reduce((sum, req) => sum + req.requirements.length, 0);
    const complianceRate = totalReqCount > 0 ? Math.round((totalCompliant / totalReqCount) * 100) : 0;

    return {
      totalVendors: requirements.length,
      vendorsByTier,
      totalRequirements: stats.totalRequirements,
      requirementsByTier,
      totalGaps: stats.totalGaps,
      gapsByTier,
      complianceRate
    };
  }, [requirements, stats]);

  const loading = vendorsLoading || requirementsLoading || isGenerating;

  if (loading && vendors.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vendorsoluce-green"></div>
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-xl border border-gray-200/70 bg-white p-8 shadow-sm text-center dark:border-gray-800 dark:bg-gray-900">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No Vendors Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Stage 2 uses the same vendor list as Stage 1. Add vendors in the Vendor Dashboard or Vendor Risk Radar first; they will appear here automatically.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              (Vendor Dashboard and Risk Radar share one list — add vendors in either place.)
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                variant="primary"
                onClick={() => navigate('/vendors')}
              >
                Go to Vendor Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/vendor-risk-radar')}
              >
                Go to Vendor Risk Radar
              </Button>
            </div>
      </div>
      </div>
    );
  }

  return (
    <WorkspacePageShell
      title="Vendor requirements"
      description="Define vendor requirements and track coverage gaps."
      actions={[{ label: 'Open assessments', onClick: handleContinueToStage3, variant: 'primary' }]}
    >
      <WorkspacePageBody>
      
      <PanelCard
        title="Objective"
        description="Generate and review requirements per vendor based on risk tier. Use the list below to validate coverage and focus evidence requests on the highest gaps."
      >
        <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/70 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/30">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-vendorsoluce-green dark:text-vendorsoluce-light-green uppercase tracking-wide">
            Requirements workbench
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
          <span className="text-xs font-semibold text-vendorsoluce-green dark:text-vendorsoluce-light-green">
            Gap-aware expectations
          </span>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Outcome: clear expectations per vendor
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Requirements are mapped from NIST SP 800-161 using each vendor's current risk tier. Use the gaps view to prioritize evidence collection.
        </p>
      </div>
      </PanelCard>

      {/* Requirements by Risk Tier */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {(['Critical', 'High', 'Medium', 'Low'] as const).map(tier => {
          const tierVendors = vendors.filter(v => 
            getRiskTierFromScore(v.residualRisk || v.inherentRisk || 0) === tier
          );
          const tierRequirements = requirements.filter(r => r.riskTier === tier);
          const requirementCount = getRequirementCountForTier(tier);

          return (
            <div key={tier} className={`rounded-xl border border-gray-200/70 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900${tier === 'Critical' ? ' border-l-4 border-l-red-500' : ''}`}>
              <div className="p-4 pb-2">
                <div className="text-lg font-semibold flex items-center justify-between">
                  <span>{tier} Risk</span>
                  <Badge variant="outline">{tierVendors.length} vendors</Badge>
                </div>
              </div>
              <div className="px-4 pb-4">
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {requirementCount} requirements per vendor
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {tierRequirements.length} vendors processed
                  </div>
                  {tier === 'Critical' && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Includes: SOC 2, $5M insurance, IR plan, MFA, security assessment
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Requirement Summary */}
      {requirements.length > 0 && (
        <RequirementSummary summary={requirementSummary} showDetails={true} />
      )}

      {/* Vendor Requirements List */}
      <PanelCard title="Vendor requirements" description="Review generated requirements, validate coverage, and prepare the evidence collection stage."><div>
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900 dark:text-white">Vendor Requirements</span>
            {!hasGenerated && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateRequirements}
                disabled={isGenerating}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                Generate Requirements
              </Button>
            )}
          </div>
        </div>
        <div className="px-4 pb-4">
          {requirements.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Requirements Generated Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Click "Generate Requirements" to create vendor-specific requirements based on risk tiers.
              </p>
              <Button
                variant="primary"
                onClick={handleGenerateRequirements}
                disabled={isGenerating}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                Generate Requirements
              </Button>
            </div>
          ) : (
            <VendorRequirementsList
              requirements={requirements}
              onRequirementUpdate={(_vendorId, _updatedRequirements) => {
                // Handle requirement updates if needed
                // [removed console.log]
              }}
              showGapAnalysis={true}
              showRequirementDetails={true}
            />
          )}
        </div>
      </div></PanelCard>

      {/* Error Display */}
      {requirementsError && (
        <div className="mb-6 rounded-xl border-l-4 border-l-red-500 border border-gray-200/70 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <span>{requirementsError}</span>
            </div>
        </div>
      )}

    </WorkspacePageBody>
    </WorkspacePageShell>
  );
};

export default VendorRequirementsDefinition;
