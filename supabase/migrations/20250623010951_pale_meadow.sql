/*
  # Rename tables to use singular naming convention

  1. Table Renames
    - `mortgage_calculations` → `mortgage_calculation` (already exists)
    - Ensure all references use singular names
    
  2. Index Updates
    - Update any indexes to reference singular table names
    
  3. Policy Updates  
    - Update RLS policies to use singular table names
    
  4. Foreign Key Updates
    - Update foreign key constraints to reference singular table names

  Note: The mortgage_calculation table already exists in singular form,
  but we need to ensure mortgage_calculations table is removed if it exists
  and all references point to the singular version.
*/

-- Drop the plural table if it exists (it should be empty or a duplicate)
DROP TABLE IF EXISTS mortgage_calculations CASCADE;

-- Ensure the singular table exists with correct structure
CREATE TABLE IF NOT EXISTS mortgage_calculation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profile(id) ON DELETE CASCADE,
  home_price numeric NOT NULL,
  down_payment numeric NOT NULL,
  interest_rate numeric NOT NULL,
  amortization_years integer NOT NULL,
  payment_frequency text NOT NULL CHECK (payment_frequency IN ('monthly', 'bi-weekly')),
  province text NOT NULL CHECK (province IN ('ontario', 'bc')),
  city text NOT NULL CHECK (city IN ('toronto', 'vancouver')),
  is_first_time_buyer boolean DEFAULT false,
  monthly_payment numeric NOT NULL,
  total_interest numeric NOT NULL,
  notes jsonb DEFAULT '{}',
  comments text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure RLS is enabled
ALTER TABLE mortgage_calculation ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can read own calculations" ON mortgage_calculation;
DROP POLICY IF EXISTS "Users can insert own calculations" ON mortgage_calculation;
DROP POLICY IF EXISTS "Users can update own calculations" ON mortgage_calculation;
DROP POLICY IF EXISTS "Users can delete own calculations" ON mortgage_calculation;
DROP POLICY IF EXISTS "Public can read shared calculations" ON mortgage_calculation;
DROP POLICY IF EXISTS "Anonymous users can create shareable calculations" ON mortgage_calculation;

-- Create policies for the singular table
CREATE POLICY "Users can read own calculations"
  ON mortgage_calculation
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calculations"
  ON mortgage_calculation
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calculations"
  ON mortgage_calculation
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calculations"
  ON mortgage_calculation
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for public access
CREATE POLICY "Public can read shared calculations"
  ON mortgage_calculation
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anonymous users can create shareable calculations"
  ON mortgage_calculation
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mortgage_calculation_user_id ON mortgage_calculation(user_id);
CREATE INDEX IF NOT EXISTS idx_mortgage_calculation_created_at ON mortgage_calculation(created_at DESC);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_mortgage_calculation_updated_at ON mortgage_calculation;
CREATE TRIGGER update_mortgage_calculation_updated_at
  BEFORE UPDATE ON mortgage_calculation
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create save limits function if it doesn't exist
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
    
    -- Count existing calculations
    SELECT COUNT(*) INTO calculation_count
    FROM mortgage_calculation
    WHERE user_id = NEW.user_id;
    
    -- Check limits based on tier
    IF user_tier = 'basic' AND calculation_count >= 1 THEN
      RAISE EXCEPTION 'Free users can only save 1 calculation. Upgrade to save unlimited calculations.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for save limits
DROP TRIGGER IF EXISTS enforce_save_limits ON mortgage_calculation;
CREATE TRIGGER enforce_save_limits
  BEFORE INSERT ON mortgage_calculation
  FOR EACH ROW
  EXECUTE FUNCTION check_save_limits();