-- ============================================================================
-- Migration: Fix RLS Enabled No Policy
-- Date: 2025-01-08
-- Description: Adds RLS policies for tables that have RLS enabled but no
--              policies exist. This fixes security warnings.
-- ============================================================================

-- Fix profiles table policies
-- Users should be able to read, update, and insert their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can read own profile'
  ) THEN
    CREATE POLICY "Users can read own profile" ON profiles
      FOR SELECT TO authenticated USING ((select auth.uid()) = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON profiles
      FOR UPDATE TO authenticated USING ((select auth.uid()) = id) WITH CHECK ((select auth.uid()) = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile" ON profiles
      FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = id);
  END IF;
END $$;

-- Fix webhook_events table policies
-- Webhook events are service-level only - only service role can access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'webhook_events' 
    AND policyname = 'Service role can manage webhook events'
  ) THEN
    CREATE POLICY "Service role can manage webhook events" ON webhook_events
      FOR ALL TO service_role USING ((select auth.role()) = 'service_role');
  END IF;
END $$;

