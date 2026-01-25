import { useState, useEffect, useMemo } from "react";
import {
  fetchOfferedCourses,
  enrollInCourse,
  fetchStudentRecord
} from "../api";
import {
  User, Calendar, CheckCircle, AlertCircle, Layers,
  Clock, UserCheck, Search, FilterX, BookOpen, ListFilter
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // --- FILTER STATE ---
  const [filters, setFilters] = useState({
    dept: "",
    code: "",
    title: "",
    session: "",
    instructor: "",
    status: "ALL" // New Status Filter
  });

  // 'appliedFilters' is NULL initially. 
  // This tells us the user hasn't clicked search yet.
  const [appliedFilters, setAppliedFilters] = useState(null);

  const loadData = async () => {
    try {
      const [coursesData, enrollmentsData] = await Promise.all([
        fetchOfferedCourses(),
        fetchStudentRecord()
      ]);
      setCourses(coursesData || []);
      setEnrollments(enrollmentsData?.data || []);
    } catch {
      toast.error("Failed to load course data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- HELPER: Get Status ---
  const getCourseStatus = (courseId) => {
    const enrollment = enrollments.find(e => e.course?._id === courseId || e.course === courseId);
    return enrollment ? enrollment.status : "NOT_ENROLLED";
  };

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    setAppliedFilters(filters);
    toast.success("Search applied");
  };

  const handleReset = () => {
    const empty = { dept: "", code: "", title: "", session: "", instructor: "", status: "ALL" };
    setFilters(empty);
    setAppliedFilters(null); // Reset to "No Search" state
    toast.info("Filters cleared");
  };

  // --- FILTER LOGIC ---
  const filteredCourses = useMemo(() => {
    // 1. If no search yet, return empty to keep page clean
    if (!appliedFilters) return [];

    return courses.filter((c) => {
      const f = appliedFilters;
      const currentStatus = getCourseStatus(c._id);

      // Status Filter Logic
      const matchesStatus = 
        f.status === "ALL" || 
        (f.status === "NOT_ENROLLED" && currentStatus === "NOT_ENROLLED") ||
        currentStatus === f.status;

      return (
        matchesStatus &&
        (!f.dept || c.dept === f.dept) &&
        (!f.code || c.courseCode.toLowerCase().includes(f.code.toLowerCase())) &&
        (!f.title || c.title.toLowerCase().includes(f.title.toLowerCase())) &&
        (!f.session || c.session === f.session) &&
        (!f.instructor || c.instructor?.name?.toLowerCase().includes(f.instructor.toLowerCase()))
      );
    });
  }, [courses, appliedFilters, enrollments]);

  const handleEnroll = async (courseId) => {
    if (!window.confirm("Confirm enrollment for this course?")) return;
    setActionLoading(courseId);
    try {
      await enrollInCourse(courseId);
      toast.success("Enrollment request submitted");
      await loadData(); // Reload to update status
    } catch (err) {
      toast.error(err.response?.data?.msg || "Enrollment failed");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-slate-200 border-t-slate-800 rounded-full" /></div>;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Offered Courses</h1>
        <p className="text-slate-500 mt-1">Search to find available courses and manage enrollments.</p>
      </div>

      {/* --- FILTER BAR --- */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          
          {/* Department */}
          <Select value={filters.dept || "ALL"} onValueChange={(val) => handleSelectChange("dept", val === "ALL" ? "" : val)}>
            <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Departments</SelectItem>
              <SelectItem value="CSE">CSE</SelectItem>
              <SelectItem value="EE">EE</SelectItem>
              <SelectItem value="ME">ME</SelectItem>
            </SelectContent>
          </Select>

          {/* Session */}
          <Select value={filters.session || "ALL"} onValueChange={(val) => handleSelectChange("session", val === "ALL" ? "" : val)}>
            <SelectTrigger><SelectValue placeholder="Session" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Sessions</SelectItem>
              <SelectItem value="2024-25-I">2024-25-I</SelectItem>
              <SelectItem value="2024-25-II">2024-25-II</SelectItem>
            </SelectContent>
          </Select>

          {/* NEW: Enrollment Status Filter */}
          <Select value={filters.status} onValueChange={(val) => handleSelectChange("status", val)}>
            <SelectTrigger className="border-blue-200 bg-blue-50/50 text-blue-900">
                <div className="flex items-center gap-2">
                    <ListFilter size={16} className="text-blue-500"/>
                    <SelectValue placeholder="Status" />
                </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Show All Courses</SelectItem>
              <SelectItem value="NOT_ENROLLED">Not Enrolled</SelectItem>
              <SelectItem value="ENROLLED">Enrolled Only</SelectItem>
              <SelectItem value="PENDING_INSTRUCTOR">Pending Instructor</SelectItem>
              <SelectItem value="PENDING_ADVISOR">Pending Advisor</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Input name="code" placeholder="Code (e.g. CS101)" value={filters.code} onChange={handleInputChange} />
          <Input name="title" placeholder="Course Title" value={filters.title} onChange={handleInputChange} />
          <Input name="instructor" placeholder="Instructor Name" value={filters.instructor} onChange={handleInputChange} />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
          <Button onClick={handleSearch} className="bg-slate-900 hover:bg-slate-800 text-white min-w-[140px]">
            <Search size={16} className="mr-2" /> Search Results
          </Button>
          <Button variant="ghost" onClick={handleReset} className="text-slate-500">
            <FilterX size={16} className="mr-2" /> Clear Filters
          </Button>
        </div>
      </div>

      {/* --- RESULTS AREA --- */}
      {!appliedFilters ? (
        // STATE 1: Initial Empty State
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white/50 rounded-2xl border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Search className="text-blue-400" size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Start your search</h3>
          <p className="text-slate-500 max-w-sm mt-2">
            Select a department or session above and click <b>Search Results</b> to view courses.
          </p>
        </div>
      ) : filteredCourses.length === 0 ? (
        // STATE 2: No Results Found
        <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 rounded-2xl border border-slate-200">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
            <BookOpen className="text-slate-300" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No matching courses</h3>
          <p className="text-slate-500">Try adjusting your filters to find what you're looking for.</p>
        </div>
      ) : (
        // STATE 3: Results List
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const status = getCourseStatus(course._id);
            let ActionButton;
            
            if (status === "ENROLLED") ActionButton = <Button disabled className="w-full bg-emerald-50 text-emerald-700 border border-emerald-100"><CheckCircle size={16} className="mr-2" /> Enrolled</Button>;
            else if (status === "PENDING_INSTRUCTOR") ActionButton = <Button disabled className="w-full bg-amber-50 text-amber-700 border border-amber-100"><Clock size={16} className="mr-2" /> Instructor Review</Button>;
            else if (status === "PENDING_ADVISOR") ActionButton = <Button disabled className="w-full bg-blue-50 text-blue-700 border border-blue-100"><UserCheck size={16} className="mr-2" /> Advisor Review</Button>;
            else if (status === "REJECTED") ActionButton = <Button disabled className="w-full bg-red-50 text-red-600 border border-red-100"><AlertCircle size={16} className="mr-2" /> Rejected</Button>;
            else ActionButton = (
              <Button 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-sm" 
                onClick={() => handleEnroll(course._id)} 
                isLoading={actionLoading === course._id}
              >
                Enroll Now
              </Button>
            );

            return (
              <Card key={course._id} className="hover:shadow-lg transition-all duration-300 group border-slate-200 flex flex-col">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="outline" className="font-mono bg-white text-slate-600 px-3 py-1">{course.courseCode}</Badge>
                    <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none">{course.dept}</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-blue-600 transition-colors">{course.title}</h3>
                  
                  <div className="space-y-2.5 text-sm text-slate-500 mb-6 flex-grow">
                    <div className="flex items-center gap-2"><User size={14} className="text-slate-400"/> {course.instructor?.name || "TBA"}</div>
                    <div className="flex items-center gap-2"><Calendar size={14} className="text-slate-400"/> {course.session}</div>
                    <div className="flex items-center gap-2"><Layers size={14} className="text-slate-400"/> <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{course.ltp}</span></div>
                  </div>
                  <div className="mt-auto pt-4 border-t border-slate-100">{ActionButton}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}