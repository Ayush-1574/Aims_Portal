import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import UserDetailsCard from "@/components/UserDetailsCard";
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

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading pending course approvals...</p>
      </div>
    </div>
  );

  if (courses.length === 0)
    return (
      <div className="bg-blue-50 rounded-lg p-8 text-center border border-blue-200">
        <p className="text-gray-600 font-medium">No courses pending advisor approval.</p>
      </div>
    );

  return (
    <div className="space-y-6">
      <UserDetailsCard />

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Course Approvals</h1>
        <p className="text-gray-600 mt-1">Review and approve new course offerings</p>
      </div>

      <div className="space-y-4">
        {courses.map(c => (
          <div
            key={c._id}
            className="p-5 border-2 border-gray-200 rounded-lg bg-white hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-lg">
                  {c.courseCode} — {c.title}
                </p>
                <div className="mt-3 space-y-2">
                  <p className="text-gray-600">
                    <span className="font-medium">Session:</span> {c.session}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Department:</span> {c.dept}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">L-T-P:</span> {c.ltp}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => approve(c._id)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => reject(c._id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
