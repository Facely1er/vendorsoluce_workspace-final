/*
  # Add Compliance Frameworks Migration
  Copy and paste this entire file into Supabase SQL Editor
*/

-- ============================================================================
-- STEP 1: Extend Framework Type Constraint
-- ============================================================================

-- Drop existing constraint
ALTER TABLE vs_assessment_frameworks 
DROP CONSTRAINT IF EXISTS vs_assessment_frameworks_framework_type_check;

-- Add new constraint with all framework types
ALTER TABLE vs_assessment_frameworks
ADD CONSTRAINT vs_assessment_frameworks_framework_type_check 
CHECK (framework_type IN (
  'cmmc_level_1',
  'cmmc_level_2', 
  'nist_privacy',
  'nist_sp_800_161',
  'soc2_type_ii',
  'iso_27001',
  'fedramp',
  'fisma',
  'custom'
));

-- ============================================================================
-- STEP 2: Insert Framework Definitions
-- ============================================================================

-- SOC2 Type II Framework
INSERT INTO vs_assessment_frameworks (name, description, framework_type, question_count, estimated_time, is_active)
VALUES (
  'SOC2',
  'Service Organization Control 2 Type II compliance assessment covering security, availability, processing integrity, confidentiality, and privacy controls.',
  'soc2_type_ii',
  0, -- Will be populated when questions are added
  '2-4 hours',
  true
) ON CONFLICT DO NOTHING;

-- ISO 27001 Framework
INSERT INTO vs_assessment_frameworks (name, description, framework_type, question_count, estimated_time, is_active)
VALUES (
  'ISO27001',
  'ISO/IEC 27001 Information Security Management System (ISMS) compliance assessment covering information security controls and risk management.',
  'iso_27001',
  0, -- Will be populated when questions are added
  '3-5 hours',
  true
) ON CONFLICT DO NOTHING;

-- FedRAMP Framework
INSERT INTO vs_assessment_frameworks (name, description, framework_type, question_count, estimated_time, is_active)
VALUES (
  'FEDRAMP',
  'Federal Risk and Authorization Management Program compliance assessment for cloud service providers serving federal agencies.',
  'fedramp',
  0, -- Will be populated when questions are added
  '4-6 hours',
  true
) ON CONFLICT DO NOTHING;

-- FISMA Framework
INSERT INTO vs_assessment_frameworks (name, description, framework_type, question_count, estimated_time, is_active)
VALUES (
  'FISMA',
  'Federal Information Security Management Act compliance assessment covering federal information system security requirements.',
  'fisma',
  0, -- Will be populated when questions are added
  '3-5 hours',
  true
) ON CONFLICT DO NOTHING;

-- NIST SP 800-161 Framework (if not already exists)
INSERT INTO vs_assessment_frameworks (name, description, framework_type, question_count, estimated_time, is_active)
VALUES (
  'NIST',
  'NIST Special Publication 800-161 Supply Chain Risk Management Practices compliance assessment.',
  'nist_sp_800_161',
  0, -- Will be populated when questions are added
  '2-3 hours',
  true
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 3: Create Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_assessment_frameworks_type 
ON vs_assessment_frameworks(framework_type);

CREATE INDEX IF NOT EXISTS idx_assessment_frameworks_active 
ON vs_assessment_frameworks(is_active) 
WHERE is_active = true;

-- ============================================================================
-- STEP 4: Add Comments for Documentation
-- ============================================================================

COMMENT ON TABLE vs_assessment_frameworks IS 'Stores compliance framework definitions including NIST, CMMC, SOC2, ISO 27001, FedRAMP, and FISMA';
COMMENT ON COLUMN vs_assessment_frameworks.framework_type IS 'Type of compliance framework: cmmc_level_1, cmmc_level_2, nist_privacy, nist_sp_800_161, soc2_type_ii, iso_27001, fedramp, fisma, or custom';

-- ============================================================================
-- VERIFICATION QUERY (Run this after migration to verify success)
-- ============================================================================

SELECT name, framework_type, is_active, estimated_time 
FROM vs_assessment_frameworks 
WHERE framework_type IN ('soc2_type_ii', 'iso_27001', 'fedramp', 'fisma', 'nist_sp_800_161')
ORDER BY name;

