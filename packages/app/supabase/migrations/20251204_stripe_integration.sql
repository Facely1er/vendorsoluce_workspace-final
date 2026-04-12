/*
  # Stripe Integration - Subscription and Payment Tables

  ## Overview
  This migration adds tables needed for Stripe payment processing and subscription management.

  ## New Tables
  - `vs_subscriptions` - Tracks active subscriptions
  - `vs_customers` - Stripe customer mapping
  - `vs_prices` - Product pricing tiers
  - `vs_payment_methods` - Saved payment methods
  - `vs_invoices` - Invoice records
  - `vs_usage_records` - Usage tracking for metered billing
  
  ## Security
  - RLS policies ensure users can only access their own billing data
  - Stripe webhook endpoints will use service role for updates
*/

-- ============================================================================
-- STEP 1: Create Stripe Customer Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS vs_customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES vs_profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_vs_customers_user_id ON vs_customers(user_id);
CREATE INDEX idx_vs_customers_stripe_id ON vs_customers(stripe_customer_id);

-- ============================================================================
-- STEP 2: Create Prices Table (Product Catalog)
-- ============================================================================

CREATE TABLE IF NOT EXISTS vs_prices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  stripe_price_id TEXT UNIQUE NOT NULL,
  stripe_product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  price_amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  interval TEXT, -- 'month' or 'year'
  interval_count INTEGER DEFAULT 1,
  tier TEXT NOT NULL, -- 'free', 'starter', 'professional', 'enterprise'
  features JSONB, -- Feature list and limits
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
   '{"vendors": -1, "sbom_scans": -1, "assessments": -1, "users": -1, "api_calls": -1, "features": ["all_features", "sso", "custom_integrations", "dedicated_support", "sla"]}'::jsonb);

-- ============================================================================
-- STEP 3: Create Subscriptions Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS vs_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES vs_profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  price_id UUID REFERENCES vs_prices(id),
  status TEXT NOT NULL, -- 'trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid'
  tier TEXT NOT NULL, -- 'free', 'starter', 'professional', 'enterprise'
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

-- Create indexes
CREATE INDEX idx_vs_subscriptions_user_id ON vs_subscriptions(user_id);
CREATE INDEX idx_vs_subscriptions_stripe_id ON vs_subscriptions(stripe_subscription_id);
CREATE INDEX idx_vs_subscriptions_status ON vs_subscriptions(status);

-- ============================================================================
-- STEP 4: Create Payment Methods Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS vs_payment_methods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES vs_profiles(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- 'card', 'bank_account', etc.
  card_brand TEXT, -- 'visa', 'mastercard', etc.
  card_last4 TEXT,
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vs_payment_methods_user_id ON vs_payment_methods(user_id);

-- ============================================================================
-- STEP 5: Create Invoices Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS vs_invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES vs_profiles(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  subscription_id UUID REFERENCES vs_subscriptions(id),
  amount_paid INTEGER, -- Amount in cents
  amount_due INTEGER,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL, -- 'draft', 'open', 'paid', 'uncollectible', 'void'
  invoice_pdf TEXT, -- URL to PDF
  hosted_invoice_url TEXT, -- Stripe hosted invoice page
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vs_invoices_user_id ON vs_invoices(user_id);
CREATE INDEX idx_vs_invoices_stripe_id ON vs_invoices(stripe_invoice_id);

-- ============================================================================
-- STEP 6: Create Usage Records Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS vs_usage_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES vs_profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES vs_subscriptions(id),
  feature TEXT NOT NULL, -- 'sbom_scans', 'vendor_assessments', 'api_calls'
  quantity INTEGER DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vs_usage_records_user_id ON vs_usage_records(user_id);
CREATE INDEX idx_vs_usage_records_period ON vs_usage_records(period_start, period_end);

-- ============================================================================
-- STEP 7: Add subscription fields to profiles
-- ============================================================================

ALTER TABLE vs_profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;

-- ============================================================================
-- STEP 8: Create RLS Policies
-- ============================================================================

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

-- ============================================================================
-- STEP 9: Create helper functions
-- ============================================================================

-- Function to increment usage
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
  ON CONFLICT (user_id, feature, period_start) DO UPDATE
  SET quantity = vs_usage_records.quantity + EXCLUDED.quantity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check usage limits
-- Drop old version first if it exists (may have different return type)
DROP FUNCTION IF EXISTS check_usage_limit(UUID, TEXT);
DROP FUNCTION IF EXISTS check_usage_limit(UUID, TEXT, TEXT);

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
  -- Get user's subscription tier
  SELECT subscription_tier INTO v_tier
  FROM vs_profiles
  WHERE id = p_user_id;

  -- Get limit for this feature and tier
  SELECT (features->p_feature)::INTEGER INTO v_limit
  FROM vs_prices
  WHERE tier = v_tier
  LIMIT 1;

  -- Get current usage
  SELECT COALESCE(SUM(quantity), 0)::INTEGER INTO v_used
  FROM vs_usage_records
  WHERE user_id = p_user_id
    AND feature = p_feature
    AND period_start = date_trunc('month', NOW());

  -- Return results
  RETURN QUERY
  SELECT 
    v_used,
    v_limit,
    (v_limit = -1 OR v_used < v_limit) AS can_use;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 10: Create updated_at trigger
-- ============================================================================

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