import { Button } from "@/components/ui/button";
import { useOutletContext } from "react-router-dom";
import UserDetailsCard from "@/components/UserDetailsCard";

export default function StudentCourseStatus() {
  const {
    availableCourses,
    studentEnrollments,
    applyForCourse,
  } = useOutletContext();

  const getStatus = (courseId) => {
    const entry = studentEnrollments.find(e => e.courseId === courseId);
    return entry?.status || "AVAILABLE";
  };

  return (
    <div className="space-y-6">
      <UserDetailsCard />

      <h2 className="text-xl font-semibold">Offered Courses</h2>

      {availableCourses.length === 0 && (
        <p className="text-gray-600">No courses offered yet.</p>
      )}

      {availableCourses.map(c => {
        const status = getStatus(c.id);

        return (
          <div
            key={c.id}
            className="p-4 border rounded bg-white flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">
                {c.code} — {c.title}
              </p>
              <p className="text-sm text-gray-600">
                {c.session} • {c.dept} • {c.ltp}
              </p>
              <p className="text-sm">Status: {status}</p>
            </div>

            {status === "AVAILABLE" && (
              <Button onClick={() => applyForCourse(c.id)}>
                Enroll
              </Button>
            )}

            {status === "PENDING_INSTRUCTOR" && (
              <span className="text-yellow-600 font-medium">
                Pending Instructor
              </span>
            )}

            {status === "PENDING_ADVISOR" && (
              <span className="text-blue-600 font-medium">
                Pending Advisor
              </span>
            )}

            {status === "ENROLLED" && (
              <span className="text-green-600 font-medium">
                Enrolled
              </span>
            )}

            {status === "REJECTED" && (
              <span className="text-red-600 font-medium">
                Rejected
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
