import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AppContent } from "../context/AppContext";

const ProtectedRoute = ({ children, requireAdmin = false }) => {

  const { isLoggedIn, userData, loading } = useContext(AppContent);
  const location = useLocation();

  if (loading) return null;

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && userData?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;