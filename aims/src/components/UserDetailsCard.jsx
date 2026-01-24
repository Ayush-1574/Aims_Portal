import { useAuth } from "@/core/context/AuthContext";
import { User, Mail, Hash, BookOpen, Calendar, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// --- FIX: Define this OUTSIDE the main component ---
const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
    <div className="p-2 bg-slate-100 rounded-md text-slate-500">
      <Icon size={16} />
    </div>
    <div>
      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value || "N/A"}</p>
    </div>
  </div>
);

export default function UserDetailsCard() {
  const { user, loading } = useAuth();

  if (loading || !user) return null;

  return (
    <Card className="border-l-4 border-l-blue-600 shadow-sm mb-8 overflow-hidden bg-white">
      <CardContent className="p-0 flex flex-col md:flex-row">
        
        {/* Left: User Identity */}
        <div className="p-6 md:p-8 bg-slate-50/50 border-b md:border-b-0 md:border-r border-slate-100 flex items-center gap-6 min-w-[280px]">
          <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center text-2xl font-bold text-blue-600 relative">
            {user.name?.[0]?.toUpperCase()}
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
            <p className="text-sm text-slate-500 font-medium">{user.email}</p>
            <div className="mt-2 inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-blue-100 text-blue-700">
              {user.role.replace("_", " ")}
            </div>
          </div>
        </div>

        {/* Right: Academic/Role Details */}
        <div className="p-6 md:p-8 flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {user.role === "student" && (
            <>
              <DetailRow icon={Hash} label="Entry Number" value={user.entry_no} />
              <DetailRow icon={Layers} label="Department" value={user.department} />
              <DetailRow icon={Calendar} label="Current Year" value={`${user.year || 1}st Year`} />
              <DetailRow icon={BookOpen} label="Semester" value={user.semester} />
            </>
          )}

          {user.role === "instructor" && (
            <>
              <DetailRow icon={Layers} label="Department" value={user.department || "General"} />
              <DetailRow icon={BookOpen} label="Courses Active" value="Check Dashboard" />
            </>
          )}
          
          {(user.role === "admin" || user.role === "faculty_advisor") && (
             <DetailRow icon={User} label="Admin Level" value="Superuser" />
          )}
        </div>

      </CardContent>
    </Card>
  );
}