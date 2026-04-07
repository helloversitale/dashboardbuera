import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Car } from 'lucide-react';
import { addDays, format, isWithinInterval, startOfDay, startOfWeek } from 'date-fns';
import { supabase, Vehicle, Booking } from '../lib/supabase';
import BookingForm from './BookingForm';

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'rented' | 'maintenance' | 'damaged'>('all');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const [selectedBookingForForm, setSelectedBookingForForm] = useState<any>(null);

  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const endDate = addDays(startDate, 6);
  const days = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch all vehicles
      const { data: vData } = await supabase.from('vehicles').select('*').order('make');
      if (vData) setVehicles(vData);

      // Fetch bookings in this range
      const { data: bData } = await supabase
        .from('bookings')
        .select('*, customers(full_name)')
        .neq('status', 'cancelled')
        .or(`pickup_datetime.lte.${endDate.toISOString()},return_datetime.gte.${startDate.toISOString()}`);
      
      if (bData) setBookings(bData);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  }

  const getVehicleStatusForDate = (vehicle: Vehicle, date: Date) => {
    // 1. Check if vehicle itself is maintenance or damaged
    if (vehicle.status === 'maintenance') return 'maintenance';
    if (vehicle.status === 'damaged') return 'damaged';

    // 2. Check if there's a booking for this day
    const dayStart = startOfDay(date);
    const hasBooking = bookings.some(b => {
      if (b.vehicle_id !== vehicle.id) return false;
      const start = startOfDay(new Date(b.pickup_datetime));
      const end = startOfDay(new Date(b.return_datetime));
      return isWithinInterval(dayStart, { start, end });
    });

    return hasBooking ? 'rented' : 'available';
  };

  const filteredFleet = statusFilter === 'all' 
    ? vehicles 
    : vehicles.filter(car => {
        return days.some((day) => getVehicleStatusForDate(car, day) === statusFilter);
    });

  const changeWeek = (offset: number) => {
    setCurrentDate(addDays(currentDate, offset * 7));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col pt-0 transition-colors">
      {/* Header */}
      <div className="p-3 md:p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="truncate">Fleet Availability</span>
          </h2>
          <p className="hidden md:block text-sm text-gray-500 dark:text-gray-300 mt-1">Track where your cars are across the week.</p>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2 md:gap-4">
          <div className="flex items-center gap-1 md:gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button onClick={() => changeWeek(-1)} className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded shadow-sm text-gray-600 dark:text-gray-300 transition-colors">
              <ChevronLeft className="w-4 h-4 md:w-5 h-5" />
            </button>
            <span className="text-[10px] md:text-sm font-bold px-1 md:px-2 text-gray-800 dark:text-gray-200 whitespace-nowrap">
              {format(startDate, 'MMM d')} - {format(addDays(startDate, 6), 'MMM d')}
            </span>
            <button onClick={() => changeWeek(1)} className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded shadow-sm text-gray-600 dark:text-gray-300 transition-colors">
              <ChevronRight className="w-4 h-4 md:w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 text-white text-xs md:text-sm font-medium rounded hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 active:scale-95"
          >
            Today
          </button>
        </div>
      </div>

      {/* Legend & Filter */}
      <div className="flex px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 gap-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest overflow-x-auto scrollbar-hide">
        <button 
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1 rounded-full border transition-all ${statusFilter === 'all' ? 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white' : 'bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        >
          All Units
        </button>
        <button 
          onClick={() => setStatusFilter('available')}
          className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${statusFilter === 'available' ? 'bg-green-100 dark:bg-green-900/40 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' : 'bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Available
        </button>
        <button 
          onClick={() => setStatusFilter('rented')}
          className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${statusFilter === 'rented' ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' : 'bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Booked
        </button>
        <button 
          onClick={() => setStatusFilter('maintenance')}
          className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${statusFilter === 'maintenance' ? 'bg-orange-100 dark:bg-orange-900/40 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300' : 'bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Repair / Mechanic
        </button>
        <button 
          onClick={() => setStatusFilter('damaged')}
          className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${statusFilter === 'damaged' ? 'bg-red-100 dark:bg-red-900/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300' : 'bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Damaged
        </button>
      </div>

      <div className="overflow-x-auto min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
          {/* Day Headers */}
          <div className="flex min-w-[800px] border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10 transition-colors">
            <div className="w-1/4 min-w-[200px] p-4 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 flex items-end">
              Vehicle
            </div>
            <div className="w-3/4 flex">
              {days.map((day, i) => (
                <div key={i} className="flex-1 p-3 text-center border-r border-gray-200 dark:border-gray-700 last:border-0 relative">
                  <span className="block text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-widest">{format(day, 'EEE')}</span>
                  <span className={`text-xl font-bold ${format(day, 'MM-dd') === format(new Date(), 'MM-dd') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                    {format(day, 'd')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Fleet Rows */}
          <div className="min-w-[800px]">
            {filteredFleet.map((car) => (
              <div key={car.id} className="flex border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="w-1/4 min-w-[200px] p-4 border-r border-gray-100 dark:border-gray-700 flex flex-col justify-center">
                  <div className="font-medium text-gray-900 dark:text-white text-sm flex items-center gap-2">
                    <Car className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    {car.make} {car.model}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-300 mt-0.5 ml-6">{car.license_plate}</div>
                </div>
                <div className="w-3/4 flex relative">
                  {days.map((day, i) => {
                    const dayStatus = getVehicleStatusForDate(car, day);
                    const bookingToday = dayStatus === 'rented' ? bookings.find(b => {
                      const start = startOfDay(new Date(b.pickup_datetime));
                      const end = startOfDay(new Date(b.return_datetime));
                      return b.vehicle_id === car.id && isWithinInterval(startOfDay(day), { start, end });
                    }) : null;

                    return (
                      <div key={i} className="flex-1 border-r border-gray-100 dark:border-gray-700 last:border-0 p-1">
                        {dayStatus === 'rented' && (
                          <div className="h-full w-full bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700 rounded p-2 flex flex-col justify-center">
                            <span className="text-[10px] md:text-xs font-bold text-blue-800 dark:text-blue-300 block truncate">
                               {bookingToday?.customers?.full_name || 'Booked'}
                            </span>
                          </div>
                        )}
                        {dayStatus === 'maintenance' && (
                          <div className="h-full w-full bg-orange-100 dark:bg-orange-900/50 border border-orange-200 dark:border-orange-700 rounded p-2 flex flex-col justify-center">
                            <span className="text-xs font-bold text-orange-800 dark:text-orange-300 block">Mechanic</span>
                          </div>
                        )}
                        {dayStatus === 'damaged' && (
                          <div className="h-full w-full bg-red-100 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded p-2 flex flex-col justify-center">
                            <span className="text-xs font-bold text-red-800 dark:text-red-300 block">Damaged</span>
                          </div>
                        )}
                        {dayStatus === 'available' && (
                          <div 
                            onClick={() => {
                              const pickup = new Date(day);
                              pickup.setHours(9, 0, 0, 0); // Default 9 AM
                              const returnDate = new Date(pickup);
                              returnDate.setDate(returnDate.getDate() + 1); // Default 1 day
                              
                              setSelectedBookingForForm({
                                vehicle_id: car.id,
                                pickup_datetime: pickup.toISOString(),
                                return_datetime: returnDate.toISOString()
                              });
                              setIsBookingFormOpen(true);
                            }}
                            className="h-full w-full rounded p-2 flex flex-col justify-center bg-green-50/10 dark:bg-green-900/5 hover:bg-green-50/40 dark:hover:bg-green-900/20 cursor-pointer border border-transparent hover:border-green-200/50 dark:hover:border-green-700/50 transition-colors group"
                          >
                            <span className="text-[10px] font-medium text-green-600/30 dark:text-green-400/20 group-hover:opacity-100 text-center transition-opacity">Available</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </div>

      {isBookingFormOpen && (
        <BookingForm 
          booking={selectedBookingForForm}
          onClose={() => setIsBookingFormOpen(false)}
          onSuccess={() => {
            setIsBookingFormOpen(false);
            fetchData();
          }}
        />
      )}
      

    </div>
  );
}
