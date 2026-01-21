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
    <div className="w-screen h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">

      {/* Sidebar */}
      <aside className="w-64 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col shadow-2xl border-r border-slate-700">
        
        {/* Header */}
        <div className="px-6 py-6 border-b border-slate-700 backdrop-blur-sm">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Instructor Panel
          </div>
          <p className="text-xs text-gray-400 mt-1">Course Management</p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col flex-1 px-4 py-4 gap-2">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/20"
                    : "text-gray-300 hover:bg-slate-700/50 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-slate-700 backdrop-blur-sm">
          <Button
            onClick={logout}
            className="w-full bg-gradient-to-r from-red-600 to-red-500
                       hover:from-red-700 hover:to-red-600
                       text-white font-medium transition-all duration-200
                       shadow-lg shadow-red-500/20"
          >
            🚪 Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
