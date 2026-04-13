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
import {
  listLocalVendorRequirements,
  upsertLocalVendorRequirementsBulk,
  updateLocalVendorRequirement,
  deleteLocalVendorRequirement,
  getLocalVendorRequirementByVendorId,
  type CreateRequirementInput as LocalCreateRequirementInput,
  type UpdateRequirementInput as LocalUpdateRequirementInput,
} from '../services/local/vendorRequirementsLocalStore';
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
  const userId = user?.id;
  const useLocal = !userId;
  const [requirements, setRequirements] = useState<VendorRequirement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load requirements on mount and when user changes
  useEffect(() => {
    void loadRequirements();
  }, [userId, loadRequirements]);

  /**
   * Load all vendor requirements for the current user
   */
  const loadRequirements = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (useLocal) {
        setRequirements(listLocalVendorRequirements());
      } else {
        const data = await getVendorRequirements(userId);
        setRequirements(data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load requirements';
      setError(errorMessage);
      logger.error('Failed to load vendor requirements:', err);
    } finally {
      setLoading(false);
    }
  }, [useLocal, userId]);

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

        if (useLocal) {
          const savedLocal = upsertLocalVendorRequirementsBulk([
            input as unknown as LocalCreateRequirementInput,
          ])[0];
          setRequirements(listLocalVendorRequirements());
          return savedLocal;
        } else {
          const saved = await createVendorRequirement(input, userId);
          setRequirements(prev => [...prev, saved]);
          return saved;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save requirement';
        setError(errorMessage);
        logger.error('Failed to save vendor requirement:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [useLocal, userId]
  );

  /**
   * Save multiple vendor requirements (bulk)
   */
  const saveRequirements = useCallback(
    async (requirementsToSave: VendorRequirement[]): Promise<VendorRequirement[]> => {
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

        if (useLocal) {
          const savedLocal = upsertLocalVendorRequirementsBulk(
            inputs as unknown as LocalCreateRequirementInput[]
          );
          setRequirements(listLocalVendorRequirements());
          return savedLocal;
        } else {
          const saved = await createVendorRequirementsBulk(inputs, userId);
          setRequirements(prev => [...prev, ...saved]);
          return saved;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save requirements';
        setError(errorMessage);
        logger.error('Failed to save vendor requirements:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [useLocal, userId]
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
      setLoading(true);
      setError(null);

      try {
        if (useLocal) {
          const updatedLocal = updateLocalVendorRequirement(
            requirementId,
            updates as LocalUpdateRequirementInput
          );
          setRequirements(listLocalVendorRequirements());
          return updatedLocal;
        } else {
          const updated = await updateVendorRequirement(requirementId, updates, userId);
          setRequirements(prev =>
            prev.map(req => (req.id === requirementId ? updated : req))
          );
          return updated;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update requirement';
        setError(errorMessage);
        logger.error('Failed to update vendor requirement:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [useLocal, userId]
  );

  /**
   * Delete a vendor requirement
   */
  const deleteRequirement = useCallback(
    async (requirementId: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        if (useLocal) {
          deleteLocalVendorRequirement(requirementId);
          setRequirements(listLocalVendorRequirements());
        } else {
          await deleteVendorRequirement(requirementId, userId);
          setRequirements(prev => prev.filter(req => req.id !== requirementId));
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete requirement';
        setError(errorMessage);
        logger.error('Failed to delete vendor requirement:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [useLocal, userId]
  );

  /**
   * Get requirement for a specific vendor
   */
  const getRequirementByVendorId = useCallback(
    async (vendorId: string): Promise<VendorRequirement | null> => {
      try {
        if (useLocal) return getLocalVendorRequirementByVendorId(vendorId);
        return await getVendorRequirementByVendorId(vendorId, userId);
      } catch (err) {
        logger.error('Failed to get vendor requirement:', err);
        return null;
      }
    },
    [useLocal, userId]
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
