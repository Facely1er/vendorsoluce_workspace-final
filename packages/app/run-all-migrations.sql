-- ============================================================================
-- VendorSoluce Database Migrations - Consolidated Script
-- Run this entire script in Supabase SQL Editor
-- Project: nuwfdvwqiynzhbbsqagw
-- ============================================================================

-- Migration 1: 20250101000000_stripe_integration.sql
-- Complete Stripe Integration Database Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  product_id TEXT NOT NULL,
  product_name TEXT,
  product_type TEXT DEFAULT 'main',
  billing_model TEXT DEFAULT 'monthly',
  tenant_id TEXT DEFAULT 'default',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  last_payment_date TIMESTAMP WITH TIME ZONE,
  last_payment_failed TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription_items table for add-ons and line items
CREATE TABLE IF NOT EXISTS subscription_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  stripe_item_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT,
  product_type TEXT DEFAULT 'addon',
  quantity INTEGER DEFAULT 1,
  unit_amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  amount_paid INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  type TEXT NOT NULL,
  card_brand TEXT,
  card_last_four TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage_tracking table for billing and limits
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id TEXT DEFAULT 'default',
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value INTEGER DEFAULT 0,
  limit_value INTEGER DEFAULT 0,
  billing_period_start TIMESTAMP WITH TIME ZONE,
  billing_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create webhook_events table for audit trail
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer_portal_sessions table
CREATE TABLE IF NOT EXISTS customer_portal_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_session_id TEXT NOT NULL UNIQUE,
  return_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant_id ON subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_product_id ON subscriptions(product_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_billing_model ON subscriptions(billing_model);

CREATE INDEX IF NOT EXISTS idx_subscription_items_subscription_id ON subscription_items(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_items_stripe_price_id ON subscription_items(stripe_price_id);
CREATE INDEX IF NOT EXISTS idx_subscription_items_product_id ON subscription_items(product_id);

CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_customer_id ON invoices(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_stripe_customer_id ON payment_methods(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_tenant_id ON usage_tracking(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_subscription_id ON usage_tracking(subscription_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_metric_name ON usage_tracking(metric_name);

CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_event_id ON webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);

CREATE INDEX IF NOT EXISTS idx_customer_portal_sessions_user_id ON customer_portal_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_portal_sessions_stripe_customer_id ON customer_portal_sessions(stripe_customer_id);

-- Enable RLS (Row Level Security)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_portal_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscriptions
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for subscription_items
CREATE POLICY "Users can view their own subscription items" ON subscription_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM subscriptions 
      WHERE subscriptions.id = subscription_items.subscription_id 
      AND subscriptions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own subscription items" ON subscription_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM subscriptions 
      WHERE subscriptions.id = subscription_items.subscription_id 
      AND subscriptions.user_id = auth.uid()
    )
  );

-- Create RLS policies for invoices
CREATE POLICY "Users can view their own invoices" ON invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM subscriptions 
      WHERE subscriptions.id = invoices.subscription_id 
      AND subscriptions.user_id = auth.uid()
    )
  );

-- Create RLS policies for payment_methods
CREATE POLICY "Users can view their own payment methods" ON payment_methods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment methods" ON payment_methods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods" ON payment_methods
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods" ON payment_methods
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for usage_tracking
CREATE POLICY "Users can view their own usage tracking" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage tracking" ON usage_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage tracking" ON usage_tracking
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for customer_portal_sessions
CREATE POLICY "Users can view their own portal sessions" ON customer_portal_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own portal sessions" ON customer_portal_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Webhook events are service-level, no RLS needed

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at 
  BEFORE UPDATE ON usage_tracking 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to get user subscription limits
CREATE OR REPLACE FUNCTION get_user_subscription_limits(user_uuid UUID)
RETURNS TABLE (
  max_users INTEGER,
  max_vendors INTEGER,
  max_assessments INTEGER,
  storage_limit TEXT,
  compliance_frameworks TEXT[],
  billing_model TEXT,
  product_name TEXT
)
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN s.product_id LIKE '%starter%' THEN 5
      WHEN s.product_id LIKE '%professional%' THEN 25
      WHEN s.product_id LIKE '%enterprise%' THEN -1
      WHEN s.product_id LIKE '%federal%' THEN -1
      ELSE 0
    END as max_users,
    CASE 
      WHEN s.product_id LIKE '%starter%' THEN 25
      WHEN s.product_id LIKE '%professional%' THEN 100
      WHEN s.product_id LIKE '%enterprise%' THEN -1
      WHEN s.product_id LIKE '%federal%' THEN -1
      ELSE 0
    END as max_vendors,
    CASE 
      WHEN s.product_id LIKE '%starter%' THEN 100
      WHEN s.product_id LIKE '%professional%' THEN 500
      WHEN s.product_id LIKE '%enterprise%' THEN -1
      WHEN s.product_id LIKE '%federal%' THEN -1
      ELSE 0
    END as max_assessments,
    CASE 
      WHEN s.product_id LIKE '%starter%' THEN '1GB'
      WHEN s.product_id LIKE '%professional%' THEN '10GB'
      WHEN s.product_id LIKE '%enterprise%' THEN '100GB'
      WHEN s.product_id LIKE '%federal%' THEN '1TB'
      ELSE '0GB'
    END as storage_limit,
    CASE 
      WHEN s.product_id LIKE '%starter%' THEN ARRAY['NIST']::TEXT[]
      WHEN s.product_id LIKE '%professional%' THEN ARRAY['NIST', 'CMMC']::TEXT[]
      WHEN s.product_id LIKE '%enterprise%' THEN ARRAY['NIST', 'CMMC', 'SOC2', 'ISO27001', 'FEDRAMP', 'FISMA']::TEXT[]
      WHEN s.product_id LIKE '%federal%' THEN ARRAY['FEDRAMP', 'FISMA', 'NIST', 'CMMC']::TEXT[]
      ELSE ARRAY[]::TEXT[]
    END as compliance_frameworks,
    s.billing_model,
    s.product_name
  FROM subscriptions s
  WHERE s.user_id = user_uuid 
  AND s.status = 'active'
  AND (s.current_period_end IS NULL OR s.current_period_end > NOW())
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user has access to feature
CREATE OR REPLACE FUNCTION user_has_feature_access(user_uuid UUID, feature_name TEXT)
RETURNS BOOLEAN
SET search_path = public
AS $$
DECLARE
  has_access BOOLEAN := FALSE;
  user_subscription RECORD;
BEGIN
  -- Get user's active subscription
  SELECT * INTO user_subscription
  FROM subscriptions 
  WHERE user_id = user_uuid 
  AND status = 'active'
  AND (current_period_end IS NULL OR current_period_end > NOW())
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Check if user has active subscription
  IF user_subscription.id IS NOT NULL THEN
    has_access := TRUE;
    
    -- Additional feature-specific checks
    CASE feature_name
      WHEN 'white_label' THEN
        has_access := user_subscription.product_id LIKE '%professional%' OR 
                     user_subscription.product_id LIKE '%enterprise%' OR 
                     user_subscription.product_id LIKE '%federal%';
      WHEN 'api_access' THEN
        has_access := user_subscription.product_id LIKE '%professional%' OR 
                     user_subscription.product_id LIKE '%enterprise%' OR 
                     user_subscription.product_id LIKE '%federal%';
      WHEN 'advanced_analytics' THEN
        has_access := user_subscription.product_id LIKE '%enterprise%' OR 
                     user_subscription.product_id LIKE '%federal%';
      ELSE
        has_access := TRUE;
    END CASE;
  END IF;
  
  RETURN has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to track usage
CREATE OR REPLACE FUNCTION track_usage(
  user_uuid UUID,
  tenant_uuid TEXT,
  subscription_uuid UUID,
  metric_name TEXT,
  metric_value INTEGER
)
RETURNS VOID
SET search_path = public
AS $$
DECLARE
  current_period_start TIMESTAMP WITH TIME ZONE;
  current_period_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get current billing period
  SELECT current_period_start, current_period_end
  INTO current_period_start, current_period_end
  FROM subscriptions
  WHERE id = subscription_uuid;
  
  -- Insert or update usage tracking
  INSERT INTO usage_tracking (
    user_id, tenant_id, subscription_id, metric_name, 
    metric_value, billing_period_start, billing_period_end
  ) VALUES (
    user_uuid, tenant_uuid, subscription_uuid, metric_name,
    metric_value, current_period_start, current_period_end
  )
  ON CONFLICT DO NOTHING;
  
  -- Update if exists (PostgreSQL doesn't have ON CONFLICT UPDATE for multiple columns, so we use separate UPDATE)
  UPDATE usage_tracking
  SET metric_value = usage_tracking.metric_value + metric_value,
      updated_at = NOW()
  WHERE user_id = user_uuid
    AND tenant_id = tenant_uuid
    AND subscription_id = subscription_uuid
    AND metric_name = track_usage.metric_name
    AND billing_period_start = current_period_start;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: check_usage_limit function is defined later in migration 9
-- The old version (returning BOOLEAN) is removed, replaced with new version (returning TABLE)

-- Create function to get subscription analytics
CREATE OR REPLACE FUNCTION get_subscription_analytics()
RETURNS TABLE (
  total_subscriptions BIGINT,
  active_subscriptions BIGINT,
  monthly_revenue NUMERIC,
  annual_revenue NUMERIC,
  total_revenue NUMERIC,
  average_revenue_per_user NUMERIC
)
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_subscriptions,
    COUNT(*) FILTER (WHERE status = 'active') as active_subscriptions,
    COALESCE(SUM(
      CASE 
        WHEN billing_model = 'monthly' THEN 
          CASE 
            WHEN product_id LIKE '%starter%' THEN 4900
            WHEN product_id LIKE '%professional%' THEN 14900
            WHEN product_id LIKE '%enterprise%' THEN 44900
            WHEN product_id LIKE '%federal%' THEN 99900
            ELSE 0
          END
        ELSE 0
      END
    ), 0) as monthly_revenue,
    COALESCE(SUM(
      CASE 
        WHEN billing_model = 'annual' THEN 
          CASE 
            WHEN product_id LIKE '%starter%' THEN 47000
            WHEN product_id LIKE '%professional%' THEN 143000
            WHEN product_id LIKE '%enterprise%' THEN 431000
            WHEN product_id LIKE '%federal%' THEN 959000
            ELSE 0
          END
        ELSE 0
      END
    ), 0) as annual_revenue,
    COALESCE(SUM(
      CASE 
        WHEN billing_model = 'monthly' THEN 
          CASE 
            WHEN product_id LIKE '%starter%' THEN 4900
            WHEN product_id LIKE '%professional%' THEN 14900
            WHEN product_id LIKE '%enterprise%' THEN 44900
            WHEN product_id LIKE '%federal%' THEN 99900
            ELSE 0
          END
        WHEN billing_model = 'annual' THEN 
          CASE 
            WHEN product_id LIKE '%starter%' THEN 47000
            WHEN product_id LIKE '%professional%' THEN 143000
            WHEN product_id LIKE '%enterprise%' THEN 431000
            WHEN product_id LIKE '%federal%' THEN 959000
            ELSE 0
          END
        ELSE 0
      END
    ), 0) as total_revenue,
    COALESCE(AVG(
      CASE 
        WHEN billing_model = 'monthly' THEN 
          CASE 
            WHEN product_id LIKE '%starter%' THEN 4900
            WHEN product_id LIKE '%professional%' THEN 14900
            WHEN product_id LIKE '%enterprise%' THEN 44900
            WHEN product_id LIKE '%federal%' THEN 99900
            ELSE 0
          END
        WHEN billing_model = 'annual' THEN 
          CASE 
            WHEN product_id LIKE '%starter%' THEN 47000
            WHEN product_id LIKE '%professional%' THEN 143000
            WHEN product_id LIKE '%enterprise%' THEN 431000
            WHEN product_id LIKE '%federal%' THEN 959000
            ELSE 0
          END
        ELSE 0
      END
    ), 0) as average_revenue_per_user
  FROM subscriptions
  WHERE status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Migration 2: 20250115_vendor_assessments_tables.sql
-- Vendor Assessments Database Schema Migration

-- Create Assessment Frameworks Table
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

-- Create Assessment Questions Table
CREATE TABLE IF NOT EXISTS vs_assessment_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id uuid NOT NULL REFERENCES vs_assessment_frameworks(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'yes_no', 'text', 'file_upload')),
  section text,
  order_index integer DEFAULT 0,
  is_required boolean DEFAULT true,
  options jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create Vendor Assessments Table (will reference vs_profiles and vs_vendors after they're created)
CREATE TABLE IF NOT EXISTS vs_vendor_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  vendor_id uuid NOT NULL,
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

-- Create Assessment Responses Table
CREATE TABLE IF NOT EXISTS vs_assessment_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES vs_vendor_assessments(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES vs_assessment_questions(id) ON DELETE CASCADE,
  answer text,
  answer_data jsonb,
  evidence_urls text[],
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(assessment_id, question_id)
);

-- Enable Row Level Security
ALTER TABLE vs_assessment_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE vs_assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vs_vendor_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vs_assessment_responses ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Anyone can read assessment frameworks"
  ON vs_assessment_frameworks
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Anyone can read assessment questions"
  ON vs_assessment_questions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read own vendor assessments"
  ON vs_vendor_assessments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vendor assessments"
  ON vs_vendor_assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vendor assessments"
  ON vs_vendor_assessments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own vendor assessments"
  ON vs_vendor_assessments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

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

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_vs_assessment_questions_framework_id ON vs_assessment_questions(framework_id);
CREATE INDEX IF NOT EXISTS idx_vs_assessment_questions_order ON vs_assessment_questions(framework_id, order_index);
CREATE INDEX IF NOT EXISTS idx_vs_vendor_assessments_user_id ON vs_vendor_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_vs_vendor_assessments_vendor_id ON vs_vendor_assessments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vs_vendor_assessments_status ON vs_vendor_assessments(status);
CREATE INDEX IF NOT EXISTS idx_vs_vendor_assessments_due_date ON vs_vendor_assessments(due_date);
CREATE INDEX IF NOT EXISTS idx_vs_assessment_responses_assessment_id ON vs_assessment_responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_vs_assessment_responses_question_id ON vs_assessment_responses(question_id);

-- Create Triggers for Updated At
CREATE TRIGGER update_vs_assessment_frameworks_updated_at
  BEFORE UPDATE ON vs_assessment_frameworks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vs_assessment_questions_updated_at
  BEFORE UPDATE ON vs_assessment_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vs_vendor_assessments_updated_at
  BEFORE UPDATE ON vs_vendor_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vs_assessment_responses_updated_at
  BEFORE UPDATE ON vs_assessment_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert Default Assessment Frameworks
INSERT INTO vs_assessment_frameworks (name, description, framework_type, question_count, estimated_time) VALUES
('CMMC Level 1', 'Cybersecurity Maturity Model Certification Level 1 - Basic Cyber Hygiene', 'cmmc_level_1', 17, '30 minutes'),
('CMMC Level 2', 'Cybersecurity Maturity Model Certification Level 2 - Intermediate Cyber Hygiene', 'cmmc_level_2', 110, '2-3 hours'),
('NIST Privacy Framework', 'NIST Privacy Framework Assessment for Data Protection Compliance', 'nist_privacy', 45, '1 hour'),
('Custom Assessment', 'Customizable security assessment framework', 'custom', 0, 'Variable')
ON CONFLICT DO NOTHING;

-- Insert Sample Questions for CMMC Level 1
DO $$
DECLARE
    cmmc_level_1_id uuid;
BEGIN
    SELECT id INTO cmmc_level_1_id FROM vs_assessment_frameworks WHERE framework_type = 'cmmc_level_1' LIMIT 1;
    
    IF cmmc_level_1_id IS NOT NULL THEN
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
        (cmmc_level_1_id, 'Do you have procedures for system and communications protection?', 'yes_no', 'System Protection', 17, true)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Migration 3: 20250701042959_crimson_waterfall.sql
-- Initial VendorSoluce Database Schema

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  company text,
  role text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  industry text,
  website text,
  contact_email text,
  risk_score integer CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level text CHECK (risk_level IN ('Low', 'Medium', 'High', 'Critical')),
  compliance_status text CHECK (compliance_status IN ('Compliant', 'Partial', 'Non-Compliant')),
  last_assessment_date timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sbom_analyses table
CREATE TABLE IF NOT EXISTS sbom_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  filename text NOT NULL,
  file_type text NOT NULL,
  total_components integer DEFAULT 0,
  total_vulnerabilities integer DEFAULT 0,
  risk_score integer CHECK (risk_score >= 0 AND risk_score <= 100),
  analysis_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create supply_chain_assessments table
CREATE TABLE IF NOT EXISTS supply_chain_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_name text,
  overall_score integer CHECK (overall_score >= 0 AND overall_score <= 100),
  section_scores jsonb,
  answers jsonb,
  status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'archived')),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  topic text,
  message text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sbom_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE supply_chain_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = id::text);

