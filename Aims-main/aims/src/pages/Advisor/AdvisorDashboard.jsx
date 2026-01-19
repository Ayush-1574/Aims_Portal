import { Outlet } from "react-router-dom";
import AdvisorLayout from "@/layout/AdvisorLayout";

export default function AdvisorDashboard() {
  return (
    <AdvisorLayout>
      <Outlet />
    </AdvisorLayout>
  );
}
