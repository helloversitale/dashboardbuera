import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import BookingsTable from './components/BookingsTable';
import FleetManagement from './components/FleetManagement';
import CalendarView from './components/CalendarView';
import TeamAccess from './components/TeamAccess';

function App() {
  const [activeView, setActiveView] = useState('my-work');

  const getPageTitle = () => {
    switch (activeView) {
      case 'home':
        return 'Home';
      case 'my-work':
        return 'My Work';
      case 'bookings':
        return 'Bookings';
      case 'fleet':
        return 'Active Vehicle Inventory';
      case 'calendar':
        return 'Calendar View';
      case 'team':
        return 'Team & Roles';
      default:
        return 'Quick Car Rental';
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'home':
        return <Dashboard />;
      case 'my-work':
        return <BookingsTable />;
      case 'bookings':
        return <BookingsTable />;
      case 'fleet':
        return <FleetManagement />;
      case 'calendar':
        return <CalendarView />;
      case 'team':
        return <TeamAccess />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={getPageTitle()} />
        <main className="flex-1 overflow-y-auto p-6 relative">
          {renderContent()}
          <ErrorButton />
        </main>
      </div>
    </div>
  );
}

function ErrorButton() {
  return (
    <button
      onClick={() => {
        throw new Error('This is your first error!');
      }}
      className="fixed bottom-20 right-4 z-50 bg-red-600 text-white rounded px-4 py-2 hover:bg-red-700 font-medium shadow-md transition-colors"
    >
      Break the world
    </button>
  );
}

export default App;
