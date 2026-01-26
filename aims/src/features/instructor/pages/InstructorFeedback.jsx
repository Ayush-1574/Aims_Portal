import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getInstructorFeedback } from "../api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Calendar, GraduationCap, Layers, ArrowRight, School, FilterX, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function InstructorFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [sessionFilter, setSessionFilter] = useState("ALL");

  const loadData = async () => {
    try {
      const res = await getInstructorFeedback();
      // Ensure we handle the response structure correctly (res.data or res.data.data)
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setFeedbacks(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // --- FILTER & GROUP LOGIC ---
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((f) => {
      const courseOk = courseFilter === "ALL" || f.course?.courseCode === courseFilter;
      const sessionOk = sessionFilter === "ALL" || f.session === sessionFilter;
      return courseOk && sessionOk;
    });
  }, [feedbacks, courseFilter, sessionFilter]);

  // Group raw feedback entries by Course ID to create "Course Cards"
  const groupedCourses = useMemo(() => {
    const map = {};
    filteredFeedbacks.forEach((f) => {
      // Safety check if course object exists
      if (!f.course) return;
      
      const key = f.course._id;
      if (!map[key]) {
        map[key] = { 
            course: f.course, 
            session: f.session, 
            count: 0 
        };
      }
      map[key].count++;
    });
    return Object.values(map);
  }, [filteredFeedbacks]);

  // Options for dropdowns
  const courseOptions = useMemo(() => ["ALL", ...new Set(feedbacks.map((f) => f.course?.courseCode).filter(Boolean))], [feedbacks]);
  const sessionOptions = useMemo(() => ["ALL", ...new Set(feedbacks.map((f) => f.session).filter(Boolean))], [feedbacks]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
         {[1,2,3].map(i => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Course Feedback</h1>
          <p className="text-slate-500 mt-1">Select a course to view detailed student feedback.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
             <div className="flex items-center gap-2 text-slate-600"><BookOpen size={16} /><SelectValue placeholder="Course" /></div>
          </SelectTrigger>
          <SelectContent>
            {courseOptions.map(c => <SelectItem key={c} value={c}>{c === "ALL" ? "All Courses" : c}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={sessionFilter} onValueChange={setSessionFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
             <div className="flex items-center gap-2 text-slate-600"><Calendar size={16} /><SelectValue placeholder="Session" /></div>
          </SelectTrigger>
          <SelectContent>
            {sessionOptions.map(s => <SelectItem key={s} value={s}>{s === "ALL" ? "All Sessions" : s}</SelectItem>)}
          </SelectContent>
        </Select>

        {(courseFilter !== "ALL" || sessionFilter !== "ALL") && (
          <Button variant="ghost" onClick={() => { setCourseFilter("ALL"); setSessionFilter("ALL"); }} className="text-slate-500 ml-auto">
            <FilterX size={16} className="mr-2"/> Reset
          </Button>
        )}
      </div>

      {/* Course Cards Grid */}
      {groupedCourses.length === 0 ? (
         <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl">
            <MessageSquare size={48} className="mx-auto text-slate-300 mb-4"/>
            <p className="text-slate-500 font-medium">No feedback records found.</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupedCourses.map(({ course, session, count }) => (
            <Card key={course._id} className="group flex flex-col h-full bg-white border border-slate-200 hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden relative">
               
               {/* Status Line */}
               <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500" />

               <CardContent className="p-6 pl-7 flex flex-col h-full">
                 <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className="font-mono font-bold text-slate-700 bg-slate-50 border-slate-200">
                      {course.courseCode}
                    </Badge>
                    <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">
                      {count} Responses
                    </Badge>
                 </div>

                 <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                   {course.title}
                 </h3>

                 {/* Info Grid */}
                 <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs text-slate-600 bg-slate-50/50 p-3 rounded-xl border border-slate-100 mb-6">
                    <div className="flex items-center gap-2">
                        <School size={14} className="text-blue-500 shrink-0"/>
                        <span className="font-semibold truncate">{course.dept || "General"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <GraduationCap size={14} className="text-purple-500 shrink-0"/>
                        <span>Year {course.year}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-orange-500 shrink-0"/>
                        <span>{session}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Layers size={14} className="text-indigo-500 shrink-0"/>
                        <span className="font-mono">{course.ltp}</span>
                    </div>
                 </div>

                 {/* Action Button */}
                 <div className="mt-auto pt-4 border-t border-slate-50">
                    {/* LINK TO THE NEW PAGE */}
                    <Link to={`/instructor/feedback/${course._id}`}>
                        <Button variant="outline" className="w-full justify-between group-hover:border-blue-500 group-hover:text-blue-600 transition-all">
                           <span className="flex items-center gap-2">
                               <MessageSquare size={16} /> View Feedback
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