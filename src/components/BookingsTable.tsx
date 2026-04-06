import { useEffect, useState } from 'react';
import { supabase, Booking, Staff } from '../lib/supabase';
import { Calendar, AlertCircle, CheckCircle, Plus, Edit2, Check, User, X, Search } from 'lucide-react';
import BookingForm from './BookingForm';
import BookingDetailsModal from './BookingDetailsModal';

export default function BookingsTable() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'overdue'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | undefined>(undefined);
  const [viewingBooking, setViewingBooking] = useState<Booking | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [filter, statusFilter, staffFilter]);

  async function fetchStaff() {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('full_name');
      if (!error && data) setStaffList(data);
    } catch (err) {
      console.error('Error fetching staff:', err);
    }
  }

  async function fetchBookings() {
    setLoading(true);
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          customers (id, full_name, email),
          vehicles (id, make, model, license_plate),
          staff:assigned_staff_id (id, full_name, avatar_url)
        `)
        .order('pickup_datetime', { ascending: true });

      if (filter === 'overdue') {
        const now = new Date().toISOString();
        query = query
            .eq('status', 'active')
            .lt('return_datetime', now);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (staffFilter !== 'all') {
        query = query.eq('assigned_staff_id', staffFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, newStatus: string) {
    try {
      const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      
      // If completed or cancelled, free up the vehicle
      if (newStatus === 'completed' || newStatus === 'cancelled') {
        const booking = bookings.find(b => b.id === id);
        if (booking?.vehicle_id) {
            await supabase.from('vehicles').update({ status: 'available' }).eq('id', booking.vehicle_id);
        }
      }
      
      fetchBookings();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  }

  function handleEdit(booking: Booking) {
    setSelectedBooking(booking);
    setShowForm(true);
  }

  function handleAdd() {
    setSelectedBooking(undefined);
    setShowForm(true);
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function calculateDays(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'overdue':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'confirmed':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'active':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'completed':
        return 'text-gray-600 bg-gray-50 dark:bg-gray-800/40';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'cancelled':
        return 'text-red-400 bg-red-50 dark:bg-red-900/10';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-800/40';
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const search = searchTerm.toLowerCase();
    const customerName = booking.customers?.full_name?.toLowerCase() || '';
    const customerEmail = booking.customers?.email?.toLowerCase() || '';
    const bookingId = booking.id.toLowerCase();
    
    return customerName.includes(search) || 
           customerEmail.includes(search) || 
           bookingId.includes(search);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors shadow-sm">
      {showForm && (
        <BookingForm 
          booking={selectedBooking} 
          onClose={() => setShowForm(false)} 
          onSuccess={() => {
            setShowForm(false);
            fetchBookings();
          }} 
        />
      )}
      {viewingBooking && (
        <BookingDetailsModal 
          booking={viewingBooking}
          onClose={() => setViewingBooking(undefined)}
          onUpdateStatus={async (id, status) => {
            await updateStatus(id, status);
            setViewingBooking(undefined);
          }}
          onEdit={(booking) => {
            setViewingBooking(undefined);
            handleEdit(booking);
          }}
        />
      )}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex items-center gap-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('overdue')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                filter === 'overdue'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Overdue
            </button>
          </div>

          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block" />

          {/* STATUS Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500 ml-1">Status</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none w-32 md:w-36 transition-all"
            >
              <option value="all">Any Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* ASSIGNED TO Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500 ml-1">Assigned To</label>
            <select 
              value={staffFilter} 
              onChange={(e) => setStaffFilter(e.target.value)}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none w-32 md:w-44 transition-all"
            >
              <option value="all">Any Staff</option>
              {staffList.map((s: Staff) => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by client or reference ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            {(statusFilter !== 'all' || staffFilter !== 'all' || searchTerm !== '') && (
              <button 
                onClick={() => { setStatusFilter('all'); setStaffFilter('all'); setSearchTerm(''); }}
                className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                title="Clear Filters"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            
            <button 
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>NEW BOOKING</span>
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-3 md:px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Customer
              </th>
              <th className="hidden lg:table-cell px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Vehicle
              </th>
              <th className="hidden md:table-cell px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Pick Up
              </th>
              <th className="hidden xl:table-cell px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Return
              </th>
              <th className="hidden md:table-cell px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Days
              </th>
              <th className="px-3 md:px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="hidden lg:table-cell px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Assigned To
              </th>
              <th className="hidden sm:table-cell px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Price
              </th>
              <th className="px-3 md:px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredBookings.map((booking: Booking) => (
              <tr
                key={booking.id}
                onClick={() => setViewingBooking(booking)}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group cursor-pointer"
              >
                <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {booking.customers?.full_name || 'Unknown'}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[120px]">
                    {booking.customers?.email || ''}
                  </div>
                </td>
                <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {booking.vehicles
                      ? `${booking.vehicles.make} ${booking.vehicles.model}`
                      : 'N/A'}
                  </div>
                  <div className="text-xs font-mono text-gray-400">
                    {booking.vehicles?.license_plate || ''}
                  </div>
                </td>
                <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(booking.pickup_datetime)}
                </td>
                <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(booking.return_datetime)}
                </td>
                <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white text-center">
                  <div className="bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-md">
                    {booking.total_days || calculateDays(booking.pickup_datetime, booking.return_datetime)}
                  </div>
                </td>
                <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {booking.staff?.avatar_url ? (
                      <img src={booking.staff.avatar_url} className="w-6 h-6 rounded-full object-cover" alt="" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <User className="w-3 h-3 text-gray-400" />
                      </div>
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {(booking as any).staff?.full_name || 'Unassigned'}
                    </span>
                  </div>
                </td>
                <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    ${booking.total_price.toFixed(2)}
                  </div>
                </td>
                <td className="px-3 md:px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1 md:gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    {/* Status Actions */}
                    {booking.status === 'confirmed' && (
                       <button 
                        onClick={(e) => { e.stopPropagation(); updateStatus(booking.id, 'active'); }}
                        className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded transition-colors" 
                        title="Check-Out"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {booking.status === 'active' && (
                       <button 
                        onClick={(e) => { e.stopPropagation(); updateStatus(booking.id, 'completed'); }}
                        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors" 
                        title="Check-In"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEdit(booking); }}
                      className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors" 
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No bookings found</p>
          </div>
        )}
      </div>

      {filter === 'overdue' && filteredBookings.length > 0 && (
        <div className="px-6 py-3 bg-red-50 dark:bg-red-900/30 border-t border-red-100 dark:border-red-800">
          <div className="flex items-center gap-2 text-sm text-red-800 dark:text-red-300">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">{filteredBookings.length} overdue items</span>
            <span className="text-red-600 dark:text-red-400">require immediate attention</span>
          </div>
        </div>
      )}
    </div>
  );
}
