/*
  # Add User Roles and Authentication

  1. New Tables
    - `user_profiles`
      - `id` (uuid, references auth.users)
      - `email` (text)
      - `role` (enum: staff, region_manager, executive)
      - `region` (text, nullable for executives)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security Changes
    - Update RLS policies for role-based access
    - Staff can only insert reports
    - Region managers can view reports from their region
    - Executives can view all reports

  3. Functions
    - Auto-create user profile on signup
*/

-- Create user role enum
CREATE TYPE user_role AS ENUM ('staff', 'region_manager', 'executive');

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role user_role NOT NULL DEFAULT 'staff',
  region text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role)
  VALUES (new.id, new.email, 'staff');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update security_reports policies
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON security_reports;
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON security_reports;
DROP POLICY IF EXISTS "Enable read for anonymous users" ON security_reports;

-- New policies for role-based access
CREATE POLICY "Staff can insert reports"
  ON security_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('staff', 'region_manager', 'executive')
    )
  );

CREATE POLICY "Region managers can view their region reports"
  ON security_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND (
        role = 'executive' OR 
        (role = 'region_manager' AND region = security_reports.region)
      )
    )
  );

CREATE POLICY "Executives can view all reports"
  ON security_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'executive'
    )
  );

-- Update trigger for user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();