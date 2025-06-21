/*
  # Make name column nullable in profiles table

  1. Changes
    - Alter the `name` column in the `profiles` table to allow NULL values
    - This fixes the signup error where the database trigger fails to insert a new profile
    
  2. Security
    - No changes to existing RLS policies
    - Maintains all existing security constraints
*/

-- Make the name column nullable to prevent signup failures
ALTER TABLE profiles ALTER COLUMN name DROP NOT NULL;