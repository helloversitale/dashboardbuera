
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ allowedRoles }: { allowedRoles?: string[] }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // If the user's role is not authorized, redirect them or show unauthorized
    // Assuming redirection to /bookings if unauthorized (better fallback than home, which is restricted)
    return <Navigate to="/bookings" replace />;
  }

  return <Outlet />;
}
