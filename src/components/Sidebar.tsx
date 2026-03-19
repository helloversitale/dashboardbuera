import { Home, ClipboardList, Car, Menu, ChevronDown, CalendarDays, Users } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Car className="w-6 h-6 text-blue-600" />
          <span className="font-semibold text-lg">Quick Car Rental</span>
        </div>
      </div>

      <nav className="flex-1 p-3">
        <div className="space-y-1">
          <button
            onClick={() => onViewChange('home')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              activeView === 'home'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>

          <button
            onClick={() => onViewChange('my-work')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              activeView === 'my-work'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>My Work</span>
          </button>

          <button
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-4 h-4" />
            <span>More</span>
          </button>
        </div>

        <div className="mt-6">
          <div className="px-3 mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Workspaces
            </span>
          </div>

          <div className="space-y-1">
            <div className="px-3 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white text-xs font-semibold">
                    Q
                  </div>
                  <span className="text-sm font-medium text-gray-900">Quick Car Rental</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="ml-8 space-y-1">
              <button
                onClick={() => onViewChange('bookings')}
                className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                  activeView === 'bookings'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Booking
              </button>
              <button
                onClick={() => onViewChange('fleet')}
                className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                  activeView === 'fleet'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Active Vehicle Inventory
              </button>
              <button
                onClick={() => onViewChange('calendar')}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors ${
                  activeView === 'calendar'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                Calendar View
              </button>
              <button
                onClick={() => onViewChange('team')}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors ${
                  activeView === 'team'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Users className="w-4 h-4" />
                Team & Roles
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
