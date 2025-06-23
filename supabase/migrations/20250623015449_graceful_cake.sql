/*
  # Fix Profile Loading Issues

  1. Database Improvements
    - Add better indexes for profile queries
    - Improve RLS policies for better performance
    - Add profile creation trigger for new users
    - Fix any potential constraint issues

  2. Security
    - Ensure RLS policies are optimized
    - Add proper indexes for performance
    - Handle edge cases in profile creation
*/

-- Ensure profile table exists with correct structure
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

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can insert own profile" ON profile;
DROP POLICY IF EXISTS "Users can read own profile" ON profile;
DROP POLICY IF EXISTS "Users can update own profile" ON profile;

-- Create optimized RLS policies
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profile_id ON profile(id);
CREATE INDEX IF NOT EXISTS idx_profile_email ON profile(email);
CREATE INDEX IF NOT EXISTS idx_profile_stripe_customer_id ON profile(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_profile_updated_at ON profile;
CREATE TRIGGER update_profile_updated_at
  BEFORE UPDATE ON profile
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profile (id, email, name, tier)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'User'),
    'basic'
  )
  ON CONFLICT (id) DO NOTHING;
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
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON profile TO authenticated;