# SQL to Paste into Supabase SQL Editor

## Migration 1: Fix Function Search Path Security Warnings

Copy and paste this entire block into Supabase SQL Editor:

```sql
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
```

---

## Migration 2: Fix RLS Policy Performance Issues

After running Migration 1, copy and paste this entire block:

```sql
-- ============================================================================
-- Migration: Fix RLS Policy Performance Issues
-- Date: 2025-01-08
-- Description: Fixes auth_rls_initplan warnings by wrapping auth.uid() and
--              auth.role() calls in (select ...) to prevent re-evaluation
--              for each row. This improves query performance at scale.
-- ============================================================================

-- Fix subscriptions table policies
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON subscriptions;
CREATE POLICY "Users can insert their own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own subscriptions" ON subscriptions;
CREATE POLICY "Users can update their own subscriptions" ON subscriptions
  FOR UPDATE USING ((select auth.uid()) = user_id);

-- Fix subscription_items table policies
DROP POLICY IF EXISTS "Users can view their own subscription items" ON subscription_items;
CREATE POLICY "Users can view their own subscription items" ON subscription_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM subscriptions 
      WHERE subscriptions.id = subscription_items.subscription_id 
      AND subscriptions.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert their own subscription items" ON subscription_items;
CREATE POLICY "Users can insert their own subscription items" ON subscription_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM subscriptions 
      WHERE subscriptions.id = subscription_items.subscription_id 
      AND subscriptions.user_id = (select auth.uid())
    )
  );

-- Fix invoices table policies
DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
CREATE POLICY "Users can view their own invoices" ON invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM subscriptions 
      WHERE subscriptions.id = invoices.subscription_id 
      AND subscriptions.user_id = (select auth.uid())
    )
  );

-- Fix payment_methods table policies
DROP POLICY IF EXISTS "Users can view their own payment methods" ON payment_methods;
CREATE POLICY "Users can view their own payment methods" ON payment_methods
  FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own payment methods" ON payment_methods;
CREATE POLICY "Users can insert their own payment methods" ON payment_methods
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own payment methods" ON payment_methods;
CREATE POLICY "Users can update their own payment methods" ON payment_methods
  FOR UPDATE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own payment methods" ON payment_methods;
CREATE POLICY "Users can delete their own payment methods" ON payment_methods
  FOR DELETE USING ((select auth.uid()) = user_id);

-- Fix usage_tracking table policies
DROP POLICY IF EXISTS "Users can view their own usage tracking" ON usage_tracking;
CREATE POLICY "Users can view their own usage tracking" ON usage_tracking
  FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own usage tracking" ON usage_tracking;
CREATE POLICY "Users can insert their own usage tracking" ON usage_tracking
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own usage tracking" ON usage_tracking;
CREATE POLICY "Users can update their own usage tracking" ON usage_tracking
  FOR UPDATE USING ((select auth.uid()) = user_id);

-- Fix customer_portal_sessions table policies
DROP POLICY IF EXISTS "Users can view their own portal sessions" ON customer_portal_sessions;
CREATE POLICY "Users can view their own portal sessions" ON customer_portal_sessions
  FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own portal sessions" ON customer_portal_sessions;
CREATE POLICY "Users can insert their own portal sessions" ON customer_portal_sessions
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- Fix vs_vendor_assessments table policies
DROP POLICY IF EXISTS "Users can read own vendor assessments" ON vs_vendor_assessments;
CREATE POLICY "Users can read own vendor assessments" ON vs_vendor_assessments
  FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own vendor assessments" ON vs_vendor_assessments;
CREATE POLICY "Users can insert own vendor assessments" ON vs_vendor_assessments
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own vendor assessments" ON vs_vendor_assessments;
CREATE POLICY "Users can update own vendor assessments" ON vs_vendor_assessments
  FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own vendor assessments" ON vs_vendor_assessments;
CREATE POLICY "Users can delete own vendor assessments" ON vs_vendor_assessments
  FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

-- Fix vs_assessment_responses table policies
DROP POLICY IF EXISTS "Users can read responses for own assessments" ON vs_assessment_responses;
CREATE POLICY "Users can read responses for own assessments" ON vs_assessment_responses
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM vs_vendor_assessments 
      WHERE id = assessment_id AND user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert responses for own assessments" ON vs_assessment_responses;
CREATE POLICY "Users can insert responses for own assessments" ON vs_assessment_responses
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM vs_vendor_assessments 
      WHERE id = assessment_id AND user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update responses for own assessments" ON vs_assessment_responses;
CREATE POLICY "Users can update responses for own assessments" ON vs_assessment_responses
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM vs_vendor_assessments 
      WHERE id = assessment_id AND user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete responses for own assessments" ON vs_assessment_responses;
CREATE POLICY "Users can delete responses for own assessments" ON vs_assessment_responses
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM vs_vendor_assessments 
      WHERE id = assessment_id AND user_id = (select auth.uid())
    )
  );

-- Fix vs_profiles table policies
DROP POLICY IF EXISTS "Users can read own profile" ON vs_profiles;
CREATE POLICY "Users can read own profile" ON vs_profiles
  FOR SELECT TO authenticated USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON vs_profiles;
CREATE POLICY "Users can update own profile" ON vs_profiles
  FOR UPDATE TO authenticated USING ((select auth.uid()) = id) WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON vs_profiles;
CREATE POLICY "Users can insert own profile" ON vs_profiles
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = id);

-- Fix vs_vendors table policies
DROP POLICY IF EXISTS "Users can read own vendors" ON vs_vendors;
CREATE POLICY "Users can read own vendors" ON vs_vendors
  FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own vendors" ON vs_vendors;
CREATE POLICY "Users can insert own vendors" ON vs_vendors
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own vendors" ON vs_vendors;
CREATE POLICY "Users can update own vendors" ON vs_vendors
  FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own vendors" ON vs_vendors;
CREATE POLICY "Users can delete own vendors" ON vs_vendors
  FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

-- Fix vs_sbom_analyses table policies
DROP POLICY IF EXISTS "Users can read own SBOM analyses" ON vs_sbom_analyses;
CREATE POLICY "Users can read own SBOM analyses" ON vs_sbom_analyses
  FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own SBOM analyses" ON vs_sbom_analyses;
CREATE POLICY "Users can insert own SBOM analyses" ON vs_sbom_analyses
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own SBOM analyses" ON vs_sbom_analyses;
CREATE POLICY "Users can update own SBOM analyses" ON vs_sbom_analyses
  FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own SBOM analyses" ON vs_sbom_analyses;
CREATE POLICY "Users can delete own SBOM analyses" ON vs_sbom_analyses
  FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

-- Fix vs_supply_chain_assessments table policies
DROP POLICY IF EXISTS "Users can read own assessments" ON vs_supply_chain_assessments;
CREATE POLICY "Users can read own assessments" ON vs_supply_chain_assessments
  FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own assessments" ON vs_supply_chain_assessments;
CREATE POLICY "Users can insert own assessments" ON vs_supply_chain_assessments
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own assessments" ON vs_supply_chain_assessments;
CREATE POLICY "Users can update own assessments" ON vs_supply_chain_assessments
  FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own assessments" ON vs_supply_chain_assessments;
CREATE POLICY "Users can delete own assessments" ON vs_supply_chain_assessments
  FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

-- Fix assets table policies
DROP POLICY IF EXISTS "Users can view their own assets" ON assets;
CREATE POLICY "Users can view their own assets" ON assets
  FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own assets" ON assets;
CREATE POLICY "Users can insert their own assets" ON assets
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own assets" ON assets;
CREATE POLICY "Users can update their own assets" ON assets
  FOR UPDATE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own assets" ON assets;
CREATE POLICY "Users can delete their own assets" ON assets
  FOR DELETE USING ((select auth.uid()) = user_id);

-- Fix asset_vendor_relationships table policies
DROP POLICY IF EXISTS "Users can view their asset-vendor relationships" ON asset_vendor_relationships;
CREATE POLICY "Users can view their asset-vendor relationships" ON asset_vendor_relationships
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM assets WHERE assets.id = asset_vendor_relationships.asset_id AND assets.user_id = (select auth.uid()))
  );

DROP POLICY IF EXISTS "Users can insert their asset-vendor relationships" ON asset_vendor_relationships;
CREATE POLICY "Users can insert their asset-vendor relationships" ON asset_vendor_relationships
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM assets WHERE assets.id = asset_vendor_relationships.asset_id AND assets.user_id = (select auth.uid()))
  );

DROP POLICY IF EXISTS "Users can update their asset-vendor relationships" ON asset_vendor_relationships;
CREATE POLICY "Users can update their asset-vendor relationships" ON asset_vendor_relationships
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM assets WHERE assets.id = asset_vendor_relationships.asset_id AND assets.user_id = (select auth.uid()))
  );

DROP POLICY IF EXISTS "Users can delete their asset-vendor relationships" ON asset_vendor_relationships;
CREATE POLICY "Users can delete their asset-vendor relationships" ON asset_vendor_relationships
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM assets WHERE assets.id = asset_vendor_relationships.asset_id AND assets.user_id = (select auth.uid()))
  );

-- Fix due_diligence_requirements table policies
DROP POLICY IF EXISTS "Users can view their due diligence requirements" ON due_diligence_requirements;
CREATE POLICY "Users can view their due diligence requirements" ON due_diligence_requirements
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM assets WHERE assets.id = due_diligence_requirements.asset_id AND assets.user_id = (select auth.uid()))
  );

DROP POLICY IF EXISTS "Users can insert their due diligence requirements" ON due_diligence_requirements;
CREATE POLICY "Users can insert their due diligence requirements" ON due_diligence_requirements
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM assets WHERE assets.id = due_diligence_requirements.asset_id AND assets.user_id = (select auth.uid()))
  );

DROP POLICY IF EXISTS "Users can update their due diligence requirements" ON due_diligence_requirements;
CREATE POLICY "Users can update their due diligence requirements" ON due_diligence_requirements
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM assets WHERE assets.id = due_diligence_requirements.asset_id AND assets.user_id = (select auth.uid()))
  );

DROP POLICY IF EXISTS "Users can delete their due diligence requirements" ON due_diligence_requirements;
CREATE POLICY "Users can delete their due diligence requirements" ON due_diligence_requirements
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM assets WHERE assets.id = due_diligence_requirements.asset_id AND assets.user_id = (select auth.uid()))
  );

-- Fix alerts table policies
DROP POLICY IF EXISTS "Users can view their alerts" ON alerts;
CREATE POLICY "Users can view their alerts" ON alerts
  FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their alerts" ON alerts;
CREATE POLICY "Users can update their alerts" ON alerts
  FOR UPDATE USING ((select auth.uid()) = user_id);

-- Fix vs_customers table policies
DROP POLICY IF EXISTS "Users can view own customer record" ON vs_customers;
CREATE POLICY "Users can view own customer record" ON vs_customers
  FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Service role can manage customers" ON vs_customers;
CREATE POLICY "Service role can manage customers" ON vs_customers
  FOR ALL USING ((select auth.role()) = 'service_role');

-- Fix vs_prices table policies (auth.role() fix)
DROP POLICY IF EXISTS "Service role can manage prices" ON vs_prices;
CREATE POLICY "Service role can manage prices" ON vs_prices
  FOR ALL USING ((select auth.role()) = 'service_role');

-- Fix vs_subscriptions table policies
DROP POLICY IF EXISTS "Users can view own subscriptions" ON vs_subscriptions;
CREATE POLICY "Users can view own subscriptions" ON vs_subscriptions
  FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Service role can manage subscriptions" ON vs_subscriptions;
CREATE POLICY "Service role can manage subscriptions" ON vs_subscriptions
  FOR ALL USING ((select auth.role()) = 'service_role');

-- Fix vs_payment_methods table policies
DROP POLICY IF EXISTS "Users can view own payment methods" ON vs_payment_methods;
CREATE POLICY "Users can view own payment methods" ON vs_payment_methods
  FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own payment methods" ON vs_payment_methods;
CREATE POLICY "Users can delete own payment methods" ON vs_payment_methods
  FOR DELETE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Service role can manage payment methods" ON vs_payment_methods;
CREATE POLICY "Service role can manage payment methods" ON vs_payment_methods
  FOR ALL USING ((select auth.role()) = 'service_role');

-- Fix vs_invoices table policies
DROP POLICY IF EXISTS "Users can view own invoices" ON vs_invoices;
CREATE POLICY "Users can view own invoices" ON vs_invoices
  FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Service role can manage invoices" ON vs_invoices;
CREATE POLICY "Service role can manage invoices" ON vs_invoices
  FOR ALL USING ((select auth.role()) = 'service_role');

-- Fix vs_usage_records table policies
DROP POLICY IF EXISTS "Users can view own usage" ON vs_usage_records;
CREATE POLICY "Users can view own usage" ON vs_usage_records
  FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Service role can manage usage" ON vs_usage_records;
CREATE POLICY "Service role can manage usage" ON vs_usage_records
  FOR ALL USING ((select auth.role()) = 'service_role');
```

---

## Instructions

1. **Go to Supabase Dashboard** → Your Project → **SQL Editor**
2. **Run Migration 1 first** (Fix Function Search Path)
   - Copy the entire first SQL block above
   - Paste into SQL Editor
   - Click **Run**
3. **Then run Migration 2** (Fix RLS Policy Performance)
   - Copy the entire second SQL block above
   - Paste into SQL Editor
   - Click **Run**
4. **Verify** by checking the Database Linter - warnings should be gone!

