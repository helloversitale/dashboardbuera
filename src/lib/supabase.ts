import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  status: string;
  daily_rate: number;
  color: string;
  created_at: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  status: string;
  total_amount: number;
  board_type: string;
  created_at: string;
  updated_at: string;
  customers?: Customer;
  vehicles?: Vehicle;
}
