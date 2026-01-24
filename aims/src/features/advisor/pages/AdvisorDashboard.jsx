import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "@/layout/DashboardLayout";

// Import Pages
import CourseApprovals from "./CourseApprovals";
import EnrollmentRequests from "./EnrollmentRequests";
import CourseStatus from "./CourseStatus";

export default function AdvisorDashboard() {
  return (
    <DashboardLayout role="faculty_advisor">
      <Routes>
        <Route index element={<Navigate to="courses" replace />} />
        {/* <Route path="courses" element={<CourseApprovals />} /> */}
        <Route path="enrollments" element={<EnrollmentRequests />} />
        <Route path="status" element={<CourseStatus />} />
        <Route path="*" element={<Navigate to="courses" replace />} />
      </Routes>
    </DashboardLayout>
  );
}