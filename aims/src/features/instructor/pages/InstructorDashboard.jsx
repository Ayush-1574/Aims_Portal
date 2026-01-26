
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "@/layout/DashboardLayout";

// Import your pages
import MyCourses from "./MyCourses";
import OfferCourse from "./OfferCourse";
import EnrolledStudents from "./EnrolledStudents";
import EnrollmentRequests from "./EnrollmentRequests";

// ✅ NEW IMPORTS
import InstructorFeedback from "./InstructorFeedback";
import FeedbackDetails from "./FeedbackDetails";

export default function InstructorDashboard() {
  return (
    <DashboardLayout role="instructor">
      <Routes>
        {/* Default redirect to courses */}
        <Route index element={<Navigate to="courses" replace />} />

        <Route path="courses" element={<MyCourses />} />
        <Route path="offer" element={<OfferCourse />} />
        
        {/* Student Management Routes */}
        <Route path="enrolled/:courseId" element={<EnrolledStudents />} />
        <Route path="requests" element={<EnrollmentRequests />} />

        {/* ✅ NEW FEEDBACK ROUTES */}
        <Route path="feedback" element={<InstructorFeedback />} />
        <Route path="feedback/:courseId" element={<FeedbackDetails />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="courses" replace />} />
      </Routes>
    </DashboardLayout>
  );
}