import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { fetchCourses, requestEnrollment } from "@/api/course";

export default function CoursesPage() {
  const [filters, setFilters] = useState({
    dept: "",
    code: "",
    title: "",
    session: "",
    ltp: "",
    instructor: "",
    status: "",
  });

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await fetchCourses(filters);
      setCourses(res.courses || []);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({
      dept: "",
      code: "",
      title: "",
      session: "",
      ltp: "",
      instructor: "",
      status: "",
    });
    setCourses([]);
  };

  const handleEnroll = async (courseId) => {
    try {
      await requestEnrollment(courseId);
      alert("Enrollment request sent!");
    } catch (err) {
      alert("Failed: " + (err.response?.data?.msg ?? "unknown error"));
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Offered Courses</h2>

      {/* FILTER GRID */}
      <div className="grid grid-cols-7 gap-3 items-center">
        <select className="border p-2 rounded" value={filters.dept} onChange={e => handleChange("dept", e.target.value)}>
          <option value="">Department</option>
          <option value="CSE">CSE</option>
          <option value="EE">EE</option>
        </select>

        <input className="border p-2 rounded" placeholder="Code"
          value={filters.code} onChange={e => handleChange("code", e.target.value)} />

        <input className="border p-2 rounded" placeholder="Title"
          value={filters.title} onChange={e => handleChange("title", e.target.value)} />

        <select className="border p-2 rounded" value={filters.session} onChange={e => handleChange("session", e.target.value)}>
          <option value="">Acad Session</option>
          <option>2023-24</option>
          <option>2024-25</option>
        </select>

        <input className="border p-2 rounded" placeholder="L-T-P"
          value={filters.ltp} onChange={e => handleChange("ltp", e.target.value)} />

        <input className="border p-2 rounded" placeholder="Instructor"
          value={filters.instructor} onChange={e => handleChange("instructor", e.target.value)} />

        <select className="border p-2 rounded" value={filters.status} onChange={e => handleChange("status", e.target.value)}>
          <option value="">Status</option>
          <option>Open</option>
          <option>Closed</option>
        </select>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-2">
        <Button onClick={handleSearch} className="bg-green-600 hover:bg-green-700 text-white">
          Search
        </Button>

        <Button onClick={handleReset} className="bg-gray-600 hover:bg-gray-700 text-white">
          Reset
        </Button>
      </div>

      {/* RESULTS */}
      <div className="border rounded-lg p-4 bg-white">
        <h3 className="font-semibold mb-2">Results</h3>

        {loading ? (
          <p>Loading...</p>
        ) : courses.length === 0 ? (
          <p className="text-gray-500">Nothing to show yet!</p>
        ) : (
          <div className="space-y-2">
            {courses.map(c => (
              <div key={c._id} className="flex justify-between items-center border-b py-2">
                <div>
                  <div className="font-medium">{c.courseCode} - {c.title}</div>
                  <div className="text-sm text-gray-600">
                    {c.ltp} • {c.dept} • {c.session}
                  </div>
                </div>
                <Button size="sm" onClick={() => handleEnroll(c._id)}>
                  Request Enrollment
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
