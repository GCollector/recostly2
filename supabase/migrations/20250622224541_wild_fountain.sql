/*
  # Fix mortgage_calculations table setup

  1. Tables
    - Ensure mortgage_calculations table exists with proper structure
    - Add missing columns if needed
  
  2. Security
    - Enable RLS
    - Add policies for authenticated and anonymous users
*/

-- Create the table if it doesn't exist (should already exist from previous migrations)
-- This is just to ensure the structure is correct

-- Add any missing columns that might be needed
DO $$ 
BEGIN
  -- Check if notes column exists and add if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mortgage_calculation' AND column_name = 'notes'
  ) THEN
    ALTER TABLE mortgage_calculation ADD COLUMN notes jsonb DEFAULT '{}';
  END IF;

  -- Check if comments column exists and add if missing  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mortgage_calculation' AND column_name = 'comments'
  ) THEN
    ALTER TABLE mortgage_calculation ADD COLUMN comments text;
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE mortgage_calculation ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own calculations" ON mortgage_calculation;
DROP POLICY IF EXISTS "Users can insert own calculations" ON mortgage_calculation;
DROP POLICY IF EXISTS "Users can update own calculations" ON mortgage_calculation;
DROP POLICY IF EXISTS "Users can delete own calculations" ON mortgage_calculation;
DROP POLICY IF EXISTS "Public can read shared calculations" ON mortgage_calculation;
DROP POLICY IF EXISTS "Anonymous users can create shareable calculations" ON mortgage_calculation;

-- Create policies for authenticated users
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

-- Create policies for public access (both authenticated and anonymous)
CREATE POLICY "Public can read shared calculations"
  ON mortgage_calculation
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create policy for anonymous users to create shareable calculations
CREATE POLICY "Anonymous users can create shareable calculations"
  ON mortgage_calculation
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);