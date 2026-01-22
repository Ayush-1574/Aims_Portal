import { useEffect, useState } from "react";
import UserDetailsCard from "@/components/UserDetailsCard";

import { fetchAdvisorEnrollRequests } from "@/api/advisorEnroll";
import { fetchInstructorEnrollRequests } from "@/api/instructorEnroll";
import { getStudentRecord } from "@/api/enrollment"; // to count enrolled
import { fetchCourses } from "@/api/advisorCourse";

export default function AdvisorCourseStatus() {
  const [courses, setCourses] = useState([]);
  const [instPending, setInstPending] = useState([]);
  const [advPending, setAdvPending] = useState([]);
  const [enrolled, setEnrolled] = useState({});
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const courseRes = await fetchCourses();
      const instructorRes = await fetchInstructorEnrollRequests();
      const advisorRes = await fetchAdvisorEnrollRequests();
      const studentRes = await getStudentRecord(); // returns enrolled per student
    
      setCourses(courseRes.courses || []);

      // pending for instructor
      setInstPending(instructorRes.data || []);

      // pending for advisor
      setAdvPending(advisorRes.data || []);

      // enrolled grouped by course
      const grouped = {};
      (studentRes.data || []).forEach(c => {
        if (!grouped[c.course]) grouped[c.course] = 0;
        if (c.enrolled) grouped[c.course]++;
      });
      setEnrolled(grouped);

    } catch (err) {
      console.error("Status load failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading course status...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <UserDetailsCard />

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Course Status</h1>
        <p className="text-gray-600 mt-1">View enrollment requests and status for all courses</p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-blue-50 rounded-lg p-8 text-center border border-blue-200">
          <p className="text-gray-600 font-medium">No courses found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {courses.map(c => {
            const instReqs = instPending.filter(r => r.course && r.course._id === c._id).length;
            const advReqs = advPending.filter(r => r.course && r.course._id === c._id).length;
            const enrolledCount = enrolled[c._id] || 0;

            return (
              <div key={c._id} className="p-5 border-2 border-gray-200 rounded-lg bg-white hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-lg text-gray-900">
                      {c.courseCode} — {c.title}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      Status: <span className="font-semibold">{c.status}</span>
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-bold rounded-full">
                    {c.courseCode}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-gray-600 text-sm font-medium">Instructor Pending</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">{instReqs}</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded border border-orange-200">
                    <p className="text-gray-600 text-sm font-medium">Advisor Pending</p>
                    <p className="text-2xl font-bold text-orange-600 mt-1">{advReqs}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <p className="text-gray-600 text-sm font-medium">Enrolled Students</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{enrolledCount}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
