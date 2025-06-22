/*
  # Fix profiles table tier default value

  1. Changes
    - Update the default tier from 'public' to 'basic' to match user story requirements
    - Update existing 'public' tier users to 'basic'
    - Update the check constraint to include the correct tier values

  2. Security
    - Maintain existing RLS policies
*/

-- Update the check constraint to use the correct tier values
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_tier_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_tier_check 
  CHECK (tier IN ('basic', 'premium'));

-- Update the default value for tier column
ALTER TABLE profiles ALTER COLUMN tier SET DEFAULT 'basic';

-- Update existing users with 'public' tier to 'basic'
UPDATE profiles SET tier = 'basic' WHERE tier = 'public';

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