/**
 * Requirement Service
 * Handles API calls for vendor requirements (Stage 2)
 */

import { supabase } from '../lib/supabase';
import type { VendorRequirement, ControlRequirement, RequirementGap } from '../types/requirements';

export interface CreateRequirementInput {
  vendorId: string;
  vendorName: string;
  riskTier: 'Critical' | 'High' | 'Medium' | 'Low';
  riskScore: number;
  requirements: ControlRequirement[];
  gaps?: RequirementGap[];
}

export interface UpdateRequirementInput {
  requirements?: ControlRequirement[];
  gaps?: RequirementGap[];
  status?: 'pending' | 'in_progress' | 'completed';
}

/**
 * Create a new vendor requirement
 */
export const createVendorRequirement = async (
  input: CreateRequirementInput,
  userId: string
): Promise<VendorRequirement> => {
  const { data, error } = await supabase
    .from('vendor_requirements')
    .insert({
      vendor_id: input.vendorId,
      user_id: userId,
      risk_tier: input.riskTier,
      risk_score: input.riskScore,
      status: 'pending',
      requirements: input.requirements,
      gaps: input.gaps || []
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create vendor requirement: ${error.message}`);
  }

  return mapDatabaseToVendorRequirement(data, input.vendorName);
};

/**
 * Get all vendor requirements for a user
 */
export const getVendorRequirements = async (userId: string): Promise<VendorRequirement[]> => {
  const { data, error } = await supabase
    .from('vendor_requirements')
    .select(`
      *,
      vs_vendors:vendor_id (
        name
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch vendor requirements: ${error.message}`);
  }

  return data.map((row: any) => ({
    id: row.id,
    vendorId: row.vendor_id,
    vendorName: row.vs_vendors?.name || 'Unknown Vendor',
    riskTier: row.risk_tier as 'Critical' | 'High' | 'Medium' | 'Low',
    riskScore: row.risk_score,
    requirements: row.requirements as ControlRequirement[],
    gaps: row.gaps as RequirementGap[],
    status: row.status as 'pending' | 'in_progress' | 'completed',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
};

/**
 * Get vendor requirement by ID
 */
export const getVendorRequirementById = async (
  requirementId: string,
  userId: string
): Promise<VendorRequirement | null> => {
  const { data, error } = await supabase
    .from('vendor_requirements')
    .select(`
      *,
      vs_vendors:vendor_id (
        name
      )
    `)
    .eq('id', requirementId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch vendor requirement: ${error.message}`);
  }

  return mapDatabaseToVendorRequirement(data, (data as any).vs_vendors?.name || 'Unknown Vendor');
};

/**
 * Get vendor requirement by vendor ID
 */
export const getVendorRequirementByVendorId = async (
  vendorId: string,
  userId: string
): Promise<VendorRequirement | null> => {
  const { data, error } = await supabase
    .from('vendor_requirements')
    .select(`
      *,
      vs_vendors:vendor_id (
        name
      )
    `)
    .eq('vendor_id', vendorId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch vendor requirement: ${error.message}`);
  }

  return mapDatabaseToVendorRequirement(data, (data as any).vs_vendors?.name || 'Unknown Vendor');
};

/**
 * Update vendor requirement
 */
export const updateVendorRequirement = async (
  requirementId: string,
  input: UpdateRequirementInput,
  userId: string
): Promise<VendorRequirement> => {
  const updateData: any = {
    updated_at: new Date().toISOString()
  };

  if (input.requirements !== undefined) {
    updateData.requirements = input.requirements;
  }
  if (input.gaps !== undefined) {
    updateData.gaps = input.gaps;
  }
  if (input.status !== undefined) {
    updateData.status = input.status;
  }

  const { data, error } = await supabase
    .from('vendor_requirements')
    .update(updateData)
    .eq('id', requirementId)
    .eq('user_id', userId)
    .select(`
      *,
      vs_vendors:vendor_id (
        name
      )
    `)
    .single();

  if (error) {
    throw new Error(`Failed to update vendor requirement: ${error.message}`);
  }

  return mapDatabaseToVendorRequirement(data, data.vendors?.name || 'Unknown Vendor');
};

/**
 * Delete vendor requirement
 */
export const deleteVendorRequirement = async (
  requirementId: string,
  userId: string
): Promise<void> => {
  const { error } = await supabase
    .from('vendor_requirements')
    .delete()
    .eq('id', requirementId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to delete vendor requirement: ${error.message}`);
  }
};

/**
 * Create multiple vendor requirements (bulk insert)
 */
export const createVendorRequirementsBulk = async (
  inputs: CreateRequirementInput[],
  userId: string
): Promise<VendorRequirement[]> => {
  const insertData = inputs.map(input => ({
    vendor_id: input.vendorId,
    user_id: userId,
    risk_tier: input.riskTier,
    risk_score: input.riskScore,
    status: 'pending' as const,
    requirements: input.requirements,
    gaps: input.gaps || []
  }));

  const { data, error } = await supabase
    .from('vendor_requirements')
    .insert(insertData)
    .select(`
      *,
      vs_vendors:vendor_id (
        name
      )
    `);

  if (error) {
    throw new Error(`Failed to create vendor requirements: ${error.message}`);
  }

  return data.map((row: any) =>
    mapDatabaseToVendorRequirement(row, row.vendors?.name || 'Unknown Vendor')
  );
};

/**
 * Map database row to VendorRequirement type
 */
function mapDatabaseToVendorRequirement(
  row: any,
  vendorName: string
): VendorRequirement {
  return {
    id: row.id,
    vendorId: row.vendor_id,
    vendorName: vendorName || (row.vs_vendors as any)?.name || 'Unknown Vendor',
    riskTier: row.risk_tier as 'Critical' | 'High' | 'Medium' | 'Low',
    riskScore: row.risk_score,
    requirements: row.requirements as ControlRequirement[],
    gaps: row.gaps as RequirementGap[],
    status: row.status as 'pending' | 'in_progress' | 'completed',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
