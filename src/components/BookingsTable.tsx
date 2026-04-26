import { useEffect, useState } from 'react';
import { supabase, Booking } from '../lib/supabase';
import { Calendar, AlertCircle, CheckCircle, Clock, Wrench } from 'lucide-react';

export default function BookingsTable() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'overdue'>('overdue');

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
          customers (id, name, email),
          vehicles (id, make, model, license_plate)
        `)
        .order('start_date', { ascending: true });

      if (filter === 'overdue') {
        query = query.eq('status', 'overdue');
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

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'overdue':
        return 'text-red-600 bg-red-50';
      case 'confirmed':
        return 'text-blue-600 bg-blue-50';
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'cancelled':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'overdue':
        return <AlertCircle className="w-3 h-3" />;
      case 'confirmed':
        return <CheckCircle className="w-3 h-3" />;
      case 'pending':
        return <Clock className="w-3 h-3" />;
      default:
        return <Calendar className="w-3 h-3" />;
    }
  }

  function getInitials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  function getRandomColor(name: string) {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-orange-500',
      'bg-teal-500',
    ];
    const index = name.length % colors.length;
    return colors[index];
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFilter('overdue')}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                filter === 'overdue'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Overdue
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Bookings
            </button>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors">
            + New Item
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Board
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Person
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr
                key={booking.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {booking.customers?.name || 'Unknown'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {booking.vehicles
                      ? `${booking.vehicles.make} ${booking.vehicles.model}`
                      : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {booking.vehicles?.license_plate || ''}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-xs ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                    </span>
                    <span className="text-sm text-gray-900">
                      {formatDate(booking.start_date)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{booking.board_type}</span>
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
                  <div className="text-sm font-medium text-gray-900">
                    ${booking.total_amount.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className={`w-8 h-8 ${getRandomColor(
                      booking.customers?.name || ''
                    )} rounded-full flex items-center justify-center text-white text-xs font-semibold`}
                  >
                    {getInitials(booking.customers?.name || 'UK')}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {bookings.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No bookings found</p>
          </div>
        )}
      </div>

      {filter === 'overdue' && bookings.length > 0 && (
        <div className="px-6 py-3 bg-red-50 border-t border-red-100">
          <div className="flex items-center gap-2 text-sm text-red-800">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">{bookings.length} overdue items</span>
            <span className="text-red-600">require immediate attention</span>
          </div>
        </div>
      )}
    </div>
  );
}
