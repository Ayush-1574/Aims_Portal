import { useState, useEffect, useRef } from "react";
import { offerCourse } from "../api";
import { fetchGlobalData } from "@/features/admin/api";
import { Book, CheckCircle, AlertCircle, PlusCircle, Search, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function OfferCourse() {
  const [formData, setFormData] = useState({
    title: "", 
    courseCode: "", 
    dept: "", 
    credits: 3,
    description: "", 
    session: "", 
    year: 1,
    ltp: "3-0-0"
  });
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });
  
  // Data States
  const [departments, setDepartments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);

  // Searchable Dropdown States
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [deptData, sessionData, courseData] = await Promise.all([
           fetchGlobalData("DEPARTMENT"),
           fetchGlobalData("SESSION"),
           fetchGlobalData("COURSE_CODE")
        ]);
        
        setDepartments(deptData.items || []);
        setSessions(sessionData.items || []);
        setCourses(courseData.items || []);
        
        if (sessionData.items && sessionData.items.length > 0) {
          setFormData(prev => ({ ...prev, session: sessionData.items[0].key }));
        }
      } catch (err) {
        console.error("Error loading global data:", err);
        toast.error("Failed to load form data");
      }
    };
    loadData();

    // Click outside listener to close dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCourseDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Logic for Course Code Input Typing
  const handleCourseCodeChange = (e) => {
    const value = e.target.value;
    setFormData(prev => {
        const newData = { ...prev, courseCode: value };
        
        // Check if typed value matches an existing course exactly to auto-fill title
        const match = courses.find(c => c.key.toLowerCase() === value.toLowerCase());
        if (match) {
            newData.title = match.value;
        } else {
            // Optional: Clear title if code doesn't match? 
            // Usually better to keep it or let user type it manually.
            // keeping it as is for now.
        }
        return newData;
    });
    setShowCourseDropdown(true);
  };

  // Logic for Selecting from Dropdown
  const selectCourseCode = (course) => {
    setFormData(prev => ({
        ...prev,
        courseCode: course.key,
        title: course.value
    }));
    setShowCourseDropdown(false);
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", msg: "" });

    try {
      await offerCourse(formData);
      toast.success("Course created successfully!");
      setStatus({ type: "success", msg: "Course offered successfully!" });
      
      setFormData(prev => ({ 
        title: "", courseCode: "", dept: "", credits: 3, 
        description: "", session: prev.session, ltp: "3-0-0" 
      }));
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Failed to offer course.";
      toast.error(errorMsg);
      setStatus({ type: "error", msg: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // Filter courses for dropdown
  const filteredCourses = courses.filter(c => 
    c.isActive && 
    c.key.toLowerCase().includes(formData.courseCode.toLowerCase())
  );

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
          {/* Status Banner */}
          {status.msg && (
            <div className={`mb-8 p-4 rounded-xl text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
              status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
            }`}>
              {status.type === 'success' ? <CheckCircle size={18} className="shrink-0"/> : <AlertCircle size={18} className="shrink-0"/>}
              {status.msg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Core Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* SEARCHABLE Course Code Input */}
              <div className="space-y-2 relative" ref={dropdownRef}>
                <Label>Course Code</Label>
                <div className="relative">
                    <Input 
                        name="courseCode"
                        value={formData.courseCode}
                        onChange={handleCourseCodeChange}
                        onFocus={() => setShowCourseDropdown(true)}
                        placeholder="Type to search (e.g. CS301)"
                        className="h-11 pl-10 bg-white"
                        autoComplete="off"
                        required
                    />
                    <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                    
                    {/* Dropdown List */}
                    {showCourseDropdown && filteredCourses.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100">
                            {filteredCourses.map((course) => (
                                <div 
                                    key={course.key}
                                    onClick={() => selectCourseCode(course)}
                                    className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 flex justify-between items-center group transition-colors"
                                >
                                    <span className="font-medium text-slate-700 group-hover:text-blue-600">{course.key}</span>
                                    <span className="text-xs text-slate-400 truncate max-w-[150px]">{course.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Course Title</Label>
                <Input 
                  name="title" 
                  placeholder="Auto-filled from selection" 
                  value={formData.title} 
                  readOnly
                  className="bg-slate-50 text-slate-500 cursor-not-allowed h-11"
                  required 
                />
              </div>

              {/* Department Select */}
              <div className="space-y-2">
                <Label>Department</Label>
                <Select 
                  value={formData.dept} 
                  onValueChange={(val) => handleSelectChange("dept", val)} 
                  required
                >
                  <SelectTrigger className="h-11 bg-white border-slate-200">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.filter(d => d.isActive).map(dept => (
                      <SelectItem key={dept._id || dept.key} value={dept.key}>
                        {dept.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Session Select */}
              <div className="space-y-2">
                <Label>Session</Label>
                <Select 
                  value={formData.session} 
                  onValueChange={(val) => handleSelectChange("session", val)} 
                  required
                >
                  <SelectTrigger className="h-11 bg-white border-slate-200">
                    <SelectValue placeholder="Select Session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.filter(s => s.isActive).map(session => (
                      <SelectItem key={session._id || session.key} value={session.key}>
                        {session.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Structure Details Box */}
            <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <Label>L-T-P Structure</Label>
                  <Input 
                    name="ltp" 
                    placeholder="3-0-0" 
                    value={formData.ltp} 
                    onChange={handleChange} 
                    className="bg-white h-11"
                    required 
                  />
               </div>
               <div className="space-y-2">
                  <Label>Credits</Label>
                  <Input 
                    type="number" 
                    name="credits" 
                    value={formData.credits} 
                    onChange={handleChange} 
                    className="bg-white h-11"
                    required 
                  />
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