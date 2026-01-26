import { useState, useEffect } from "react";
import { offerCourse } from "../api";
import { fetchGlobalData } from "@/features/admin/api";
import { PlusCircle, Book, Layers, Layout, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
 

export default function OfferCourse() {
  const [formData, setFormData] = useState({
    title: "", courseCode: "", dept: "", credits: 3,
    description: "", session: "", year: 1, ltp: "3-0-0"
  });
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [departments, setDepartments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);

  // Load departments, sessions, and courses on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const deptData = await fetchGlobalData("DEPARTMENT");
        const sessionData = await fetchGlobalData("SESSION");
        const courseData = await fetchGlobalData("COURSE_CODE");
        
       
        
        setDepartments(deptData.items || []);
        setSessions(sessionData.items || []);
        setCourses(courseData.items || []);
        
        // Set default session if available
        if (sessionData.items && sessionData.items.length > 0) {
          setFormData(prev => ({ ...prev, session: sessionData.items[0].key }));
        }
      } catch (err) {
        console.error("Error loading global data:", err);
      }
    };
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Auto-fill title when course code is selected
    if (name === "courseCode") {
      const selectedCourse = courses.find(c => c.key === value);
      if (selectedCourse) {
        setFormData(prev => ({ ...prev, courseCode: value, title: selectedCourse.value }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", msg: "" });

    try {
      await offerCourse(formData);
      toast.success("Course created successfully!");
      setStatus({ type: "success", msg: "Course offered successfully!" });
      
      // Reset form
      setFormData({ 
        title: "", courseCode: "", dept: "", credits: 3, 
        description: "", session: sessions.length > 0 ? sessions[0].key : "", year: 1, ltp: "3-0-0" 
      });
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Failed to offer course.";
      toast.error(errorMsg);
      setStatus({ type: "error", msg: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <Card className="border-0 shadow-2xl overflow-hidden rounded-2xl">
        <CardHeader className="bg-slate-900 text-white p-8">
          <div className="flex items-center gap-5">
             <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 shadow-inner">
                <Book size={32} className="text-blue-200" />
             </div>
             <div>
                <CardTitle className="text-2xl font-bold text-white">Offer New Course</CardTitle>
                <p className="text-slate-400 mt-1">Create a new course curriculum for the upcoming session.</p>
             </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          {/* Inline Feedback Banner */}
          {status.msg && (
            <div className={`mb-8 p-4 rounded-xl text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
              status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
            }`}>
              {status.type === 'success' ? <CheckCircle size={18} className="shrink-0"/> : <AlertCircle size={18} className="shrink-0"/>}
              {status.msg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Core Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Course Code</Label>
                <select 
                  name="courseCode" 
                  value={formData.courseCode} 
                  onChange={handleChange}
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  required
                >
                  <option value="">Select Course Code</option>
                  {courses.filter(c => c.isActive).map(course => (
                    <option key={course._id} value={course.key}>{course.key}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Course Title</Label>
                <Input 
                  name="title" 
                  placeholder="Auto-filled from course selection" 
                  value={formData.title} 
                  readOnly
                  className="bg-slate-50 cursor-not-allowed"
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label>Department</Label>
                <select 
                  name="dept" 
                  value={formData.dept} 
                  onChange={handleChange}
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.filter(d => d.isActive).map(dept => (
                    <option key={dept._id} value={dept.key}>{dept.value}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Session</Label>
                <select 
                  name="session" 
                  value={formData.session} 
                  onChange={handleChange}
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  required
                >
                  <option value="">Select Session</option>
                  {sessions.filter(s => s.isActive).map(session => (
                    <option key={session._id} value={session.key}>{session.value}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Structure Details - Grouped in a subtle box */}
            <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-2">
                  <Label>L-T-P Structure</Label>
                  <Input name="ltp" placeholder="3-0-0" value={formData.ltp} onChange={handleChange} required />
               </div>
               <div className="space-y-2">
                  <Label>Credits</Label>
                  <Input type="number" name="credits" value={formData.credits} onChange={handleChange} required />
               </div>
               <div className="space-y-2">
                  <Label>Year Level</Label>
                  <Input type="number" name="year" value={formData.year} onChange={handleChange} required />
               </div>
            </div>

            {/* Footer Action */}
            <Button type="submit" size="lg" className="w-full text-base h-12 bg-slate-900 hover:bg-slate-800" isLoading={loading}>
              <PlusCircle size={18} className="mr-2"/> Offer Course
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}