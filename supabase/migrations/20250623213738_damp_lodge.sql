/*
  # Create closing_cost_preset table

  1. New Tables
    - `closing_cost_preset`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profile.id)
      - `name` (text, preset name)
      - `tag` (text, optional tag/category)
      - `landTransferTax` (numeric, land transfer tax amount)
      - `additionalTax` (numeric, additional tax amount)
      - `legalFees` (numeric, legal fees amount)
      - `titleInsurance` (numeric, title insurance amount)
      - `homeInspection` (numeric, home inspection amount)
      - `appraisal` (numeric, appraisal amount)
      - `surveyFee` (numeric, survey fee amount)
      - `firstTimeBuyerRebate` (numeric, first-time buyer rebate amount)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `closing_cost_preset` table
    - Add policies for authenticated users to manage their own presets

  3. Triggers
    - Add trigger to automatically update `updated_at` timestamp
*/

CREATE TABLE IF NOT EXISTS closing_cost_preset (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  name text NOT NULL,
  tag text,
  landTransferTax numeric NOT NULL DEFAULT 0,
  additionalTax numeric NOT NULL DEFAULT 0,
  legalFees numeric NOT NULL DEFAULT 0,
  titleInsurance numeric NOT NULL DEFAULT 0,
  homeInspection numeric NOT NULL DEFAULT 0,
  appraisal numeric NOT NULL DEFAULT 0,
  surveyFee numeric NOT NULL DEFAULT 0,
  firstTimeBuyerRebate numeric NOT NULL DEFAULT 0,
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

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_closing_cost_preset_user_id 
  ON closing_cost_preset(user_id);

CREATE INDEX IF NOT EXISTS idx_closing_cost_preset_created_at 
  ON closing_cost_preset(created_at DESC);