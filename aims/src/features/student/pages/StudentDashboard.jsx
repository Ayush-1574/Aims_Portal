import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "@/layout/DashboardLayout";
import StudentFeedback from "./StudentFeedback";



// Page Imports
import StudentOverview from "./StudentOverview";
import CoursesPage from "./CoursesPage";
import StudentRecord from "./StudentRecord";

export default function StudentDashboard() {
  return (
    <DashboardLayout role="student">
      <Routes>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<StudentOverview />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="record" element={<StudentRecord />} />
        <Route path="feedback" element={<StudentFeedback />} />
        <Route path="*" element={<Navigate to="overview" replace />} />
      </Routes>
    </DashboardLayout>
  );
}