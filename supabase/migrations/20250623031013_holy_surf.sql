/*
  # Fix Tier Nomenclature

  1. Database Changes
    - Update tier values to match requirements
    - 'free' = free registered users (can save 1 calculation)
    - 'basic' = Basic plan subscribers ($9/month, unlimited saves)
    - 'premium' = Premium plan subscribers ($29/month, unlimited saves + notes)

  2. Security
    - Update RLS policies to use new tier names
    - Update save limit function to use correct tier logic
    - Update trigger function to create users with 'free' tier by default
*/

-- First, update existing users to use the new tier naming
UPDATE profile SET tier = 'free' WHERE tier = 'basic';

-- Update the tier constraint to use the correct values
ALTER TABLE profile DROP CONSTRAINT IF EXISTS profile_tier_check;
ALTER TABLE profile ADD CONSTRAINT profile_tier_check CHECK (tier IN ('free', 'basic', 'premium'));

-- Update the default tier for new users
ALTER TABLE profile ALTER COLUMN tier SET DEFAULT 'free';

-- Update the save limits function with correct tier logic
CREATE OR REPLACE FUNCTION check_save_limits()
RETURNS TRIGGER AS $$
DECLARE
  user_tier text;
  calculation_count integer;
BEGIN
  -- Only check limits for authenticated users
  IF NEW.user_id IS NOT NULL THEN
    -- Get user tier
    SELECT tier INTO user_tier
    FROM profile
    WHERE id = NEW.user_id;
    
    -- Count existing calculations for this user
    SELECT COUNT(*) INTO calculation_count
    FROM mortgage_calculation
    WHERE user_id = NEW.user_id;
    
    -- Check limits based on tier
    -- 'free' tier = free registered users (can save 1 calculation)
    -- 'basic' tier = Basic plan subscribers ($9/month, unlimited saves)
    -- 'premium' tier = Premium plan subscribers ($29/month, unlimited saves + notes)
    IF user_tier = 'free' AND calculation_count >= 1 THEN
      RAISE EXCEPTION 'Free users can only save 1 calculation. Upgrade to Basic plan for unlimited calculations, or delete your existing calculation to save a new one.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the handle_new_user function to create users with 'free' tier
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name text;
BEGIN
  -- Extract name from metadata with fallbacks
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1),
    'User'
  );

  -- Insert profile with 'free' tier by default
  INSERT INTO profile (id, email, name, tier)
  VALUES (
    NEW.id,
    NEW.email,
    user_name,
    'free'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now()
  WHERE profile.email != EXCLUDED.email;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update comments to reflect the correct tier system
COMMENT ON FUNCTION check_save_limits() IS 'Enforces save limits: tier=free (registered free users) can save 1 calculation, tier=basic/premium (paid users) have unlimited saves';
COMMENT ON FUNCTION handle_new_user() IS 'Automatically creates profile with free tier when new user signs up';