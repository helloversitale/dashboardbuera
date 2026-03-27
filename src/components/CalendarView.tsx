import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Car, Info } from 'lucide-react';
import { addDays, format, startOfWeek } from 'date-fns';

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Mock fleet for the timeline view
  const fleet = [
    { id: 1, name: 'Toyota Camry 2023', plate: 'XYZ-1234', status: 'available' },
    { id: 2, name: 'Honda Civic 2022', plate: 'ABC-9876', status: 'rented' },
    { id: 3, name: 'Ford Explorer 2024', plate: 'LMN-4567', status: 'maintenance' },
    { id: 4, name: 'Tesla Model 3', plate: 'EV-001', status: 'damaged' },
  ];

  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  const changeWeek = (offset: number) => {
    setCurrentDate(addDays(currentDate, offset * 7));
  };

  const getRandomStatusForDay = (vehicleStatus: string, dayIndex: number) => {
    if (dayIndex % 3 === 0 && vehicleStatus === 'rented') return 'rented';
    if (dayIndex % 2 === 0 && vehicleStatus === 'maintenance') return 'maintenance';
    if (vehicleStatus === 'damaged') return 'damaged';
    return 'available';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col pt-0 transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Fleet Availability Calendar
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">Track where your cars are across the week.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button onClick={() => changeWeek(-1)} className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded shadow-sm text-gray-600 dark:text-gray-300 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium px-2 text-gray-800 dark:text-gray-200">
              {format(startDate, 'MMM d')} - {format(addDays(startDate, 6), 'MMM d, yyyy')}
            </span>
            <button onClick={() => changeWeek(1)} className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded shadow-sm text-gray-600 dark:text-gray-300 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors">
            Today
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 gap-4 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-700 border border-green-300 dark:border-green-600"></span> Available
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-blue-200 dark:bg-blue-700 border border-blue-300 dark:border-blue-600"></span> Booked
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-orange-200 dark:bg-orange-700 border border-orange-300 dark:border-orange-600"></span> Repair / Mechanic
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-red-200 dark:bg-red-700 border border-red-300 dark:border-red-600"></span> Damaged
        </div>
      </div>

      <div className="overflow-x-auto min-h-[400px]">
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
                {format(day, 'MM-dd') === format(new Date(), 'MM-dd') && (
                  <div className="absolute top-0 right-0 left-0 flex justify-center mt-1">
                    <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Fleet Rows */}
        <div className="min-w-[800px]">
          {fleet.map((car) => (
            <div key={car.id} className="flex border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="w-1/4 min-w-[200px] p-4 border-r border-gray-100 dark:border-gray-700 flex flex-col justify-center">
                <div className="font-medium text-gray-900 dark:text-white text-sm flex items-center gap-2">
                  <Car className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  {car.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-300 mt-0.5 ml-6">{car.plate}</div>
              </div>
              <div className="w-3/4 flex relative">
                {days.map((_, i) => {
                  const dayStatus = getRandomStatusForDay(car.status, i);
                  return (
                    <div key={i} className="flex-1 border-r border-gray-100 dark:border-gray-700 last:border-0 p-1">
                      {dayStatus === 'rented' && (
                        <div className="h-full w-full bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700 rounded p-2 flex flex-col justify-center">
                          <span className="text-xs font-bold text-blue-800 dark:text-blue-300 block">Booked</span>
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
                        <div className="h-full w-full rounded p-2 flex flex-col justify-center hover:bg-green-50/50 dark:hover:bg-green-900/20 cursor-pointer border border-transparent hover:border-green-200 dark:hover:border-green-700 transition-colors group">
                          <span className="text-xs font-medium text-green-600 dark:text-green-400 opacity-0 group-hover:opacity-100 text-center">Available</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Info Footer */}
      <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 border-t border-blue-100 dark:border-blue-800 flex items-start gap-3 text-sm text-blue-800 dark:text-blue-300">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
        <p>This is your interactive fleet availability calendar. You can click on any 'Available' block to instantly create a new booking for that specific car and date. Drag across days for multi-day bookings.</p>
      </div>
    </div>
  );
}
