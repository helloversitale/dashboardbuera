import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ClipboardList, Car, Menu, ChevronDown, CalendarDays, Users, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();
  
  const activeView = location.pathname.substring(1) || 'home';

  const navigateTo = (path: string) => {
    navigate(`/${path}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen transition-colors">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Car className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-lg text-gray-900 dark:text-white">Quick Car Rental</span>
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-1">
          {role === 'admin' && (
            <button
              onClick={() => navigateTo('')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeView === 'home'
                  ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
          )}

          <button
            onClick={() => navigateTo('bookings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              activeView === 'bookings'
                ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Bookings</span>
          </button>

          <button
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-4 h-4" />
            <span>More</span>
          </button>
        </div>

        <div className="mt-6">
          <div className="px-3 mb-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Quick Car Rental</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </div>
            </div>

            <div className="ml-8 space-y-1">
              <button
                onClick={() => navigateTo('fleet')}
                className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                  activeView === 'fleet'
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                Active Vehicle Inventory
              </button>
              <button
                onClick={() => navigateTo('calendar')}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors ${
                  activeView === 'calendar'
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                Calendar View
              </button>
              {(role === 'manager' || role === 'admin') && (
                <button
                  onClick={() => navigateTo('team')}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors ${
                    activeView === 'team'
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Team & Roles
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
