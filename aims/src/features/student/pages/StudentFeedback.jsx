import { useEffect, useState } from "react";
import {
  fetchCurrentSessionEnrollments,
  submitFeedback,
  getFeedbackStatus
} from "../api";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, BookOpen, Send, Search } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// --- CUSTOM STAR RATING COMPONENT ---
function StarRating({ value, onChange, max = 5 }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1.5" onMouseLeave={() => setHover(0)}>
      {[...Array(max)].map((_, i) => {
        const ratingValue = i + 1;
        const isFilled = ratingValue <= (hover || value);
        
        return (
          <button
            key={i}
            type="button"
            className="focus:outline-none transition-all duration-200 hover:scale-110 active:scale-90"
            onClick={() => onChange(ratingValue)}
            onMouseEnter={() => setHover(ratingValue)}
          >
            <Star
              size={26}
              className={`${
                isFilled
                  ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                  : "fill-slate-50 text-slate-200"
              } transition-colors duration-200`}
              strokeWidth={isFilled ? 0 : 2}
            />
          </button>
        );
      })}
      <span className="ml-2 text-sm font-bold text-slate-400 w-6">
        {hover || value || 0}
        <span className="text-[10px] font-normal text-slate-300">/5</span>
      </span>
    </div>
  );
}

// --- FEEDBACK CARD ---
function FeedbackCard({ course, onSubmit }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    rating: 0,
    teachingQuality: 0,
    workload: 0,
    comments: ""
  });

  const handleSubmit = async () => {
    if (form.rating === 0 || form.teachingQuality === 0 || form.workload === 0) {
      toast.error("Please provide a rating for all categories.");
      return;
    }
    if (!form.comments.trim()) {
      toast.error("Please provide written feedback.");
      return;
    }

    setLoading(true);
    await onSubmit(course.courseId, form);
    setLoading(false);
    setForm({ rating: 0, teachingQuality: 0, workload: 0, comments: "" });
  };

  return (
    <Card className="flex flex-col h-full bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden group">
      
      {/* Header */}
      <div className="p-5 border-b border-slate-50 bg-slate-50/30">
        <div className="flex justify-between items-start mb-2">
           <Badge variant="outline" className="bg-white text-slate-600 border-slate-200 font-mono text-xs shadow-sm">
              {course.code}
           </Badge>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-full">
              {course.session}
           </span>
        </div>
        <h3 className="text-lg font-bold text-slate-800 leading-tight line-clamp-1" title={course.title}>
          {course.title}
        </h3>
        <p className="text-xs text-slate-500 mt-1 font-medium">{course.dept} Department</p>
      </div>
      
      {/* Form Body */}
      <CardContent className="flex-1 p-5 space-y-6">
        
        {/* Rating Section */}
        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Overall Satisfaction</Label>
            <StarRating value={form.rating} onChange={(v) => setForm({...form, rating: v})} />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Teaching Quality</Label>
            <StarRating value={form.teachingQuality} onChange={(v) => setForm({...form, teachingQuality: v})} />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Workload Balance</Label>
            <StarRating value={form.workload} onChange={(v) => setForm({...form, workload: v})} />
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-2 pt-2 border-t border-slate-50">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <MessageSquare size={12} /> Your Comments <span className="text-red-400">*</span>
          </Label>
          <Textarea
            rows={3}
            value={form.comments}
            onChange={(e) => setForm({ ...form, comments: e.target.value })}
            placeholder="Share your experience (anonymous)..."
            className="resize-none text-sm bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 rounded-lg"
          />
        </div>
      </CardContent>

      <CardFooter className="p-4 bg-slate-50 border-t border-slate-100">
        <Button 
          className="w-full bg-slate-900 hover:bg-blue-600 text-white font-medium shadow-sm transition-all h-10 gap-2 rounded-lg" 
          onClick={handleSubmit} 
          isLoading={loading}
        >
          <Send size={16} /> Submit Feedback
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
      toast.success("Feedback submitted successfully");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Submission failed");
    }
  };

  const filteredEnrollments = enrollments.filter((e) =>
    e.code.toLowerCase().includes(search.toLowerCase()) || 
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  // Loading State
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-[550px] w-full rounded-2xl" />)}
      </div>
    );
  }

  // Inactive State
  if (!active) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <BookOpen size={40} className="text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Feedback Closed</h2>
        <p className="text-slate-500 max-w-md mt-2">
          The course feedback portal is currently closed. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Course Feedback</h1>
          <p className="text-slate-500 mt-1">Provide anonymous feedback for your enrolled courses.</p>
        </div>
        
        <div className="w-full md:w-80 relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search by course code or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Grid Layout */}
      {filteredEnrollments.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
          <div className="mx-auto w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mb-4">
             <Search size={24} className="text-slate-400"/>
          </div>
          <p className="text-slate-600 font-medium">No courses found matching your search.</p>
          <Button variant="link" onClick={() => setSearch("")} className="mt-2 text-blue-600">Clear filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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