-- Create policies for vendors
CREATE POLICY "Users can read own vendors"
  ON vendors
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own vendors"
  ON vendors
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own vendors"
  ON vendors
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own vendors"
  ON vendors
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Create policies for sbom_analyses
CREATE POLICY "Users can read own SBOM analyses"
  ON sbom_analyses
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own SBOM analyses"
  ON sbom_analyses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own SBOM analyses"
  ON sbom_analyses
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own SBOM analyses"
  ON sbom_analyses
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Create policies for supply_chain_assessments
CREATE POLICY "Users can read own assessments"
  ON supply_chain_assessments
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own assessments"
  ON supply_chain_assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own assessments"
  ON supply_chain_assessments
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own assessments"
  ON supply_chain_assessments
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Create policies for contact_submissions
CREATE POLICY "Anyone can insert contact submissions"
  ON contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_sbom_analyses_user_id ON sbom_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_supply_chain_assessments_user_id ON supply_chain_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at);

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sbom_analyses_updated_at
  BEFORE UPDATE ON sbom_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supply_chain_assessments_updated_at
  BEFORE UPDATE ON supply_chain_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Migration 4: 20250722160541_withered_glade.sql
-- Add is_first_login column to profiles table

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_first_login'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_first_login boolean DEFAULT true;
  END IF;
