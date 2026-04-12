-- ============================================================================
-- Migration: Fix Duplicate Permissive Policies
-- Date: 2025-01-20
-- Description: Removes duplicate permissive RLS policies that cause performance
--              issues. Consolidates policies to one per role/action combination.
-- ============================================================================

-- Fix assets table: Remove duplicate INSERT policies
-- Keep "Users can insert their own assets", drop "Users can create their own assets"
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'assets') THEN
    DROP POLICY IF EXISTS "Users can create their own assets" ON assets;
    
    -- Ensure we have the correct single policy for INSERT
    DROP POLICY IF EXISTS "Users can insert their own assets" ON assets;
    CREATE POLICY "Users can insert their own assets" ON assets
      FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
  END IF;
END $$;

-- Fix profiles table: Remove duplicate SELECT policies
-- Keep "Users can read own profile", drop "Users can view own profile"
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
    
    -- Ensure we have the correct single policy for SELECT
    DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
    CREATE POLICY "Users can read own profile" ON profiles
      FOR SELECT TO authenticated USING ((select auth.uid()) = id);
  END IF;
END $$;

-- Fix vs_profiles table: Remove duplicate SELECT policies
-- Keep "Users can read own profile", drop "Users can view own profile"
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vs_profiles') THEN
    DROP POLICY IF EXISTS "Users can view own profile" ON vs_profiles;
    
    -- Ensure we have the correct single policy for SELECT
    DROP POLICY IF EXISTS "Users can read own profile" ON vs_profiles;
    CREATE POLICY "Users can read own profile" ON vs_profiles
      FOR SELECT TO authenticated USING ((select auth.uid()) = id);
  END IF;
END $$;

