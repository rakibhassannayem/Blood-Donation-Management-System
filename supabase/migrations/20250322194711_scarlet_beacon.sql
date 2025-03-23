/*
  # Blood Donation Management System Schema

  1. New Tables
    - profiles
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - type (text) - 'donor' or 'hospital'
      - name (text)
      - contact (text)
      - address (text)
      - blood_type (text, for donors only)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - blood_requests
      - id (uuid, primary key)
      - hospital_id (uuid, references profiles)
      - blood_type (text)
      - units_needed (integer)
      - urgency_level (text)
      - status (text)
      - description (text)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  type text NOT NULL CHECK (type IN ('donor', 'hospital')),
  name text NOT NULL,
  email text,
  contact text,
  address text,
  blood_type text CHECK (type != 'hospital' OR blood_type IS NULL),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create blood requests table
CREATE TABLE blood_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid REFERENCES profiles NOT NULL,
  blood_type text NOT NULL,
  units_needed integer NOT NULL CHECK (units_needed > 0),
  urgency_level text NOT NULL CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'cancelled')),
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Blood requests policies
CREATE POLICY "Anyone can view blood requests"
  ON blood_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Hospitals can create blood requests"
  ON blood_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND type = 'hospital'
      AND id = blood_requests.hospital_id
    )
  );

CREATE POLICY "Hospitals can update their own requests"
  ON blood_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND type = 'hospital'
      AND id = blood_requests.hospital_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND type = 'hospital'
      AND id = blood_requests.hospital_id
    )
  );

CREATE POLICY "Hospitals can delete their own requests"
  ON blood_requests FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND type = 'hospital'
      AND id = blood_requests.hospital_id
    )
  );
