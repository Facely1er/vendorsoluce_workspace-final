/*
  # Add is_first_login column to profiles table

  1. New Columns
    - `is_first_login` (boolean, default true)
      - Tracks whether this is the user's first login to trigger onboarding flow
      - Defaults to true for new users
      - Can be set to false once onboarding is completed

  2. Changes
    - Add is_first_login column to existing profiles table
    - Set safe default value for existing users
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_first_login'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_first_login boolean DEFAULT true;
  END IF;
END $$;