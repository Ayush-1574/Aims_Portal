import { useState, useEffect } from "react";
import { fetchMyCourses } from "../api";
import { Link } from "react-router-dom";
import { BookOpen, Users, ArrowRight, PlusCircle, Calendar } from "lucide-react";
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
        const data = await fetchMyCourses();
        setCourses(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {[1,2,3].map(i => <Skeleton key={i} className="h-60 w-full rounded-2xl" />)}
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
        <Link to="/instructor/dashboard/offer">
          <Button className="gap-2 shadow-lg shadow-blue-500/20">
            <PlusCircle size={18} /> Offer New Course
          </Button>
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 bg-white/40 border-2 border-dashed border-slate-200 rounded-3xl">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
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
            <Card key={course._id} className="group hover:shadow-xl transition-all duration-300 border-slate-200 overflow-hidden">
               <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />
               <CardContent className="p-6">
                 <div className="flex justify-between items-start mb-4">
                    <Badge variant="secondary" className="font-mono text-xs bg-slate-100 text-slate-600 border border-slate-200">
                      {course.courseCode || "CODE"}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-blue-200 text-blue-600 bg-blue-50">
                      {course.dept}
                    </Badge>
                 </div>

                 <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                   {course.title}
                 </h3>
                 
                 <div className="grid grid-cols-2 gap-4 my-6">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Users size={16} className="text-slate-400" />
                        <span className="font-semibold text-slate-700">{course.enrolled || 0}</span> Enrolled
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Calendar size={16} className="text-slate-400" />
                        <span>{course.session || "2025"}</span>
                    </div>
                 </div>

                 <Link to={`/instructor/dashboard/enrolled/${course._id}`}>
                    <Button variant="outline" className="w-full justify-between group-hover:border-blue-500 group-hover:text-blue-600 transition-all">
                      Manage Students <ArrowRight size={16} />
                    </Button>
                 </Link>
               </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}