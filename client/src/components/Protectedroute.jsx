import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AppContent } from "../context/AppContent";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isLoggedIn, userData, loading } = useContext(AppContent);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!isLoggedIn || !userData) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && userData.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
