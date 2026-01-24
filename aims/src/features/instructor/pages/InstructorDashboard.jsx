import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "@/layout/DashboardLayout";

// Import the updated pages
import MyCourses from "./MyCourses";
import OfferCourse from "./OfferCourse";
import EnrollmentRequests from "./EnrollmentRequests";
import EnrolledStudents from "./EnrolledStudents";

export default function InstructorDashboard() {
  return (
    <DashboardLayout role="instructor">
      <Routes>
        <Route index element={<Navigate to="courses" replace />} />
        
        {/* Main Routes */}
        <Route path="courses" element={<MyCourses />} />
        <Route path="offer" element={<OfferCourse />} />
        <Route path="requests" element={<EnrollmentRequests />} />
        
        {/* Sub-routes */}
        <Route path="enrolled/:courseId" element={<EnrolledStudents />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="courses" replace />} />
      </Routes>
    </DashboardLayout>
  );
}