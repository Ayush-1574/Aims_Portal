import { useState, useEffect } from "react";
import { fetchOfferedCourses, enrollInCourse, fetchStudentRecord } from "../api";
import { BookOpen, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [offered, record] = await Promise.all([
        fetchOfferedCourses(),
        fetchStudentRecord()
      ]);
      setCourses(offered || []);
      setMyEnrollments(record?.data || []); // Adjust based on your API response structure
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    setActionLoading(courseId);
    try {
      await enrollInCourse(courseId);
      await loadData(); // Refresh to show new status
    } catch (err) {
      alert("Failed to request enrollment");
    } finally {
      setActionLoading(null);
    }
  };

  // Helper to check status
  const getStatus = (courseId) => {
    // Check if we have an enrollment entry for this course
    // Note: Adjust logic if your backend returns full objects or just IDs
    const enrollment = myEnrollments.find(e => e.course?._id === courseId || e.course === courseId);
    return enrollment ? enrollment.status : null;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Course Registration</h1>
        <p className="text-slate-500 mt-1">Browse and enroll in courses for the upcoming session.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => {
          const status = getStatus(course._id);
          const isEnrolled = status === 'ENROLLED';
          const isPending = status && status.includes('PENDING');
          const isRejected = status === 'REJECTED';

          return (
            <Card key={course._id} className="hover:shadow-lg transition-all duration-300 border-slate-200">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <BookOpen size={24} />
                  </div>
                  <Badge variant="secondary" className="font-mono">{course.courseCode}</Badge>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">{course.title}</h3>
                <p className="text-sm text-slate-500 mb-6 flex-grow line-clamp-2">
                  {course.description || "No description provided."}
                </p>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                   <div className="flex justify-between text-sm text-slate-600">
                      <span>Credits: <strong>{course.credits}</strong></span>
                      <span>Dept: <strong>{course.dept}</strong></span>
                   </div>

                   {/* Action Button */}
                   {isEnrolled ? (
                     <Button variant="success" className="w-full bg-green-100 text-green-700 border-green-200 cursor-default shadow-none">
                        <CheckCircle size={18} className="mr-2"/> Enrolled
                     </Button>
                   ) : isPending ? (
                     <Button variant="secondary" className="w-full bg-amber-100 text-amber-700 border-amber-200 cursor-default shadow-none">
                        <Clock size={18} className="mr-2"/> {status === 'PENDING_ADVISOR' ? 'Advisor Approval' : 'Instructor Approval'}
                     </Button>
                   ) : isRejected ? (
                     <Button variant="destructive" className="w-full bg-red-100 text-red-700 border-red-200 cursor-default shadow-none">
                        <AlertCircle size={18} className="mr-2"/> Rejected
                     </Button>
                   ) : (
                     <Button 
                       onClick={() => handleEnroll(course._id)}
                       isLoading={actionLoading === course._id}
                       className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                     >
                       Enroll Now
                     </Button>
                   )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}