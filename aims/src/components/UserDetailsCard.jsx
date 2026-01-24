import { useAuth } from "@/core/context/AuthContext";
import { User, Mail, Hash, BookOpen, Calendar, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// --- Components ---

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all group">
    {/* Icon Box */}
    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-md group-hover:scale-105 transition-transform shrink-0">
      <Icon size={18} />
    </div>
    
    {/* Text Content with Truncation */}
    <div className="min-w-0 flex-1">
      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-800 truncate" title={value}>
        {value || "N/A"}
      </p>
    </div>
  </div>
);

export default function UserDetailsCard() {
  const { user, loading } = useAuth();

  if (loading || !user) return null;

  return (
    <Card className="border-t-4 border-t-blue-600 shadow-md mb-8 overflow-hidden bg-white rounded-xl">
      <CardContent className="p-0 flex flex-col md:flex-row">
        
        {/* --- LEFT: User Identity (Sidebar style on Desktop) --- */}
        <div className="w-full md:w-72 lg:w-80 bg-slate-50/80 border-b md:border-b-0 md:border-r border-slate-100 p-8 flex flex-col items-center text-center shrink-0">
          
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center text-3xl font-bold text-blue-600">
              {user.name?.[0]?.toUpperCase()}
            </div>
            {/* Status Dot */}
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-slate-50 rounded-full" title="Active"></div>
          </div>

          {/* Name & Role */}
          <h2 className="text-xl font-bold text-slate-900 leading-tight mb-1">
            {user.name}
          </h2>
          <p className="text-sm text-slate-500 font-medium mb-4 break-all">
            {user.email}
          </p>
          
          <div className="inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 shadow-sm">
            {user.role?.replace("_", " ")}
          </div>
        </div>

        {/* --- RIGHT: Details Grid --- */}
        <div className="flex-1 p-6 md:p-8 bg-white">
          <div className="h-full flex flex-col justify-center">
            
            {/* Grid Layout: 1 col (mobile) -> 2 col (tablet) -> 3 col (desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {user.role === "student" && (
                <>
                  <DetailRow icon={Hash} label="Entry Number" value={user.entry_no} />
                  <DetailRow icon={Layers} label="Department" value={user.department} />
                  <DetailRow icon={Calendar} label="Year" value={user.year ? `${user.year} Year` : "1st Year"} />
                  <DetailRow icon={BookOpen} label="Semester" value={user.semester} />
                </>
              )}

              {user.role === "instructor" && (
                <>
                  <DetailRow icon={Layers} label="Department" value={user.department || "General"} />
                  <DetailRow icon={BookOpen} label="Active Courses" value="Check Dashboard" />
                </>
              )}
              
              {(user.role === "admin" || user.role === "faculty_advisor") && (
                 <DetailRow icon={User} label="Admin Privileges" value="Superuser Access" />
              )}

              {/* Common Fallback / Extra Info can go here */}
              <DetailRow icon={Mail} label="Contact Status" value="Verified" />
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}