END $$;

-- Migration 5: 20250724052026_broad_castle.sql
-- Fix Profiles RLS Policy for User Signup

-- Drop existing policies that use incorrect function name
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create correct RLS policies with proper auth.uid() function
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Migration 6 & 7: 20251004090256 & 20251004090354_rename_tables_with_vs_prefix.sql
-- Rename tables with vs_ prefix and add missing columns

-- Add missing columns to profiles table
DO $$
BEGIN
  -- Add company_size column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'company_size'
  ) THEN
    ALTER TABLE profiles ADD COLUMN company_size text;
  END IF;

  -- Add industry column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'industry'
  ) THEN
    ALTER TABLE profiles ADD COLUMN industry text;
  END IF;

  -- Add tour_completed column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'tour_completed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN tour_completed boolean DEFAULT false;
  END IF;
END $$;

-- Add vendor_id column to supply_chain_assessments table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'supply_chain_assessments' AND column_name = 'vendor_id'
  ) THEN
    ALTER TABLE supply_chain_assessments ADD COLUMN vendor_id uuid;
  END IF;
END $$;

-- Drop All Existing RLS Policies (handle both old and new table names, only if tables exist)
DO $$
BEGIN
  -- Drop policies on profiles/vs_profiles
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vs_profiles' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Users can read own profile" ON vs_profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON vs_profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON vs_profiles;
  END IF;

  -- Drop policies on vendors/vs_vendors
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vendors' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Users can read own vendors" ON vendors;
    DROP POLICY IF EXISTS "Users can insert own vendors" ON vendors;
    DROP POLICY IF EXISTS "Users can update own vendors" ON vendors;
    DROP POLICY IF EXISTS "Users can delete own vendors" ON vendors;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vs_vendors' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Users can read own vendors" ON vs_vendors;
    DROP POLICY IF EXISTS "Users can insert own vendors" ON vs_vendors;
    DROP POLICY IF EXISTS "Users can update own vendors" ON vs_vendors;
    DROP POLICY IF EXISTS "Users can delete own vendors" ON vs_vendors;
  END IF;

  -- Drop policies on sbom_analyses/vs_sbom_analyses
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sbom_analyses' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Users can read own SBOM analyses" ON sbom_analyses;
    DROP POLICY IF EXISTS "Users can insert own SBOM analyses" ON sbom_analyses;
    DROP POLICY IF EXISTS "Users can update own SBOM analyses" ON sbom_analyses;
    DROP POLICY IF EXISTS "Users can delete own SBOM analyses" ON sbom_analyses;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vs_sbom_analyses' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Users can read own SBOM analyses" ON vs_sbom_analyses;
    DROP POLICY IF EXISTS "Users can insert own SBOM analyses" ON vs_sbom_analyses;
    DROP POLICY IF EXISTS "Users can update own SBOM analyses" ON vs_sbom_analyses;
    DROP POLICY IF EXISTS "Users can delete own SBOM analyses" ON vs_sbom_analyses;
  END IF;

  -- Drop policies on supply_chain_assessments/vs_supply_chain_assessments
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'supply_chain_assessments' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Users can read own assessments" ON supply_chain_assessments;
    DROP POLICY IF EXISTS "Users can insert own assessments" ON supply_chain_assessments;
    DROP POLICY IF EXISTS "Users can update own assessments" ON supply_chain_assessments;
    DROP POLICY IF EXISTS "Users can delete own assessments" ON supply_chain_assessments;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vs_supply_chain_assessments' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Users can read own assessments" ON vs_supply_chain_assessments;
    DROP POLICY IF EXISTS "Users can insert own assessments" ON vs_supply_chain_assessments;
    DROP POLICY IF EXISTS "Users can update own assessments" ON vs_supply_chain_assessments;
    DROP POLICY IF EXISTS "Users can delete own assessments" ON vs_supply_chain_assessments;
  END IF;

  -- Drop policies on contact_submissions/vs_contact_submissions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contact_submissions' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Anyone can insert contact submissions" ON contact_submissions;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vs_contact_submissions' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Anyone can insert contact submissions" ON vs_contact_submissions;
  END IF;
