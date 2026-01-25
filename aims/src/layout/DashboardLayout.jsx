import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/core/context/AuthContext";
import { 
  Menu, LogOut, LayoutDashboard, BookOpen, 
  Users, FileText, CheckSquare, Activity, UserPlus
} from "lucide-react";
import UserPill from "@/components/ui/UserPill";
import { getFeedbackStatus } from "@/features/admin/api";

export default function DashboardLayout({ role, children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [feedbackActive, setFeedbackActive] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getLinks = (userRole) => {
    switch (userRole) {
      case "student": {
        const links = [
          { icon: LayoutDashboard, label: "Overview", path: "/student/overview" },
          { icon: BookOpen, label: "Course Reg.", path: "/student/courses" },
          { icon: FileText, label: "Academic Record", path: "/student/record" },
        ];

        if (feedbackActive) {
          links.push({
            icon: CheckSquare,
            label: "Course Feedback",
            path: "/student/feedback",
          });
        }

        return links;
      }

      case "instructor":
        return [
          { icon: BookOpen, label: "My Courses", path: "/instructor/courses" },
          { icon: UserPlus, label: "Offer Course", path: "/instructor/offer" },
          { icon: Users, label: "Enrollment Req.", path: "/instructor/requests" },
          { icon: CheckSquare, label: "Course Feedback", path: "/instructor/feedback" },
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
          { icon: CheckSquare, label: "Course Approvals", path: "/admin/course-approvals" },
          { icon: CheckSquare, label: "Feedback Settings", path: "/admin/feedback-settings" },
        ];

      default:
        return [];
    }
  };

  const links = getLinks(role);
  const currentTitle = links.find(l => location.pathname.includes(l.path))?.label || "Dashboard";

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* SIDEBAR */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 shadow-xl 
          transition-[width] duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]
          ${isSidebarOpen ? "w-72" : "w-20"}
        `}
      >
        {/* LOGO AREA */}
        <div className={`
          h-20 flex items-center border-b border-slate-100 
          transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]
          ${isSidebarOpen ? 'px-6' : 'w-full justify-center px-0'}
        `}>
            
            {/* Logo Frame */}
            <div className={`
              flex items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm flex-shrink-0
              transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]
              ${isSidebarOpen ? 'h-12 w-12 p-2' : 'h-14 w-14 p-1'}
            `}>
               <img 
                 src="/header-logo.png" 
                 alt="IIT Ropar" 
                 className="h-full w-full object-contain" 
               />
            </div>

            {/* Text Title */}
            <div className={`
              ml-4 flex flex-col justify-center overflow-hidden whitespace-nowrap
              transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]
              ${isSidebarOpen ? 'w-40 opacity-100' : 'w-0 opacity-0'}
            `}>
               <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                 AIMS Portal
               </h1>
            </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="p-4 space-y-2 mt-4 overflow-hidden">
          {links.map((link) => {
            const isActive = location.pathname.includes(link.path);
            return (
              <Link 
                key={link.path} 
                to={link.path}
                // FIXED: 
                // 1. Added 'border' base class so sizing is consistent
                // 2. Added 'focus:ring-0' to kill any browser focus rings
                // 3. Inactive state now has 'border-transparent' instead of no border
                className={`
                  flex items-center rounded-xl relative group outline-none focus:outline-none focus:ring-0 border
                  transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]
                  ${isSidebarOpen ? "px-4 py-3 gap-3" : "justify-center py-3 px-0"} 
                  ${isActive 
                    ? "bg-blue-50 border-blue-100 text-blue-700 font-semibold shadow-sm" 
                    : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }
                `}
              >
                {/* ICON */}
                <link.icon 
                  size={22} 
                  className={`
                    flex-shrink-0 transition-colors duration-300
                    ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}
                  `} 
                />
                
                {/* LABEL */}
                <span className={`
                  whitespace-nowrap overflow-hidden
                  transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]
                  ${isSidebarOpen ? "w-full opacity-100 translate-x-0" : "w-0 opacity-0 -translate-x-4 absolute"}
                `}>
                  {link.label}
                </span>

                {isActive && isSidebarOpen && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* LOGOUT BUTTON */}
        <div className="absolute bottom-6 left-0 right-0 px-4">
          <button 
            onClick={handleLogout}
            className={`
              flex items-center w-full rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100 border border-transparent outline-none focus:outline-none focus:ring-0
              transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]
              ${isSidebarOpen ? "px-4 py-3 gap-3" : "justify-center py-3 px-0"}
            `}
          >
            <LogOut size={20} className="flex-shrink-0" />
            
            <span className={`
              font-medium whitespace-nowrap overflow-hidden
              transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]
              ${isSidebarOpen ? "w-full opacity-100" : "w-0 opacity-0 absolute"}
            `}>
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <main 
        className={`
          flex-1 min-h-screen flex flex-col 
          transition-[margin] duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]
          ${isSidebarOpen ? "ml-72" : "ml-20"}
        `}
      >
        {/* HEADER */}
        <header className="h-20 sticky top-0 z-30 px-8 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors outline-none focus:outline-none focus:ring-0"
            >
              <Menu size={20}/>
            </button>
            <h2 className="text-xl font-bold text-slate-800 hidden md:block animate-in fade-in duration-500">
              {currentTitle}
            </h2>
          </div>

          <div className="flex items-center gap-4">
              <UserPill />
          </div>
        </header>

        {/* CONTENT */}
        <div className="p-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
        </div>
      </main>
    </div>
  );
}