import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function AdminLayout() {
  const { logout } = useAuth();

  const menu = [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Create User", path: "/admin/dashboard/create" },
    { label: "User Management", path: "/admin/dashboard/users" },
    { label: "Audit Logs", path: "/admin/dashboard/logs" },
  ];

  return (
    <div className="w-screen h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">

      {/* Sidebar */}
      <aside className="w-64 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col shadow-2xl border-r border-slate-700">
        
        {/* Header */}
        <div className="px-6 py-6 border-b border-slate-700 backdrop-blur-sm">
          <div className="text-2xl font-bold text-white">
            Admin Panel
          </div>
          <p className="text-xs text-gray-400 mt-1">System Management</p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col flex-1 px-4 py-4 gap-3">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-white text-slate-900 shadow-lg"
                    : "text-gray-300 hover:bg-slate-700/80 hover:text-white"
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
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold transition-all duration-200 shadow-lg"
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
