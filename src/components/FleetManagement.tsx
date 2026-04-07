import { useEffect, useState } from 'react';
import { supabase, Vehicle } from '../lib/supabase';
import { Car, Wrench, CheckCircle, AlertTriangle } from 'lucide-react';
import VehicleForm from './VehicleForm';

export default function FleetManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'booked' | 'maintenance' | 'damaged'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | undefined>();

  useEffect(() => {
    fetchVehicles();
  }, [filter]);

  async function fetchVehicles() {
    setLoading(true);
    try {
      let query = supabase.from('vehicles').select('*').order('created_at', { ascending: false });
      
      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (!error && data) {
        setVehicles(data);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'available':
        return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700';
      case 'booked':
        return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      case 'maintenance':
        return 'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-700';
      case 'damaged':
        return 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  }

  const stats = {
    total: vehicles.length,
    available: vehicles.filter((v) => v.status === 'available').length,
    booked: vehicles.filter((v) => v.status === 'booked').length,
    maintenance: vehicles.filter((v) => v.status === 'maintenance').length,
    damaged: vehicles.filter((v) => v.status === 'damaged').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6 transition-colors group">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium truncate uppercase tracking-widest">Total</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 dark:bg-gray-700 rounded-lg hidden sm:flex items-center justify-center shrink-0">
              <Car className="w-5 h-5 md:w-6 md:h-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6 transition-colors group">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium truncate uppercase tracking-widest">Available</p>
              <p className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.available}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900/40 rounded-lg hidden sm:flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6 transition-colors group">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium truncate uppercase tracking-widest">Booked</p>
              <p className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.booked}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900/40 rounded-lg hidden sm:flex items-center justify-center shrink-0">
              <Car className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6 transition-colors group">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium truncate uppercase tracking-widest">Maintenance</p>
              <p className="text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">{stats.maintenance}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 dark:bg-orange-900/40 rounded-lg hidden sm:flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5 md:w-6 md:h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6 transition-colors group">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium truncate uppercase tracking-widest">Damaged</p>
              <p className="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.damaged}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 dark:bg-red-900/40 rounded-lg hidden sm:flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded transition-colors whitespace-nowrap ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('available')}
                className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded transition-colors whitespace-nowrap ${
                  filter === 'available'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Available
              </button>
              <button
                onClick={() => setFilter('booked')}
                className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded transition-colors whitespace-nowrap ${
                  filter === 'booked'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Booked
              </button>
              <button
                onClick={() => setFilter('maintenance')}
                className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded transition-colors whitespace-nowrap ${
                  filter === 'maintenance'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Maintenance
              </button>
              <button
                onClick={() => setFilter('damaged')}
                className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded transition-colors whitespace-nowrap ${
                  filter === 'damaged'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Damaged
              </button>
            </div>
            <button 
              onClick={() => {
                setSelectedVehicle(undefined);
                setIsFormOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors shrink-0"
            >
              + Add Vehicle
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                    <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{vehicle.year}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(
                    vehicle.status
                  )}`}
                >
                  {vehicle.status}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Plate</span>
                  <span className="font-mono text-gray-900 dark:text-white">{vehicle.license_plate}</span>
                </div>
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Color</span>
                  <span className="text-gray-900 dark:text-white capitalize">{vehicle.color}</span>
                </div>
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Daily Rate</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">${vehicle.pricing_per_day}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button 
                  onClick={() => {
                    setSelectedVehicle(vehicle);
                    setIsFormOpen(true);
                  }}
                  className="w-full px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors border border-blue-100 dark:border-blue-900/50"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {isFormOpen && (
          <VehicleForm
            vehicle={selectedVehicle}
            onClose={() => setIsFormOpen(false)}
            onSuccess={() => {
              setIsFormOpen(false);
              fetchVehicles();
            }}
          />
        )}

        {vehicles.length === 0 && !isFormOpen && (
          <div className="text-center py-12">
            <Car className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No vehicles found</p>
          </div>
        )}
      </div>
    </div>
  );
}
