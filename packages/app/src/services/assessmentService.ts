/**
 * Assessment Service
 * Handles assessment creation, portal link generation, and email sending
 */

import { supabase } from '../lib/supabase';
import { config } from '../utils/config';
import { EmailTemplates } from '../templates/emailTemplates';
import { logger } from '../utils/logger';
import type { Database } from '../lib/database.types';
import type { ControlRequirement } from '../types/requirements';
import { buildPortalQuestionsFromStage2 } from './portalQuestionBuilder';

type VendorAssessmentInsert = Database['public']['Tables']['vs_vendor_assessments']['Insert'];
type VendorAssessment = Database['public']['Tables']['vs_vendor_assessments']['Row'];

export interface CreateAssessmentRequest {
  vendorId: string;
  frameworkId: string;
  dueDate: string;
  instructions?: string;
  contactEmail?: string;
  assessmentName?: string;
  sendImmediately?: boolean;
  /** When present, snapshot Stage 2 controls into portal_questions for the vendor questionnaire. */
  stage2Controls?: ControlRequirement[];
}

export interface AssessmentWithPortalLink {
  assessment: VendorAssessment;
  portalLink: string;
  assessmentId: string;
}

/**
 * Generate a secure portal link for an assessment
 */
export const generatePortalLink = (assessmentId: string): string => {
  const portalUrl = config.vendorPortal.url;
  return `${portalUrl}/vendor-assessments/${assessmentId}`;
};

const BACKEND_NOT_CONFIGURED_MSG =
  'Backend is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to use assessments.';

/**
 * Create a new assessment and optionally send it to the vendor portal
 */
export const createAssessmentWithPortal = async (
  assessmentData: CreateAssessmentRequest,
  userId: string,
  organizationName?: string
): Promise<AssessmentWithPortalLink> => {
  if (!config.supabase.enabled) {
    throw new Error(BACKEND_NOT_CONFIGURED_MSG);
  }
  try {
    const portalSnapshot =
      assessmentData.stage2Controls && assessmentData.stage2Controls.length > 0
        ? buildPortalQuestionsFromStage2(assessmentData.stage2Controls)
        : null;

    // 1. Create assessment in database
    const newAssessment: VendorAssessmentInsert = {
      vendor_id: assessmentData.vendorId,
      framework_id: assessmentData.frameworkId,
      due_date: assessmentData.dueDate,
      custom_message: assessmentData.instructions ?? null,
      contact_email: assessmentData.contactEmail ?? null,
      assessment_name:
        assessmentData.assessmentName?.trim() || 'Vendor security assessment',
      status: assessmentData.sendImmediately ? 'sent' : 'pending',
      user_id: userId,
      sent_at: assessmentData.sendImmediately ? new Date().toISOString() : null,
      portal_questions: portalSnapshot as VendorAssessmentInsert['portal_questions'],
    };

    const { data: assessment, error: createError } = await supabase
      .from('vs_vendor_assessments')
      .insert(newAssessment)
      .select()
      .single();

    if (createError) {
      throw new Error(`Failed to create assessment: ${createError.message}`);
    }

    if (!assessment) {
      throw new Error('Assessment creation returned no data');
    }

    // 2. Generate portal link
    const portalLink = generatePortalLink(assessment.id);

    // 3. If sendImmediately is true, send email invitation
    if (assessmentData.sendImmediately) {
      await sendAssessmentInvitation({
        assessmentId: assessment.id,
        vendorId: assessmentData.vendorId,
        contactEmail: assessmentData.contactEmail,
        portalLink,
        organizationName: organizationName || 'Your Organization',
        frameworkName: undefined, // Will be fetched if needed
        dueDate: assessmentData.dueDate,
      });
    }

    return {
      assessment,
      portalLink,
      assessmentId: assessment.id,
    };
  } catch (error) {
    logger.error('Error creating assessment with portal:', error);
    throw error;
  }
};

/**
 * Send assessment invitation email to vendor
 */
