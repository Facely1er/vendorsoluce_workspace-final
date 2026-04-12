/**
 * Vendor portal: anonymous access to assessment payload via Supabase RPC (SECURITY DEFINER).
 */

import { supabase } from '../lib/supabase';
import { config } from '../utils/config';
import { logger } from '../utils/logger';
import type { PortalQuestionSnapshot } from './portalQuestionBuilder';

export interface PortalAssessmentBundle {
  assessment: {
    id: string;
    status: string | null;
    due_date: string | null;
    custom_message: string | null;
    contact_email: string | null;
    framework_id: string;
    uses_portal_snapshot: boolean;
  };
  vendor: { name: string };
  framework: { name: string };
  requesting_organization: string;
  questions: PortalQuestionSnapshot[];
  answers: Record<
    string,
    {
      answer: string | null;
      evidence_urls: string[] | null;
    }
  >;
}

const BACKEND_MSG =
  'Backend is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to use assessments.';

export async function fetchPortalAssessmentBundle(
  assessmentId: string
): Promise<PortalAssessmentBundle | null> {
  if (!config.supabase.enabled) {
    logger.warn('fetchPortalAssessmentBundle: Supabase disabled');
    return null;
  }

  // Use .schema('public') so RPC args are typed when Database['public'] does not satisfy GenericSchema (postgrest-js).
  const { data, error } = await supabase.schema('public').rpc('portal_get_vendor_assessment', {
    p_assessment_id: assessmentId,
  });

  if (error) {
    logger.error('portal_get_vendor_assessment failed', error);
    throw new Error(error.message);
  }

  if (data == null) {
    return null;
  }

  const raw = data as Record<string, unknown>;
  return {
    assessment: raw.assessment as PortalAssessmentBundle['assessment'],
    vendor: raw.vendor as PortalAssessmentBundle['vendor'],
    framework: raw.framework as PortalAssessmentBundle['framework'],
    requesting_organization: String(raw.requesting_organization ?? ''),
    questions: (Array.isArray(raw.questions) ? raw.questions : []) as PortalQuestionSnapshot[],
    answers:
      raw.answers && typeof raw.answers === 'object' && raw.answers !== null
        ? (raw.answers as PortalAssessmentBundle['answers'])
        : {},
  };
}

export async function savePortalAnswerRpc(params: {
  assessmentId: string;
  questionKey: string;
  answer: string | null;
  answerData?: Record<string, unknown> | null;
  evidenceUrls?: string[] | null;
}): Promise<boolean> {
  if (!config.supabase.enabled) {
    return false;
  }

  const { data, error } = await supabase.schema('public').rpc('portal_save_vendor_answer', {
    p_assessment_id: params.assessmentId,
    p_question_key: params.questionKey,
    p_answer: params.answer,
    p_answer_data: params.answerData ?? null,
    p_evidence_urls: params.evidenceUrls ?? null,
  });

  if (error) {
    logger.error('portal_save_vendor_answer failed', error);
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function submitPortalAssessmentRpc(assessmentId: string): Promise<boolean> {
  if (!config.supabase.enabled) {
    return false;
  }

  const { data, error } = await supabase.schema('public').rpc('portal_submit_vendor_assessment', {
    p_assessment_id: assessmentId,
  });

  if (error) {
    logger.error('portal_submit_vendor_assessment failed', error);
    throw new Error(error.message);
  }

  return Boolean(data);
}

export { BACKEND_MSG as PORTAL_ASSESSMENT_BACKEND_MSG };
