import { useEffect, useState } from "react";

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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Course Status</h2>

      {courses.map(c => (
        <div key={c._id} className="p-3 border rounded bg-white">
          <p className="font-semibold">
            {c.courseCode} — {c.title}
          </p>
          <p>Status: {c.status}</p>
          <p>
            Instructor Pending:{" "}
            {instPending.filter(r => r.course._id === c._id).length}
          </p>
          <p>
            Advisor Pending:{" "}
            {advPending.filter(r => r.course._id === c._id).length}
          </p>
          <p>
            Enrolled: {enrolled[c._id] || 0}
          </p>
        </div>
      ))}
    </div>
  );
}
