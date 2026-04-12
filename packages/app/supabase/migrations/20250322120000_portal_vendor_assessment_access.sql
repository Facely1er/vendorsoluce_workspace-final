/*
  Vendor portal: load/save assessments without exposing broad anon table access.
  - portal_questions: optional Stage-2-derived JSON question list on vs_vendor_assessments
  - vs_portal_assessment_answers: vendor answers keyed by question id / stage2 key
  - SECURITY DEFINER RPCs callable with anon key
*/

ALTER TABLE vs_vendor_assessments
  ADD COLUMN IF NOT EXISTS portal_questions jsonb;

COMMENT ON COLUMN vs_vendor_assessments.portal_questions IS
  'When set, vendor portal uses this question snapshot (e.g. Stage 2 controls). Otherwise framework questions from vs_assessment_questions are used.';

CREATE TABLE IF NOT EXISTS vs_portal_assessment_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES vs_vendor_assessments(id) ON DELETE CASCADE,
  question_key text NOT NULL,
  answer text,
  answer_data jsonb,
  evidence_urls text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assessment_id, question_key)
);

CREATE INDEX IF NOT EXISTS idx_vs_portal_answers_assessment
  ON vs_portal_assessment_answers(assessment_id);

ALTER TABLE vs_portal_assessment_answers ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_vs_portal_assessment_answers_updated_at ON vs_portal_assessment_answers;
CREATE TRIGGER update_vs_portal_assessment_answers_updated_at
  BEFORE UPDATE ON vs_portal_assessment_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION portal_get_vendor_assessment(p_assessment_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  va vs_vendor_assessments%ROWTYPE;
  v_vendor text;
  v_framework text;
  v_org text;
  qs jsonb;
  ans jsonb;
  can_access boolean;
BEGIN
  SELECT * INTO va FROM vs_vendor_assessments WHERE id = p_assessment_id;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF va.status = 'cancelled' THEN
    RETURN NULL;
  END IF;

  can_access := false;
  IF va.status = 'pending' THEN
    IF auth.uid() IS NOT NULL AND auth.uid() = va.user_id THEN
      can_access := true;
    END IF;
  ELSIF va.status IN ('sent', 'in_progress', 'completed', 'reviewed') THEN
    can_access := true;
  END IF;

  IF NOT can_access THEN
    RETURN NULL;
  END IF;

  SELECT name INTO v_vendor FROM vs_vendors WHERE id = va.vendor_id;
  SELECT name INTO v_framework FROM vs_assessment_frameworks WHERE id = va.framework_id;
  SELECT company INTO v_org FROM vs_profiles WHERE id = va.user_id;

  IF va.portal_questions IS NOT NULL
     AND jsonb_typeof(va.portal_questions) = 'array'
     AND jsonb_array_length(va.portal_questions) > 0 THEN
    qs := va.portal_questions;
  ELSE
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', q.id::text,
          'section', COALESCE(NULLIF(trim(q.section), ''), 'General'),
          'question', q.question_text,
          'type',
            CASE COALESCE(q.question_type, 'text')
              WHEN 'yes_no' THEN 'yes_no'
              WHEN 'file_upload' THEN 'file_upload'
              WHEN 'multiple_choice' THEN 'multiple_choice'
              ELSE 'text'
            END,
          'required', COALESCE(q.is_required, true),
          'guidance', NULL,
          'evidenceRequired', (q.question_type = 'file_upload')
        )
        ORDER BY COALESCE(q.order_index, 0), q.created_at
      ),
      '[]'::jsonb
    )
    INTO qs
    FROM vs_assessment_questions q
    WHERE q.framework_id = va.framework_id;
  END IF;

  SELECT COALESCE(
    jsonb_object_agg(
      a.question_key,
      jsonb_build_object(
        'answer', a.answer,
        'evidence_urls', COALESCE(to_jsonb(a.evidence_urls), '[]'::jsonb)
      )
    ),
    '{}'::jsonb
  )
  INTO ans
  FROM vs_portal_assessment_answers a
  WHERE a.assessment_id = p_assessment_id;

  RETURN jsonb_build_object(
    'assessment', jsonb_build_object(
      'id', va.id,
      'status', va.status,
      'due_date', va.due_date,
      'custom_message', va.custom_message,
      'contact_email', va.contact_email,
      'framework_id', va.framework_id,
      'uses_portal_snapshot',
        (va.portal_questions IS NOT NULL
         AND jsonb_typeof(va.portal_questions) = 'array'
         AND jsonb_array_length(va.portal_questions) > 0)
    ),
    'vendor', jsonb_build_object('name', COALESCE(v_vendor, '')),
    'framework', jsonb_build_object('name', COALESCE(v_framework, 'Assessment')),
    'requesting_organization', COALESCE(v_org, 'Your customer'),
    'questions', qs,
    'answers', ans
  );
END;
$$;

CREATE OR REPLACE FUNCTION portal_save_vendor_answer(
  p_assessment_id uuid,
  p_question_key text,
  p_answer text,
  p_answer_data jsonb DEFAULT NULL,
  p_evidence_urls text[] DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  st text;
BEGIN
  IF p_question_key IS NULL OR length(trim(p_question_key)) = 0 THEN
    RETURN false;
  END IF;

  SELECT status INTO st FROM vs_vendor_assessments WHERE id = p_assessment_id;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF st NOT IN ('sent', 'in_progress') THEN
    RETURN false;
  END IF;

  INSERT INTO vs_portal_assessment_answers (
    assessment_id, question_key, answer, answer_data, evidence_urls
  )
  VALUES (
    p_assessment_id,
    p_question_key,
    p_answer,
    p_answer_data,
    p_evidence_urls
  )
  ON CONFLICT (assessment_id, question_key)
  DO UPDATE SET
    answer = EXCLUDED.answer,
    answer_data = EXCLUDED.answer_data,
    evidence_urls = EXCLUDED.evidence_urls,
    updated_at = now();

  UPDATE vs_vendor_assessments
  SET status = 'in_progress', updated_at = now()
  WHERE id = p_assessment_id AND status = 'sent';

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION portal_get_vendor_assessment(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION portal_save_vendor_answer(uuid, text, text, jsonb, text[]) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION portal_get_vendor_assessment(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION portal_save_vendor_answer(uuid, text, text, jsonb, text[]) TO anon, authenticated;
