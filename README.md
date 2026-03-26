# Quick Car Rental - Internal ERP 🚗

Welcome to the **Quick Car Rental** repository! This project is an internal, web-based CRM and ERP dashboard designed specifically for our car rental agency staff. **It is not a client-facing portal.**

The goal of this application is to provide desk employees and administrators with a centralized, robust platform to manage fleet inventory, process manual walk-in reservations, check out / check in vehicles, maintain customer records, and monitor live telemetry for the business.

---

## 🛠 Tech Stack

Our stack is built for speed, type safety, and modern UI practices.

**Frontend:**
*   **[React 18](https://react.dev/)** + **[Vite](https://vitejs.dev/)**: Lightning-fast local development and optimized production builds.
*   **[TypeScript](https://www.typescriptlang.org/)**: For strict, scalable typing across components.
*   **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first styling based on a modern Blue/Gray color palette.
*   **[shadcn/ui](https://ui.shadcn.com/)** *(planned)*: Accessible, customizable Radix primitives for tables, dialogs, buttons, and toasts.
*   **[Lucide React](https://lucide.dev/)**: For clean, modern SVG iconography.
*   **[Sentry](https://sentry.io/)**: Integrated for error reporting and performance monitoring in production.
*   **[React Big Calendar](https://github.com/jquense/react-big-calendar)**: Used for the visual booking and fleet availability desk calendar.

**Backend (BaaS):**
*   **[Supabase](https://supabase.com/)**: 
    *   **PostgreSQL**: Core relational database for `staff`, `customers`, `vehicles`, `bookings`, and `audit_logs`.
    *   **GoTrue Auth**: Handles internal staff authentication and role management (Staff, Manager, Admin).
    *   **Row-Level Security (RLS)**: Enforces access control strictly on the database layer.
    *   **Storage**: Buckets for handling vehicle thumbnails and customer ID scans.

---

## 🏗 Architecture Overview

This is an **internal-only system**, meaning there are no public unauthenticated views besides the login screen. 

1.  **Staff CRM & Roles:** 
    *   All users logging into the app are agency staff.
    *   Roles dictate permissions (e.g., Admins can add vehicles or edit maintenance logs; standard Staff can only create bookings and view customers).
2.  **Customer Database (CRM):** 
    *   Renters are stored as `customers`. They do *not* have login access. Staff input their data (driver's licenses, contact info) when they walk in.
3.  **Fleet Management:**
    *   Vehicles are tracked meticulously with statuses ranging from `available`, `booked`, `maintenance`, to `inactive`.
4.  **Booking Operations:**
    *   The core functionality ties a `Customer` to a `Vehicle` across a specific date range. Statuses track the lifecycle of a rental (`pending` -> `confirmed` -> `active` checkout -> `completed` checkin).
5.  **Audit & Telemetry:**
    *   Major actions (like handing keys over to a customer) trigger lightweight logs to the `audit_logs` SQL table for historical tracing.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js (v18+) installed.

### Installation

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Environment Variables:**
   Create a `.env` file in the root based on your Supabase configuration. Include your Sentry DSN if testing error reporting.
   ```env
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_SENTRY_DSN=your-sentry-dsn
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Database Migrations:**
   Ensure your connected Supabase instance has run the SQL schema migrations mapping out the `customers`, `vehicles`, and `bookings` structures (see `IMPLEMENTATION_PLAN.md`).

---

## 📖 Useful References
*   [IMPLEMENTATION_PLAN.md](./implementation/IMPLEMENTATION_PLAN.md) - For the database schemas, routing plans, and phased rollout strategy.
*   [SENTRY_GUIDE.md](./SENTRY_GUIDE.md) - For tracking issues and crash reporting guidelines.
*   [GITHUB_ISSUES_GUIDE.md](./GITHUB_ISSUES_GUIDE.md) - For our preferred workflow on opening feature requests.

Happy Coding! 🏎️💨
