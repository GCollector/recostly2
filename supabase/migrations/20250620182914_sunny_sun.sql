/*
  # Create users and calculations schema

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `email` (text)
      - `name` (text)
      - `tier` (text, default 'basic')
      - `stripe_customer_id` (text, nullable)
      - `stripe_subscription_id` (text, nullable)
      - `subscription_status` (text, nullable)
      - `marketing_image` (text, nullable)
      - `marketing_copy` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `mortgage_calculations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `home_price` (numeric)
      - `down_payment` (numeric)
      - `interest_rate` (numeric)
      - `amortization_years` (integer)
      - `payment_frequency` (text)
      - `province` (text)
      - `city` (text)
      - `is_first_time_buyer` (boolean)
      - `monthly_payment` (numeric)
      - `total_interest` (numeric)
      - `notes` (jsonb, nullable)
      - `comments` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `investment_calculations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `purchase_price` (numeric)
      - `down_payment` (numeric)
      - `monthly_rent` (numeric)
      - `monthly_expenses` (jsonb)
      - `cap_rate` (numeric)
      - `cash_flow` (numeric)
      - `roi` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public access to shared calculations
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  tier text DEFAULT 'basic' CHECK (tier IN ('public', 'basic', 'premium')),
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text,
  marketing_image text,
  marketing_copy text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create mortgage_calculations table
CREATE TABLE IF NOT EXISTS mortgage_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
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

-- Create investment_calculations table
CREATE TABLE IF NOT EXISTS investment_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  purchase_price numeric NOT NULL,
  down_payment numeric NOT NULL,
  monthly_rent numeric NOT NULL,
  monthly_expenses jsonb NOT NULL DEFAULT '{}',
  cap_rate numeric NOT NULL,
  cash_flow numeric NOT NULL,
  roi numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mortgage_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_calculations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Mortgage calculations policies
CREATE POLICY "Users can read own calculations"
  ON mortgage_calculations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public can read shared calculations"
  ON mortgage_calculations
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can insert own calculations"
  ON mortgage_calculations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calculations"
  ON mortgage_calculations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calculations"
  ON mortgage_calculations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Investment calculations policies
CREATE POLICY "Users can read own investment calculations"
  ON investment_calculations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own investment calculations"
  ON investment_calculations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investment calculations"
  ON investment_calculations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own investment calculations"
  ON investment_calculations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mortgage_calculations_updated_at
  BEFORE UPDATE ON mortgage_calculations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investment_calculations_updated_at
  BEFORE UPDATE ON investment_calculations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();