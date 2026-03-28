import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  address?: string;
  driver_license_id?: string;
  driver_license_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  name_title: string;
  category: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  vin?: string;
  color?: string;
  fuel_type?: string;
  transmission?: string;
  status: 'available' | 'booked' | 'maintenance' | 'inactive' | 'damaged';
  pricing_per_day: number;
  location?: string;
  description?: string;
  media_urls: string[];
  mileage?: number;
  insurance_expiry?: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  vehicle_id: string;
  staff_created_by: string;
  pickup_datetime: string;
  return_datetime: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  total_price: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  customers?: Customer;
  vehicles?: Vehicle;
}
