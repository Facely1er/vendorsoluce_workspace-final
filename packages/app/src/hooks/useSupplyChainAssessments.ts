import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseEnabled } from '../lib/supabase';
import { DEMO_ASSESSMENTS } from '../data/demoData';
import { UsageService } from '../services/usageService';
import type { Database } from '../lib/database.types';
import {
  completeLocalAssessment,
  deleteLocalAssessment,
  getLocalAssessments,
  getLocalWorkspaceStorageIssue,
  upsertLocalAssessment,
} from '../services/local/workspaceLocalStore';

const usageService = new UsageService();

type Assessment = Database['public']['Tables']['vs_supply_chain_assessments']['Row'];
type AssessmentInsert = Database['public']['Tables']['vs_supply_chain_assessments']['Insert'];
type AssessmentUpdate = Database['public']['Tables']['vs_supply_chain_assessments']['Update'];

export const useSupplyChainAssessments = () => {
  const { user, isDemoMode } = useAuth();
  const useLocalWorkspaceData = !isDemoMode && !isSupabaseEnabled();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);

  const fetchAssessments = useCallback(async () => {
    if (!user) {
      setAssessments([]);
      setCurrentAssessment(null);
      setLoading(false);
      setStorageWarning(null);
      return;
    }

    if (isDemoMode) {
      setAssessments(DEMO_ASSESSMENTS);
      setCurrentAssessment(null);
      setLoading(false);
      setError(null);
      setStorageWarning(null);
      return;
    }

    if (useLocalWorkspaceData) {
      const localAssessments = getLocalAssessments(user.id);
      setAssessments(localAssessments);
      setCurrentAssessment(localAssessments.find(a => a.status === 'in_progress') ?? null);
      setLoading(false);
      setError(null);
      setStorageWarning(getLocalWorkspaceStorageIssue()?.message ?? null);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vs_supply_chain_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssessments(data || []);
      setCurrentAssessment(data?.find(a => a.status === 'in_progress') ?? null);
      setStorageWarning(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assessments');
    } finally {
      setLoading(false);
    }
  }, [user, isDemoMode, useLocalWorkspaceData]);

  const createOrUpdateAssessment = async (
    assessmentData: Partial<AssessmentUpdate>,
    answers: Record<string, string>
  ) => {
    if (!user) throw new Error('User not authenticated');
    if (isDemoMode) return;

    if (useLocalWorkspaceData) {
      try {
        const saved = upsertLocalAssessment(user.id, currentAssessment?.id ?? null, assessmentData, answers);
        setCurrentAssessment(saved.status === 'completed' ? null : saved);
        setAssessments(prev => {
          const rest = prev.filter(a => a.id !== saved.id);
          return [saved, ...rest];
        });
        setStorageWarning(getLocalWorkspaceStorageIssue()?.message ?? null);
        return saved;
      } catch (err) {
        setStorageWarning(getLocalWorkspaceStorageIssue()?.message ?? (err instanceof Error ? err.message : 'Failed to save assessment locally'));
        throw err;
      }
    }

    try {
      if (currentAssessment) {
        const updateData: AssessmentUpdate = { ...assessmentData, answers };
        const { data, error } = await supabase
          .from('vs_supply_chain_assessments')
          .update(updateData)
          .eq('id', currentAssessment.id)
          .select()
          .single();

        if (error) throw error;
        setCurrentAssessment(data);
        setAssessments(prev => prev.map(a => (a.id === data.id ? data : a)));
        return data;
      }

      const limitCheck = await usageService.canPerformAction(user.id, 'vendor_assessments');
      if (!limitCheck.canPerform) {
        throw new Error(limitCheck.message || 'Assessment limit reached. Please upgrade your plan.');
      }

      const newAssessmentData: AssessmentInsert = {
        user_id: user.id,
        assessment_name: assessmentData.assessment_name || 'Supply Chain Assessment',
        answers,
        status: 'in_progress',
        ...assessmentData,
      };

      const { data, error } = await supabase
        .from('vs_supply_chain_assessments')
        .insert(newAssessmentData)
        .select()
        .single();

      if (error) throw error;
      await usageService.incrementUsage(user.id, 'vendor_assessments', 1);
      setCurrentAssessment(data);
      setAssessments(prev => [data, ...prev]);
      setStorageWarning(null);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save assessment');
      throw err;
    }
  };

  const completeAssessment = async (
    overallScore: number,
    sectionScores: Array<{ section: string; score: number }>
  ) => {
    if (!currentAssessment || !user) throw new Error('No current assessment to complete');
    if (isDemoMode) return;

    if (useLocalWorkspaceData) {
      try {
        const saved = completeLocalAssessment(user.id, currentAssessment.id, overallScore, sectionScores);
        setCurrentAssessment(null);
        setAssessments(prev => prev.map(a => (a.id === saved.id ? saved : a)));
        setStorageWarning(getLocalWorkspaceStorageIssue()?.message ?? null);
        return saved;
      } catch (err) {
        setStorageWarning(getLocalWorkspaceStorageIssue()?.message ?? (err instanceof Error ? err.message : 'Failed to complete assessment locally'));
        throw err;
      }
    }

    try {
      const updateData: AssessmentUpdate = {
        overall_score: overallScore,
        section_scores: sectionScores,
        status: 'completed',
        completed_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('vs_supply_chain_assessments')
        .update(updateData)
        .eq('id', currentAssessment.id)
        .select()
        .single();

      if (error) throw error;
      setCurrentAssessment(null);
      setAssessments(prev => prev.map(a => (a.id === data.id ? data : a)));
      setStorageWarning(null);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete assessment');
      throw err;
    }
  };

  const deleteAssessment = async (id: string) => {
    if (useLocalWorkspaceData) {
      if (!user) throw new Error('User not authenticated');
      try {
        deleteLocalAssessment(user.id, id);
        setAssessments(prev => prev.filter(a => a.id !== id));
        if (currentAssessment?.id === id) setCurrentAssessment(null);
        setStorageWarning(getLocalWorkspaceStorageIssue()?.message ?? null);
        return;
      } catch (err) {
        setStorageWarning(getLocalWorkspaceStorageIssue()?.message ?? (err instanceof Error ? err.message : 'Failed to update local assessment data'));
        throw err;
      }
    }

    try {
      const { error } = await supabase
        .from('vs_supply_chain_assessments')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      setAssessments(prev => prev.filter(a => a.id !== id));
      if (currentAssessment?.id === id) setCurrentAssessment(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete assessment');
      throw err;
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchAssessmentsSafely = async () => {
      if (!isMounted) return;
      await fetchAssessments();
    };
    fetchAssessmentsSafely();
    return () => {
      isMounted = false;
    };
  }, [user, fetchAssessments]);

  return {
    assessments,
    currentAssessment,
    loading,
    error,
    storageWarning,
    createOrUpdateAssessment,
    completeAssessment,
    deleteAssessment,
    refetch: fetchAssessments,
  };
};
