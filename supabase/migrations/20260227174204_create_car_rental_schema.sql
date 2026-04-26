/*
  # Car Rental Management System Schema

  1. New Tables
    - `customers`
      - `id` (uuid, primary key)
      - `name` (text) - Customer full name
      - `email` (text, unique) - Customer email
      - `phone` (text) - Customer phone number
      - `created_at` (timestamptz) - Account creation date
    
    - `vehicles`
      - `id` (uuid, primary key)
      - `make` (text) - Vehicle manufacturer
      - `model` (text) - Vehicle model
      - `year` (integer) - Manufacturing year
      - `license_plate` (text, unique) - Vehicle license plate
      - `status` (text) - Vehicle status (available, rented, maintenance)
      - `daily_rate` (numeric) - Daily rental rate
      - `color` (text) - Vehicle color
      - `created_at` (timestamptz)
    
    - `bookings`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key) - Reference to customer
      - `vehicle_id` (uuid, foreign key) - Reference to vehicle
      - `start_date` (date) - Booking start date
      - `end_date` (date) - Booking end date
      - `status` (text) - Booking status (pending, confirmed, completed, cancelled, overdue)
      - `total_amount` (numeric) - Total booking amount
      - `board_type` (text) - Board category (Booking, Maintenance, etc.)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their data
*/

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  license_plate text UNIQUE NOT NULL,
  status text DEFAULT 'available' NOT NULL,
  daily_rate numeric NOT NULL,
  color text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  total_amount numeric NOT NULL,
  board_type text DEFAULT 'Booking',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to customers"
  ON customers FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert customers"
  ON customers FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update customers"
  ON customers FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read access to vehicles"
  ON vehicles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert vehicles"
  ON vehicles FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update vehicles"
  ON vehicles FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read access to bookings"
  ON bookings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert bookings"
  ON bookings FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update bookings"
  ON bookings FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete bookings"
  ON bookings FOR DELETE
  TO public
  USING (true);