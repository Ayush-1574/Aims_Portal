import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AdvisorLayout({ children }) {
  const { logout } = useAuth();

  const menu = [
    { label: "Course Approvals", path: "/advisor/dashboard/courses" },
    { label: "Enrollment Requests", path: "/advisor/dashboard/enrollments" },
    { label: "Course Status", path: "/advisor/dashboard/status" },
  ];

  useEffect(() => {
    document.title = "Advisor Dashboard";
  }, []);

  return (
    <div className="w-screen h-screen flex bg-gray-100">

      {/* Sidebar */}
      <aside className="w-60 h-full bg-white border-r shadow-sm flex flex-col">
        <div className="px-4 py-4 font-bold text-lg border-b">
          Advisor Panel
        </div>

        <nav className="flex flex-col flex-1 px-2 py-3 gap-1">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? "bg-purple-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t">
          <Button variant="destructive" onClick={logout} className="w-full">
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}
