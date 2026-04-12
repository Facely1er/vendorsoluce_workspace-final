/**
 * Hook for managing vendor requirements (Stage 2)
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  createVendorRequirement,
  getVendorRequirements,
  getVendorRequirementByVendorId,
  updateVendorRequirement,
  deleteVendorRequirement,
  createVendorRequirementsBulk,
  type CreateRequirementInput
} from '../services/requirementService';
import { getRequirementsForTier, getRiskTierFromScore } from '../utils/requirementMapping';
import type { VendorRequirement, ControlRequirement, RequirementGap } from '../types/requirements';
import { logger } from '../utils/logger';

export interface GenerateRequirementInput {
  vendorId: string;
  vendorName: string;
  riskTier: 'Critical' | 'High' | 'Medium' | 'Low';
  riskScore: number;
}

export const useVendorRequirements = () => {
  const { user } = useAuth();
  const [requirements, setRequirements] = useState<VendorRequirement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load requirements on mount and when user changes
  useEffect(() => {
    if (user) {
      loadRequirements();
    } else {
      setRequirements([]);
    }
  }, [user]);

  /**
   * Load all vendor requirements for the current user
   */
  const loadRequirements = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getVendorRequirements(user.id);
      setRequirements(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load requirements';
      setError(errorMessage);
      logger.error('Failed to load vendor requirements:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Generate requirements for a single vendor
   */
  const generateRequirements = useCallback(
    (input: GenerateRequirementInput): VendorRequirement => {
      const controlRequirements = getRequirementsForTier(input.riskTier);

      // Initialize gaps - all requirements start as missing
      const gaps: RequirementGap[] = controlRequirements.map(req => ({
        requirementId: req.id,
        controlId: req.controlId,
        controlName: req.controlName,
        status: 'missing',
        evidenceRequired: req.evidenceRequired || []
      }));

      return {
        id: '', // Will be set when saved
        vendorId: input.vendorId,
        vendorName: input.vendorName,
        riskTier: input.riskTier,
        riskScore: input.riskScore,
        requirements: controlRequirements,
        gaps,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    },
    []
  );

  /**
   * Save a single vendor requirement
   */
  const saveRequirement = useCallback(
    async (requirement: VendorRequirement): Promise<VendorRequirement> => {
      if (!user) {
        throw new Error('User must be authenticated to save requirements');
      }

      setLoading(true);
      setError(null);

      try {
        const input: CreateRequirementInput = {
          vendorId: requirement.vendorId,
          vendorName: requirement.vendorName,
          riskTier: requirement.riskTier,
          riskScore: requirement.riskScore,
          requirements: requirement.requirements,
          gaps: requirement.gaps
        };

        const saved = await createVendorRequirement(input, user.id);
        setRequirements(prev => [...prev, saved]);
        return saved;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save requirement';
        setError(errorMessage);
        logger.error('Failed to save vendor requirement:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  /**
   * Save multiple vendor requirements (bulk)
   */
  const saveRequirements = useCallback(
    async (requirementsToSave: VendorRequirement[]): Promise<VendorRequirement[]> => {
      if (!user) {
        throw new Error('User must be authenticated to save requirements');
      }

      if (requirementsToSave.length === 0) {
        return [];
      }

      setLoading(true);
      setError(null);

      try {
        const inputs: CreateRequirementInput[] = requirementsToSave.map(req => ({
          vendorId: req.vendorId,
          vendorName: req.vendorName,
          riskTier: req.riskTier,
          riskScore: req.riskScore,
          requirements: req.requirements,
          gaps: req.gaps
        }));

        const saved = await createVendorRequirementsBulk(inputs, user.id);
        setRequirements(prev => [...prev, ...saved]);
        return saved;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save requirements';
        setError(errorMessage);
        logger.error('Failed to save vendor requirements:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  /**
   * Update an existing vendor requirement
   */
  const updateRequirement = useCallback(
    async (
      requirementId: string,
      updates: {
        requirements?: ControlRequirement[];
        gaps?: RequirementGap[];
        status?: 'pending' | 'in_progress' | 'completed';
      }
    ): Promise<VendorRequirement> => {
      if (!user) {
        throw new Error('User must be authenticated to update requirements');
      }

      setLoading(true);
      setError(null);

      try {
        const updated = await updateVendorRequirement(requirementId, updates, user.id);
        setRequirements(prev =>
          prev.map(req => (req.id === requirementId ? updated : req))
        );
        return updated;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update requirement';
        setError(errorMessage);
        logger.error('Failed to update vendor requirement:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  /**
   * Delete a vendor requirement
   */
  const deleteRequirement = useCallback(
    async (requirementId: string): Promise<void> => {
      if (!user) {
        throw new Error('User must be authenticated to delete requirements');
      }

      setLoading(true);
      setError(null);

      try {
        await deleteVendorRequirement(requirementId, user.id);
        setRequirements(prev => prev.filter(req => req.id !== requirementId));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete requirement';
        setError(errorMessage);
        logger.error('Failed to delete vendor requirement:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  /**
   * Get requirement for a specific vendor
   */
  const getRequirementByVendorId = useCallback(
    async (vendorId: string): Promise<VendorRequirement | null> => {
      if (!user) return null;

      try {
        return await getVendorRequirementByVendorId(vendorId, user.id);
      } catch (err) {
        logger.error('Failed to get vendor requirement:', err);
        return null;
      }
    },
    [user]
  );

  /**
   * Generate and save requirements for multiple vendors
   */
  const generateAndSaveRequirements = useCallback(
    async (
      vendors: Array<{
        id: string;
        name: string;
        riskScore: number;
      }>
    ): Promise<VendorRequirement[]> => {
      const requirementsToSave = vendors.map(vendor => {
        const riskTier = getRiskTierFromScore(vendor.riskScore);
        return generateRequirements({
          vendorId: vendor.id,
          vendorName: vendor.name,
          riskTier,
          riskScore: vendor.riskScore
        });
      });

      return await saveRequirements(requirementsToSave);
    },
    [generateRequirements, saveRequirements]
  );

  return {
    requirements,
    loading,
    error,
    generateRequirements,
    saveRequirement,
    saveRequirements,
    updateRequirement,
    deleteRequirement,
    getRequirementByVendorId,
    generateAndSaveRequirements,
    refetch: loadRequirements
  };
};
