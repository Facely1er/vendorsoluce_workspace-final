import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseEnabled } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import {
  createLocalVendorAssessment,
  deleteLocalVendorAssessment,
  getLocalAssessmentFrameworks,
  listLocalVendorAssessments,
  updateLocalVendorAssessment,
} from '../services/local/vendorAssessmentsLocalStore';
import { useVendorPortfolio } from '../pages/tools/VendorRiskRadar/hooks/useVendorPortfolio';

type VendorAssessment = Database['public']['Tables']['vs_vendor_assessments']['Row'];
type VendorAssessmentInsert = Database['public']['Tables']['vs_vendor_assessments']['Insert'];
type VendorAssessmentUpdate = Database['public']['Tables']['vs_vendor_assessments']['Update'];
type AssessmentFramework = Database['public']['Tables']['vs_assessment_frameworks']['Row'];

export interface VendorAssessmentWithDetails extends VendorAssessment {
  vendor: {
    id: string;
    name: string;
    contact_email: string | null;
  };
  framework: {
    id: string;
    name: string;
    description: string | null;
    framework_type: string;
    question_count: number | null;
    estimated_time: string | null;
  };
}

export const useVendorAssessments = () => {
  const { user } = useAuth();
  const { vendors } = useVendorPortfolio();
  const [assessments, setAssessments] = useState<VendorAssessmentWithDetails[]>([]);
  const [frameworks, setFrameworks] = useState<AssessmentFramework[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const useLocal = !user || !isSupabaseEnabled();

  const fetchAssessments = useCallback(async () => {
    if (useLocal) {
      const local = listLocalVendorAssessments();
      const mapped: VendorAssessmentWithDetails[] = local.map((a) => ({
        ...(a as VendorAssessment),
        vendor: {
          id: a.vendor_id || '',
          name: vendors.find((v) => v.id === a.vendor_id)?.name || 'Unknown Vendor',
          contact_email: null,
        },
        framework: {
          id: a.framework_id || 'local-nist-800-161',
          name:
            frameworks.find((f) => f.id === a.framework_id)?.name ||
            'NIST SP 800-161 (Supply Chain)',
          description: null,
          framework_type: 'nist',
          question_count: null,
          estimated_time: null,
        },
      }));
      setAssessments(mapped);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('vs_vendor_assessments')
        .select(`
          *,
          vendor:vs_vendors(id, name, contact_email),
          framework:vs_assessment_frameworks(id, name, description, framework_type, question_count, estimated_time)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setAssessments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assessments');
    } finally {
      setLoading(false);
    }
  }, [useLocal, user, vendors, frameworks]);

  const fetchFrameworks = useCallback(async () => {
    if (useLocal) {
      setFrameworks(getLocalAssessmentFrameworks());
      return;
    }
    try {
      const { data, error } = await supabase
        .from('vs_assessment_frameworks')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw error;
      }

      setFrameworks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch frameworks');
    }
  }, [useLocal]);

  const createAssessment = async (assessmentData: Omit<VendorAssessmentInsert, 'user_id'>) => {
    if (useLocal) {
      const created = createLocalVendorAssessment({ ...assessmentData, status: 'pending' });
      await fetchAssessments();
      return created as unknown as VendorAssessmentWithDetails;
    }

    try {
      const newAssessment: VendorAssessmentInsert = {
        ...assessmentData,
        user_id: user.id,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('vs_vendor_assessments')
        .insert(newAssessment)
        .select(`
          *,
          vendor:vs_vendors(id, name, contact_email),
          framework:vs_assessment_frameworks(id, name, description, framework_type, question_count, estimated_time)
        `)
        .single();

      if (error) {
        throw error;
      }

      setAssessments(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create assessment');
      throw err;
    }
  };

  const updateAssessment = async (id: string, updates: VendorAssessmentUpdate) => {
    if (useLocal) {
      const updated = updateLocalVendorAssessment(id, updates);
      await fetchAssessments();
      return updated as unknown as VendorAssessmentWithDetails;
    }
    try {
      const { data, error } = await supabase
        .from('vs_vendor_assessments')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select(`
          *,
          vendor:vs_vendors(id, name, contact_email),
          framework:vs_assessment_frameworks(id, name, description, framework_type, question_count, estimated_time)
        `)
        .single();

      if (error) {
        throw error;
      }

      setAssessments(prev => prev.map(a => a.id === id ? data : a));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update assessment');
      throw err;
    }
  };

  const deleteAssessment = async (id: string) => {
    if (useLocal) {
      deleteLocalVendorAssessment(id);
      await fetchAssessments();
      return;
    }
    try {
      const { error } = await supabase
        .from('vs_vendor_assessments')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) {
        throw error;
      }

      setAssessments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete assessment');
      throw err;
    }
  };

  const sendAssessment = async (id: string) => {
    if (useLocal) {
      const updated = updateLocalVendorAssessment(id, {
        status: 'sent',
        sent_at: new Date().toISOString(),
      });
      await fetchAssessments();
      return updated as unknown as VendorAssessmentWithDetails;
    }
    try {
      const { data, error } = await supabase
        .from('vs_vendor_assessments')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user?.id)
        .select(`
          *,
          vendor:vs_vendors(id, name, contact_email),
          framework:vs_assessment_frameworks(id, name, description, framework_type, question_count, estimated_time)
        `)
        .single();

      if (error) {
        throw error;
      }

      setAssessments(prev => prev.map(a => a.id === id ? data : a));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send assessment');
      throw err;
    }
  };

  const completeAssessment = async (id: string, overallScore: number, sectionScores: Record<string, number>) => {
    if (useLocal) {
      const updated = updateLocalVendorAssessment(id, {
        status: 'completed',
        overall_score: overallScore,
        section_scores: sectionScores,
        completed_at: new Date().toISOString(),
      });
      await fetchAssessments();
      return updated as unknown as VendorAssessmentWithDetails;
    }
    try {
      const { data, error } = await supabase
        .from('vs_vendor_assessments')
        .update({
          status: 'completed',
          overall_score: overallScore,
          section_scores: sectionScores,
          completed_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user?.id)
        .select(`
          *,
          vendor:vs_vendors(id, name, contact_email),
          framework:vs_assessment_frameworks(id, name, description, framework_type, question_count, estimated_time)
        `)
        .single();

      if (error) {
        throw error;
      }

      setAssessments(prev => prev.map(a => a.id === id ? data : a));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete assessment');
      throw err;
    }
  };

  const getAssessmentProgress = (assessment: VendorAssessmentWithDetails) => {
    // This would need to be calculated based on responses
    // For now, return a mock progress based on status
    switch (assessment.status) {
      case 'pending': return 0;
      case 'sent': return 0;
      case 'in_progress': return 50;
      case 'completed': return 100;
      case 'reviewed': return 100;
      default: return 0;
    }
  };

  const getAssessmentStats = () => {
    const total = assessments.length;
    const completed = assessments.filter(a => a.status === 'completed').length;
    const inProgress = assessments.filter(a => a.status === 'in_progress').length;
    const overdue = assessments.filter(a => {
      if (!a.due_date) return false;
      return new Date(a.due_date) < new Date() && a.status !== 'completed';
    }).length;

    const averageScore = assessments
      .filter(a => a.overall_score !== null)
      .reduce((sum, a) => sum + (a.overall_score || 0), 0) / 
      Math.max(1, assessments.filter(a => a.overall_score !== null).length);

    return {
      total,
      completed,
      inProgress,
      overdue,
      averageScore: Math.round(averageScore),
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  useEffect(() => {
    let isMounted = true;

    const fetchDataSafely = async () => {
      if (!isMounted) return;
      await Promise.all([fetchAssessments(), fetchFrameworks()]);
    };

    fetchDataSafely();

    return () => {
      isMounted = false;
    };
  }, [user, fetchAssessments, fetchFrameworks]);

  return {
    assessments,
    frameworks,
    loading,
    error,
    createAssessment,
    updateAssessment,
    deleteAssessment,
    sendAssessment,
    completeAssessment,
    getAssessmentProgress,
    getAssessmentStats,
    refetch: fetchAssessments,
  };
};