export const sendAssessmentInvitation = async (params: {
  assessmentId: string;
  vendorId: string;
  contactEmail?: string;
  portalLink: string;
  organizationName: string;
  frameworkName?: string;
  dueDate?: string;
}): Promise<void> => {
  if (!config.supabase.enabled) {
    logger.warn('sendAssessmentInvitation skipped: Supabase not configured');
    return;
  }
  try {
    // Fetch vendor details
    const { data: vendor, error: vendorError } = await supabase
      .from('vs_vendors')
      .select('name, contact_email')
      .eq('id', params.vendorId)
      .single();

    if (vendorError || !vendor) {
      throw new Error(`Failed to fetch vendor: ${vendorError?.message || 'Vendor not found'}`);
    }

    // Use provided email or vendor's contact email
    const recipientEmail = params.contactEmail || vendor.contact_email;
    if (!recipientEmail) {
      throw new Error('No contact email provided for vendor');
    }

    // Fetch framework details if frameworkName not provided
    let frameworkName = params.frameworkName;
    if (!frameworkName) {
      const { data: assessment } = await supabase
        .from('vs_vendor_assessments')
        .select('framework:vs_assessment_frameworks(name)')
        .eq('id', params.assessmentId)
        .single();

      if (assessment && 'framework' in assessment && assessment.framework) {
        frameworkName = (assessment.framework as { name: string }).name;
      }
    }

    // Generate email template
    const emailTemplate = EmailTemplates.vendorAssessmentInvitation({
      vendorName: vendor.name,
      assessmentId: params.assessmentId,
      organizationName: params.organizationName,
      dueDate: params.dueDate,
      frameworkName,
    });

    // Send email via Supabase Edge Function
    try {
      const { data, error: fnError } = await supabase.functions.invoke('send-email-notification', {
        body: {
          to: recipientEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        },
      });

      if (fnError) {
        logger.warn('Edge function email delivery failed, recording for retry:', {
          to: recipientEmail,
          error: fnError.message,
        });
        // Store the pending notification so it can be retried or sent manually
        await supabase.from('vs_pending_notifications').insert({
          assessment_id: params.assessmentId,
          recipient_email: recipientEmail,
          subject: emailTemplate.subject,
          body_text: emailTemplate.text,
          body_html: emailTemplate.html,
          portal_link: params.portalLink,
          status: 'pending',
        }).then(({ error: insertErr }) => {
          if (insertErr) logger.warn('Could not queue notification:', insertErr.message);
        });
      } else {
        logger.info('Assessment invitation email sent successfully', {
          to: recipientEmail,
          assessmentId: params.assessmentId,
          messageId: data?.messageId,
        });
      }
    } catch (emailError) {
      // Non-blocking: log and store for manual follow-up rather than failing the whole flow
      logger.warn('Email service unavailable, portal link still generated:', {
        to: recipientEmail,
        portalLink: params.portalLink,
        error: emailError instanceof Error ? emailError.message : String(emailError),
      });
    }

  } catch (error) {
    logger.error('Error sending assessment invitation:', error);
    throw error;
  }
};

/**
 * Send existing assessment to vendor portal
 */
export const sendExistingAssessmentToPortal = async (
  assessmentId: string,
  userId: string,
  organizationName?: string
): Promise<{ portalLink: string; sent: boolean }> => {
  if (!config.supabase.enabled) {
    throw new Error(BACKEND_NOT_CONFIGURED_MSG);
  }
  try {
    // Fetch assessment with vendor details
    const { data: assessment, error: fetchError } = await supabase
      .from('vs_vendor_assessments')
      .select(`
        *,
        vendor:vs_vendors(id, name, contact_email),
        framework:vs_assessment_frameworks(id, name)
      `)
      .eq('id', assessmentId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !assessment) {
      throw new Error(`Failed to fetch assessment: ${fetchError?.message || 'Assessment not found'}`);
    }

    // Generate portal link
    const portalLink = generatePortalLink(assessmentId);

    // Update assessment status to 'sent'
    const { error: updateError } = await supabase
      .from('vs_vendor_assessments')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', assessmentId)
      .eq('user_id', userId);

    if (updateError) {
      throw new Error(`Failed to update assessment status: ${updateError.message}`);
    }

    // Send invitation email
    const vendor = (assessment as any).vendor;
    const framework = (assessment as any).framework;

    await sendAssessmentInvitation({
      assessmentId,
      vendorId: assessment.vendor_id,
      contactEmail: vendor?.contact_email,
      portalLink,
      organizationName: organizationName || 'Your Organization',
      frameworkName: framework?.name,
      dueDate: assessment.due_date || undefined,
    });

    return {
      portalLink,
      sent: true,
    };
  } catch (error) {
    logger.error('Error sending existing assessment to portal:', error);
    throw error;
  }
};

/**
 * Get portal link for an existing assessment
 */
export const getAssessmentPortalLink = (assessmentId: string): string => {
  return generatePortalLink(assessmentId);
};

/**
 * Copy portal link to clipboard (utility function)
 */
export const copyPortalLinkToClipboard = async (portalLink: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(portalLink);
    return true;
  } catch (error) {
    logger.error('Failed to copy portal link to clipboard:', error);
    return false;
  }
};
