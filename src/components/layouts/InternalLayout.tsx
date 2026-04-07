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
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-950 transition-colors relative">
          {/* Dashboard Accent Background */}
          <div 
            className="fixed bottom-0 right-0 w-[500px] h-[300px] md:w-[800px] md:h-[500px] opacity-[0.03] dark:opacity-[0.07] pointer-events-none z-0 translate-x-1/4 translate-y-1/4 hidden lg:block"
            style={{ 
              backgroundImage: "url('/login-bg.png')",
              backgroundSize: 'contain',
              backgroundPosition: 'right bottom',
              backgroundRepeat: 'no-repeat',
              filter: 'grayscale(100%) contrast(120%)'
            }}
          />
          <div className="max-w-[1600px] mx-auto relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
