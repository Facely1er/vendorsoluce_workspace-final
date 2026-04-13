/*
  Phase 3 — org layer, portfolio dashboard, and attestation verification.

  All changes in vs schema.
  Every statement uses IF NOT EXISTS or IF EXISTS guards.
  Every CREATE POLICY preceded by DROP POLICY IF EXISTS.
*/

-- ============================================================================
-- Add org_id to vs.vendors
-- ============================================================================

ALTER TABLE vs.vendors
  ADD COLUMN IF NOT EXISTS org_id uuid
    REFERENCES shared.organizations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_vendors_org_id
  ON vs.vendors(org_id);

-- ============================================================================
-- Add org_id to vs.vendor_assessments
-- (vs.vendor_assessments exists in existing migrations)
-- ============================================================================

ALTER TABLE vs.vendor_assessments
  ADD COLUMN IF NOT EXISTS org_id uuid
    REFERENCES shared.organizations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_vendor_assessments_org_id
  ON vs.vendor_assessments(org_id);

-- ============================================================================
-- RLS policy updates for vs.vendors
-- ============================================================================

DROP POLICY IF EXISTS "vendors_select" ON vs.vendors;
CREATE POLICY "vendors_select" ON vs.vendors
  FOR SELECT USING (
    user_id = (select auth.uid())
    OR org_id IN (
      SELECT org_id FROM shared.org_members
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "vendors_insert" ON vs.vendors;
CREATE POLICY "vendors_insert" ON vs.vendors
  FOR INSERT WITH CHECK (
    user_id = (select auth.uid())
  );

DROP POLICY IF EXISTS "vendors_update" ON vs.vendors;
CREATE POLICY "vendors_update" ON vs.vendors
  FOR UPDATE USING (
    user_id = (select auth.uid())
    OR org_id IN (
      SELECT org_id FROM shared.org_members
      WHERE user_id = (select auth.uid())
        AND role IN ('admin', 'owner')
    )
  );

DROP POLICY IF EXISTS "vendors_delete" ON vs.vendors;
CREATE POLICY "vendors_delete" ON vs.vendors
  FOR DELETE USING (
    user_id = (select auth.uid())
  );

-- ============================================================================
-- RLS policy updates for vs.vendor_assessments (SELECT + UPDATE)
-- ============================================================================

DROP POLICY IF EXISTS "vendor_assessments_select" ON vs.vendor_assessments;
CREATE POLICY "vendor_assessments_select" ON vs.vendor_assessments
  FOR SELECT USING (
    user_id = (select auth.uid())
    OR org_id IN (
      SELECT org_id FROM shared.org_members
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "vendor_assessments_update" ON vs.vendor_assessments;
CREATE POLICY "vendor_assessments_update" ON vs.vendor_assessments
  FOR UPDATE USING (
    user_id = (select auth.uid())
    OR org_id IN (
      SELECT org_id FROM shared.org_members
      WHERE user_id = (select auth.uid())
        AND role IN ('admin', 'owner')
    )
  );

-- ============================================================================
-- New table: vs.vendor_attestations
-- ============================================================================

CREATE TABLE IF NOT EXISTS vs.vendor_attestations (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id         uuid NOT NULL
                      REFERENCES vs.vendors(id) ON DELETE CASCADE,
  attestation_token text NOT NULL,
  framework         text NOT NULL,
  level             text CHECK (level IN ('L1','L2')),
  overall_score     numeric(5,2),
  determination     text CHECK (determination IN
                      ('met','conditional','not_met')),
  assessor_org      text,
  assessed_at       timestamptz,
  verified_at       timestamptz,
  verified_by       uuid REFERENCES auth.users(id),
  expires_at        timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendor_attestations_vendor
  ON vs.vendor_attestations(vendor_id);

CREATE INDEX IF NOT EXISTS idx_vendor_attestations_token
  ON vs.vendor_attestations(attestation_token);

ALTER TABLE vs.vendor_attestations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "attestations_select"
  ON vs.vendor_attestations;
CREATE POLICY "attestations_select" ON vs.vendor_attestations
  FOR SELECT USING (
    vendor_id IN (
      SELECT id FROM vs.vendors
      WHERE user_id = (select auth.uid())
        OR org_id IN (
          SELECT org_id FROM shared.org_members
          WHERE user_id = (select auth.uid())
        )
    )
  );

DROP POLICY IF EXISTS "attestations_insert"
  ON vs.vendor_attestations;
CREATE POLICY "attestations_insert" ON vs.vendor_attestations
  FOR INSERT WITH CHECK (
    vendor_id IN (
      SELECT id FROM vs.vendors
      WHERE user_id = (select auth.uid())
        OR org_id IN (
          SELECT org_id FROM shared.org_members
          WHERE user_id = (select auth.uid())
            AND role IN ('admin', 'owner')
        )
    )
  );

DROP POLICY IF EXISTS "attestations_update"
  ON vs.vendor_attestations;
CREATE POLICY "attestations_update" ON vs.vendor_attestations
  FOR UPDATE USING (
    vendor_id IN (
      SELECT id FROM vs.vendors
      WHERE org_id IN (
        SELECT org_id FROM shared.org_members
        WHERE user_id = (select auth.uid())
          AND role IN ('admin', 'owner')
      )
    )
  );

-- Service role full access
DROP POLICY IF EXISTS "attestations_service_role"
  ON vs.vendor_attestations;
CREATE POLICY "attestations_service_role"
  ON vs.vendor_attestations
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- Trigger
-- ============================================================================

-- no update_updated_at trigger in vs schema; skipped.
