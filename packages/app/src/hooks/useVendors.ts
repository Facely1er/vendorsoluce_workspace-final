import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseEnabled } from '../lib/supabase';
import { DEMO_VENDORS } from '../data/demoData';
import { UsageService } from '../services/usageService';
import type { Database } from '../lib/database.types';
import { createLocalVendor, deleteLocalVendor, getLocalVendors, updateLocalVendor } from '../services/local/workspaceLocalStore';

const usageService = new UsageService();

type Vendor = Database['public']['Tables']['vs_vendors']['Row'];
type VendorInsert = Database['public']['Tables']['vs_vendors']['Insert'];
type VendorUpdate = Database['public']['Tables']['vs_vendors']['Update'];

export const useVendors = () => {
  const { user, isDemoMode } = useAuth();
  const useLocalWorkspaceData = !isDemoMode && !isSupabaseEnabled();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVendors = useCallback(async () => {
    if (!user) {
      setVendors([]);
      setLoading(false);
      return;
    }

    if (isDemoMode) {
      setVendors(DEMO_VENDORS);
      setLoading(false);
      setError(null);
      return;
    }

    if (useLocalWorkspaceData) {
      setVendors(getLocalVendors(user.id));
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('vs_vendors')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVendors(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  }, [user, isDemoMode, useLocalWorkspaceData]);

  const createVendor = async (vendorData: Omit<VendorInsert, 'user_id'>) => {
    if (!user) throw new Error('User not authenticated');
    if (isDemoMode) return;

    if (useLocalWorkspaceData) {
      const created = createLocalVendor(user.id, vendorData);
      setVendors(prev => [created, ...prev]);
      return created;
    }

    try {
      const limitCheck = await usageService.canPerformAction(user.id, 'vendors');
      if (!limitCheck.canPerform) {
        throw new Error(limitCheck.message || 'Vendor limit reached. Please upgrade your plan.');
      }

      const newVendorData: VendorInsert = {
        ...vendorData,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('vs_vendors')
        .insert(newVendorData)
        .select()
        .single();

      if (error) throw error;

      await usageService.incrementUsage(user.id, 'vendors', 1);
      setVendors(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create vendor');
      throw err;
    }
  };

  const updateVendor = async (id: string, vendorData: VendorUpdate) => {
    if (isDemoMode) return;

    if (useLocalWorkspaceData) {
      if (!user) throw new Error('User not authenticated');
      const updated = updateLocalVendor(user.id, id, vendorData);
      setVendors(prev => prev.map(vendor => (vendor.id === id ? updated : vendor)));
      return updated;
    }

    try {
      const { data, error } = await supabase
        .from('vs_vendors')
        .update(vendorData)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      setVendors(prev => prev.map(vendor => (vendor.id === id ? data : vendor)));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vendor');
      throw err;
    }
  };

  const deleteVendor = async (id: string) => {
    if (isDemoMode) return;

    if (useLocalWorkspaceData) {
      if (!user) throw new Error('User not authenticated');
      deleteLocalVendor(user.id, id);
      setVendors(prev => prev.filter(vendor => vendor.id !== id));
      return;
    }

    try {
      const { error } = await supabase
        .from('vs_vendors')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      setVendors(prev => prev.filter(vendor => vendor.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete vendor');
      throw err;
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchVendorsSafely = async () => {
      if (!isMounted) return;
      await fetchVendors();
    };
    fetchVendorsSafely();
    return () => {
      isMounted = false;
    };
  }, [user, fetchVendors]);

  return {
    vendors,
    loading,
    error,
    createVendor,
    updateVendor,
    deleteVendor,
    refetch: fetchVendors,
  };
};
