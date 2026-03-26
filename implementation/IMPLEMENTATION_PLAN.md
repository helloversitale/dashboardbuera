# Quick Car Rental - Implementation Plan (Internal ERP)

## 1. Overview & Tech Stack
This document outlines the step-by-step implementation plan and the corresponding code drafts to build an **internal dashboard/CRM** for the staff of the **Quick Car Rental** business. Clients will *not* log in; this platform is strictly for the business owners and staff to manage their fleet, desk operations, and bookings.

**Core Stack:**
- **Frontend:** React, Tailwind CSS, Vite
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (using Radix primitives)
- **Backend/Database/Auth:** Supabase (PostgreSQL, GoTrue Auth, Storage Buckets)
- **Routing:** React Router 

---

## 2. Branding & UI/UX Guidelines

To maintain alignment with the existing dashboard:
- **Color Palette & Theme:** 
  - Primary color: `blue-600` for main actions.
  - Backgrounds: `gray-50` for overall app background, `white` for content cards/panels.
  - Text: `gray-900` for headings, `gray-600` or `gray-500` for secondary text.
  - Status Colors: `green-500` (Available/Completed), `red-500` (Maintenance/Cancelled), `yellow-500` (Pending/Booked).
- **Page Navigations:** Use distinct routes/pages with slugs for main CRUD operations (e.g., `/fleet/new` or `/fleet/uuid`) rather than monolithic modals.
- **Modals:** Use exclusively for quick confirmations (e.g., "Are you sure you want to cancel this booking?") or minor, single-field edits.
- **Notifications:** Use top-left Toast notifications for success, error, and informational screen messages.
- **Payments:** Handled exclusively on-premises (in person). No online payment integration (Stripe) is needed at this phase.

---

## 3. Step-by-Step Implementation Execution

### Phase 1: Supabase Setup & Architecture
1. **Initialize Supabase Project:** Create the project and setup database schemas for staff, customers, vehicles, and bookings.
2. **Setup RLS (Row Level Security):** 
   - Ensure only authenticated staff can read/write data.
3. **Storage Buckets:** Create `vehicle-media` and `customer-documents` private buckets.

### Phase 2: React Architecture & Component Integration
1. **Component Library Setup:** Add fundamental shadcn/ui components (`button`, `input`, `select`, `toast`, `table`, `dialog`, `calendar`).
2. **Routing & Auth Wrapping:** Configure `react-router` protecting all internal pages so that unauthenticated visitors are kicked to `/login`. Implement the top-left Toast system.

### Phase 3: Staff CRM & Fleet Management (CRUD)
1. **Customer CRM:** Build the `/customers` table and customer creation flow so staff can register renters.
2. **Inventory Table:** Build `/fleet` using shadcn Data Table.
3. **Vehicle Details/Edit:** Build `/fleet/:id` featuring a detailed form.
4. **Media Uploads:** Implement file selection for vehicle images and customer documents, syncing to Supabase Storage.

### Phase 4: Desk Operations (Bookings & Calendars)
1. **Manual Booking Flow:** Build `/bookings/new`. Staff creates a booking by picking a customer and a car, entering dates, and generating a record.
2. **Bookings List:** Build `/bookings` listing all reservations.
3. **Calendar View:** Integrate a scheduling calendar component in `/calendar` to visually map the fleet against bookings.
4. **Operations:** In `/bookings/:id`, add buttons for staff to transition statuses (`Confirm`, `Check-Out`, `Check-In`).

### Phase 5: Logging, Telemetry & Polish
1. **Audit Logs Interface:** Build the reporting section reading from `audit_logs`.
2. **Dashboard Metrics:** Hook up the `/` overview to live aggregates.
3. **Role Enforcement:** Ensure middleware and UI elements rigorously differentiate between `staff`, `manager`, and `admin` limits if necessary.

---

## 4. CODE DRAFTS

The following are the exact blueprints drafted for applying this system.

### 4.1 Supabase Initialization Schema (SQL)
Run this SQL script directly in your Supabase SQL Editor.

