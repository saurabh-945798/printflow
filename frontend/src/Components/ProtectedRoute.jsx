import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-white">Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  // Redirect authenticated users without required role back to dashboard.
  if (role && user.role !== role)
    return <Navigate to="/dashboard" replace />;

  return children;
};

export default ProtectedRoute;
