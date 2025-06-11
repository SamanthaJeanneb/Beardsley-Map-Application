/*
  # Add building_type column to projects table

  1. Changes
    - Add `building_type` column to `projects` table
    - Set default value to empty string for consistency with other optional fields
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'building_type'
  ) THEN
    ALTER TABLE projects ADD COLUMN building_type text DEFAULT '';
  END IF;
END $$;