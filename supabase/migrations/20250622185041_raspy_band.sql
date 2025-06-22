/*
  # Add save limits for free users

  1. Changes
    - Add function to check save limits for basic tier users
    - Add trigger to enforce save limits on insert
    - Ensure basic tier users can only save 1 calculation

  2. Security
    - Server-side validation to prevent bypassing client-side limits
    - Maintain existing RLS policies
*/

-- Function to check save limits for basic tier users
CREATE OR REPLACE FUNCTION check_save_limits()
RETURNS TRIGGER AS $$
DECLARE
  user_tier text;
  calculation_count integer;
BEGIN
  -- Only check for authenticated users (not anonymous)
  IF NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get user's tier
  SELECT tier INTO user_tier
  FROM profile
  WHERE id = NEW.user_id;

  -- If user is basic tier, check calculation count
  IF user_tier = 'basic' THEN
    SELECT COUNT(*) INTO calculation_count
    FROM mortgage_calculation
    WHERE user_id = NEW.user_id;

    -- Basic tier users can only save 1 calculation
    IF calculation_count >= 1 THEN
      RAISE EXCEPTION 'Free users can only save 1 calculation. Upgrade to save unlimited calculations.'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to enforce save limits
DROP TRIGGER IF EXISTS enforce_save_limits ON mortgage_calculation;
CREATE TRIGGER enforce_save_limits
  BEFORE INSERT ON mortgage_calculation
  FOR EACH ROW
  EXECUTE FUNCTION check_save_limits();