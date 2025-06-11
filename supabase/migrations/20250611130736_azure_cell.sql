/*
  # Create projects table

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `title` (text)
      - `address` (text)
      - `city` (text)
      - `coordinates` (point)
      - `latitude` (numeric)
      - `longitude` (numeric)
      - `market_sector` (text)
      - `description` (text)
      - `image_urls` (text array)
      - `client` (text)
      - `project_manager` (text)
      - `status` (text)
      - `compensation` (numeric)
      - `year` (integer)
      - `featured` (boolean)
      - `recent` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `projects` table
    - Add policies for public read access
    - Add policies for authenticated users to manage projects
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  address text DEFAULT '',
  city text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  market_sector text NOT NULL DEFAULT 'commercial',
  description text NOT NULL,
  image_urls text[] DEFAULT '{}',
  client text NOT NULL,
  project_manager text DEFAULT '',
  status text NOT NULL DEFAULT 'Active',
  compensation numeric DEFAULT 0,
  year integer DEFAULT EXTRACT(year FROM NOW()),
  featured boolean DEFAULT false,
  recent boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access"
  ON projects
  FOR SELECT
  TO public
  USING (true);

-- Allow public insert access
CREATE POLICY "Allow public insert access"
  ON projects
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow public update access
CREATE POLICY "Allow public update access"
  ON projects
  FOR UPDATE
  TO public
  USING (true);

-- Allow public delete access
CREATE POLICY "Allow public delete access"
  ON projects
  FOR DELETE
  TO public
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();