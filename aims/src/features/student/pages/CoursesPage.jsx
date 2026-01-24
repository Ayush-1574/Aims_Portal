import { useState, useEffect, useMemo } from "react";
import {
  fetchOfferedCourses,
  enrollInCourse,
  fetchStudentRecord
} from "../api";
import {
  User,
  Calendar,
  CheckCircle,
  AlertCircle,
  Layers,
  GraduationCap,
  Clock,
  UserCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  /* -------- Filters -------- */
  const [dept, setDept] = useState("");
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [session, setSession] = useState("");
  const [instructor, setInstructor] = useState("");
  const [ltp, setLtp] = useState("");

  const loadData = async () => {
    try {
      const [coursesData, enrollmentsData] = await Promise.all([
        fetchOfferedCourses(),
        fetchStudentRecord()
      ]);
      setCourses(coursesData || []);
      setEnrollments(enrollmentsData?.data || []);
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* -------- Enrollment Status -------- */
  const getCourseStatus = (courseId) => {
    const enrollment = enrollments.find(
      (e) => e.course?._id === courseId || e.course === courseId
    );
    return enrollment ? enrollment.status : null;
  };

  /* -------- Filter Logic -------- */
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      return (
        (!dept || c.dept === dept) &&
        (!code ||
          c.courseCode.toLowerCase().includes(code.toLowerCase())) &&
        (!title ||
          c.title.toLowerCase().includes(title.toLowerCase())) &&
        (!session || c.session === session) &&
        (!instructor ||
          c.instructor?.name
            ?.toLowerCase()
            .includes(instructor.toLowerCase())) &&
        (!ltp || c.ltp.includes(ltp))
      );
    });
  }, [courses, dept, code, title, session, instructor, ltp]);

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

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full" />
      </div>
    );

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold">Offered Courses</h1>
        <p className="text-gray-500 mt-1">
          Search and enroll in available courses
        </p>
      </div>

      {/* ---------- FILTER BAR (LIKE IMAGE) ---------- */}
      <div className="bg-white p-5 rounded-xl shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <select
            className="h-10 border rounded-md px-3 text-sm"
            value={dept}
            onChange={(e) => setDept(e.target.value)}
          >
            <option value="">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="EE">EE</option>
            <option value="ME">ME</option>
          </select>

          <Input
            placeholder="Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <select
            className="h-10 border rounded-md px-3 text-sm"
            value={session}
            onChange={(e) => setSession(e.target.value)}
          >
            <option value="">Acad Session</option>
            <option value="2024-25-I">2024-25-I</option>
            <option value="2024-25-II">2024-25-II</option>
          </select>

          <Input
            placeholder="Instructor"
            value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
          />

          <Input
            placeholder="L-T-P"
            value={ltp}
            onChange={(e) => setLtp(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setDept("");
              setCode("");
              setTitle("");
              setSession("");
              setInstructor("");
              setLtp("");
            }}
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {/* ---------- RESULTS ---------- */}
      {filteredCourses.length === 0 ? (
        <div className="p-10 text-center text-gray-500 bg-white rounded-xl shadow-sm">
          Nothing to show yet!
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const status = getCourseStatus(course._id);

            let ActionButton;
            if (status === "ENROLLED")
              ActionButton = (
                <Button disabled className="w-full bg-green-50 text-green-700">
                  <CheckCircle size={16} className="mr-2" /> Enrolled
                </Button>
              );
            else if (status === "PENDING_INSTRUCTOR")
              ActionButton = (
                <Button disabled className="w-full bg-amber-50 text-amber-700">
                  <Clock size={16} className="mr-2" /> Instructor Approval
                </Button>
              );
            else if (status === "PENDING_ADVISOR")
              ActionButton = (
                <Button disabled className="w-full bg-indigo-50 text-indigo-700">
                  <UserCheck size={16} className="mr-2" /> Advisor Approval
                </Button>
              );
            else if (status === "REJECTED")
              ActionButton = (
                <Button disabled className="w-full bg-red-50 text-red-600">
                  <AlertCircle size={16} className="mr-2" /> Rejected
                </Button>
              );
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
              <Card key={course._id} className="hover:shadow-lg transition">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between">
                    <Badge variant="outline">{course.courseCode}</Badge>
                    <Badge variant="secondary">{course.dept}</Badge>
                  </div>

                  <h3 className="text-lg font-bold">{course.title}</h3>

                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <User size={14} /> {course.instructor?.name || "TBA"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} /> {course.session}
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers size={14} /> {course.ltp}
                    </div>
                  </div>

                  {ActionButton}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}