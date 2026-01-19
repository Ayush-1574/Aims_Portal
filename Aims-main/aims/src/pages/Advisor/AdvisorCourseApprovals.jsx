import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  fetchPendingCourses,
  advisorApproveCourse,
  advisorRejectCourse
} from "@/api/advisorCourse";

export default function AdvisorCourseApprovals() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchPendingCourses();
      // backend returns: { success, courses: [...] }
      setCourses(res.courses || []);
    } catch (err) {
      console.error("Failed to fetch pending courses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const approve = async (id) => {
    await advisorApproveCourse(id);
    loadData();
  };

  const reject = async (id) => {
    await advisorRejectCourse(id);
    loadData();
  };

  if (loading) return <div>Loading...</div>;

  if (courses.length === 0)
    return <div>No courses pending advisor approval.</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Course Approvals</h2>

      {courses.map(c => (
        <div key={c._id} className="p-3 border rounded bg-white flex justify-between">
          <div>
            <p className="font-semibold">
              {c.courseCode} — {c.title}
            </p>
            <p className="text-gray-600">Session: {c.session}</p>
            <p className="text-gray-600 text-sm">{c.dept} — {c.ltp}</p>
          </div>

          <div className="space-x-2">
            <Button onClick={() => approve(c._id)}>Approve</Button>
            <Button variant="destructive" onClick={() => reject(c._id)}>Reject</Button>
          </div>
        </div>
      ))}
    </div>
  );
}
