/*
  # Update mortgage calculations table and policies

  1. Changes
    - Ensure mortgage_calculations table exists with correct structure
    - Update RLS policies to handle both authenticated and anonymous users
    - Add support for shareable calculations by anonymous users
    - Add updated_at trigger if not exists

  2. Security
    - Enable RLS on mortgage_calculations table
    - Allow authenticated users to manage their own calculations
    - Allow public read access for shared calculations
    - Allow anonymous users to create shareable calculations
*/

-- Create mortgage_calculations table if it doesn't exist
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

-- Enable Row Level Security
ALTER TABLE mortgage_calculations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can read own calculations" ON mortgage_calculations;
DROP POLICY IF EXISTS "Users can insert own calculations" ON mortgage_calculations;
DROP POLICY IF EXISTS "Users can update own calculations" ON mortgage_calculations;
DROP POLICY IF EXISTS "Users can delete own calculations" ON mortgage_calculations;
DROP POLICY IF EXISTS "Public can read shared calculations" ON mortgage_calculations;
DROP POLICY IF EXISTS "Anonymous users can create shareable calculations" ON mortgage_calculations;

-- Policies for authenticated users to manage their own calculations
CREATE POLICY "Users can read own calculations"
  ON mortgage_calculations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

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

-- Policies for public access to shared calculations (both authenticated and anonymous users)
CREATE POLICY "Public can read shared calculations"
  ON mortgage_calculations
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy for anonymous users to create shareable calculations
CREATE POLICY "Anonymous users can create shareable calculations"
  ON mortgage_calculations
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- Create function to update updated_at timestamp if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists and recreate it
DROP TRIGGER IF EXISTS update_mortgage_calculations_updated_at ON mortgage_calculations;
CREATE TRIGGER update_mortgage_calculations_updated_at
  BEFORE UPDATE ON mortgage_calculations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();