END $$;

-- Rename Tables with vs_ Prefix (only if vs_ tables don't exist)
DO $$
BEGIN
  -- Rename profiles to vs_profiles only if vs_profiles doesn't exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vs_profiles' AND table_schema = 'public') THEN
    ALTER TABLE profiles RENAME TO vs_profiles;
  END IF;

  -- Rename vendors to vs_vendors only if vs_vendors doesn't exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vendors' AND table_schema = 'public')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vs_vendors' AND table_schema = 'public') THEN
    ALTER TABLE vendors RENAME TO vs_vendors;
  END IF;

  -- Rename sbom_analyses to vs_sbom_analyses only if vs_sbom_analyses doesn't exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sbom_analyses' AND table_schema = 'public')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vs_sbom_analyses' AND table_schema = 'public') THEN
    ALTER TABLE sbom_analyses RENAME TO vs_sbom_analyses;
  END IF;

  -- Rename supply_chain_assessments to vs_supply_chain_assessments only if vs_supply_chain_assessments doesn't exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'supply_chain_assessments' AND table_schema = 'public')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vs_supply_chain_assessments' AND table_schema = 'public') THEN
    ALTER TABLE supply_chain_assessments RENAME TO vs_supply_chain_assessments;
  END IF;

  -- Rename contact_submissions to vs_contact_submissions only if vs_contact_submissions doesn't exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contact_submissions' AND table_schema = 'public')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vs_contact_submissions' AND table_schema = 'public') THEN
    ALTER TABLE contact_submissions RENAME TO vs_contact_submissions;
  END IF;
