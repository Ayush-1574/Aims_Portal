import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/core/context/AuthContext"; 
import ProtectedRoute from "@/core/routes/ProtectedRoute";

// --- FEATURE ROUTERS ---
// We import the Router files we will create in the next steps
import AuthPage from "@/features/auth/pages/AuthPage";
import StudentDashboard from "@/features/student/pages/StudentDashboard";
import InstructorDashboard from "@/features/instructor/pages/InstructorDashboard";
import AdvisorDashboard from "@/features/advisor/pages/AdvisorDashboard";
import AdminDashboard from "@/features/admin/pages/AdminDashboard"; // Note: This will be a new file

// Home Route
function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  if (user) {
    switch (user.role) {
      case "student": return <Navigate to="/student" replace />;
      case "instructor": return <Navigate to="/instructor" replace />;
      case "faculty_advisor": return <Navigate to="/advisor" replace />;
      case "admin": return <Navigate to="/admin" replace />;
      default: return <Navigate to="/login" replace />;
    }
  }
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/login" element={<AuthPage />} />

      {/* FIXED PATHS: Removed '/dashboard' from the path.
         Now /student matches the Sidebar link /student 
      */}
      
      <Route 
        path="/student/*" 
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/instructor/*" 
        element={
          <ProtectedRoute allowedRoles={["instructor"]}>
            <InstructorDashboard />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/advisor/*" 
        element={
          <ProtectedRoute allowedRoles={["faculty_advisor"]}>
            <AdvisorDashboard />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}