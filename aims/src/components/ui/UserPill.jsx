import { useState } from "react";
import { useAuth } from "@/core/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom"; // 1. Import useLocation
import { 
  Mail, Hash, BookOpen, Calendar, Layers, 
  LogOut, Repeat, GraduationCap, School, UserCog 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UserPill() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // 2. Get current location
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  // 3. Check if we are currently in the instructor view
  // Adjust "/instructor" string to match your exact route path
  const isInstructorView = location.pathname.startsWith("/instructor");

  const handleSwitchRole = () => {
    if (isInstructorView) {
        // If currently in instructor view, switch back to Advisor Dashboard
        // Change "/advisor-dashboard" to your actual advisor route (e.g., "/" or "/advisor")
        window.location.href = "/advisor-dashboard"; 
    } else {
        // If currently in advisor view, switch to Instructor View
        window.location.href = "/instructor"; 
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div 
      className="relative group z-50"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* 1. The Trigger (Visible Badge) */}
      <div className="flex items-center gap-3 pl-1 pr-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
          {user.name?.[0]?.toUpperCase()}
        </div>
        <div className="text-left hidden md:block">
          <p className="text-sm font-bold text-slate-700 leading-tight">{user.name}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            {/* Optional: Show Current View Mode instead of static role if helpful */}
            {user.role?.replace("_", " ")}
          </p>
        </div>
      </div>

      {/* 2. The Dropdown */}
      <div 
        className={`
          absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transition-all duration-200 origin-top-right
          ${isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}
        `}
      >
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
           <div className="relative z-10 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-white/20 bg-white/10 flex items-center justify-center text-2xl font-bold">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-lg">{user.name}</h3>
                <div className="flex items-center gap-1.5 text-slate-300 text-xs mt-1">
                  <Mail size={12}/> {user.email}
                </div>
              </div>
           </div>
        </div>

        {/* Details Grid */}
        <div className="p-5 space-y-4">
          {user.role === "student" && (
            <div className="grid grid-cols-2 gap-3">
              <DetailBox icon={Hash} label="Entry No" value={user.entry_no} />
              <DetailBox icon={Layers} label="Dept" value={user.department} />
              <DetailBox icon={Calendar} label="Year" value={user.year} />
              <DetailBox icon={BookOpen} label="Sem" value={user.semester} />
            </div>
          )}

          {user.role === "instructor" && (
            <div className="grid grid-cols-2 gap-3">
               <DetailBox icon={Layers} label="Department" value={user.department || "General"} />
               <DetailBox icon={BookOpen} label="Role" value="Course Instructor" />
            </div>
          )}

          {user.role === "faculty_advisor" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <DetailBox icon={School} label="Advising Dept" value={user.advisor_department} highlight />
                <DetailBox icon={GraduationCap} label="Advising Year" value={`${user.advisor_year}st Year`} highlight />
              </div>
              
              {/* Optional: Show different hint text based on view */}
              <p className="text-xs text-slate-500 mt-2 italic">
                {isInstructorView 
                  ? "Viewing as Instructor. Switch back to manage advising."
                  : "You can switch view to manage your own courses."
                }
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
          {user.role === "faculty_advisor" && (
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 bg-white border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
              onClick={handleSwitchRole}
            >
              {/* 4. Dynamic Icon and Text based on current view */}
              {isInstructorView ? (
                <>
                  <UserCog size={16} /> Switch to Advisor View
                </>
              ) : (
                <>
                  <Repeat size={16} /> Switch to Instructor View
                </>
              )}
            </Button>
          )}

          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={handleLogout}
          >
            <LogOut size={16} /> Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}

const DetailBox = ({ icon: Icon, label, value, highlight }) => (
  <div className={`p-2.5 rounded-xl border ${highlight ? 'bg-blue-50 border-blue-100' : 'bg-white border-slate-100'}`}>
    <div className="flex items-center gap-2 mb-1">
      <Icon size={12} className={highlight ? 'text-blue-600' : 'text-slate-400'} />
      <span className={`text-[10px] font-bold uppercase ${highlight ? 'text-blue-600' : 'text-slate-400'}`}>{label}</span>
    </div>
    <p className="text-sm font-bold text-slate-800 truncate">{value || "N/A"}</p>
  </div>
);