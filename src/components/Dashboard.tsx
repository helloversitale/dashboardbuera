import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Car,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowRight,
  MoreVertical,
  CheckCircle2,
} from 'lucide-react';
import BookingForm from './BookingForm';
import VehicleForm from './VehicleForm';
import CustomerForm from './CustomerForm';
import BookingDetailsModal from './BookingDetailsModal';

interface Stats {
  revenue: number;
  newClients: number;
  activeBookings: number;
  pendingBookings: number;
}

interface ActivityLog {
  id: string;
  action_type: string;
  created_at: string;
  details: any;
  staff?: { full_name: string };
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    revenue: 0,
    newClients: 0,
    activeBookings: 0,
    pendingBookings: 0,
  });
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [viewingBooking, setViewingBooking] = useState<any | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modal, setModal] = useState<'booking' | 'vehicle' | 'customer' | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const [bookingsRes, newClientsRes, activeRes, pendingRes, upcomingRes, activityRes] = await Promise.all([
        supabase.from('bookings').select('total_price'),
        supabase.from('customers').select('id', { count: 'exact', head: true }).gt('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('bookings')
          .select('*, customers(*), vehicles(*)')
          .in('status', ['confirmed', 'pending'])
          .order('pickup_datetime', { ascending: true })
          .limit(5),
        supabase.from('audit_logs')
          .select('*, staff(full_name)')
          .order('created_at', { ascending: false })
          .limit(6)
      ]);

      const totalRevenue = bookingsRes.data?.reduce((sum, booking) => sum + Number(booking.total_price), 0) || 0;

      setUpcomingBookings(upcomingRes.data || []);

      setRecentActivity(activityRes.data || []);

      setStats({
        revenue: totalRevenue,
        newClients: newClientsRes.count || 0,
        activeBookings: activeRes.count || 0,
        pendingBookings: pendingRes.count || 0,
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(id: string, status: string) {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      fetchDashboardData();
      setViewingBooking(null);
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  }

  function handleEdit(booking: any) {
    setSelectedBooking(booking);
    setViewingBooking(null);
    setModal('booking');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Modals */}
      {modal === 'booking' && (
        <BookingForm 
          onClose={() => { setModal(null); setSelectedBooking(undefined); }} 
          onSuccess={() => { setModal(null); setSelectedBooking(undefined); fetchDashboardData(); }} 
          booking={selectedBooking}
        />
      )}
      {modal === 'vehicle' && (
        <VehicleForm onClose={() => setModal(null)} onSuccess={() => { setModal(null); fetchDashboardData(); }} />
      )}
      {modal === 'customer' && (
        <CustomerForm onClose={() => setModal(null)} onSuccess={() => { setModal(null); fetchDashboardData(); }} />
      )}
      {viewingBooking && (
        <BookingDetailsModal 
          booking={viewingBooking} 
          onClose={() => setViewingBooking(null)} 
          onUpdateStatus={handleUpdateStatus}
          onEdit={handleEdit}
        />
      )}

      {/* Header */}
      <div className="px-2 md:px-0">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Dashboard Overview</h1>
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">Monitor your performance and manage key activities.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 px-2 md:px-0">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-700 p-4 md:p-6 shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-[10px] md:text-xs font-bold bg-green-50 dark:bg-green-900/40 px-2 py-1 rounded-full text-nowrap">
              <TrendingUp className="w-3 h-3" />
              +12.5%
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Revenue</p>
            <h3 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white mt-1">
              ${stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        {/* New Clients */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-700 p-4 md:p-6 shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-[10px] md:text-xs font-bold bg-green-50 dark:bg-green-900/40 px-2 py-1 rounded-full text-nowrap">
              <TrendingUp className="w-3 h-3" />
              +4.2%
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Clients</p>
            <h3 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.newClients}</h3>
          </div>
        </div>

        {/* Active Bookings */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-700 p-4 md:p-6 shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-[10px] md:text-xs font-bold bg-red-50 dark:bg-red-900/40 px-2 py-1 rounded-full text-nowrap">
              <TrendingUp className="w-3 h-3 rotate-180" />
              -2.1%
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Active</p>
            <h3 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.activeBookings}</h3>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-700 p-4 md:p-6 shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Pending</p>
            <h3 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.pendingBookings}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Section: Upcoming Bookings */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-orange-500 rounded-full" />
              Upcoming Bookings
            </h2>
            <button 
              onClick={() => navigate('/bookings')}
              className="text-sm font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1 group"
            >
              View All
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="space-y-4">
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No upcoming bookings found.</p>
              </div>
            ) : (
              upcomingBookings.map((booking) => (
                <div 
                  key={booking.id}
                  onClick={() => setViewingBooking(booking)}
                  className="bg-white dark:bg-gray-800/40 p-3 md:p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20 shrink-0">
                      {booking.customers?.full_name?.charAt(0) || '?'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-900 dark:text-white uppercase text-xs md:text-sm tracking-wide truncate">
                        {booking.customers?.full_name || 'Anonymous Client'}
                      </h4>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5 truncate">
                        <Car className="w-3 h-3 shrink-0" />
                        {booking.vehicles?.make} {booking.vehicles?.model} • {new Date(booking.pickup_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100 dark:border-gray-700">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800' 
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                    }`}>
                      {booking.status}
                    </span>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar: Recent Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-orange-500 rounded-full" />
              Recent Activity
            </h2>
          </div>

          <div className="relative pl-4">
            <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-gray-700" />
            
            <div className="space-y-8">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No recent activity.</p>
              ) : (
                recentActivity.map((log) => (
                  <div key={log.id} className="relative">
                    <div className="absolute -left-[21px] top-1.5 w-4 h-4 rounded-full border-4 border-white dark:border-gray-900 bg-orange-500 z-10" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 capitalize">
                        {log.action_type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {log.staff?.full_name || 'System'} modified {log.details?.target || 'record'}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
