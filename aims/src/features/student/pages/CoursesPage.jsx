import { useState, useEffect, useMemo } from "react";
import {
  fetchOfferedCourses,
  enrollInCourse,
  fetchStudentRecord
} from "../api";
import { fetchGlobalData } from "@/features/admin/api";

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

  // dynamic backend-driven filter options
  const [departments, setDepartments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [courseCodes, setCourseCodes] = useState([]);

  // Filter State
  const [filters, setFilters] = useState({
    dept: "",
    code: "",
    title: "",
    session: "",
    instructor: "",
    status: "ALL"
  });

  const [appliedFilters, setAppliedFilters] = useState(null);

  const loadData = async () => {
    try {
      const [
        coursesData,
        enrollmentsData,
        deptData,
        sessionData,
        courseCodeData
      ] = await Promise.all([
        fetchOfferedCourses(),
        fetchStudentRecord(),
        fetchGlobalData("DEPARTMENT"),
        fetchGlobalData("SESSION"),
        fetchGlobalData("COURSE_CODE")
      ]);

      setCourses(coursesData || []);
      setEnrollments(enrollmentsData?.data || []);
      setDepartments(deptData.items || []);
      setSessions(sessionData.items || []);
      setCourseCodes(courseCodeData.items || []);
    } catch {
      toast.error("Failed to load course data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getCourseStatus = (courseId) => {
    const enrollment = enrollments.find(e => e.course?._id === courseId || e.course === courseId);
    return enrollment ? enrollment.status : "NOT_ENROLLED";
  };

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
    setAppliedFilters(null);
    toast.info("Filters cleared");
  };

  const filteredCourses = useMemo(() => {
    if (!appliedFilters) return [];

    return courses.filter((c) => {
      const f = appliedFilters;
      const currentStatus = getCourseStatus(c._id);

      const matchesStatus =
        f.status === "ALL" ||
        (f.status === "NOT_ENROLLED" && currentStatus === "NOT_ENROLLED") ||
        currentStatus === f.status;

      return (
        matchesStatus &&
        (!f.dept || c.dept === f.dept) &&
        (!f.code || c.courseCode === f.code) &&
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
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Enrollment failed");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin h-10 w-10 border-4 border-slate-200 border-t-slate-800 rounded-full" />
    </div>
  );

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Offered Courses</h1>
        <p className="text-slate-500 mt-1">Search to find available courses and manage enrollments.</p>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

          {/* Department */}
          <Select value={filters.dept || "ALL"} onValueChange={(v) => handleSelectChange("dept", v === "ALL" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Departments</SelectItem>
              {departments.filter(d => d.isActive).map(d => (
                <SelectItem key={d._id} value={d.key}>{d.value}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Session */}
          <Select value={filters.session || "ALL"} onValueChange={(v) => handleSelectChange("session", v === "ALL" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="Session" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Sessions</SelectItem>
              {sessions.filter(s => s.isActive).map(s => (
                <SelectItem key={s._id} value={s.key}>{s.value}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Course Code */}
          <Select value={filters.code || "ALL"} onValueChange={(v) => handleSelectChange("code", v === "ALL" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="Course Code" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Codes</SelectItem>
              {courseCodes.filter(c => c.isActive).map(c => (
                <SelectItem key={c._id} value={c.key}>{c.key}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input name="title" placeholder="Course Title" value={filters.title} onChange={handleInputChange} />
          <Input name="instructor" placeholder="Instructor Name" value={filters.instructor} onChange={handleInputChange} />

        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
          <Button onClick={handleSearch} className="bg-slate-900 text-white min-w-[140px]">
            <Search size={16} className="mr-2" /> Search Results
          </Button>
          <Button variant="ghost" onClick={handleReset} className="text-slate-500">
            <FilterX size={16} className="mr-2" /> Clear Filters
          </Button>
        </div>
      </div>

      {/* RESULTS */}
      {!appliedFilters ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white/50 rounded-2xl border-2 border-dashed border-slate-200">
          <Search className="text-blue-400" size={32} />
          <h3 className="text-xl font-bold text-slate-900 mt-3">Start your search</h3>
          <p className="text-slate-500 mt-2">Apply filters and click Search.</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center bg-slate-50 rounded-2xl border border-slate-200">
          <BookOpen className="text-slate-300" size={24} />
          <h3 className="text-lg font-semibold text-slate-900 mt-3">No matching courses</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const status = getCourseStatus(course._id);
            let ActionButton;

            if (status === "ENROLLED")
              ActionButton = <Button disabled className="w-full bg-emerald-50 text-emerald-700 border border-emerald-100"><CheckCircle size={16} className="mr-2" /> Enrolled</Button>;
            else if (status === "PENDING_INSTRUCTOR")
              ActionButton = <Button disabled className="w-full bg-amber-50 text-amber-700 border border-amber-100"><Clock size={16} className="mr-2" /> Instructor Review</Button>;
            else if (status === "PENDING_ADVISOR")
              ActionButton = <Button disabled className="w-full bg-blue-50 text-blue-700 border border-blue-100"><UserCheck size={16} className="mr-2" /> Advisor Review</Button>;
            else if (status === "REJECTED")
              ActionButton = <Button disabled className="w-full bg-red-50 text-red-600 border border-red-100"><AlertCircle size={16} className="mr-2" /> Rejected</Button>;
            else
              ActionButton = (
                <Button
                  className="w-full bg-slate-900 text-white"
                  onClick={() => handleEnroll(course._id)}
                  isLoading={actionLoading === course._id}
                >
                  Enroll Now
                </Button>
              );

            return (
              <Card key={course._id} className="border-slate-200 flex flex-col">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex justify-between mb-4">
                    <Badge variant="outline" className="font-mono bg-white text-slate-600 px-3 py-1">
                      {course.courseCode}
                    </Badge>
                    <Badge className="bg-blue-50 text-blue-700">{course.dept}</Badge>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">{course.title}</h3>

                  <div className="space-y-2 text-sm text-slate-500 flex-grow">
                    <div className="flex items-center gap-2"><User size={14} /> {course.instructor?.name || "TBA"}</div>
                    <div className="flex items-center gap-2"><Calendar size={14} /> {course.session}</div>
                    <div className="flex items-center gap-2"><Layers size={14} /><span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{course.ltp}</span></div>
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
