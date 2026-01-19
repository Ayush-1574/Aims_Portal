import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

export default function StudentDashboard() {
  const [availableCourses, setAvailableCourses] = useState([]);
  const [studentEnrollments, setStudentEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch offered courses (from instructor side)
  useEffect(() => {
    fetch("http://localhost:5000/api/courses") // CHANGE URL if needed
      .then(res => res.json())
      .then(data => {
        setAvailableCourses(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch courses", err);
        setLoading(false);
      });
  }, []);

  // 🔹 Apply for course
  const applyForCourse = (courseId) => {
    const newEntry = {
      courseId,
      status: "PENDING_INSTRUCTOR",
    };

    setStudentEnrollments(prev => [...prev, newEntry]);

    // OPTIONAL: send to backend
    fetch("http://localhost:5000/api/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEntry),
    });
  };

  if (loading) {
    return <p className="text-gray-600">Loading courses...</p>;
  }

  return (
    <Outlet
      context={{
        availableCourses,
        studentEnrollments,
        applyForCourse,
      }}
    />
  );
}