```sql
-- 1. Create Enums
CREATE TYPE staff_role AS ENUM ('staff', 'manager', 'admin');
CREATE TYPE vehicle_status AS ENUM ('available', 'booked', 'maintenance', 'inactive');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'active', 'completed', 'cancelled');

-- 2. Create Staff Table (Extends Supabase Auth)
CREATE TABLE public.staff (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role staff_role DEFAULT 'staff'::staff_role NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read own profile" ON public.staff FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Managers and Admins can read all staff" ON public.staff FOR SELECT USING (
  (SELECT role FROM public.staff WHERE id = auth.uid()) IN ('manager', 'admin')
);

CREATE OR REPLACE FUNCTION public.handle_new_staff()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.staff (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'staff');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_staff();

-- 3. Create Customers Table (No Login Access)
CREATE TABLE public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  driver_license_id TEXT,
  driver_license_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage customers" ON public.customers FOR ALL USING (auth.uid() IS NOT NULL);

-- 4. Create Vehicles Table
CREATE TABLE public.vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_title TEXT NOT NULL,
  category TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INT NOT NULL,
  license_plate TEXT NOT NULL,
  status vehicle_status DEFAULT 'available'::vehicle_status NOT NULL,
  pricing_per_day NUMERIC(10, 2) NOT NULL,
  location TEXT,
  description TEXT,
  media_urls TEXT[] DEFAULT '{}',
  mileage NUMERIC(10, 2),
  insurance_expiry DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage vehicles" ON public.vehicles FOR ALL USING (auth.uid() IS NOT NULL);

-- 5. Create Bookings Table
CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) NOT NULL,
  staff_created_by UUID REFERENCES public.staff(id) NOT NULL,
  pickup_datetime TIMESTAMPTZ NOT NULL,
  return_datetime TIMESTAMPTZ NOT NULL,
  status booking_status DEFAULT 'pending'::booking_status NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage bookings" ON public.bookings FOR ALL USING (auth.uid() IS NOT NULL);

-- 6. Additional Tables: Logs
CREATE TABLE public.vehicle_maintenance_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  service_date DATE,
  description TEXT,
  cost NUMERIC(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.vehicle_maintenance_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage maintenance" ON public.vehicle_maintenance_logs FOR ALL USING (auth.uid() IS NOT NULL);

CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action_type TEXT,
  staff_id UUID REFERENCES public.staff(id),
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can create records" ON public.audit_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Managers see all records" ON public.audit_logs FOR SELECT USING (
  (SELECT role FROM public.staff WHERE id = auth.uid()) IN ('manager', 'admin')
);
```

### 4.2 Terminal Setup Commands
```bash
npm install @supabase/supabase-js react-router-dom date-fns lucide-react clsx tailwind-merge

# Shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button input select dialog toast table calendar badge
```

### 4.3 Router System (`src/App.tsx`)
```tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import InternalLayout from './components/layouts/InternalLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardOverview from './pages/Overview';
import FleetInventory from './pages/FleetInventory';
import CustomerList from './pages/CustomerList';
import BookingList from './pages/BookingList';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<InternalLayout />}>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/fleet" element={<FleetInventory />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/bookings" element={<BookingList />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}
```

### 4.4 Centralized API logic Hooks (`src/lib/api.ts`)
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getCustomers() {
  const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getVehicles() {
  const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getBookings() {
  const { data, error } = await supabase
    .from('bookings')
    .select(`*, customers ( full_name, phone ), vehicles ( name_title, license_plate )`)
    .order('pickup_datetime', { ascending: true });
  if (error) throw error;
  return data;
}

// Telemetry Logger
export async function createAuditLog(actionType: string, staffId: string, targetId?: string, details = {}) {
  await supabase.from('audit_logs').insert({ action_type: actionType, staff_id: staffId, target_id: targetId, details });
}
```

### 4.5 Component Layout Blueprints

**Fleet Inventory List (`src/pages/FleetInventory.tsx`)**
```tsx
import { useState, useEffect } from 'react';
import { getVehicles } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function FleetInventory() {
  const [vehicles, setVehicles] = useState<any[]>([]);

  useEffect(() => { getVehicles().then(setVehicles); }, []);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'available': return <Badge className="bg-green-500 hover:bg-green-600">Available</Badge>;
      case 'booked': return <Badge className="bg-yellow-500 hover:bg-yellow-600">Reserved</Badge>;
      case 'maintenance': return <Badge className="bg-red-500 hover:bg-red-600">Maintenance</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Active Fleet Inventory</h1>
        <Button>Add Vehicle</Button>
      </div>
      {/* Renders <Table> mapping through vehicles */}
    </div>
  );
}
```

**Booking Map (`src/pages/Overview.tsx`)**
```tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/api';

export default function DashboardOverview() {
  const [metrics, setMetrics] = useState({ activeRentals: 0, availableFleet: 0 });

  useEffect(() => {
    async function loadMetrics() {
        const { count: activeCount } = await supabase.from('bookings').select('*', { count: 'exact' }).eq('status', 'active');
        const { count: fleetCount } = await supabase.from('vehicles').select('*', { count: 'exact' }).eq('status', 'available');
        setMetrics({ activeRentals: activeCount || 0, availableFleet: fleetCount || 0 });
    }
    loadMetrics();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Today's Operating Desk</h1>
      <div className="grid grid-cols-2 gap-4">
         <div className="p-6 border rounded shadow-sm">
            <p>Active Outbound Rentals: {metrics.activeRentals}</p>
         </div>
         <div className="p-6 border rounded shadow-sm">
            <p>Cars on Lot Available: {metrics.availableFleet}</p>
         </div>
      </div>
    </div>
  );
}
```
