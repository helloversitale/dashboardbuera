import { useState, useEffect } from 'react';
import { supabase, Customer, Vehicle } from '../lib/supabase';
import { X, Save, Calendar, User, Car, DollarSign, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface BookingFormProps {
  onClose: () => void;
  onSuccess: () => void;
  booking?: any;
}

export default function BookingForm({ onClose, onSuccess, booking }: BookingFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  const [formData, setFormData] = useState({
    customer_id: booking?.customer_id || '',
    vehicle_id: booking?.vehicle_id || '',
    pickup_datetime: booking?.pickup_datetime ? new Date(booking.pickup_datetime).toISOString().slice(0, 16) : '',
    return_datetime: booking?.return_datetime ? new Date(booking.return_datetime).toISOString().slice(0, 16) : '',
    total_price: booking?.total_price || 0,
    status: booking?.status || 'pending',
    notes: booking?.notes || '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    try {
      const [customersRes, vehiclesRes] = await Promise.all([
        supabase.from('customers').select('*').order('full_name'),
        supabase.from('vehicles').select('*').eq('status', 'available').order('name_title')
      ]);

      if (customersRes.data) setCustomers(customersRes.data);
      if (vehiclesRes.data) {
        // If editing, include the current vehicle even if not 'available'
        if (booking?.vehicle_id) {
            const { data: currentVehicle } = await supabase.from('vehicles').select('*').eq('id', booking.vehicle_id).single();
            if (currentVehicle && !vehiclesRes.data.find(v => v.id === currentVehicle.id)) {
                setVehicles([...vehiclesRes.data, currentVehicle]);
            } else {
                setVehicles(vehiclesRes.data);
            }
        } else {
            setVehicles(vehiclesRes.data);
        }
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
    }
  }

  // Auto-calculate price when dates or vehicle change
  useEffect(() => {
    if (formData.vehicle_id && formData.pickup_datetime && formData.return_datetime) {
      const vehicle = vehicles.find(v => v.id === formData.vehicle_id);
      if (vehicle) {
        const start = new Date(formData.pickup_datetime);
        const end = new Date(formData.return_datetime);
        const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
        setFormData(prev => ({ ...prev, total_price: days * vehicle.pricing_per_day }));
      }
    }
  }, [formData.vehicle_id, formData.pickup_datetime, formData.return_datetime, vehicles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const payload = {
        ...formData,
        staff_created_by: user.id,
      };

      if (booking?.id) {
        const { error } = await supabase
          .from('bookings')
          .update(payload)
          .eq('id', booking.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('bookings')
          .insert([payload]);
        if (error) throw error;

        // Also update vehicle status to 'booked'
        await supabase.from('vehicles').update({ status: 'booked' }).eq('id', formData.vehicle_id);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving booking:', error);
      alert('Failed to save booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            {booking ? 'Edit Booking' : 'New Reservation'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                Select Client
              </label>
              <select
                required
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="">Choose a client...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.full_name} ({c.phone})</option>
                ))}
              </select>
            </div>

            {/* Vehicle Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Car className="w-4 h-4 text-gray-400" />
                Select Vehicle
              </label>
              <select
                required
                value={formData.vehicle_id}
                onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="">Choose a vehicle...</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.make} {v.model} - {v.license_plate} (${v.pricing_per_day}/day)</option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                Pick-up Date & Time
              </label>
              <input
                required
                type="datetime-local"
                value={formData.pickup_datetime}
                onChange={(e) => setFormData({ ...formData, pickup_datetime: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                Return Date & Time
              </label>
              <input
                required
                type="datetime-local"
                value={formData.return_datetime}
                onChange={(e) => setFormData({ ...formData, return_datetime: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="active">Active (Picked Up)</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                Total Price
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.total_price}
                  onChange={(e) => setFormData({ ...formData, total_price: parseFloat(e.target.value) })}
                  className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-bold"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              Notes / Special Requests
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all h-24 resize-none"
              placeholder="e.g. Needs baby seat, Full tank requested..."
            />
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Creating...' : (booking ? 'Update Reservation' : 'Confirm Booking')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
