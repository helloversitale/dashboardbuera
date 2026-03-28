import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar';
import Header from '../Header';

export default function InternalLayout() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/':
        return 'Home';
      case '/bookings':
        return 'Bookings';
      case '/customers':
        return 'Clients Management';
      case '/fleet':
        return 'Active Vehicle Inventory';
      case '/calendar':
        return 'Calendar View';
      case '/team':
        return 'Team & Roles';
      case '/blacklist':
        return 'Black List';
      case '/profile':
        return 'Profile';
      default:
        return 'Quick Car Rental';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-all duration-300">
      <Sidebar 
        isCollapsed={isCollapsed} 
        onToggleSidebar={() => setIsCollapsed(!isCollapsed)} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={getPageTitle(location.pathname)} />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950 transition-colors">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
