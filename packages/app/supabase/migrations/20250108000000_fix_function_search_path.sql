-- ============================================================================
-- Migration: Fix Function Search Path Security Warnings
-- Date: 2025-01-08
-- Description: Adds SET search_path to all functions to prevent search path
--              manipulation attacks and resolve database linter warnings
-- ============================================================================

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Fix get_user_subscription_limits function
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
      WHEN s.product_id LIKE '%starter%' THEN '10GB'
      WHEN s.product_id LIKE '%professional%' THEN '100GB'
      WHEN s.product_id LIKE '%enterprise%' THEN 'unlimited'
      WHEN s.product_id LIKE '%federal%' THEN 'unlimited'
      ELSE '0GB'
    END as storage_limit,
    CASE 
      WHEN s.product_id LIKE '%starter%' THEN ARRAY['SOC2']::TEXT[]
      WHEN s.product_id LIKE '%professional%' THEN ARRAY['SOC2', 'ISO27001', 'GDPR']::TEXT[]
      WHEN s.product_id LIKE '%enterprise%' THEN ARRAY['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'NIST']::TEXT[]
      WHEN s.product_id LIKE '%federal%' THEN ARRAY['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'NIST', 'FedRAMP']::TEXT[]
      ELSE ARRAY[]::TEXT[]
    END as compliance_frameworks,
    s.billing_model,
    s.product_id as product_name
  FROM subscriptions s
  WHERE s.user_id = user_uuid 
  AND s.status = 'active'
  AND (s.current_period_end IS NULL OR s.current_period_end > NOW())
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix user_has_feature_access function
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
        has_access := user_subscription.product_id LIKE '%professional%' OR 
                     user_subscription.product_id LIKE '%enterprise%' OR 
                     user_subscription.product_id LIKE '%federal%';
      WHEN 'custom_integrations' THEN
        has_access := user_subscription.product_id LIKE '%enterprise%' OR 
                     user_subscription.product_id LIKE '%federal%';
      WHEN 'priority_support' THEN
        has_access := user_subscription.product_id LIKE '%professional%' OR 
                     user_subscription.product_id LIKE '%enterprise%' OR 
                     user_subscription.product_id LIKE '%federal%';
      ELSE
        has_access := TRUE;
    END CASE;
  END IF;
  
  RETURN has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix track_usage function
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

-- Fix get_subscription_analytics function
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
            WHEN product_id LIKE '%starter%' THEN 49000
            WHEN product_id LIKE '%professional%' THEN 149000
            WHEN product_id LIKE '%enterprise%' THEN 449000
            WHEN product_id LIKE '%federal%' THEN 999000
            ELSE 0
          END
        ELSE 0
      END
    ), 0) as annual_revenue,
    COALESCE(SUM(
      CASE 
        WHEN product_id LIKE '%starter%' THEN 
          CASE WHEN billing_model = 'monthly' THEN 4900 ELSE 49000 END
        WHEN product_id LIKE '%professional%' THEN 
          CASE WHEN billing_model = 'monthly' THEN 14900 ELSE 149000 END
        WHEN product_id LIKE '%enterprise%' THEN 
          CASE WHEN billing_model = 'monthly' THEN 44900 ELSE 449000 END
        WHEN product_id LIKE '%federal%' THEN 
          CASE WHEN billing_model = 'monthly' THEN 99900 ELSE 999000 END
        ELSE 0
      END
    ), 0) as total_revenue,
    COALESCE(AVG(
      CASE 
        WHEN product_id LIKE '%starter%' THEN 
          CASE WHEN billing_model = 'monthly' THEN 4900 ELSE 49000 END
        WHEN product_id LIKE '%professional%' THEN 
          CASE WHEN billing_model = 'monthly' THEN 14900 ELSE 149000 END
        WHEN product_id LIKE '%enterprise%' THEN 
          CASE WHEN billing_model = 'monthly' THEN 44900 ELSE 449000 END
        WHEN product_id LIKE '%federal%' THEN 
          CASE WHEN billing_model = 'monthly' THEN 99900 ELSE 999000 END
        ELSE 0
      END
    ), 0) as average_revenue_per_user
  FROM subscriptions
  WHERE status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix increment_usage function
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

-- Fix check_usage_limit function
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

-- Fix update_updated_at function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

