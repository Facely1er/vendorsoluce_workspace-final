/*
  # Fix Profiles RLS Policy for User Signup

  1. Security Policy Updates
    - Drop existing incorrect RLS policies for profiles table
    - Create new RLS policy allowing users to insert their own profile
    - Fix function name from uid() to auth.uid() for proper authentication context

  2. Changes Made
    - Updated INSERT policy to use correct auth.uid() function
    - Ensures users can only create profiles with their own authenticated user ID
    - Maintains security while allowing proper user registration flow
*/

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