import { useEffect, useState } from "react";
import { fetchStudentRecord } from "../api";
import { BookOpen, Activity, AlertCircle, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import UserDetailsCard from "@/components/UserDetailsCard";

export default function StudentOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchStudentRecord();
        setData(res); 
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const cgpa = (data?.cgpa || 0).toFixed(2);
  const activeCourses = data?.data?.filter(c => c.status === "ENROLLED") || [];
  const totalCredits = activeCourses.reduce((acc, curr) => acc + (curr.course?.credits || 0), 0);

  const StatBox = ({ label, value, icon: Icon, color }) => (
    <Card className="border border-slate-200 shadow-sm bg-white">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
          <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${color || "bg-slate-50 text-slate-400"}`}>
          <Icon size={24} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* 1. Profile Section */}
      <UserDetailsCard />

      {/* 2. Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatBox 
          label="CGPA" 
          value={loading ? "-" : cgpa} 
          icon={Activity} 
          color="bg-emerald-50 text-emerald-600"
        />
        <StatBox 
          label="Active Courses" 
          value={loading ? "-" : activeCourses.length} 
          icon={BookOpen} 
          color="bg-blue-50 text-blue-600"
        />
        <StatBox 
          label="Credits This Sem" 
          value={loading ? "-" : totalCredits} 
          icon={AlertCircle} 
          color="bg-purple-50 text-purple-600"
        />
      </div>

      {/* 3. Current Active Courses (Full Width) */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Calendar size={20} className="text-slate-400"/> Currently Enrolled
        </h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Skeleton className="h-32 w-full rounded-xl" />
             <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : activeCourses.length === 0 ? (
          <div className="p-10 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-500">
            No active courses found. Go to "Offered Courses" to register.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeCourses.map((item) => (
              <div key={item._id} className="flex flex-col justify-between p-6 bg-white border border-slate-200 rounded-xl hover:border-blue-300 transition-all shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-md mb-2 inline-block">
                      {item.course?.courseCode}
                    </span>
                    <h4 className="font-bold text-slate-900 text-lg leading-tight">{item.course?.title}</h4>
                    <p className="text-sm text-slate-500 mt-1">{item.course?.dept} Department</p>
                  </div>
                  <div className="text-right">
                     <span className="block text-[10px] text-slate-400 font-bold uppercase">Session</span>
                     <span className="text-xs font-mono font-medium text-slate-600">{item.course?.session || "N/A"}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Attendance:</span>
                    <span className={`font-bold ${item.attendance < 75 ? "text-red-500" : "text-green-600"}`}>
                      {item.attendance || 0}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Grade:</span>
                    <span className="font-bold text-slate-800">{item.grade || "N/A"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}