/*
  # Fix name handling in user signup process

  1. Database Changes
    - Revert name column back to NOT NULL since we should always have a name
    - Update the handle_new_user trigger function to properly extract name from user metadata
  
  2. Security
    - Ensure the trigger function handles the name properly from auth.users metadata
*/

-- First, let's make sure we have the proper trigger function that handles name from metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, tier)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'User'),
    'public'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Revert name column back to NOT NULL since we should always have a name
ALTER TABLE profiles ALTER COLUMN name SET NOT NULL;