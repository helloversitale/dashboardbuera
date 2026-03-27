import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Car, Users, Calendar, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

interface Stats {
  totalVehicles: number;
  totalBookings: number;
  totalCustomers: number;
  revenue: number;
  overdueBookings: number;
  availableVehicles: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalVehicles: 0,
    totalBookings: 0,
    totalCustomers: 0,
    revenue: 0,
    overdueBookings: 0,
    availableVehicles: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const [vehiclesRes, bookingsRes, customersRes, overdueRes, availableRes] = await Promise.all([
        supabase.from('vehicles').select('id', { count: 'exact', head: true }),
        supabase.from('bookings').select('total_amount'),
        supabase.from('customers').select('id', { count: 'exact', head: true }),
        supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'overdue'),
        supabase.from('vehicles').select('id', { count: 'exact', head: true }).eq('status', 'available'),
      ]);

      const totalRevenue = bookingsRes.data?.reduce((sum, booking) => sum + Number(booking.total_amount), 0) || 0;

      setStats({
        totalVehicles: vehiclesRes.count || 0,
        totalBookings: bookingsRes.data?.length || 0,
        totalCustomers: customersRes.count || 0,
        revenue: totalRevenue,
        overdueBookings: overdueRes.count || 0,
        availableVehicles: availableRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Quick Car Rental</h2>
        <p className="text-gray-600 dark:text-gray-400">Here's what's happening with your business today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                ${stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">+12.5%</span>
                <span className="text-sm text-gray-500 dark:text-gray-500">from last month</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center">
              <DollarSign className="w-7 h-7 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalBookings}</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">{stats.overdueBookings} overdue</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
              <Calendar className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Customers</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalCustomers}</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-sm text-gray-500 dark:text-gray-500">Active users</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center">
              <Users className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Fleet Size */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Fleet Size</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalVehicles}</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">{stats.availableVehicles} available</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-cyan-100 dark:bg-cyan-900/40 rounded-xl flex items-center justify-center">
              <Car className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
        </div>

        {/* Available Vehicles */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Vehicles</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.availableVehicles}</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-sm text-gray-500 dark:text-gray-500">Ready to rent</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center">
              <Car className="w-7 h-7 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Overdue Items */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue Items</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{stats.overdueBookings}</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-sm text-red-600 dark:text-red-400 font-medium">Needs attention</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {stats.overdueBookings > 0 && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-300">Action Required</h3>
              <p className="text-sm text-red-800 dark:text-red-400 mt-1">
                You have {stats.overdueBookings} overdue booking{stats.overdueBookings !== 1 ? 's' : ''} that need
                immediate attention. Please review and take action.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">New Booking</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Create reservation</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Add Vehicle</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Expand fleet</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">New Customer</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Register client</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/40 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">View Overdue</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Review items</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
