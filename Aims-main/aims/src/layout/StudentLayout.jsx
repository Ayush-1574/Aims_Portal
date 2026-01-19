import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function StudentLayout() {
  const { logout } = useAuth();

  const menu = [
    { label: "Offered Courses", path: "/student/dashboard/courses" },
    { label: "Record", path: "/student/dashboard/record" },
  ];

  return (
    <div className="w-screen h-screen flex bg-gray-100">
      
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-gray-100 flex flex-col">
        
        {/* Title */}
        <div className="p-4 text-lg font-semibold border-b border-gray-700">
          Student Portal
        </div>

        {/* Navigation */}
        <nav className="flex flex-col p-2 gap-1 flex-1">
          {menu.map(m => (
            <NavLink
              key={m.path}
              to={m.path}
              className={({ isActive }) =>
                `px-3 py-2 text-sm rounded-md transition-colors
                ${
                  isActive
                    ? "bg-black text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              {m.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-700">
          <Button
            onClick={logout}
            className="w-full px-3 py-2 text-sm rounded-md
                       bg-red-600 hover:bg-red-700
                       text-white transition-colors"
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
}
