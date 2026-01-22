import { useState, useEffect } from "react";
import { getStudentRecord } from "@/api/enrollment";
import UserDetailsCard from "@/components/UserDetailsCard";

export default function StudentRecord() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEnrolledOnly, setShowEnrolledOnly] = useState(false);
  const [selectedSession, setSelectedSession] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getStudentRecord();
        setCourses(res.data || []);
      } catch (err) {
        console.error("Failed to load student record:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading your records...</p>
      </div>
    </div>
  );

  // Get unique sessions
  const uniqueSessions = [...new Set(courses.map(c => c.session))].sort().reverse();

  const filtered = courses.filter(c => {
    if (showEnrolledOnly && !c.enrolled) return false;
    if (selectedSession !== "all" && c.session !== selectedSession) return false;
    return true;
  });

  const sessionGroups = filtered.reduce((acc, c) => {
    const session = c.session || "Unknown";
    if (!acc[session]) acc[session] = [];
    acc[session].push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <UserDetailsCard />

      <div>
        <h1 className="text-4xl font-bold mb-2 text-gray-900">📚 Academic Record</h1>
        <p className="text-gray-600">View your course history and grades</p>
      </div>

      <div className="bg-amber-50 border-2 border-amber-200 text-amber-900 p-4 rounded-lg flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">ℹ️</span>
        <div>
          <p className="font-semibold">Note:</p>
          <p className="text-sm">Grades may be pending senate approval. Contact academic advisor for clarification.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">🔍 Filters</h3>
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showEnrolledOnly}
              onChange={e => setShowEnrolledOnly(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-200"
            />
            <span className="text-sm font-medium text-gray-700">Show only enrolled courses</span>
          </label>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Session:</label>
            <select
              className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              value={selectedSession}
              onChange={e => setSelectedSession(e.target.value)}
            >
              <option value="all">All Sessions</option>
              {uniqueSessions.map(session => (
                <option key={session} value={session}>{session}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Records */}
      <div className="space-y-6">
        {Object.keys(sessionGroups).length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600 text-lg font-medium">No courses to display</p>
            <p className="text-gray-500 text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          Object.keys(sessionGroups).sort().reverse().map(session => (
            <div key={session} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              {/* Session Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4">
                <h3 className="text-lg font-bold">📅 Session: {session}</h3>
              </div>

              {/* Course Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-200">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Course</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Enrollment</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Category</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Grade</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionGroups[session].map((c, i) => (
                      <tr
                        key={c.id}
                        className={`border-b transition-colors hover:bg-blue-50 ${
                          i % 2 === 1 ? "bg-gray-50" : "bg-white"
                        }`}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-700">{i + 1}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="font-semibold text-gray-900">{c.code}</div>
                          <div className="text-gray-600 text-xs mt-1">{c.title}</div>
                          <div className="text-gray-500 text-xs">{c.ltp}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          {c.enrolled ? (
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">✓ Enrolled</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            c.status === 'ENROLLED' ? 'bg-green-100 text-green-800' :
                            c.status === 'PENDING_INSTRUCTOR' ? 'bg-yellow-100 text-yellow-800' :
                            c.status === 'PENDING_ADVISOR' ? 'bg-blue-100 text-blue-800' :
                            c.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-center text-gray-700">{c.category || '-'}</td>
                        <td className="px-6 py-4 text-sm text-center">
                          <span className={`font-bold text-lg ${
                            c.grade && c.grade !== '-' ? 'text-blue-600' : 'text-gray-400'
                          }`}>
                            {c.grade || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          <span className="cursor-pointer text-blue-600 hover:text-blue-800 hover:underline font-medium">
                            {c.attendance || '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
