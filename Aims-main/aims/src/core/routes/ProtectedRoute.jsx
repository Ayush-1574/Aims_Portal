import { Navigate } from "react-router-dom";
import { useAuth } from "@/core/context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  // Wait for /auth/me before making a decision
  if (loading) return <div>Checking session...</div>;

  // Not logged in
  if (!user) return <Navigate to="/login" replace />;

  // Role mismatch
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
