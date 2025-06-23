/*
  # Fix Tier Nomenclature Migration

  1. Updates existing tier values from 'basic' to 'free' for free users
  2. Updates database constraints to use correct tier values
  3. Updates functions to use new tier logic
  4. Ensures all existing data is compatible with new constraints

  Changes:
  - tier = 'basic' becomes tier = 'free' (for existing free users)
  - Constraint updated to allow 'free', 'basic', 'premium'
  - Default tier changed to 'free'
  - Functions updated to use correct tier logic
*/

-- Step 1: First, drop the existing constraint to avoid conflicts
ALTER TABLE profile DROP CONSTRAINT IF EXISTS profile_tier_check;

-- Step 2: Update existing data to use new tier naming
-- Change 'basic' to 'free' for users who are actually free users
-- (users without stripe_subscription_id are free users)
UPDATE profile 
SET tier = 'free' 
WHERE tier = 'basic' AND (stripe_subscription_id IS NULL OR subscription_status IS NULL OR subscription_status != 'active');

-- Step 3: For users with active subscriptions, determine correct tier based on their subscription
-- This handles edge cases where users might have been incorrectly marked
UPDATE profile 
SET tier = CASE 
  WHEN stripe_subscription_id IS NOT NULL AND subscription_status = 'active' THEN 'basic'
  ELSE 'free'
END
WHERE tier NOT IN ('premium'); -- Don't change premium users

-- Step 4: Add the new constraint with correct values
ALTER TABLE profile ADD CONSTRAINT profile_tier_check CHECK (tier = ANY (ARRAY['free'::text, 'basic'::text, 'premium'::text]));

-- Step 5: Update the default tier for new users
ALTER TABLE profile ALTER COLUMN tier SET DEFAULT 'free';

-- Step 6: Update the save limits function with correct tier logic
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

-- Step 7: Update the handle_new_user function to create users with 'free' tier
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

-- Step 8: Update function comments to reflect the correct tier system
COMMENT ON FUNCTION check_save_limits() IS 'Enforces save limits: tier=free (registered free users) can save 1 calculation, tier=basic/premium (paid users) have unlimited saves';
COMMENT ON FUNCTION handle_new_user() IS 'Automatically creates profile with free tier when new user signs up';

-- Step 9: Verify all existing data meets the new constraint
-- This will show any rows that still don't meet the constraint
DO $$
DECLARE
  invalid_count integer;
BEGIN
  SELECT COUNT(*) INTO invalid_count
  FROM profile
  WHERE tier NOT IN ('free', 'basic', 'premium');
  
  IF invalid_count > 0 THEN
    RAISE WARNING 'Found % profiles with invalid tier values. These will be updated to free.', invalid_count;
    
    -- Fix any remaining invalid tier values
    UPDATE profile 
    SET tier = 'free' 
    WHERE tier NOT IN ('free', 'basic', 'premium');
  END IF;
END $$;