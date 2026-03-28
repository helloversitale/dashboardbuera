import { useEffect, useState } from 'react';
import { supabase, Booking } from '../lib/supabase';
import { Calendar, AlertCircle, CheckCircle, Clock, Plus, Edit2, Trash2, Check, XCircle } from 'lucide-react';
import BookingForm from './BookingForm';

export default function BookingsTable() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'overdue'>('overdue');
  const [showForm, setShowForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | undefined>(undefined);

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  async function fetchBookings() {
    setLoading(true);
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          customers (id, full_name, email),
          vehicles (id, make, model, license_plate)
        `)
        .order('pickup_datetime', { ascending: true });

      if (filter === 'overdue') {
        const now = new Date().toISOString();
        query = query
            .eq('status', 'active')
            .lt('return_datetime', now);
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

  async function deleteBooking(id: string) {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    try {
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) throw error;
      fetchBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Failed to delete booking');
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

  function getStatusIcon(status: string) {
    switch (status) {
      case 'overdue':
        return <AlertCircle className="w-3.5 h-3.5" />;
      case 'confirmed':
        return <CheckCircle className="w-3.5 h-3.5" />;
      case 'active':
        return <Clock className="w-3.5 h-3.5" />;
      case 'pending':
        return <Clock className="w-3.5 h-3.5" />;
      default:
        return <Calendar className="w-3.5 h-3.5" />;
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
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('overdue')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                filter === 'overdue'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Overdue
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              All Bookings
            </button>
          </div>
          <button 
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Vehicle
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Pick Up
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Return
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Price
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {bookings.map((booking) => (
              <tr
                key={booking.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {booking.customers?.full_name || 'Unknown'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {booking.customers?.email || ''}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {booking.vehicles
                      ? `${booking.vehicles.make} ${booking.vehicles.model}`
                      : 'N/A'}
                  </div>
                  <div className="text-xs font-mono text-gray-400">
                    {booking.vehicles?.license_plate || ''}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-200">
                    {formatDate(booking.pickup_datetime)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-200">
                    {formatDate(booking.return_datetime)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {getStatusIcon(booking.status)}
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    ${booking.total_price.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Status Actions */}
                    {booking.status === 'confirmed' && (
                       <button 
                        onClick={() => updateStatus(booking.id, 'active')}
                        className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" 
                        title="Check-Out (Active)"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {booking.status === 'active' && (
                       <button 
                        onClick={() => updateStatus(booking.id, 'completed')}
                        className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" 
                        title="Check-In (Complete)"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    {['pending', 'confirmed'].includes(booking.status) && (
                       <button 
                        onClick={() => updateStatus(booking.id, 'cancelled')}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" 
                        title="Cancel Booking"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}

                    <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />

                    {/* General Actions */}
                    <button 
                      onClick={() => handleEdit(booking)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" 
                      title="Edit Booking"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteBooking(booking.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" 
                      title="Delete Booking"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {bookings.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No bookings found</p>
          </div>
        )}
      </div>

      {filter === 'overdue' && bookings.length > 0 && (
        <div className="px-6 py-3 bg-red-50 dark:bg-red-900/30 border-t border-red-100 dark:border-red-800">
          <div className="flex items-center gap-2 text-sm text-red-800 dark:text-red-300">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">{bookings.length} overdue items</span>
            <span className="text-red-600 dark:text-red-400">require immediate attention</span>
          </div>
        </div>
      )}
    </div>
  );
}
