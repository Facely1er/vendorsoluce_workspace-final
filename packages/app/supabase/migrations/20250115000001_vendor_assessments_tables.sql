/*
  # Vendor Assessments Database Schema Migration
  
  This migration creates the missing tables needed for the Vendor Risk Assessments module
  to be fully functional in production.
  
  ## New Tables Created:
  - `vs_vendor_assessments` - Links vendors to specific assessment frameworks
  - `vs_assessment_frameworks` - Stores CMMC/NIST questionnaire definitions
  - `vs_assessment_responses` - Stores vendor answers to questions
  - `vs_assessment_questions` - Stores individual questions for frameworks
  
  ## Security:
  - All tables have RLS enabled
  - User-scoped policies for data isolation
  - Proper foreign key constraints
  - Indexes for performance
*/

-- ============================================================================
-- STEP 1: Create Assessment Frameworks Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS vs_assessment_frameworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  framework_type text NOT NULL CHECK (framework_type IN ('cmmc_level_1', 'cmmc_level_2', 'nist_privacy', 'custom')),
  question_count integer DEFAULT 0,
  estimated_time text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- STEP 2: Create Assessment Questions Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS vs_assessment_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id uuid NOT NULL REFERENCES vs_assessment_frameworks(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'yes_no', 'text', 'file_upload')),
  section text,
  order_index integer DEFAULT 0,
  is_required boolean DEFAULT true,
  options jsonb, -- For multiple choice questions
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- STEP 3: Create Vendor Assessments Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS vs_vendor_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES vs_profiles(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES vs_vendors(id) ON DELETE CASCADE,
  framework_id uuid NOT NULL REFERENCES vs_assessment_frameworks(id) ON DELETE CASCADE,
  assessment_name text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'in_progress', 'completed', 'reviewed', 'cancelled')),
  due_date timestamptz,
  sent_at timestamptz,
  completed_at timestamptz,
  overall_score integer CHECK (overall_score >= 0 AND overall_score <= 100),
  section_scores jsonb,
  contact_email text,
  custom_message text,
  send_reminders boolean DEFAULT true,
  allow_save_progress boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- STEP 4: Create Assessment Responses Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS vs_assessment_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES vs_vendor_assessments(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES vs_assessment_questions(id) ON DELETE CASCADE,
  answer text,
  answer_data jsonb, -- For complex answers, file uploads, etc.
  evidence_urls text[],
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(assessment_id, question_id)
);

-- ============================================================================
-- STEP 5: Enable Row Level Security
-- ============================================================================

ALTER TABLE vs_assessment_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE vs_assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vs_vendor_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vs_assessment_responses ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 6: Create RLS Policies
-- ============================================================================

-- Policies for vs_assessment_frameworks (read-only for all authenticated users)
DROP POLICY IF EXISTS "Anyone can read assessment frameworks" ON vs_assessment_frameworks;
CREATE POLICY "Anyone can read assessment frameworks"
  ON vs_assessment_frameworks
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policies for vs_assessment_questions (read-only for all authenticated users)
DROP POLICY IF EXISTS "Anyone can read assessment questions" ON vs_assessment_questions;
CREATE POLICY "Anyone can read assessment questions"
  ON vs_assessment_questions
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for vs_vendor_assessments (user-scoped)
DROP POLICY IF EXISTS "Users can read own vendor assessments" ON vs_vendor_assessments;
CREATE POLICY "Users can read own vendor assessments"
  ON vs_vendor_assessments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own vendor assessments" ON vs_vendor_assessments;
CREATE POLICY "Users can insert own vendor assessments"
  ON vs_vendor_assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own vendor assessments" ON vs_vendor_assessments;
CREATE POLICY "Users can update own vendor assessments"
  ON vs_vendor_assessments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own vendor assessments" ON vs_vendor_assessments;
CREATE POLICY "Users can delete own vendor assessments"
  ON vs_vendor_assessments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for vs_assessment_responses (user-scoped through assessment)
DROP POLICY IF EXISTS "Users can read responses for own assessments" ON vs_assessment_responses;
CREATE POLICY "Users can read responses for own assessments"
  ON vs_assessment_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vs_vendor_assessments 
      WHERE id = assessment_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert responses for own assessments" ON vs_assessment_responses;
CREATE POLICY "Users can insert responses for own assessments"
  ON vs_assessment_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vs_vendor_assessments 
      WHERE id = assessment_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update responses for own assessments" ON vs_assessment_responses;
CREATE POLICY "Users can update responses for own assessments"
  ON vs_assessment_responses
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vs_vendor_assessments 
      WHERE id = assessment_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vs_vendor_assessments 
      WHERE id = assessment_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete responses for own assessments" ON vs_assessment_responses;
CREATE POLICY "Users can delete responses for own assessments"
  ON vs_assessment_responses
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vs_vendor_assessments 
      WHERE id = assessment_id AND user_id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 7: Create Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_vs_assessment_questions_framework_id ON vs_assessment_questions(framework_id);
