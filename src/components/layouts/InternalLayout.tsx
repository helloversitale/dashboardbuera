import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar';
import Header from '../Header';

export default function InternalLayout() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const getPageTitle = (pathname: string) => {
    // ... same as before
    switch (pathname) {
      case '/': return 'Home';
      case '/bookings': return 'Bookings';
      case '/customers': return 'Clients';
      case '/fleet': return 'Fleet';
      case '/calendar': return 'Calendar';
      case '/team': return 'Team';
      case '/blacklist': return 'Blacklist';
      case '/profile': return 'Profile';
      default: return 'Quick Rental';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-all duration-300 relative">
      <Sidebar 
        isCollapsed={isCollapsed} 
        onToggleSidebar={() => setIsCollapsed(!isCollapsed)} 
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          title={getPageTitle(location.pathname)} 
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-950 transition-colors">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
