import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { getInstructorFeedback } from "../api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Star, MessageSquare, Quote, Calendar, BarChart3 } from "lucide-react";
import { toast } from "sonner";

export default function FeedbackDetails() {
  const { courseId } = useParams();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseInfo, setCourseInfo] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await getInstructorFeedback();
        const allData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        
        // Filter the big list for THIS course only
        const courseData = allData.filter(f => f.course?._id === courseId);
        setFeedbacks(courseData);

        if (courseData.length > 0) {
          setCourseInfo(courseData[0].course);
        }
      } catch (err) {
        toast.error("Failed to load feedback details");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [courseId]);

  // Calculate Stats
  const stats = useMemo(() => {
    if (feedbacks.length === 0) return { overall: 0, teaching: 0, workload: 0 };
    const avg = (field) => (feedbacks.reduce((acc, curr) => acc + (curr[field] || 0), 0) / feedbacks.length).toFixed(1);
    return {
      overall: avg("rating"),
      teaching: avg("teachingQuality"),
      workload: avg("workload")
    };
  }, [feedbacks]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <Skeleton className="h-96 w-full max-w-4xl rounded-2xl" />
    </div>
  );

  if (!courseInfo) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900">No Feedback Found</h2>
        <p className="text-slate-500 mt-2 mb-6">No feedback records found for this course ID.</p>
        <Link to="/instructor/feedback">
            <Button variant="outline">Go Back</Button>
        </Link>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
            <Link to="/instructor/feedback">
                <Button variant="ghost" size="icon" className="hover:bg-slate-100">
                   <ArrowLeft size={20} className="text-slate-600"/>
                </Button>
            </Link>
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    Feedback: {courseInfo.title}
                    <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 font-mono">
                        {courseInfo.courseCode}
                    </Badge>
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                    Viewing {feedbacks.length} anonymous responses.
                </p>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Overall Satisfaction" value={stats.overall} icon={Star} color="text-yellow-500" bg="bg-yellow-50" />
            <StatCard label="Teaching Quality" value={stats.teaching} icon={BarChart3} color="text-blue-500" bg="bg-blue-50" />
            <StatCard label="Workload Balance" value={stats.workload} icon={Calendar} color="text-purple-500" bg="bg-purple-50" />
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare size={18} className="text-slate-400"/> Student Comments
        </h2>

        <div className="grid gap-4">
            {feedbacks.map((item, idx) => (
                <Card key={idx} className="border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-6 flex gap-4">
                        <Quote size={24} className="text-slate-200 flex-shrink-0 fill-slate-50" />
                        <div className="space-y-3 flex-1">
                            {item.comments ? (
                                <p className="text-slate-700 leading-relaxed text-sm md:text-base">{item.comments}</p>
                            ) : (
                                <p className="text-slate-400 italic text-sm">No written comment provided.</p>
                            )}
                            
                            {/* Individual Rating Badge */}
                            <div className="flex gap-2 pt-2">
                                <Badge variant="secondary" className="text-xs bg-slate-50 text-slate-500 font-normal border border-slate-100">
                                    Teaching: <span className="font-bold text-slate-700 ml-1">{item.teachingQuality}/5</span>
                                </Badge>
                                <Badge variant="secondary" className="text-xs bg-slate-50 text-slate-500 font-normal border border-slate-100">
                                    Workload: <span className="font-bold text-slate-700 ml-1">{item.workload}/5</span>
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    </div>
  );
}

// Sub-component
function StatCard({ label, value, icon: Icon, color, bg }) {
    return (
        <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                    <div className="flex items-end gap-1 mt-1">
                        <span className="text-3xl font-black text-slate-900">{value}</span>
                        <span className="text-sm text-slate-400 font-medium mb-1">/ 5.0</span>
                    </div>
                </div>
                <div className={`p-3 rounded-xl ${bg}`}>
                    <Icon size={24} className={color} />
                </div>
            </CardContent>
        </Card>
    );
}