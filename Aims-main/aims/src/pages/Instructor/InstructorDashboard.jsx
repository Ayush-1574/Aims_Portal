import { Outlet } from "react-router-dom";
import InstructorLayout from "@/layout/InstructorLayout";

export default function InstructorDashboard() {
  return (
    <InstructorLayout>
      <Outlet />
    </InstructorLayout>
  );
}
