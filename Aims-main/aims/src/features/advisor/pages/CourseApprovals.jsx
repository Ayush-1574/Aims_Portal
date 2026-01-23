import { useEffect, useState } from "react";
import { fetchPendingCourses, approveCourse, rejectCourse } from "../api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, BookOpen, User, Clock, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CourseApprovals() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const loadData = async () => {
    try {
      const res = await fetchPendingCourses();
      setCourses(res || []);
    } catch (err) {
      console.error("Failed to fetch courses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAction = async (id, action) => {
    if (!confirm(`Are you sure you want to ${action} this course?`)) return;
    setProcessing(id);
    try {
      if (action === 'approve') await approveCourse(id);
      else await rejectCourse(id);
      await loadData();
    } catch (err) {
      alert("Action failed");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{[1,2,3,4].map(i => <Skeleton key={i} className="h-64 w-full" />)}</div>;

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pending Course Approvals</h1>
        <p className="text-slate-500">Review new course proposals from instructors.</p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 bg-white/40 border-2 border-dashed border-slate-200 rounded-3xl">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-700">All Caught Up!</h3>
          <p className="text-slate-500">No courses pending approval at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map((c) => (
            <Card key={c._id} className="border-slate-200 hover:shadow-lg transition-all overflow-hidden group">
              <div className="h-1 bg-gradient-to-r from-orange-400 to-red-400" />
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="outline" className="font-mono bg-slate-50 text-slate-600">
                    {c.courseCode}
                  </Badge>
                  <Badge variant="warning" className="bg-amber-100 text-amber-700 border-amber-200">
                    <Clock size={12} className="mr-1"/> Pending
                  </Badge>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">{c.title}</h3>
                
                <div className="space-y-3 my-4">
                   <div className="flex items-center gap-2 text-sm text-slate-600">
                      <User size={16} className="text-slate-400"/>
                      <span>Instructor: <span className="font-semibold text-slate-800">{c.instructor?.name || "Unknown"}</span></span>
                   </div>
                   <div className="flex items-center gap-2 text-sm text-slate-600">
                      <BookOpen size={16} className="text-slate-400"/>
                      <span>Department: <span className="font-semibold text-slate-800">{c.dept}</span></span>
                   </div>
                   <div className="flex items-center gap-2 text-sm text-slate-600">
                      <AlertTriangle size={16} className="text-slate-400"/>
                      <span>Credits: <strong>{c.credits}</strong> • Structure: <strong>{c.ltp}</strong></span>
                   </div>
                </div>

                <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 italic mb-6">
                  "{c.description || "No description provided."}"
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white shadow-green-200"
                    onClick={() => handleAction(c._id, 'approve')}
                    isLoading={processing === c._id}
                    disabled={processing && processing !== c._id}
                  >
                    <CheckCircle size={18} className="mr-2"/> Approve
                  </Button>
                  <Button 
                    variant="destructive"
                    className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200 shadow-none"
                    onClick={() => handleAction(c._id, 'reject')}
                    disabled={processing !== null}
                  >
                    <XCircle size={18} className="mr-2"/> Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}