END $$;

-- Add Foreign Key Constraint for vendor_id (only if both tables exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vs_supply_chain_assessments' AND table_schema = 'public')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vs_vendors' AND table_schema = 'public')
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.table_constraints
       WHERE constraint_name = 'vs_supply_chain_assessments_vendor_id_fkey'
       AND table_name = 'vs_supply_chain_assessments'
     ) THEN
    ALTER TABLE vs_supply_chain_assessments
    ADD CONSTRAINT vs_supply_chain_assessments_vendor_id_fkey
    FOREIGN KEY (vendor_id) REFERENCES vs_vendors(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Recreate RLS Policies on New Tables (with error handling for existing policies)
DO $$
BEGIN
  -- Policies for vs_profiles (only if table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vs_profiles' AND table_schema = 'public') THEN
    BEGIN
      CREATE POLICY "Users can read own profile"
        ON vs_profiles
        FOR SELECT
        TO authenticated
        USING (auth.uid() = id);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
      CREATE POLICY "Users can update own profile"
        ON vs_profiles
        FOR UPDATE
        TO authenticated
        USING (auth.uid() = id)
        WITH CHECK (auth.uid() = id);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
      CREATE POLICY "Users can insert own profile"
        ON vs_profiles
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = id);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

-- Policies for vs_vendors (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vs_vendors' AND table_schema = 'public') THEN
    BEGIN CREATE POLICY "Users can read own vendors" ON vs_vendors FOR SELECT TO authenticated USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "Users can insert own vendors" ON vs_vendors FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "Users can update own vendors" ON vs_vendors FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "Users can delete own vendors" ON vs_vendors FOR DELETE TO authenticated USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

-- Policies for vs_sbom_analyses (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vs_sbom_analyses' AND table_schema = 'public') THEN
    BEGIN CREATE POLICY "Users can read own SBOM analyses" ON vs_sbom_analyses FOR SELECT TO authenticated USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "Users can insert own SBOM analyses" ON vs_sbom_analyses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "Users can update own SBOM analyses" ON vs_sbom_analyses FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "Users can delete own SBOM analyses" ON vs_sbom_analyses FOR DELETE TO authenticated USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

-- Policies for vs_supply_chain_assessments (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vs_supply_chain_assessments' AND table_schema = 'public') THEN
    BEGIN CREATE POLICY "Users can read own assessments" ON vs_supply_chain_assessments FOR SELECT TO authenticated USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "Users can insert own assessments" ON vs_supply_chain_assessments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "Users can update own assessments" ON vs_supply_chain_assessments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "Users can delete own assessments" ON vs_supply_chain_assessments FOR DELETE TO authenticated USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

-- Policy for vs_contact_submissions (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vs_contact_submissions' AND table_schema = 'public') THEN
    BEGIN CREATE POLICY "Anyone can insert contact submissions" ON vs_contact_submissions FOR INSERT TO anon, authenticated WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

-- Recreate Indexes with vs_ Prefix (only if tables exist)
DO $$
BEGIN
  -- Drop old indexes
  DROP INDEX IF EXISTS idx_vendors_user_id;
  DROP INDEX IF EXISTS idx_sbom_analyses_user_id;
  DROP INDEX IF EXISTS idx_supply_chain_assessments_user_id;
  DROP INDEX IF EXISTS idx_contact_submissions_created_at;

  -- Create new indexes only if tables exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vs_vendors' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_vs_vendors_user_id ON vs_vendors(user_id);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vs_sbom_analyses' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_vs_sbom_analyses_user_id ON vs_sbom_analyses(user_id);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vs_supply_chain_assessments' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_vs_supply_chain_assessments_user_id ON vs_supply_chain_assessments(user_id);
    CREATE INDEX IF NOT EXISTS idx_vs_supply_chain_assessments_vendor_id ON vs_supply_chain_assessments(vendor_id);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vs_contact_submissions' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_vs_contact_submissions_created_at ON vs_contact_submissions(created_at);
  END IF;
END $$;

-- Recreate Triggers with New Table Names (only if tables exist)
DO $$
BEGIN
  -- Drop old triggers
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vs_profiles' AND table_schema = 'public') THEN
    DROP TRIGGER IF EXISTS update_profiles_updated_at ON vs_profiles;
    DROP TRIGGER IF EXISTS update_vs_profiles_updated_at ON vs_profiles;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vs_vendors' AND table_schema = 'public') THEN
    DROP TRIGGER IF EXISTS update_vendors_updated_at ON vs_vendors;
    DROP TRIGGER IF EXISTS update_vs_vendors_updated_at ON vs_vendors;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vs_sbom_analyses' AND table_schema = 'public') THEN
    DROP TRIGGER IF EXISTS update_sbom_analyses_updated_at ON vs_sbom_analyses;
    DROP TRIGGER IF EXISTS update_vs_sbom_analyses_updated_at ON vs_sbom_analyses;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vs_supply_chain_assessments' AND table_schema = 'public') THEN
    DROP TRIGGER IF EXISTS update_supply_chain_assessments_updated_at ON vs_supply_chain_assessments;
    DROP TRIGGER IF EXISTS update_vs_supply_chain_assessments_updated_at ON vs_supply_chain_assessments;
  END IF;

  -- Create new triggers
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vs_profiles' AND table_schema = 'public') THEN
    CREATE TRIGGER update_vs_profiles_updated_at
      BEFORE UPDATE ON vs_profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vs_vendors' AND table_schema = 'public') THEN
    CREATE TRIGGER update_vs_vendors_updated_at
      BEFORE UPDATE ON vs_vendors
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vs_sbom_analyses' AND table_schema = 'public') THEN
    CREATE TRIGGER update_vs_sbom_analyses_updated_at
      BEFORE UPDATE ON vs_sbom_analyses
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vs_supply_chain_assessments' AND table_schema = 'public') THEN
    CREATE TRIGGER update_vs_supply_chain_assessments_updated_at
      BEFORE UPDATE ON vs_supply_chain_assessments
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Now update vs_vendor_assessments to reference vs_profiles and vs_vendors
DO $$
BEGIN
  -- Add foreign key constraints if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'vs_vendor_assessments_user_id_fkey'
    AND table_name = 'vs_vendor_assessments'
  ) THEN
    ALTER TABLE vs_vendor_assessments
    ADD CONSTRAINT vs_vendor_assessments_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES vs_profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'vs_vendor_assessments_vendor_id_fkey'
    AND table_name = 'vs_vendor_assessments'
  ) THEN
    ALTER TABLE vs_vendor_assessments
    ADD CONSTRAINT vs_vendor_assessments_vendor_id_fkey
    FOREIGN KEY (vendor_id) REFERENCES vs_vendors(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Migration 8: 20251107_asset_management.sql
-- Asset Management Migration

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('software', 'hardware', 'service', 'data', 'infrastructure', 'third_party')),
  category TEXT NOT NULL,
  criticality_level TEXT NOT NULL CHECK (criticality_level IN ('low', 'medium', 'high', 'critical')),
  business_impact TEXT NOT NULL CHECK (business_impact IN ('low', 'medium', 'high', 'critical')),
  data_classification TEXT NOT NULL CHECK (data_classification IN ('public', 'internal', 'confidential', 'restricted')),
  location TEXT,
  owner TEXT NOT NULL,
  custodian TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deprecated', 'under_review')),
  version TEXT,
  cost DECIMAL,
  acquisition_date DATE,
  end_of_life_date DATE,
  compliance_requirements TEXT[] DEFAULT '{}',
  security_controls TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  risk_score INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create asset_vendor_relationships table (references vs_vendors)
CREATE TABLE IF NOT EXISTS asset_vendor_relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES vs_vendors(id) ON DELETE CASCADE NOT NULL,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('primary_vendor', 'secondary_vendor', 'support_vendor', 'licensing_vendor', 'maintenance_vendor')),
  criticality_to_asset TEXT NOT NULL CHECK (criticality_to_asset IN ('low', 'medium', 'high', 'critical')),
  data_access_level TEXT NOT NULL CHECK (data_access_level IN ('none', 'read_only', 'read_write', 'full_access')),
  integration_type TEXT CHECK (integration_type IN ('api', 'database', 'file_transfer', 'web_service', 'direct_access', 'cloud_service')),
  contract_id TEXT,
  contract_start_date DATE,
  contract_end_date DATE,
  security_requirements TEXT[] DEFAULT '{}',
  compliance_requirements TEXT[] DEFAULT '{}',
  risk_factors TEXT[] DEFAULT '{}',
  mitigation_controls TEXT[] DEFAULT '{}',
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(asset_id, vendor_id, relationship_type)
);

-- Create due_diligence_requirements table
CREATE TABLE IF NOT EXISTS due_diligence_requirements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES vs_vendors(id) ON DELETE CASCADE NOT NULL,
  framework TEXT NOT NULL CHECK (framework IN ('nist', 'cmmc', 'iso27001', 'soc2', 'gdpr', 'hipaa', 'custom')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  due_date DATE NOT NULL,
  completed_date DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  vendor_id UUID REFERENCES vs_vendors(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('overdue_assessment', 'high_risk_relationship', 'contract_expiring', 'compliance_issue', 'security_incident')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  acknowledged BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_criticality ON assets(criticality_level);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_asset_vendor_relationships_asset ON asset_vendor_relationships(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_vendor_relationships_vendor ON asset_vendor_relationships(vendor_id);
CREATE INDEX IF NOT EXISTS idx_due_diligence_asset ON due_diligence_requirements(asset_id);
CREATE INDEX IF NOT EXISTS idx_due_diligence_vendor ON due_diligence_requirements(vendor_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_asset ON alerts(asset_id);
CREATE INDEX IF NOT EXISTS idx_alerts_vendor ON alerts(vendor_id);

-- Enable Row Level Security
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_vendor_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE due_diligence_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for assets
CREATE POLICY "Users can view their own assets" ON assets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assets" ON assets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assets" ON assets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assets" ON assets
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for asset_vendor_relationships
CREATE POLICY "Users can view their asset-vendor relationships" ON asset_vendor_relationships
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM assets WHERE assets.id = asset_vendor_relationships.asset_id AND assets.user_id = auth.uid())
  );

CREATE POLICY "Users can insert their asset-vendor relationships" ON asset_vendor_relationships
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM assets WHERE assets.id = asset_vendor_relationships.asset_id AND assets.user_id = auth.uid())
  );

CREATE POLICY "Users can update their asset-vendor relationships" ON asset_vendor_relationships
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM assets WHERE assets.id = asset_vendor_relationships.asset_id AND assets.user_id = auth.uid())
  );

