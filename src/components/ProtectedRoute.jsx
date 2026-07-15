import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    // Not logged in → redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && role !== 'Admin' && role !== 'SUPER_ADMIN') {
    // Admin-only page but user is not admin → redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;