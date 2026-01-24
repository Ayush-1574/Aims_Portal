import { Navigate } from "react-router-dom";
import { useAuth } from "@/core/context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  // Wait for /auth/me before making a decision
  if (loading) return <div>Checking session...</div>;

  // Not logged in
  if (!user) return <Navigate to="/login" replace />;

  // --- CHANGED LOGIC STARTS HERE ---
  // Check if the user has permission.
  // We use .some() to check if ANY of the allowed roles match the user's role/capabilities
  const isAllowed = allowedRoles ? allowedRoles.some(role => {
    // 1. Exact match (e.g. Student accessing Student route)
    if (user.role === role) return true;
    
    // 2. Hierarchy match: Advisor accessing Instructor route
    // If the route allows 'instructor', we also allow 'faculty_advisor'
    if (role === 'instructor' && user.role === 'faculty_advisor') return true;
    
    return false;
  }) : true; // If allowedRoles is undefined, allow everyone (optional safety)

  if (!isAllowed) {
    return <Navigate to="/" replace />;
  }
  // --- CHANGED LOGIC ENDS HERE ---

  return children;
}