import { useEffect, useState } from "react";
import {
  fetchCurrentSessionEnrollments,
  submitFeedback,
  getFeedbackStatus
} from "../api";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, BookOpen, GraduationCap, BarChart } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// --- SUB-COMPONENT: Individual Feedback Card ---
function FeedbackCard({ course, onSubmit }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    rating: 5,
    teachingQuality: 5,
    workload: 3,
    comments: ""
  });

  // Calculate dynamic average for display
  const averageRating = ((Number(form.rating) + Number(form.teachingQuality) + Number(form.workload)) / 3).toFixed(1);

  // Helper for Rating Buttons
  const RatingInput = ({ label, value, field, max = 5, icon: Icon }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-xs sm:text-sm font-medium text-slate-700 flex items-center gap-2">
          {Icon && <Icon size={14} className="text-slate-400 shrink-0" />} 
          <span className="truncate">{label}</span>
        </Label>
        <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded shrink-0">
          {value}/{max}
        </span>
      </div>
      <div className="flex gap-1 sm:gap-2">
        {[...Array(max)].map((_, i) => {
          const ratingValue = i + 1;
          const isActive = ratingValue <= value;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setForm({ ...form, [field]: ratingValue })}
              // Larger touch target (h-10) on mobile, standard (h-9) on desktop
              className={`flex-1 h-10 sm:h-9 rounded-md transition-all duration-200 border text-sm font-medium touch-manipulation ${
                isActive 
                  ? "bg-slate-900 border-slate-900 text-white shadow-sm" 
                  : "bg-white border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600"
              }`}
            >
              {ratingValue}
            </button>
          );
        })}
      </div>
    </div>
  );

  const handleSubmit = async () => {
    if (!form.comments.trim()) {
      toast.error("Please provide written feedback before submitting.");
      return;
    }

    setLoading(true);
    await onSubmit(course.courseId, form);
    setLoading(false);
    
    // Reset defaults for next time (optional)
    setForm({ rating: 5, teachingQuality: 5, workload: 3, comments: "" });
  };

  return (
    <Card className="flex flex-col h-full border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header */}
      <CardHeader className="pb-4 bg-slate-50/50 border-b border-slate-100 p-4 sm:p-6">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0"> {/* Enables text truncation in flex item */}
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1" title={course.title}>
              {course.title}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <Badge variant="outline" className="font-mono text-[10px] sm:text-xs bg-white text-slate-600 border-slate-200 shrink-0">
                {course.code}
              </Badge>
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium px-1.5 py-0.5 rounded bg-slate-100 truncate">
                {course.session}
              </span>
            </div>
          </div>
          
          {/* Average Score Badge */}
          <div className="flex flex-col items-center justify-center bg-white border border-slate-200 rounded-lg p-1.5 sm:p-2 min-w-[3rem] sm:min-w-[3.5rem] shadow-sm shrink-0">
            <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none">{averageRating}</span>
            <span className="text-[8px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">Avg</span>
          </div>
        </div>
      </CardHeader>
      
      {/* Body */}
      <CardContent className="flex-1 p-4 sm:p-6 space-y-6">
        <div className="space-y-5">
          <RatingInput label="Satisfaction" value={form.rating} field="rating" icon={Star} />
          <RatingInput label="Teaching" value={form.teachingQuality} field="teachingQuality" icon={GraduationCap} />
          <RatingInput label="Workload" value={form.workload} field="workload" icon={BarChart} />
        </div>

        <div className="space-y-2">
          <Label className="text-xs sm:text-sm font-medium text-slate-700 flex items-center gap-2">
            <MessageSquare size={14} className="text-slate-400" /> 
            Written Feedback <span className="text-red-500">*</span>
          </Label>
          <Textarea
            rows={4}
            value={form.comments}
            onChange={(e) => setForm({ ...form, comments: e.target.value })}
            placeholder="What worked well? What could be improved?"
            className="resize-none bg-slate-50 border-slate-200 focus:bg-white transition-colors text-sm sm:text-base"
          />
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-4 px-4 sm:pb-6 sm:px-6">
        <Button 
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium h-10 sm:h-11 text-sm sm:text-base shadow-sm active:scale-[0.98] transition-transform" 
          onClick={handleSubmit} 
          isLoading={loading}
        >
          Submit Anonymous Feedback
        </Button>
      </CardFooter>
    </Card>
  );
}

// --- MAIN PAGE ---
export default function StudentFeedback() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(false);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    try {
      const [status, record] = await Promise.all([
        getFeedbackStatus(),
        fetchCurrentSessionEnrollments()
      ]);

      setActive(status.active);
      setEnrollments(record || []);
    } catch {
      toast.error("Failed to load feedback data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFeedbackSubmit = async (courseId, formData) => {
    try {
      await submitFeedback({ courseId, ...formData });
      toast.success("Feedback submitted anonymously");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Feedback submission failed");
    }
  };

  const filteredEnrollments = enrollments.filter((e) =>
    e.code.toLowerCase().includes(search.toLowerCase()) || 
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  // Loading Skeleton
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pb-20 animate-pulse px-4 sm:px-0">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-[500px] w-full rounded-2xl" />)}
      </div>
    );
  }

  // Inactive State
  if (!active) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <BookOpen size={32} className="text-slate-300 sm:w-10 sm:h-10" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Feedback Closed</h2>
        <p className="text-sm sm:text-base text-slate-500 max-w-md mt-2 leading-relaxed">
          The course feedback period is currently not active. Please check back later or contact the administration.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 sm:gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Course Feedback</h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl leading-relaxed">
            Share your honest feedback. 
            <span className="font-semibold text-slate-700"> Responses are 100% anonymous</span> and visible only after grades are finalized.
          </p>
        </div>
        
        {/* Search Input */}
        <div className="w-full md:w-72 relative">
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 sm:h-11 pl-4 pr-10 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all text-sm shadow-sm"
          />
          <SearchIcon className="absolute right-3 top-2.5 sm:top-3 text-slate-400 pointer-events-none" size={18} />
        </div>
      </div>

      {/* Grid Layout - Responsive Breakpoints */}
      {filteredEnrollments.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 sm:p-12 text-center">
          <p className="text-slate-500 font-medium text-sm sm:text-base">No pending feedback found for your enrolled courses.</p>
          <Button variant="link" onClick={() => setSearch("")} className="mt-2 text-slate-900">Clear Search</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredEnrollments.map((course) => (
            <FeedbackCard 
              key={course.courseId} 
              course={course} 
              onSubmit={handleFeedbackSubmit} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SearchIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}