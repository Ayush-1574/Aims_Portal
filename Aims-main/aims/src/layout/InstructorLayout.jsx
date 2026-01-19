import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function InstructorLayout({ children }) {
  const { logout } = useAuth();

  const menu = [
    { label: "Offer Course", path: "/instructor/dashboard/offer" },
    { label: "My Courses", path: "/instructor/dashboard/courses" },
    { label: "Enrollment Requests", path: "/instructor/dashboard/requests" },
  ];

  useEffect(() => {
    document.title = "Instructor Dashboard";
  }, []);

  return (
    <div className="w-screen h-screen flex bg-gray-100">

      {/* Sidebar */}
      <aside className="w-60 h-full bg-white border-r shadow-sm flex flex-col">
        <div className="px-4 py-4 font-bold text-lg border-b">
          Instructor Panel
        </div>

        <nav className="flex flex-col flex-1 px-2 py-3 gap-1">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t">
          <Button
            variant="destructive"
            className="w-full"
            onClick={logout}
          >
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
