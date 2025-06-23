/*
  # Debug and Fix Authentication Issues

  1. Profile Table Optimization
    - Ensure proper indexes for performance
    - Add constraints for data integrity
    - Optimize RLS policies

  2. Authentication Triggers
    - Improve automatic profile creation
    - Add error handling and logging
    - Ensure idempotent operations

  3. Performance Improvements
    - Add missing indexes
    - Optimize query patterns
    - Reduce database load
*/

-- Ensure profile table exists with optimal structure
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

-- Enable RLS
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies for optimal performance
DROP POLICY IF EXISTS "Users can insert own profile" ON profile;
DROP POLICY IF EXISTS "Users can read own profile" ON profile;
DROP POLICY IF EXISTS "Users can update own profile" ON profile;

-- Optimized RLS policies with better performance
CREATE POLICY "Users can insert own profile"
  ON profile
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

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

-- Create comprehensive indexes for better performance
CREATE UNIQUE INDEX IF NOT EXISTS profile_pkey ON profile(id);
CREATE UNIQUE INDEX IF NOT EXISTS profile_email_key ON profile(email);
CREATE INDEX IF NOT EXISTS idx_profile_id ON profile(id);
CREATE INDEX IF NOT EXISTS idx_profile_email ON profile(email);
CREATE INDEX IF NOT EXISTS idx_profile_stripe_customer_id ON profile(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Improved updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_profile_updated_at ON profile;
CREATE TRIGGER update_profile_updated_at
  BEFORE UPDATE ON profile
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enhanced function to handle new user profile creation with better error handling
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

  -- Insert profile with proper error handling
  INSERT INTO profile (id, email, name, tier)
  VALUES (
    NEW.id,
    NEW.email,
    user_name,
    'basic'
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

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON profile TO authenticated;
GRANT SELECT ON profile TO anon;

-- Ensure mortgage_calculation table is properly set up
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

-- Enable RLS on mortgage_calculation
ALTER TABLE mortgage_calculation ENABLE ROW LEVEL SECURITY;

-- Create indexes for mortgage_calculation
CREATE INDEX IF NOT EXISTS idx_mortgage_calculation_user_id ON mortgage_calculation(user_id);
CREATE INDEX IF NOT EXISTS idx_mortgage_calculation_created_at ON mortgage_calculation(created_at DESC);

-- Grant permissions for mortgage_calculation
GRANT ALL ON mortgage_calculation TO authenticated;
GRANT SELECT, INSERT ON mortgage_calculation TO anon;

-- Add helpful comments for debugging
COMMENT ON TABLE profile IS 'User profiles with subscription and marketing information';
COMMENT ON TABLE mortgage_calculation IS 'Saved mortgage calculations with investment analysis';
COMMENT ON FUNCTION handle_new_user() IS 'Automatically creates profile when new user signs up';
COMMENT ON FUNCTION update_updated_at_column() IS 'Updates the updated_at timestamp on row changes';