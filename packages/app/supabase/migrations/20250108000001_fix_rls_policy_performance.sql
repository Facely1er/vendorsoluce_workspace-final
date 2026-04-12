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

-- Fix vs_vendor_assessments table policies (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vs_vendor_assessments') THEN
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
  END IF;
END $$;

-- Fix vs_assessment_responses table policies (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vs_assessment_responses') THEN
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
  END IF;
END $$;

-- Fix vs_profiles table policies (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vs_profiles') THEN
    DROP POLICY IF EXISTS "Users can read own profile" ON vs_profiles;
    CREATE POLICY "Users can read own profile" ON vs_profiles
      FOR SELECT TO authenticated USING ((select auth.uid()) = id);

    DROP POLICY IF EXISTS "Users can update own profile" ON vs_profiles;
    CREATE POLICY "Users can update own profile" ON vs_profiles
      FOR UPDATE TO authenticated USING ((select auth.uid()) = id) WITH CHECK ((select auth.uid()) = id);

    DROP POLICY IF EXISTS "Users can insert own profile" ON vs_profiles;
    CREATE POLICY "Users can insert own profile" ON vs_profiles
      FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = id);
  END IF;
END $$;

-- Fix vs_vendors table policies (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vs_vendors') THEN
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
  END IF;
END $$;

-- Fix vs_sbom_analyses table policies (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vs_sbom_analyses') THEN
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
  END IF;
END $$;

-- Fix vs_supply_chain_assessments table policies (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vs_supply_chain_assessments') THEN
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
  END IF;
END $$;

-- Fix assets table policies (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'assets') THEN
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
  END IF;
END $$;

-- Fix asset_vendor_relationships table policies (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'asset_vendor_relationships') THEN
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
  END IF;
END $$;

-- Fix due_diligence_requirements table policies (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'due_diligence_requirements') THEN
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
  END IF;
END $$;

-- Fix alerts table policies (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'alerts') THEN
    DROP POLICY IF EXISTS "Users can view their alerts" ON alerts;
    CREATE POLICY "Users can view their alerts" ON alerts
      FOR SELECT USING ((select auth.uid()) = user_id);

    DROP POLICY IF EXISTS "Users can update their alerts" ON alerts;
    CREATE POLICY "Users can update their alerts" ON alerts
      FOR UPDATE USING ((select auth.uid()) = user_id);
  END IF;
END $$;

-- Fix vs_customers table policies (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vs_customers') THEN
    DROP POLICY IF EXISTS "Users can view own customer record" ON vs_customers;
    CREATE POLICY "Users can view own customer record" ON vs_customers
      FOR SELECT USING ((select auth.uid()) = user_id);

    DROP POLICY IF EXISTS "Service role can manage customers" ON vs_customers;
    CREATE POLICY "Service role can manage customers" ON vs_customers
      FOR ALL USING ((select auth.role()) = 'service_role');
  END IF;
END $$;

-- Fix vs_prices table policies (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vs_prices') THEN
    DROP POLICY IF EXISTS "Service role can manage prices" ON vs_prices;
    CREATE POLICY "Service role can manage prices" ON vs_prices
      FOR ALL USING ((select auth.role()) = 'service_role');
  END IF;
END $$;

-- Fix vs_subscriptions table policies (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vs_subscriptions') THEN
    DROP POLICY IF EXISTS "Users can view own subscriptions" ON vs_subscriptions;
    CREATE POLICY "Users can view own subscriptions" ON vs_subscriptions
      FOR SELECT USING ((select auth.uid()) = user_id);

    DROP POLICY IF EXISTS "Service role can manage subscriptions" ON vs_subscriptions;
    CREATE POLICY "Service role can manage subscriptions" ON vs_subscriptions
      FOR ALL USING ((select auth.role()) = 'service_role');
  END IF;
END $$;

-- Fix vs_payment_methods table policies (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vs_payment_methods') THEN
    DROP POLICY IF EXISTS "Users can view own payment methods" ON vs_payment_methods;
    CREATE POLICY "Users can view own payment methods" ON vs_payment_methods
      FOR SELECT USING ((select auth.uid()) = user_id);

    DROP POLICY IF EXISTS "Users can delete own payment methods" ON vs_payment_methods;
    CREATE POLICY "Users can delete own payment methods" ON vs_payment_methods
      FOR DELETE USING ((select auth.uid()) = user_id);

    DROP POLICY IF EXISTS "Service role can manage payment methods" ON vs_payment_methods;
    CREATE POLICY "Service role can manage payment methods" ON vs_payment_methods
      FOR ALL USING ((select auth.role()) = 'service_role');
  END IF;
END $$;

-- Fix vs_invoices table policies (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vs_invoices') THEN
    DROP POLICY IF EXISTS "Users can view own invoices" ON vs_invoices;
    CREATE POLICY "Users can view own invoices" ON vs_invoices
      FOR SELECT USING ((select auth.uid()) = user_id);

    DROP POLICY IF EXISTS "Service role can manage invoices" ON vs_invoices;
    CREATE POLICY "Service role can manage invoices" ON vs_invoices
      FOR ALL USING ((select auth.role()) = 'service_role');
  END IF;
END $$;

-- Fix vs_usage_records table policies (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vs_usage_records') THEN
    DROP POLICY IF EXISTS "Users can view own usage" ON vs_usage_records;
    CREATE POLICY "Users can view own usage" ON vs_usage_records
      FOR SELECT USING ((select auth.uid()) = user_id);

    DROP POLICY IF EXISTS "Service role can manage usage" ON vs_usage_records;
    CREATE POLICY "Service role can manage usage" ON vs_usage_records
      FOR ALL USING ((select auth.role()) = 'service_role');
  END IF;
END $$;