CREATE POLICY "Users can delete their asset-vendor relationships" ON asset_vendor_relationships
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM assets WHERE assets.id = asset_vendor_relationships.asset_id AND assets.user_id = auth.uid())
  );

-- Create RLS policies for due_diligence_requirements
CREATE POLICY "Users can view their due diligence requirements" ON due_diligence_requirements
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM assets WHERE assets.id = due_diligence_requirements.asset_id AND assets.user_id = auth.uid())
  );

CREATE POLICY "Users can insert their due diligence requirements" ON due_diligence_requirements
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM assets WHERE assets.id = due_diligence_requirements.asset_id AND assets.user_id = auth.uid())
  );

CREATE POLICY "Users can update their due diligence requirements" ON due_diligence_requirements
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM assets WHERE assets.id = due_diligence_requirements.asset_id AND assets.user_id = auth.uid())
  );

CREATE POLICY "Users can delete their due diligence requirements" ON due_diligence_requirements
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM assets WHERE assets.id = due_diligence_requirements.asset_id AND assets.user_id = auth.uid())
  );

-- Create RLS policies for alerts
CREATE POLICY "Users can view their alerts" ON alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their alerts" ON alerts
  FOR UPDATE USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_vendor_relationships_updated_at BEFORE UPDATE ON asset_vendor_relationships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_due_diligence_requirements_updated_at BEFORE UPDATE ON due_diligence_requirements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Migration 9: 20251204_stripe_integration.sql
