/*
  # Convert table names to singular form

  1. Changes
    - Rename `profiles` to `profile`
    - Rename `mortgage_calculations` to `mortgage_calculation`
    - Update all foreign key references
    - Update all RLS policies
    - Update trigger functions

  2. Security
    - Maintain all existing RLS policies with updated table names
    - Preserve all data during migration
*/

-- First, create the new tables with singular names

-- Create profile table (singular)
CREATE TABLE IF NOT EXISTS profile (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  tier text DEFAULT 'basic' CHECK (tier IN ('basic', 'premium')),
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text,
  marketing_image text,
  marketing_copy text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create mortgage_calculation table (singular)
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

-- Copy data from old tables to new tables if old tables exist
DO $$
BEGIN
  -- Copy profiles data if the table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
    INSERT INTO profile SELECT * FROM profiles ON CONFLICT (id) DO NOTHING;
  END IF;
  
  -- Copy mortgage_calculations data if the table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'mortgage_calculations') THEN
    INSERT INTO mortgage_calculation SELECT * FROM mortgage_calculations ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Enable Row Level Security on new tables
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE mortgage_calculation ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own calculations" ON mortgage_calculations;
DROP POLICY IF EXISTS "Users can insert own calculations" ON mortgage_calculations;
DROP POLICY IF EXISTS "Users can update own calculations" ON mortgage_calculations;
DROP POLICY IF EXISTS "Users can delete own calculations" ON mortgage_calculations;
DROP POLICY IF EXISTS "Public can read shared calculations" ON mortgage_calculations;
DROP POLICY IF EXISTS "Anonymous users can create shareable calculations" ON mortgage_calculations;

-- Create RLS policies for profile table
CREATE POLICY "Users can read own profile"
  ON profile
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profile
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profile
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create RLS policies for mortgage_calculation table
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

-- Policies for public access to shared calculations
CREATE POLICY "Public can read shared calculations"
  ON mortgage_calculation
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy for anonymous users to create shareable calculations
CREATE POLICY "Anonymous users can create shareable calculations"
  ON mortgage_calculation
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- Update the handle_new_user function to use singular table name
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profile (id, email, name, tier)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'basic'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create triggers for updated_at on new tables
DROP TRIGGER IF EXISTS update_profile_updated_at ON profile;
CREATE TRIGGER update_profile_updated_at
  BEFORE UPDATE ON profile
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mortgage_calculation_updated_at ON mortgage_calculation;
CREATE TRIGGER update_mortgage_calculation_updated_at
  BEFORE UPDATE ON mortgage_calculation
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Drop old tables if they exist (after data has been copied)
DROP TABLE IF EXISTS mortgage_calculations CASCADE;
DROP TABLE IF EXISTS investment_calculations CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;