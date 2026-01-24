import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/core/context/AuthContext";
import { 
  Menu, LogOut, ChevronRight, LayoutDashboard, 
  BookOpen, Users, FileText, CheckSquare, Activity, 
  Shield, UserPlus
} from "lucide-react";

// 1. ADD 'children' HERE
export default function DashboardLayout({ role, children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getLinks = (userRole) => {
    switch(userRole) {
      case "student":
        return [
          { icon: LayoutDashboard, label: "Overview", path: "/student/overview" },
          { icon: BookOpen, label: "Course Reg.", path: "/student/courses" },
          { icon: FileText, label: "Academic Record", path: "/student/record" },
        ];
      case "instructor":
        return [
          { icon: BookOpen, label: "My Courses", path: "/instructor/courses" },
          { icon: UserPlus, label: "Offer Course", path: "/instructor/offer" },
          { icon: Users, label: "Enrollment Req.", path: "/instructor/requests" },
        ];
      case "faculty_advisor":
        return [
          { icon: CheckSquare, label: "Course Approvals", path: "/advisor/courses" },
          { icon: Users, label: "Student Enrollments", path: "/advisor/enrollments" },
          { icon: Activity, label: "System Status", path: "/advisor/status" },
        ];
      case "admin":
        return [
          { icon: LayoutDashboard, label: "Overview", path: "/admin/overview" },
          { icon: Users, label: "User Management", path: "/admin/users" },
          { icon: UserPlus, label: "Create User", path: "/admin/create-user" },
        ];
      default:
        return [];
    }
  };

  const links = getLinks(role);
  // Safe check for title
  const currentTitle = links.find(l => location.pathname.includes(l.path))?.label || "Dashboard";

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* SIDEBAR */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 bg-slate-900 text-white shadow-2xl transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "w-72" : "w-20"}
        `}
      >
        {/* Logo Area */}
        <div className="h-20 flex items-center justify-center border-b border-slate-800">
           {isSidebarOpen ? (
             <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
               AIMS Portal
             </h1>
           ) : (
             <span className="text-3xl">🎓</span>
           )}
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-2 mt-4">
          {links.map((link) => {
            const isActive = location.pathname.includes(link.path);
            return (
              <Link 
                key={link.path} 
                to={link.path}
                className={`
                  flex items-center rounded-xl transition-all duration-200 group relative
                  ${isSidebarOpen ? "px-4 py-3.5 gap-4" : "justify-center py-4 px-0"} 
                  ${isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }
                `}
              >
                {/* ICON: Ensure it is always visible */}
                <link.icon 
                  size={24} 
                  className={`
                    flex-shrink-0 transition-colors
                    ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}
                  `} 
                />
                
                {/* LABEL: Hide completely when closed */}
                <span className={`font-medium whitespace-nowrap transition-all duration-300 overflow-hidden ${!isSidebarOpen && "w-0 opacity-0 absolute"}`}>
                  {link.label}
                </span>

                {isActive && isSidebarOpen && (
                  <ChevronRight size={16} className="ml-auto opacity-50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-0 right-0 px-4">
          <button 
            onClick={handleLogout}
            className={`
              flex items-center w-full rounded-xl transition-all duration-200 text-red-400 hover:bg-red-500/10 hover:text-red-300
              ${isSidebarOpen ? "px-4 py-3 gap-4" : "justify-center py-3 px-0"}
            `}
          >
            <LogOut size={22} />
            {isSidebarOpen && <span className="font-bold">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <main 
        className={`
          flex-1 min-h-screen flex flex-col transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "ml-72" : "ml-20"}
        `}
      >
        {/* Header */}
        <header className="h-20 sticky top-0 z-30 px-8 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <Menu size={20}/>
            </button>
            <h2 className="text-xl font-bold text-slate-800 hidden md:block">{currentTitle}</h2>
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-1 pr-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
               <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                 {user?.name?.[0]?.toUpperCase() || "U"}
               </div>
               <div className="text-left hidden md:block">
                 <p className="text-sm font-bold text-slate-700 leading-tight">{user?.name}</p>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{role?.replace("_", " ")}</p>
               </div>
            </div>
          </div>
        </header>

        {/* 2. RENDER CHILDREN HERE (Important!) */}
        <div className="p-8 max-w-7xl mx-auto w-full animate-fade-in">
           {children}
        </div>
      </main>
    </div>
  );
}