-- Additional Stripe Integration

-- Create Stripe Customer Table
CREATE TABLE IF NOT EXISTS vs_customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES vs_profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vs_customers_user_id ON vs_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_vs_customers_stripe_id ON vs_customers(stripe_customer_id);

-- Create Prices Table (Product Catalog)
CREATE TABLE IF NOT EXISTS vs_prices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  stripe_price_id TEXT UNIQUE NOT NULL,
  stripe_product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  price_amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  interval TEXT,
  interval_count INTEGER DEFAULT 1,
  tier TEXT NOT NULL,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default pricing tiers
INSERT INTO vs_prices (stripe_price_id, stripe_product_id, product_name, price_amount, interval, tier, features) VALUES
  ('price_free', 'prod_free', 'Free Tier', 0, NULL, 'free', 
   '{"vendors": 5, "sbom_scans": 3, "assessments": 1, "users": 1, "api_calls": 0, "features": ["basic_dashboard", "basic_sbom"]}'::jsonb),
  ('price_starter_monthly', 'prod_starter', 'Starter Plan', 4900, 'month', 'starter',
   '{"vendors": 10, "sbom_scans": 10, "assessments": 5, "users": 1, "api_calls": 100, "features": ["all_free", "vendor_management", "pdf_export", "email_support"]}'::jsonb),
  ('price_professional_monthly', 'prod_professional', 'Professional Plan', 14900, 'month', 'professional',
   '{"vendors": 50, "sbom_scans": 50, "assessments": 20, "users": 5, "api_calls": 10000, "features": ["all_starter", "api_access", "advanced_analytics", "threat_intel", "priority_support"]}'::jsonb),
  ('price_enterprise_monthly', 'prod_enterprise', 'Enterprise Plan', 44900, 'month', 'enterprise',
   '{"vendors": -1, "sbom_scans": -1, "assessments": -1, "users": -1, "api_calls": -1, "features": ["all_features", "sso", "custom_integrations", "dedicated_support", "sla"]}'::jsonb)
