/*
  # Create security reports table and storage

  1. New Tables
    - `security_reports`
      - `id` (uuid, primary key)
      - `unit` (text, required) - Security unit identifier
      - `region` (text, required) - Geographic region
      - `category` (text, required) - Incident category
      - `incident_date` (date, required) - Date of incident
      - `incident_time` (time, required) - Time of incident
      - `loss_estimation_kg` (numeric, default 0) - Estimated loss in kilograms
      - `supervisor_phone` (text, required) - Supervisor contact number
      - `summary` (text, required) - Incident summary/notes
      - `latitude` (double precision, optional) - GPS latitude
      - `longitude` (double precision, optional) - GPS longitude
      - `photos` (text array, default empty) - URLs of uploaded photos
      - `created_at` (timestamptz, auto-generated)
      - `updated_at` (timestamptz, auto-generated)

  2. Storage
    - Create `report-photos` bucket for incident photo uploads
    - Configure public access policies for photo viewing

  3. Security
    - Enable RLS on `security_reports` table
    - Add policy for authenticated users to manage all reports
    - Add storage policies for photo upload and access
*/

-- Create the security_reports table
CREATE TABLE IF NOT EXISTS public.security_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit text NOT NULL,
  region text NOT NULL,
  category text NOT NULL,
  incident_date date NOT NULL,
  incident_time time NOT NULL,
  loss_estimation_kg numeric NOT NULL DEFAULT 0,
  supervisor_phone text NOT NULL,
  summary text NOT NULL,
  latitude double precision,
  longitude double precision,
  photos text[] DEFAULT '{}'::text[],
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.security_reports ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to access all reports
CREATE POLICY "Enable all access for authenticated users" 
  ON public.security_reports
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy for anonymous users to insert reports (for public reporting)
CREATE POLICY "Enable insert for anonymous users"
  ON public.security_reports
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy for anonymous users to read reports (for dashboard access)
CREATE POLICY "Enable read for anonymous users"
  ON public.security_reports
  FOR SELECT
  TO anon
  USING (true);

-- Create storage bucket for report photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-photos', 'report-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for photo uploads (anonymous users can upload)
CREATE POLICY "Enable photo uploads for anonymous users"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'report-photos');

-- Create storage policy for photo uploads (authenticated users can upload)
CREATE POLICY "Enable photo uploads for authenticated users"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'report-photos');

-- Create storage policy for public photo access
CREATE POLICY "Enable public photo access"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'report-photos');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_security_reports_updated_at
    BEFORE UPDATE ON public.security_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();