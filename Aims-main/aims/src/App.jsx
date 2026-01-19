import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";

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

// config
import { ROUTES } from "@/config/constants";
import StudentLayout from "./layout/StudentLayout";

export default function App() {
  return (
    <Routes>

      {/* PUBLIC */}
      <Route path={ROUTES.HOME} element={<AuthPage />} />

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

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />

    </Routes>
  );
}
