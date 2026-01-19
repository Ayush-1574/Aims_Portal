import { useState, useEffect } from "react";
import { getStudentRecord } from "@/api/enrollment";

export default function StudentRecord() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEnrolledOnly, setShowEnrolledOnly] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState("all");

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

  if (loading) return <div>Loading...</div>;

  // normalize → backend already provides semester
  const normalized = courses.map(c => ({
    ...c,
    semester: c.semester ?? 1
  }));

  const filtered = normalized.filter(c => {
    if (showEnrolledOnly && !c.enrolled) return false;
    if (selectedSemester !== "all" && c.semester !== Number(selectedSemester))
      return false;
    return true;
  });

  const semesterGroups = filtered.reduce((acc, c) => {
    if (!acc[c.semester]) acc[c.semester] = [];
    acc[c.semester].push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Academics</h2>

      <div className="border border-red-400 bg-red-50 text-red-700 p-3 rounded text-sm">
        <strong>NOTE:</strong> Grades may be pending senate approval...
      </div>

      <div className="flex justify-end gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showEnrolledOnly}
            onChange={e => setShowEnrolledOnly(e.target.checked)}
          />
          Show only Enrolled
        </label>

        <label className="text-sm">
          Semester:
          <select
            className="ml-2 border rounded px-2 py-1"
            value={selectedSemester}
            onChange={e => setSelectedSemester(e.target.value)}
          >
            <option value="all">All</option>
            <option value="1">Sem 1</option>
            <option value="2">Sem 2</option>
            <option value="3">Sem 3</option>
            <option value="4">Sem 4</option>
          </select>
        </label>
      </div>

      <div className="border rounded-lg overflow-hidden bg-white">
        <div className="grid grid-cols-7 font-medium bg-gray-100 px-3 py-2 border-b text-sm">
          <div>S#</div>
          <div>Course</div>
          <div>Enrol.</div>
          <div>Status</div>
          <div>Course cat.</div>
          <div>Grade</div>
          <div>Attd.</div>
        </div>

        {Object.keys(semesterGroups).length === 0 ? (
          <div className="px-3 py-4 text-sm text-gray-600">
            No courses to show!
          </div>
        ) : (
          Object.keys(semesterGroups).map(sem => (
            <div key={sem}>
              <div className="bg-gray-200 px-3 py-2 text-sm font-semibold">
                Semester {sem}
              </div>

              {semesterGroups[sem].map((c, i) => (
                <div
                  key={c.id}
                  className={`grid grid-cols-7 px-3 py-2 text-sm ${
                    i % 2 === 1 ? "bg-gray-100" : "bg-white"
                  }`}
                >
                  <div>{i + 1}</div>
                  <div>
                    {c.code} - {c.title} ({c.ltp})
                  </div>
                  <div>{c.enrolled ? "Credit" : "-"}</div>
                  <div>{c.status}</div>
                  <div>{c.category}</div>
                  <div>{c.grade}</div>
                  <div className="text-blue-600 underline cursor-pointer">
                    {c.attendance}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
