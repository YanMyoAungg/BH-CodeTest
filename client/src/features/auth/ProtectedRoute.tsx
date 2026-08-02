import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