CREATE INDEX IF NOT EXISTS idx_vs_assessment_questions_order ON vs_assessment_questions(framework_id, order_index);
CREATE INDEX IF NOT EXISTS idx_vs_vendor_assessments_user_id ON vs_vendor_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_vs_vendor_assessments_vendor_id ON vs_vendor_assessments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vs_vendor_assessments_status ON vs_vendor_assessments(status);
CREATE INDEX IF NOT EXISTS idx_vs_vendor_assessments_due_date ON vs_vendor_assessments(due_date);
CREATE INDEX IF NOT EXISTS idx_vs_assessment_responses_assessment_id ON vs_assessment_responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_vs_assessment_responses_question_id ON vs_assessment_responses(question_id);

-- ============================================================================
-- STEP 8: Create Triggers for Updated At
-- ============================================================================

DROP TRIGGER IF EXISTS update_vs_assessment_frameworks_updated_at ON vs_assessment_frameworks;
CREATE TRIGGER update_vs_assessment_frameworks_updated_at
  BEFORE UPDATE ON vs_assessment_frameworks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vs_assessment_questions_updated_at ON vs_assessment_questions;
CREATE TRIGGER update_vs_assessment_questions_updated_at
  BEFORE UPDATE ON vs_assessment_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vs_vendor_assessments_updated_at ON vs_vendor_assessments;
CREATE TRIGGER update_vs_vendor_assessments_updated_at
  BEFORE UPDATE ON vs_vendor_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vs_assessment_responses_updated_at ON vs_assessment_responses;
CREATE TRIGGER update_vs_assessment_responses_updated_at
  BEFORE UPDATE ON vs_assessment_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 9: Insert Default Assessment Frameworks
-- ============================================================================

INSERT INTO vs_assessment_frameworks (name, description, framework_type, question_count, estimated_time) VALUES
('CMMC Level 1', 'Cybersecurity Maturity Model Certification Level 1 - Basic Cyber Hygiene', 'cmmc_level_1', 17, '30 minutes'),
('CMMC Level 2', 'Cybersecurity Maturity Model Certification Level 2 - Intermediate Cyber Hygiene', 'cmmc_level_2', 110, '2-3 hours'),
('NIST Privacy Framework', 'NIST Privacy Framework Assessment for Data Protection Compliance', 'nist_privacy', 45, '1 hour'),
('Custom Assessment', 'Customizable security assessment framework', 'custom', 0, 'Variable');

-- ============================================================================
-- STEP 10: Insert Sample Questions for CMMC Level 1
-- ============================================================================

-- Get the CMMC Level 1 framework ID
DO $$
DECLARE
    cmmc_level_1_id uuid;
BEGIN
    SELECT id INTO cmmc_level_1_id FROM vs_assessment_frameworks WHERE framework_type = 'cmmc_level_1';
    
    -- Insert CMMC Level 1 questions
    INSERT INTO vs_assessment_questions (framework_id, question_text, question_type, section, order_index, is_required) VALUES
    (cmmc_level_1_id, 'Does your organization have a formal information security program with documented policies and procedures?', 'yes_no', 'Security Program', 1, true),
    (cmmc_level_1_id, 'Do you maintain an inventory of all information systems and assets?', 'yes_no', 'Asset Management', 2, true),
    (cmmc_level_1_id, 'Do you have procedures for managing access to information systems?', 'yes_no', 'Access Control', 3, true),
    (cmmc_level_1_id, 'Do you encrypt sensitive data both at rest and in transit?', 'yes_no', 'Data Protection', 4, true),
    (cmmc_level_1_id, 'Do you have incident response procedures documented and tested?', 'yes_no', 'Incident Response', 5, true),
    (cmmc_level_1_id, 'Do you perform regular security awareness training for all personnel?', 'yes_no', 'Training', 6, true),
    (cmmc_level_1_id, 'Do you have procedures for secure disposal of information and information systems?', 'yes_no', 'Media Protection', 7, true),
    (cmmc_level_1_id, 'Do you maintain audit logs and monitor system activities?', 'yes_no', 'Audit and Accountability', 8, true),
    (cmmc_level_1_id, 'Do you have procedures for configuration management of information systems?', 'yes_no', 'Configuration Management', 9, true),
    (cmmc_level_1_id, 'Do you perform regular vulnerability assessments?', 'yes_no', 'Vulnerability Management', 10, true),
    (cmmc_level_1_id, 'Do you have procedures for secure communications?', 'yes_no', 'Communications Protection', 11, true),
    (cmmc_level_1_id, 'Do you maintain physical security controls for information systems?', 'yes_no', 'Physical Protection', 12, true),
    (cmmc_level_1_id, 'Do you have procedures for personnel security?', 'yes_no', 'Personnel Security', 13, true),
    (cmmc_level_1_id, 'Do you have procedures for risk assessment and management?', 'yes_no', 'Risk Management', 14, true),
    (cmmc_level_1_id, 'Do you have procedures for supply chain risk management?', 'yes_no', 'Supply Chain Risk', 15, true),
    (cmmc_level_1_id, 'Do you have procedures for system and information integrity?', 'yes_no', 'System Integrity', 16, true),
    (cmmc_level_1_id, 'Do you have procedures for system and communications protection?', 'yes_no', 'System Protection', 17, true);
END $$;
