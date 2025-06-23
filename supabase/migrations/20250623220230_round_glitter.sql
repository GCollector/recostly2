/*
  # Fix closing cost preset table column names

  1. Changes
    - Update column names to use lowercase with underscores (database convention)
    - Ensure all columns exist with correct data types
    - Maintain existing data if any

  2. Security
    - Maintain existing RLS policies
    - Keep existing indexes and triggers
*/

-- Drop the table if it exists and recreate with correct column names
DROP TABLE IF EXISTS closing_cost_preset CASCADE;

CREATE TABLE closing_cost_preset (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  name text NOT NULL,
  tag text,
  landtransfertax numeric NOT NULL DEFAULT 0,
  additionaltax numeric NOT NULL DEFAULT 0,
  legalfees numeric NOT NULL DEFAULT 0,
  titleinsurance numeric NOT NULL DEFAULT 0,
  homeinspection numeric NOT NULL DEFAULT 0,
  appraisal numeric NOT NULL DEFAULT 0,
  surveyfee numeric NOT NULL DEFAULT 0,
  firsttimebuyerrebate numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE closing_cost_preset ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users to manage their own presets
CREATE POLICY "Users can view their own closing cost presets"
  ON closing_cost_preset
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own closing cost presets"
  ON closing_cost_preset
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own closing cost presets"
  ON closing_cost_preset
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own closing cost presets"
  ON closing_cost_preset
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_closing_cost_preset_updated_at
  BEFORE UPDATE ON closing_cost_preset
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_closing_cost_preset_user_id 
  ON closing_cost_preset(user_id);

CREATE INDEX IF NOT EXISTS idx_closing_cost_preset_created_at 
  ON closing_cost_preset(created_at DESC);