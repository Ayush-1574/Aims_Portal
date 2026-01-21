import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function StudentLayout() {
  const { logout } = useAuth();

  const menu = [
    { label: "📚 Offered Courses", path: "/student/dashboard/courses" },
    { label: "📋 Academic Record", path: "/student/dashboard/record" },
  ];

  return (
    <div className="w-screen h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-gray-100 flex flex-col shadow-2xl border-r border-slate-700">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700 backdrop-blur-sm">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Student Portal
          </div>
          <p className="text-xs text-gray-400 mt-1">Academic Management</p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col p-4 gap-2 flex-1">
          {menu.map(m => (
            <NavLink
              key={m.path}
              to={m.path}
              className={({ isActive }) =>
                `px-4 py-3 text-sm rounded-lg font-medium transition-all duration-200 flex items-center gap-2
                ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20"
                    : "text-gray-300 hover:bg-slate-700/50 hover:text-white"
                }`
              }
            >
              {m.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-700 backdrop-blur-sm">
          <Button
            onClick={logout}
            className="w-full px-4 py-2.5 text-sm rounded-lg
                       bg-gradient-to-r from-red-600 to-red-500
                       hover:from-red-700 hover:to-red-600
                       text-white font-medium transition-all duration-200
                       shadow-lg shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30"
          >
            🚪 Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 min-h-screen">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
