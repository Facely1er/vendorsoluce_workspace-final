-- ============================================================================
-- Migration: Fix Multiple Permissive Policies
-- Date: 2025-01-08
-- Description: Consolidates redundant RLS policies by making service role
--              policies specific to service_role only. This prevents multiple
--              permissive policies from being evaluated for the same role/action.
-- ============================================================================

-- Fix vs_customers table policies
-- Make service role policy specific to service_role only
DROP POLICY IF EXISTS "Service role can manage customers" ON vs_customers;
CREATE POLICY "Service role can manage customers" ON vs_customers
  FOR ALL TO service_role USING ((select auth.role()) = 'service_role');

-- Fix vs_prices table policies
-- Make service role policy specific to service_role only
DROP POLICY IF EXISTS "Service role can manage prices" ON vs_prices;
CREATE POLICY "Service role can manage prices" ON vs_prices
  FOR ALL TO service_role USING ((select auth.role()) = 'service_role');

-- Fix vs_subscriptions table policies
-- Make service role policy specific to service_role only
-- Also check for and remove any redundant service role policies
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON vs_subscriptions;
DROP POLICY IF EXISTS "Service role can insert subscriptions" ON vs_subscriptions;
DROP POLICY IF EXISTS "Service role can update subscriptions" ON vs_subscriptions;
DROP POLICY IF EXISTS "Service role can delete subscriptions" ON vs_subscriptions;
DROP POLICY IF EXISTS "Users or service role can view subscriptions" ON vs_subscriptions;

CREATE POLICY "Service role can manage subscriptions" ON vs_subscriptions
  FOR ALL TO service_role USING ((select auth.role()) = 'service_role');

-- Fix vs_payment_methods table policies
-- Make service role policy specific to service_role only
DROP POLICY IF EXISTS "Service role can manage payment methods" ON vs_payment_methods;
CREATE POLICY "Service role can manage payment methods" ON vs_payment_methods
  FOR ALL TO service_role USING ((select auth.role()) = 'service_role');

-- Fix vs_invoices table policies
-- Make service role policy specific to service_role only
DROP POLICY IF EXISTS "Service role can manage invoices" ON vs_invoices;
CREATE POLICY "Service role can manage invoices" ON vs_invoices
  FOR ALL TO service_role USING ((select auth.role()) = 'service_role');

-- Fix vs_usage_records table policies
-- Make service role policy specific to service_role only
-- Also check for and remove any redundant service role policies
DROP POLICY IF EXISTS "Service role can manage usage" ON vs_usage_records;
DROP POLICY IF EXISTS "Service role can insert usage" ON vs_usage_records;
DROP POLICY IF EXISTS "Service role can update usage" ON vs_usage_records;
DROP POLICY IF EXISTS "Service role can delete usage" ON vs_usage_records;
DROP POLICY IF EXISTS "Users or service role can view usage" ON vs_usage_records;

CREATE POLICY "Service role can manage usage" ON vs_usage_records
  FOR ALL TO service_role USING ((select auth.role()) = 'service_role');

