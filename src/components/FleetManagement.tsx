import { useEffect, useState } from 'react';
import { supabase, Vehicle } from '../lib/supabase';
import { Car, Wrench, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';

export default function FleetManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'rented' | 'maintenance' | 'damaged'>('all');

  useEffect(() => {
    fetchVehicles();
  }, [filter]);

  async function fetchVehicles() {
    setLoading(true);
    try {
      const mockData: Vehicle[] = [
        { id: '1', make: 'Hyundai', model: 'Accent 2019', year: 2019, license_plate: 'A-67507', status: 'available', daily_rate: 45, color: 'White', created_at: new Date().toISOString() },
        { id: '2', make: 'Kia', model: 'Picanto 2016', year: 2016, license_plate: 'A-13407', status: 'rented', daily_rate: 35, color: 'White', created_at: new Date().toISOString() },
        { id: '3', make: 'Nissan', model: 'March 2007', year: 2007, license_plate: 'A-80018', status: 'available', daily_rate: 25, color: 'Grey', created_at: new Date().toISOString() },
        { id: '4', make: 'Kia', model: 'Picanto 2014', year: 2014, license_plate: 'A-30564', status: 'maintenance', daily_rate: 30, color: 'White', created_at: new Date().toISOString() },
        { id: '5', make: 'Hyundai', model: 'Accent 2019', year: 2019, license_plate: 'A-34479', status: 'available', daily_rate: 45, color: 'Red', created_at: new Date().toISOString() },
        { id: '6', make: 'Ford', model: 'Eco Sport 2014', year: 2014, license_plate: 'A-17684', status: 'rented', daily_rate: 40, color: 'Grey', created_at: new Date().toISOString() },
        { id: '7', make: 'Kia', model: 'Rio 2014', year: 2014, license_plate: 'A-82824', status: 'available', daily_rate: 35, color: 'Grey', created_at: new Date().toISOString() },
        { id: '8', make: 'Hyundai', model: 'I10 Grand 2016', year: 2016, license_plate: 'A-16148', status: 'damaged', daily_rate: 40, color: 'Silver', created_at: new Date().toISOString() }
      ];

      let queryRes = mockData;

      try {
        let query = supabase.from('vehicles').select('*').order('created_at', { ascending: false });
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          queryRes = data;
        }
      } catch (error) {
        // Fall back to mock
      }

      if (filter !== 'all') {
        queryRes = queryRes.filter((v) => v.status === filter);
      }

      setVehicles(queryRes);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rented':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'damaged':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4" />;
      case 'rented':
        return <Car className="w-4 h-4" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4" />;
      case 'damaged':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  }

  const stats = {
    total: vehicles.length,
    available: vehicles.filter((v) => v.status === 'available').length,
    rented: vehicles.filter((v) => v.status === 'rented').length,
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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Vehicles</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.available}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rented</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.rented}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Maintenance</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{stats.maintenance}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Damaged</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.damaged}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('available')}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                  filter === 'available'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Available
              </button>
              <button
                onClick={() => setFilter('rented')}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                  filter === 'rented'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Rented
              </button>
              <button
                onClick={() => setFilter('maintenance')}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                  filter === 'maintenance'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Maintenance
              </button>
              <button
                onClick={() => setFilter('damaged')}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                  filter === 'damaged'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Damaged
              </button>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors">
              + Add Vehicle
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Car className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="text-sm text-gray-500">{vehicle.year}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    vehicle.status
                  )}`}
                >
                  {getStatusIcon(vehicle.status)}
                  {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">License Plate</span>
                  <span className="font-medium text-gray-900">{vehicle.license_plate}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Color</span>
                  <span className="font-medium text-gray-900">{vehicle.color}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Daily Rate</span>
                  <span className="font-semibold text-blue-600">${vehicle.daily_rate}/day</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="w-full px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {vehicles.length === 0 && (
          <div className="text-center py-12">
            <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No vehicles found</p>
          </div>
        )}
      </div>
    </div>
  );
}
