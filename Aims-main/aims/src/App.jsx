import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

// pages
import AuthPage from "@/pages/auth/AuthPage";
import CoursesPage from "@/pages/student/CoursesPage";
import StudentRecord from "@/pages/student/StudentRecord";
import StudentDashboard from "@/pages/student/StudentDashboard";

// instructor
import OfferCourse from "@/pages/Instructor/OfferCourse";
import EnrolledStudents from "@/pages/Instructor/EnrolledStudents";
import MyCourses from "@/pages/Instructor/MyCourses";
import EnrollmentRequests from "@/pages/Instructor/EnrollmentRequests";
import InstructorDashboard from "./pages/Instructor/InstructorDashboard";

// advisor
import AdvisorCourseApprovals from "./pages/Advisor/AdvisorCourseApprovals";
import AdvisorCourseStatus from "./pages/Advisor/AdvisorCourseStatus";
import AdvisorDashboard from "./pages/Advisor/AdvisorDashboard";
import AdvisorEnrollmentRequests from "./pages/Advisor/AdvisorEnrollmentRequests";

// admin
import AdminLayout from "./layout/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import UserManagement from "./pages/Admin/UserManagement";
import CreateUser from "./pages/Admin/CreateUser";

// config
import { ROUTES } from "@/config/constants";
import StudentLayout from "./layout/StudentLayout";

// Smart home route that redirects authenticated users to their dashboard
function HomeRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, redirect to appropriate dashboard
  if (user) {
    switch (user.role) {
      case "student":
        return <Navigate to={ROUTES.STUDENT_DASHBOARD} replace />;
      case "instructor":
        return <Navigate to="/instructor/dashboard" replace />;
      case "faculty_advisor":
        return <Navigate to="/advisor/dashboard" replace />;
      case "admin":
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <AuthPage />;
    }
  }

  // Not authenticated, show login
  return <AuthPage />;
}

export default function App() {
  return (
    <Routes>

      {/* HOME - Smart redirect based on auth state */}
      <Route path={ROUTES.HOME} element={<HomeRoute />} />
      <Route path="/login" element={<AuthPage />} />

      {/* STUDENT */}
      <Route
        path={ROUTES.STUDENT_DASHBOARD}
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CoursesPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="record" element={<StudentRecord />} />
      </Route>

      {/* INSTRUCTOR */}
      <Route
        path="/instructor/dashboard/*"
        element={
          <ProtectedRoute allowedRoles={["instructor"]}>
            <InstructorDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<MyCourses />} />
        <Route path="offer" element={<OfferCourse />} />
        <Route path="courses" element={<MyCourses />} />
        <Route path="requests" element={<EnrollmentRequests />} />
        <Route path="enrolled/:courseId" element={<EnrolledStudents />} />
      </Route>

      {/* ADVISOR */}
      <Route
        path="/advisor/dashboard/*"
        element={
          <ProtectedRoute allowedRoles={["faculty_advisor"]}>
            <AdvisorDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="courses" replace />} />
        <Route path="courses" element={<AdvisorCourseApprovals />} />
        <Route path="enrollments" element={<AdvisorEnrollmentRequests />} />
        <Route path="status" element={<AdvisorCourseStatus />} />
      </Route>

      {/* ADMIN */}
      <Route
        path="/admin/dashboard/*"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="create" element={<CreateUser />} />
        <Route path="users" element={<UserManagement />} />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />

    </Routes>
  );
}
