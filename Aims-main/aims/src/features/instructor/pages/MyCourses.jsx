import { useState, useEffect } from "react";
import client from "@/core/api/client"; // Use your axios client
import { Link } from "react-router-dom";
import { 
  BookOpen, Users, ArrowRight, PlusCircle, Calendar, 
  Layers, GraduationCap, School 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Matches route: router.get("/my", ...)
        const res = await client.get("/course/my");
        setCourses(res.data.courses || []);
      } catch (err) {
        console.error("Failed to load instructor courses", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {[1,2,3].map(i => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900">My Teaching & Courses</h1>
           <p className="text-slate-500 mt-1">Manage your active courses and student enrollments.</p>
        </div>
        <Link to="/instructor/offer">
          <Button className="gap-2 shadow-lg bg-blue-600 hover:bg-blue-700 text-white">
            <PlusCircle size={18} /> Offer New Course
          </Button>
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-2xl">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <BookOpen size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-700">No Courses Offered Yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2 mb-6">
            You haven't created any courses for this session. Click the button above to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course._id} className="group hover:shadow-xl transition-all duration-300 border border-slate-200 bg-white overflow-hidden">
               {/* Decorative Top Strip */}
               <div className={`h-1.5 w-full ${
                 course.status === 'OPEN' ? 'bg-green-500' : 'bg-blue-500'
               }`} />

               <CardContent className="p-6">
                 {/* Header */}
                 <div className="flex justify-between items-start mb-4">
                    <Badge variant="outline" className="font-mono text-xs bg-slate-50 text-slate-700 border-slate-200">
                      {course.courseCode}
                    </Badge>
                    <Badge className={`
                      ${course.status === 'OPEN' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-amber-100 text-amber-700 hover:bg-amber-100'}
                    `}>
                      {course.status === 'PENDING_APPROVAL' ? 'Pending Approval' : 'Active'}
                    </Badge>
                 </div>

                 <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                   {course.title}
                 </h3>

                 {/* Rich Details Grid */}
                 <div className="grid grid-cols-2 gap-y-3 gap-x-2 my-5 text-xs text-slate-600 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                        <School size={14} className="text-blue-500"/>
                        <span className="font-semibold">{course.dept}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <GraduationCap size={14} className="text-purple-500"/>
                        <span>Year {course.year}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-orange-500"/>
                        <span>{course.session}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Layers size={14} className="text-indigo-500"/>
                        <span className="font-mono">{course.ltp}</span>
                    </div>
                 </div>

                 {/* Action Footer */}
                 <div className="mt-4 pt-4 border-t border-slate-100">
                    <Link to={`/instructor/enrolled/${course._id}`}>
                        <Button variant="outline" className="w-full justify-between group-hover:border-blue-500 group-hover:text-blue-600 transition-all">
                        <span className="flex items-center gap-2">
                            <Users size={16} /> Manage Students
                        </span>
                        <ArrowRight size={16} />
                        </Button>
                    </Link>
                 </div>
               </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}