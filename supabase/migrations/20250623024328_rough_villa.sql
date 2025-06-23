/*
  # Fix Save Limits for User Tiers

  1. Correct Tier System
    - Free users have tier = 'basic' in database (confusing but existing)
    - Paid Basic users should have tier = 'premium' 
    - Premium users have tier = 'premium' with additional features

  2. Save Limits
    - Free users (tier = 'basic'): 1 calculation maximum
    - Basic paid users (tier = 'premium'): unlimited calculations
    - Premium users (tier = 'premium'): unlimited calculations + notes/comments

  3. Database Changes
    - Update check_save_limits function to enforce correct limits
    - Add clear error messages for users hitting limits
*/

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
    -- Note: 'basic' tier in database = free user (confusing legacy naming)
    -- 'premium' tier in database = paid user (basic or premium plan)
    IF user_tier = 'basic' AND calculation_count >= 1 THEN
      RAISE EXCEPTION 'Free users can only save 1 calculation. Upgrade to Basic plan for unlimited calculations, or delete your existing calculation to save a new one.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS enforce_save_limits ON mortgage_calculation;
CREATE TRIGGER enforce_save_limits
  BEFORE INSERT ON mortgage_calculation
  FOR EACH ROW
  EXECUTE FUNCTION check_save_limits();

-- Add helpful comment explaining the tier system
COMMENT ON FUNCTION check_save_limits() IS 'Enforces save limits: tier=basic (free users) can save 1 calculation, tier=premium (paid users) have unlimited saves';