-- Complete Stripe Integration Database Schema
-- File: supabase/migrations/20250101000000_stripe_integration.sql

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
      WHEN s.product_id LIKE '%starter%' THEN ARRAY['NIST']
      WHEN s.product_id LIKE '%professional%' THEN ARRAY['NIST', 'CMMC']
      WHEN s.product_id LIKE '%enterprise%' THEN ARRAY['NIST', 'CMMC', 'SOC2', 'ISO27001', 'FEDRAMP', 'FISMA']
      WHEN s.product_id LIKE '%federal%' THEN ARRAY['FEDRAMP', 'FISMA', 'NIST', 'CMMC']
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
  ON CONFLICT (user_id, tenant_id, subscription_id, metric_name, billing_period_start)
  DO UPDATE SET 
    metric_value = usage_tracking.metric_value + metric_value,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check usage limits
CREATE OR REPLACE FUNCTION check_usage_limit(
  user_uuid UUID,
  metric_name TEXT
)
RETURNS BOOLEAN
SET search_path = public
AS $$
DECLARE
  current_usage INTEGER := 0;
  usage_limit INTEGER := 0;
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
  
  IF user_subscription.id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get current usage for this billing period
  SELECT COALESCE(SUM(metric_value), 0) INTO current_usage
  FROM usage_tracking
  WHERE user_id = user_uuid
  AND subscription_id = user_subscription.id
  AND metric_name = check_usage_limit.metric_name
  AND billing_period_start = user_subscription.current_period_start;
  
  -- Get usage limit based on subscription
  CASE metric_name
    WHEN 'users' THEN
      CASE 
        WHEN user_subscription.product_id LIKE '%starter%' THEN usage_limit := 5;
        WHEN user_subscription.product_id LIKE '%professional%' THEN usage_limit := 25;
        WHEN user_subscription.product_id LIKE '%enterprise%' THEN usage_limit := -1; -- unlimited
        WHEN user_subscription.product_id LIKE '%federal%' THEN usage_limit := -1; -- unlimited
        ELSE usage_limit := 0;
      END CASE;
    WHEN 'vendors' THEN
      CASE 
        WHEN user_subscription.product_id LIKE '%starter%' THEN usage_limit := 25;
        WHEN user_subscription.product_id LIKE '%professional%' THEN usage_limit := 100;
        WHEN user_subscription.product_id LIKE '%enterprise%' THEN usage_limit := -1; -- unlimited
        WHEN user_subscription.product_id LIKE '%federal%' THEN usage_limit := -1; -- unlimited
        ELSE usage_limit := 0;
      END CASE;
    WHEN 'assessments' THEN
      CASE 
        WHEN user_subscription.product_id LIKE '%starter%' THEN usage_limit := 100;
        WHEN user_subscription.product_id LIKE '%professional%' THEN usage_limit := 500;
        WHEN user_subscription.product_id LIKE '%enterprise%' THEN usage_limit := -1; -- unlimited
        WHEN user_subscription.product_id LIKE '%federal%' THEN usage_limit := -1; -- unlimited
        ELSE usage_limit := 0;
      END CASE;
    ELSE
      usage_limit := -1; -- unlimited for unknown metrics
  END CASE;
  
  -- Check if usage is within limits
  IF usage_limit = -1 THEN
    RETURN TRUE; -- unlimited
  ELSE
    RETURN current_usage < usage_limit;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Stripe integration database schema created successfully!';
  RAISE NOTICE 'Tables created: subscriptions, subscription_items, invoices, payment_methods, usage_tracking, webhook_events, customer_portal_sessions';
  RAISE NOTICE 'RLS policies enabled for all tables';
  RAISE NOTICE 'Helper functions created: get_user_subscription_limits, user_has_feature_access, track_usage, check_usage_limit, get_subscription_analytics';
  RAISE NOTICE 'Indexes created for optimal performance';
END $$;
