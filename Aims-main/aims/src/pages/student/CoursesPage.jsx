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
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">📚 Available Courses</h1>
        <p className="text-gray-600">Search and enroll in courses offered this semester</p>
      </div>

      {/* FILTER SECTION */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          🔍 Filter Courses
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select 
              className="w-full px-4 py-2.5 border border-blue-300 rounded-lg bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
              value={filters.dept} 
              onChange={e => handleChange("dept", e.target.value)}
            >
              <option value="">All Departments</option>
              <option value="CSE">Computer Science</option>
              <option value="EE">Electrical Engineering</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course Code</label>
            <input 
              className="w-full px-4 py-2.5 border border-blue-300 rounded-lg bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
              placeholder="e.g., CS101"
              value={filters.code} 
              onChange={e => handleChange("code", e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
            <input 
              className="w-full px-4 py-2.5 border border-blue-300 rounded-lg bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
              placeholder="e.g., Data Structures"
              value={filters.title} 
              onChange={e => handleChange("title", e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Academic Session</label>
            <select 
              className="w-full px-4 py-2.5 border border-blue-300 rounded-lg bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
              value={filters.session} 
              onChange={e => handleChange("session", e.target.value)}
            >
              <option value="">All Sessions</option>
              <option>2023-24</option>
              <option>2024-25</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">L-T-P</label>
            <input 
              className="w-full px-4 py-2.5 border border-blue-300 rounded-lg bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
              placeholder="e.g., 3-1-2"
              value={filters.ltp} 
              onChange={e => handleChange("ltp", e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instructor</label>
            <input 
              className="w-full px-4 py-2.5 border border-blue-300 rounded-lg bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
              placeholder="Instructor name"
              value={filters.instructor} 
              onChange={e => handleChange("instructor", e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select 
              className="w-full px-4 py-2.5 border border-blue-300 rounded-lg bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
              value={filters.status} 
              onChange={e => handleChange("status", e.target.value)}
            >
              <option value="">All Statuses</option>
              <option>Open</option>
              <option>Closed</option>
            </select>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3 mt-6">
          <Button 
            onClick={handleSearch} 
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            🔎 Search Courses
          </Button>

          <Button 
            onClick={handleReset} 
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-6 py-2.5 rounded-lg transition-all"
          >
            ↻ Reset Filters
          </Button>
        </div>
      </div>

      {/* RESULTS SECTION */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {loading ? "⏳ Loading..." : `📋 Results (${courses.length} course${courses.length !== 1 ? 's' : ''})`}
        </h3>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Searching courses...</p>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <p className="text-gray-600 text-lg font-medium">No courses found</p>
            <p className="text-gray-500">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
            {courses.map(c => (
              <div 
                key={c._id} 
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-bold text-blue-600">{c.courseCode}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        c.status === 'Open' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {c.status || 'Open'}
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{c.title}</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                      <div>👨‍🏫 <span className="font-medium">{c.instructor || 'TBA'}</span></div>
                      <div>🏢 <span className="font-medium">{c.dept}</span></div>
                      <div>📅 <span className="font-medium">{c.session}</span></div>
                      <div>⏱️ <span className="font-medium">{c.ltp}</span></div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleEnroll(c._id)}
                    className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-medium px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all whitespace-nowrap"
                  >
                    ✓ Enroll
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