ON CONFLICT (stripe_price_id) DO NOTHING;

-- Create Subscriptions Table
CREATE TABLE IF NOT EXISTS vs_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES vs_profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  price_id UUID REFERENCES vs_prices(id),
  status TEXT NOT NULL,
  tier TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vs_subscriptions_user_id ON vs_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_vs_subscriptions_stripe_id ON vs_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_vs_subscriptions_status ON vs_subscriptions(status);

-- Create Payment Methods Table
CREATE TABLE IF NOT EXISTS vs_payment_methods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES vs_profiles(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  card_brand TEXT,
  card_last4 TEXT,
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vs_payment_methods_user_id ON vs_payment_methods(user_id);

-- Create Invoices Table
CREATE TABLE IF NOT EXISTS vs_invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES vs_profiles(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  subscription_id UUID REFERENCES vs_subscriptions(id),
  amount_paid INTEGER,
  amount_due INTEGER,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL,
  invoice_pdf TEXT,
  hosted_invoice_url TEXT,
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vs_invoices_user_id ON vs_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_vs_invoices_stripe_id ON vs_invoices(stripe_invoice_id);

-- Create Usage Records Table
CREATE TABLE IF NOT EXISTS vs_usage_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES vs_profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES vs_subscriptions(id),
  feature TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vs_usage_records_user_id ON vs_usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_vs_usage_records_period ON vs_usage_records(period_start, period_end);

-- Add subscription fields to profiles
ALTER TABLE vs_profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS on all tables
ALTER TABLE vs_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vs_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE vs_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vs_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE vs_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE vs_usage_records ENABLE ROW LEVEL SECURITY;

-- Customers policies
CREATE POLICY "Users can view own customer record" ON vs_customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage customers" ON vs_customers
  FOR ALL USING (auth.role() = 'service_role');

-- Prices policies (everyone can view prices)
CREATE POLICY "Anyone can view prices" ON vs_prices
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage prices" ON vs_prices
  FOR ALL USING (auth.role() = 'service_role');

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON vs_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON vs_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Payment methods policies
CREATE POLICY "Users can view own payment methods" ON vs_payment_methods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment methods" ON vs_payment_methods
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage payment methods" ON vs_payment_methods
  FOR ALL USING (auth.role() = 'service_role');

-- Invoices policies
CREATE POLICY "Users can view own invoices" ON vs_invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage invoices" ON vs_invoices
  FOR ALL USING (auth.role() = 'service_role');

-- Usage records policies
CREATE POLICY "Users can view own usage" ON vs_usage_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage usage" ON vs_usage_records
  FOR ALL USING (auth.role() = 'service_role');

-- Create helper functions
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID,
  p_feature TEXT,
  p_quantity INTEGER DEFAULT 1
)
RETURNS void
SET search_path = public
AS $$
BEGIN
  INSERT INTO vs_usage_records (user_id, feature, quantity, period_start, period_end)
  VALUES (
    p_user_id,
    p_feature,
    p_quantity,
    date_trunc('month', NOW()),
    date_trunc('month', NOW()) + INTERVAL '1 month'
  )
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the old check_usage_limit function before creating the new one with different return type
DROP FUNCTION IF EXISTS check_usage_limit(UUID, TEXT);

-- Create new check_usage_limit function (returns TABLE instead of BOOLEAN)
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_user_id UUID,
  p_feature TEXT
)
RETURNS TABLE(used INTEGER, limit_value INTEGER, can_use BOOLEAN)
SET search_path = public
AS $$
DECLARE
  v_tier TEXT;
  v_limit INTEGER;
  v_used INTEGER;
BEGIN
  SELECT subscription_tier INTO v_tier
  FROM vs_profiles
  WHERE id = p_user_id;

  SELECT (features->p_feature)::INTEGER INTO v_limit
  FROM vs_prices
  WHERE tier = v_tier
  LIMIT 1;

  SELECT COALESCE(SUM(quantity), 0)::INTEGER INTO v_used
  FROM vs_usage_records
  WHERE user_id = p_user_id
    AND feature = p_feature
    AND period_start = date_trunc('month', NOW());

  RETURN QUERY
  SELECT 
    v_used,
    v_limit,
    (v_limit = -1 OR v_used < v_limit) AS can_use;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vs_customers_updated_at BEFORE UPDATE ON vs_customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_vs_prices_updated_at BEFORE UPDATE ON vs_prices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_vs_subscriptions_updated_at BEFORE UPDATE ON vs_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- Migration Complete - Verification Queries
-- ============================================================================

-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE 'vs_%' OR table_name IN ('subscriptions', 'subscription_items', 'invoices', 'payment_methods', 'usage_tracking', 'webhook_events', 'customer_portal_sessions', 'assets', 'asset_vendor_relationships', 'due_diligence_requirements', 'alerts'))
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND (tablename LIKE 'vs_%' OR tablename IN ('subscriptions', 'subscription_items', 'invoices', 'payment_methods', 'usage_tracking', 'webhook_events', 'customer_portal_sessions', 'assets', 'asset_vendor_relationships', 'due_diligence_requirements', 'alerts'))
ORDER BY tablename;

