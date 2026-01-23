import { useState, useEffect } from "react";
import { fetchOfferedCourses, enrollInCourse, fetchStudentRecord } from "../api";
import { 
  User, Calendar, CheckCircle, AlertCircle, 
  Loader2, Layers, GraduationCap, Clock, UserCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const loadData = async () => {
    try {
      const [coursesData, enrollmentsData] = await Promise.all([
        fetchOfferedCourses(),
        fetchStudentRecord()
      ]);
      setCourses(coursesData || []);
      setEnrollments(enrollmentsData?.data || []);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEnroll = async (courseId) => {
    if (!window.confirm("Confirm enrollment for this course?")) return;
    setActionLoading(courseId);
    try {
      await enrollInCourse(courseId);
      await loadData(); // Refresh to show new status immediately
    } catch (err) {
      alert(err.response?.data?.msg || "Enrollment failed");
    } finally {
      setActionLoading(null);
    }
  };

  // Helper to find status for a specific course
  const getCourseStatus = (courseId) => {
    const enrollment = enrollments.find(e => 
      (e.course?._id === courseId) || (e.course === courseId)
    );
    return enrollment ? enrollment.status : null; // Returns: PENDING_INSTRUCTOR, PENDING_ADVISOR, ENROLLED, etc.
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Offered Courses</h1>
        <p className="text-gray-500 mt-2">Browse available courses for the upcoming academic session.</p>
      </div>

      {courses.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-white border border-gray-200 rounded-2xl border-dashed">
          No courses available for enrollment at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => {
            const status = getCourseStatus(course._id);

            // --- DYNAMIC BUTTON LOGIC ---
            let ButtonComponent;
            
            switch (status) {
              case "ENROLLED":
                ButtonComponent = (
                  <Button disabled className="w-full bg-green-50 text-green-700 font-bold border border-green-200 hover:bg-green-50 opacity-100 cursor-not-allowed">
                    <CheckCircle size={18} className="mr-2" /> Enrolled
                  </Button>
                );
                break;

              case "PENDING_INSTRUCTOR":
                ButtonComponent = (
                  <Button disabled className="w-full bg-amber-50 text-amber-700 font-bold border border-amber-200 hover:bg-amber-50 opacity-100 cursor-not-allowed">
                    <Clock size={18} className="mr-2" /> Waiting: Instructor
                  </Button>
                );
                break;

              case "PENDING_ADVISOR":
                ButtonComponent = (
                  <Button disabled className="w-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 hover:bg-indigo-50 opacity-100 cursor-not-allowed">
                    <UserCheck size={18} className="mr-2" /> Waiting: Advisor
                  </Button>
                );
                break;

              case "REJECTED":
                ButtonComponent = (
                  <Button disabled className="w-full bg-red-50 text-red-600 font-bold border border-red-200 hover:bg-red-50 opacity-100 cursor-not-allowed">
                    <AlertCircle size={18} className="mr-2" /> Rejected
                  </Button>
                );
                break;

              default:
                // Not enrolled yet
                ButtonComponent = (
                  <Button
                    onClick={() => handleEnroll(course._id)}
                    disabled={actionLoading === course._id}
                    isLoading={actionLoading === course._id}
                    className="w-full bg-slate-900 hover:bg-blue-600 text-white font-semibold shadow-lg shadow-slate-200 transition-all active:scale-95"
                  >
                    Enroll Now
                  </Button>
                );
            }

            // Determine Border Color based on status
            const borderColor = 
              status === "ENROLLED" ? "border-green-200" :
              status === "REJECTED" ? "border-red-200" :
              status?.includes("PENDING") ? "border-yellow-200" :
              "border-gray-200";

            return (
              <Card key={course._id} className={`group relative overflow-hidden bg-white border ${borderColor} hover:shadow-xl hover:border-blue-200 transition-all duration-300`}>
                
                {/* Status Indicator Strip */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  status === "ENROLLED" ? "bg-green-500" : 
                  status === "PENDING_INSTRUCTOR" ? "bg-amber-400" : 
                  status === "PENDING_ADVISOR" ? "bg-indigo-500" : 
                  status === "REJECTED" ? "bg-red-500" : 
                  "bg-blue-600"
                }`} />
                
                <CardContent className="p-6 flex flex-col h-full pl-7">
                  
                  {/* Header: Code & Title */}
                  <div className="mb-5">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 font-mono font-bold tracking-wide">
                        {course.courseCode}
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                        {course.dept}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>
                  </div>

                  {/* Details Grid (Schema Fields) */}
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-gray-600 mb-6 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    
                    {/* Instructor */}
                    <div className="col-span-2 flex items-center gap-2.5">
                      <User size={16} className="text-blue-500 shrink-0" />
                      <span className="font-medium text-gray-900 truncate">
                        {course.instructor?.name || "TBA"}
                      </span>
                    </div>

                    {/* Session */}
                    <div className="flex items-center gap-2.5">
                      <Calendar size={16} className="text-orange-500 shrink-0" />
                      <span>{course.session}</span>
                    </div>

                    {/* Year */}
                    <div className="flex items-center gap-2.5">
                      <GraduationCap size={16} className="text-purple-500 shrink-0" />
                      <span>Year {course.year}</span>
                    </div>

                    {/* L-T-P Structure */}
                    <div className="col-span-2 flex items-center gap-2.5 pt-1 border-t border-slate-200/50 mt-1">
                      <Layers size={16} className="text-indigo-500 shrink-0" />
                      <div className="flex items-center gap-2 w-full">
                        <span>Structure:</span> 
                        <span className="font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-xs font-bold text-slate-700">
                          {course.ltp}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button Area */}
                  <div className="mt-auto">
                    {ButtonComponent}
                  </div>

                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}