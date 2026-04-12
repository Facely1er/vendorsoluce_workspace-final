import type { ControlRequirement } from '../types/requirements';

/**
 * JSON shape stored in vs_vendor_assessments.portal_questions (matches portal RPC output).
 */
export interface PortalQuestionSnapshot {
  id: string;
  section: string;
  question: string;
  type: 'yes_no' | 'yes_no_na' | 'text' | 'file_upload' | 'scale' | 'multiple_choice';
  required: boolean;
  guidance?: string | null;
  evidenceRequired?: boolean;
  options?: unknown;
}

/**
 * Build a portal question list from Stage 2 NIST / control requirements so vendors see the same scope the buyer defined.
 */
export function buildPortalQuestionsFromStage2(
  controls: ControlRequirement[]
): PortalQuestionSnapshot[] {
  return controls.map((c) => ({
    id: `stage2-${c.controlId}`,
    section: c.category || 'Security requirements',
    question: `${c.controlName}: ${c.description}`.trim(),
    type: 'yes_no',
    required: c.required !== false,
    guidance: c.nistReference || null,
    evidenceRequired: Boolean(c.evidenceRequired?.length),
  }));
}
