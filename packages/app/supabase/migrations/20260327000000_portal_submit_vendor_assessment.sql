/*
  Vendor portal: allow vendors to submit a completed assessment.
  Transitions status from 'in_progress' → 'submitted'.
  Callable with the anon key (SECURITY DEFINER).
*/

CREATE OR REPLACE FUNCTION portal_submit_vendor_assessment(p_assessment_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  st text;
BEGIN
  SELECT status INTO st FROM vs_vendor_assessments WHERE id = p_assessment_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Only allow submission from in_progress (vendor has started answering)
  IF st <> 'in_progress' THEN
    RETURN false;
  END IF;

  UPDATE vs_vendor_assessments
  SET status = 'submitted', updated_at = now()
  WHERE id = p_assessment_id;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION portal_submit_vendor_assessment(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION portal_submit_vendor_assessment(uuid) TO anon, authenticated;
