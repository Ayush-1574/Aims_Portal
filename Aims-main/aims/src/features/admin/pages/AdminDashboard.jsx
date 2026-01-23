import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "@/layout/DashboardLayout";

// Import Pages
import AdminOverview from "./AdminOverview";
import UserManagement from "./UserManagement";
import CreateUser from "./CreateUser";

export default function AdminDashboard() {
  return (
    <DashboardLayout role="admin">
      <Routes>
        <Route index element={<Navigate to="overview" replace />} />
        
        {/* Sub-Routes */}
        <Route path="overview" element={<AdminOverview />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="create-user" element={<CreateUser />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="overview" replace />} />
      </Routes>
    </DashboardLayout>
  );
}