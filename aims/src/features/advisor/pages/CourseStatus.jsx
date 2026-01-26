import { useEffect, useState } from "react";
import { fetchEnrollmentRequests, fetchAllCourses } from "../api";
import UserDetailsCard from "@/components/UserDetailsCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Layers, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function CourseStatus() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    pendingRequests: 0,
    coursesWithPending: 0
  });

  useEffect(() => {
    async function load() {
      try {
        const [allCoursesRes, pendingRes] = await Promise.all([
          fetchAllCourses(),
          fetchEnrollmentRequests()
        ]);

        const allCourses = Array.isArray(allCoursesRes) ? allCoursesRes : (allCoursesRes?.courses || []);
        const pending = Array.isArray(pendingRes) ? pendingRes : [];

        // Calculate unique courses that have pending requests
        const uniquePendingCourses = new Set(pending.map(r => r.course?._id).filter(Boolean));

        setStats({
          totalCourses: allCourses.length,
          pendingRequests: pending.length,
          coursesWithPending: uniquePendingCourses.size
        });

      } catch (err) {
        console.error("Failed to load advisor stats", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Sub-component for uniform card styling
  const StatCard = ({ title, value, icon: Icon, color, bg, action }) => (
    <Card className="border-slate-200 shadow-sm relative overflow-hidden group">
      <CardContent className="p-6 flex items-center justify-between z-10 relative">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
          {loading ? (
             <Skeleton className="h-9 w-16" />
          ) : (
             <h3 className="text-3xl font-black text-slate-800">{value}</h3>
          )}
          {action && (
            <div className="mt-3">
              {action}
            </div>
          )}
        </div>
        <div className={`p-4 rounded-xl ${bg} ${color} transition-transform duration-300 group-hover:scale-110`}>
          <Icon size={28} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* 1. User/Advisor Details */}
      <UserDetailsCard />

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Pending Approvals */}
        <StatCard 
          title="Pending Approvals" 
          value={stats.pendingRequests} 
          icon={AlertCircle} 
          color="text-amber-600" 
          bg="bg-amber-50"
          action={
            stats.pendingRequests > 0 && (
              <Link to="/advisor/enrollments">
                <Button variant="link" className="p-0 h-auto text-amber-600 font-semibold text-xs flex items-center gap-1 hover:text-amber-700">
                   Review Requests <ArrowRight size={12} />
                </Button>
              </Link>
            )
          }
        />

        {/* Courses with Actions */}
        <StatCard 
          title="Courses With Actions" 
          value={stats.coursesWithPending} 
          icon={Layers} 
          color="text-blue-600" 
          bg="bg-blue-50"
        />

        {/* Total System Courses */}
        <StatCard 
          title="Total Active Courses" 
          value={stats.totalCourses} 
          icon={BookOpen} 
          color="text-slate-600" 
          bg="bg-slate-50"
        />
      </div>
    </div>
  );
}