import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return <div>Φόρτωση...</div>;
  }

  if (!user) {
    // Redirect to login page, but save the location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if admin access is required
  if (requireAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/404" replace />;
  }

  return children;
};

export default ProtectedRoute;
