import { useEffect, useState } from "react";
import { fetchAllCourses, fetchEnrollmentRequests as fetchAdvisorPending } from "../api";
import { fetchEnrollmentRequests as fetchInstructorPending } from "@/features/instructor/api";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Users, AlertCircle, BookOpen } from "lucide-react";

export default function CourseStatus() {
  const [stats, setStats] = useState({ total: 0, instPending: 0, advPending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [allCourses, instReqs, advReqs] = await Promise.all([
          fetchAllCourses(),
          fetchInstructorPending(),
          fetchAdvisorPending()
        ]);
        setStats({
          total: allCourses?.courses?.length || 0,
          instPending: instReqs?.length || 0,
          advPending: advReqs?.length || 0
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`p-4 rounded-xl ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          {loading ? <Skeleton className="h-8 w-16 mt-1" /> : <h3 className="text-2xl font-bold text-slate-800">{value}</h3>}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-20">
       <div>
        <h1 className="text-3xl font-bold text-slate-900">Advisor Overview</h1>
        <p className="text-slate-500 mt-1">System-wide course and enrollment statistics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Courses" value={stats.total} icon={BookOpen} color="bg-blue-500" />
        <StatCard title="Pending Advisor" value={stats.advPending} icon={AlertCircle} color="bg-amber-500" />
        <StatCard title="Pending Instructor" value={stats.instPending} icon={Users} color="bg-purple-500" />
      </div>

      <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
        <TrendingUp size={48} className="mx-auto text-slate-300 mb-4"/>
        <h3 className="text-lg font-bold text-slate-600">Analytics Module</h3>
        <p className="text-slate-400">Detailed charts and reports will appear here in future updates.</p>
      </div>
    </div>
  );
}