import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ClipboardList, Car, Menu, ChevronDown, CalendarDays, Users, LogOut, UserX, PanelLeft, PanelRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleSidebar: () => void;
}

export default function Sidebar({ isCollapsed, onToggleSidebar }: SidebarProps) {
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
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen transition-all duration-300 overflow-hidden z-20`}>
      <div className={`p-4 border-b border-gray-200 dark:border-gray-700 h-[73px] flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-2 overflow-hidden">
          <Car className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0" />
          {!isCollapsed && <span className="font-semibold text-lg text-gray-900 dark:text-white truncate">Quick Rental</span>}
        </div>
        <button
          onClick={onToggleSidebar}
          className={`p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors border border-gray-200 dark:border-gray-700 shadow-sm shrink-0 ${isCollapsed ? 'hidden' : ''}`}
        >
          <PanelLeft className="w-4 h-4" />
        </button>
        {isCollapsed && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors"
          >
            <PanelRight className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-3 overflow-y-auto scrollbar-hide">
        <div className="space-y-1">
          {role === 'admin' && (
            <button
              onClick={() => navigateTo('')}
              title={isCollapsed ? 'Home' : undefined}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2 rounded-lg text-sm transition-colors ${
                activeView === 'home'
                  ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Home className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span>Home</span>}
            </button>
          )}

          <button
            onClick={() => navigateTo('bookings')}
            title={isCollapsed ? 'Bookings' : undefined}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2 rounded-lg text-sm transition-colors ${
              activeView === 'bookings'
                ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <ClipboardList className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Bookings</span>}
          </button>

          <button
            onClick={() => navigateTo('customers')}
            title={isCollapsed ? 'Clients' : undefined}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2 rounded-lg text-sm transition-colors ${
              activeView === 'customers'
                ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Users className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Clients</span>}
          </button>

          <button
            title={isCollapsed ? 'More' : undefined}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
          >
            <Menu className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>More</span>}
          </button>
        </div>

        <div className="mt-6">
          {!isCollapsed && (
            <div className="px-3 mb-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Workspaces
              </span>
            </div>
          )}

          <div className="space-y-1">
            <div className={`px-3 py-2 ${isCollapsed ? 'flex justify-center' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                    Q
                  </div>
                  {!isCollapsed && <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">Quick Rental</span>}
                </div>
                {!isCollapsed && <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />}
              </div>
            </div>

            <div className={`space-y-1 ${isCollapsed ? 'hidden' : 'ml-8'}`}>
              <button
                onClick={() => navigateTo('fleet')}
                className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                  activeView === 'fleet'
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                Active Vehicles
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
              {role === 'admin' && (
                <>
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
                  <button
                    onClick={() => navigateTo('blacklist')}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors ${
                      activeView === 'blacklist'
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <UserX className="w-4 h-4 text-red-500" />
                    Black Listed
                  </button>
                </>
              )}
            </div>
            
            {/* Collapsed Workspace icons */}
            {isCollapsed && (
              <div className="flex flex-col items-center gap-4 mt-2">
                <button onClick={() => navigateTo('fleet')} title="Active Vehicles" className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                  <Car className="w-5 h-5" />
                </button>
                <button onClick={() => navigateTo('calendar')} title="Calendar View" className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                  <CalendarDays className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className={`p-4 border-t border-gray-200 dark:border-gray-700 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Sign Out' : undefined}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
}
