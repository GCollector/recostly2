/*
  # Fix profiles tier constraint and default values

  1. Changes
    - Update existing 'public' tier users to 'basic' tier
    - Drop and recreate the tier constraint to only allow 'basic' and 'premium'
    - Update default value for tier column to 'basic'
    - Update handle_new_user function to use 'basic' as default

  2. Security
    - Maintain existing RLS policies
    - Ensure all existing data is preserved with updated tier values
*/

-- First, update existing users with 'public' tier to 'basic'
UPDATE profiles SET tier = 'basic' WHERE tier = 'public';

-- Drop the existing check constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_tier_check;

-- Add the new check constraint with only 'basic' and 'premium'
ALTER TABLE profiles ADD CONSTRAINT profiles_tier_check 
  CHECK (tier IN ('basic', 'premium'));

-- Update the default value for tier column
ALTER TABLE profiles ALTER COLUMN tier SET DEFAULT 'basic';

-- Update the handle_new_user function to use 'basic' as default
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, tier)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'basic'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;