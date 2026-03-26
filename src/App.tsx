import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import InternalLayout from './components/layouts/InternalLayout';
import { AuthProvider } from './contexts/AuthContext';

// Pages & Components (Re-using old components for now in new routes)
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

import Dashboard from './components/Dashboard';
import BookingsTable from './components/BookingsTable';
import FleetManagement from './components/FleetManagement';
import CalendarView from './components/CalendarView';
import TeamAccess from './components/TeamAccess';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<InternalLayout />}>
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/" element={<Dashboard />} />
              </Route>
              
              <Route path="/fleet" element={<FleetManagement />} />
              <Route path="/bookings" element={<BookingsTable />} />
              <Route path="/calendar" element={<CalendarView />} />
              
              <Route element={<ProtectedRoute allowedRoles={['admin', 'manager']} />}>
                <Route path="/team" element={<TeamAccess />} />
              </Route>

              <Route path="*" element={<Navigate to="/bookings" replace />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
