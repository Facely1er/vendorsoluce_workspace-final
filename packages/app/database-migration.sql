-- Stripe Integration Database Migration
-- Run this in your Supabase SQL Editor

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  product_id TEXT NOT NULL,
  tenant_id TEXT DEFAULT 'default',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  last_payment_date TIMESTAMP WITH TIME ZONE,
  last_payment_failed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription_items table for add-ons
CREATE TABLE IF NOT EXISTS subscription_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  stripe_item_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  card_brand TEXT,
  card_last_four TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage_tracking table for billing
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id TEXT DEFAULT 'default',
  metric_name TEXT NOT NULL,
  metric_value INTEGER DEFAULT 0,
  billing_period_start TIMESTAMP WITH TIME ZONE,
  billing_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscription_items_subscription_id ON subscription_items(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_tenant_id ON usage_tracking(tenant_id);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

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

CREATE POLICY "Users can view their own invoices" ON invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM subscriptions 
      WHERE subscriptions.id = invoices.subscription_id 
      AND subscriptions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own payment methods" ON payment_methods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment methods" ON payment_methods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods" ON payment_methods
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods" ON payment_methods
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own usage tracking" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage tracking" ON usage_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage tracking" ON usage_tracking
  FOR UPDATE USING (auth.uid() = user_id);

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
  compliance_frameworks TEXT[]
)
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN s.product_id = 'starter-monthly' THEN 5
      WHEN s.product_id = 'professional-monthly' THEN 25
      WHEN s.product_id = 'enterprise-monthly' THEN -1
      WHEN s.product_id = 'federal-monthly' THEN -1
      ELSE 0
    END as max_users,
    CASE 
      WHEN s.product_id = 'starter-monthly' THEN 25
      WHEN s.product_id = 'professional-monthly' THEN 100
      WHEN s.product_id = 'enterprise-monthly' THEN -1
      WHEN s.product_id = 'federal-monthly' THEN -1
      ELSE 0
    END as max_vendors,
    CASE 
      WHEN s.product_id = 'starter-monthly' THEN 100
      WHEN s.product_id = 'professional-monthly' THEN 500
      WHEN s.product_id = 'enterprise-monthly' THEN -1
      WHEN s.product_id = 'federal-monthly' THEN -1
      ELSE 0
    END as max_assessments,
    CASE 
      WHEN s.product_id = 'starter-monthly' THEN '1GB'
      WHEN s.product_id = 'professional-monthly' THEN '10GB'
      WHEN s.product_id = 'enterprise-monthly' THEN '100GB'
      WHEN s.product_id = 'federal-monthly' THEN '1TB'
      ELSE '0GB'
    END as storage_limit,
    CASE 
      WHEN s.product_id = 'starter-monthly' THEN ARRAY['NIST']
      WHEN s.product_id = 'professional-monthly' THEN ARRAY['NIST', 'CMMC']
      WHEN s.product_id = 'enterprise-monthly' THEN ARRAY['NIST', 'CMMC', 'SOC2', 'ISO27001', 'FEDRAMP', 'FISMA']
      WHEN s.product_id = 'federal-monthly' THEN ARRAY['FEDRAMP', 'FISMA', 'NIST', 'CMMC']
      ELSE ARRAY[]::TEXT[]
    END as compliance_frameworks
  FROM subscriptions s
  WHERE s.user_id = user_uuid 
  AND s.status = 'active'
  AND (s.current_period_end IS NULL OR s.current_period_end > NOW())
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
BEGIN
  -- Check if user has active subscription
  SELECT EXISTS(
    SELECT 1 FROM subscriptions 
    WHERE user_id = user_uuid 
    AND status = 'active'
    AND (current_period_end IS NULL OR current_period_end > NOW())
  ) INTO has_access;
  
  -- Additional feature-specific checks can be added here
  RETURN has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Stripe integration database schema created successfully!';
  RAISE NOTICE 'Tables created: subscriptions, subscription_items, invoices, payment_methods, usage_tracking';
  RAISE NOTICE 'RLS policies enabled for all tables';
  RAISE NOTICE 'Helper functions created: get_user_subscription_limits, user_has_feature_access';
END $$;
