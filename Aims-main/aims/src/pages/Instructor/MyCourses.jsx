import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

import {
  fetchMyCourses,
  fetchInstructorPendingEnrollments,
  fetchEnrolledCount
} from "@/api/instructorCourses";

export default function MyCourses() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState({});
  const [enrolledCounts, setEnrolledCounts] = useState({});

  const [filters, setFilters] = useState({
    search: "",
    session: "",
    status: ""
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const courseRes = await fetchMyCourses();
      const pendRes = await fetchInstructorPendingEnrollments();

      const courseList = courseRes.courses || [];
      setCourses(courseList);

      // compute pending
      const pendingMap = {};
      (pendRes.data || []).forEach(r => {
        const cid = r.course._id;
        pendingMap[cid] = (pendingMap[cid] || 0) + 1;
      });
      setPending(pendingMap);

      // compute enrolled count (parallel fetch)
      const enrollMap = {};
      await Promise.all(
        courseList.map(async c => {
          const res = await fetchEnrolledCount(c._id);
          enrollMap[c._id] = (res.data || []).length;
        })
      );
      setEnrolledCounts(enrollMap);

    } catch (err) {
      console.error("Failed loading instructor courses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const sessions = ["2025-I", "2025-II", "2026-I"];
  const statuses = ["PENDING_APPROVAL", "OPEN", "REJECTED"];

 const filtered = courses.filter(c => {
  const s1 =
    (c.courseCode || "").toLowerCase().includes(filters.search.toLowerCase()) ||
    (c.title || "").toLowerCase().includes(filters.search.toLowerCase());

  const s2 = filters.session ? c.session === filters.session : true;
  const s3 = filters.status ? c.status === filters.status : true;
  return s1 && s2 && s3;
});


  const handleViewRequests = (courseId) => {
    navigate(`/instructor/dashboard/requests`, { state: { courseId } });
  };

  const handleViewEnrolled = (courseId) => {
    navigate(`/instructor/dashboard/enrolled/${courseId}`);
  };

  if (loading) return (
    <div className="flex justify-center items-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading your courses...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2 text-gray-900">📚 My Courses</h1>
        <p className="text-gray-600">Manage your offered courses and enrollments</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">🔍 Search & Filter</h3>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <Input
              placeholder="Search by course code or title..."
              value={filters.search}
              onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="h-10"
            />
          </div>

          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">Session</label>
            <select
              value={filters.session}
              onChange={e => setFilters(prev => ({ ...prev, session: e.target.value }))}
              className="h-10 w-full px-4 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white cursor-pointer transition"
            >
              <option value="">All Sessions</option>
              {sessions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="h-10 w-full px-4 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white cursor-pointer transition"
            >
              <option value="">All Statuses</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <Button 
            onClick={()=> setFilters({ search:"", session:"", status:"" })}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium h-10"
          >
            ↻ Reset
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg font-medium">No courses found</p>
            <p className="text-gray-500 text-sm">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-gray-200">
                  <TableHead className="font-bold text-gray-900">Course Code</TableHead>
                  <TableHead className="font-bold text-gray-900">Title</TableHead>
                  <TableHead className="font-bold text-gray-900">Session</TableHead>
                  <TableHead className="text-center font-bold text-gray-900">Status</TableHead>
                  <TableHead className="text-center font-bold text-gray-900">📋 Pending</TableHead>
                  <TableHead className="text-center font-bold text-gray-900">✓ Enrolled</TableHead>
                  <TableHead className="text-right font-bold text-gray-900">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.map((c, idx) => (
                  <TableRow 
                    key={c._id}
                    className={`border-b transition-colors hover:bg-purple-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <TableCell className="font-semibold text-gray-900">{c.courseCode}</TableCell>
                    <TableCell className="text-gray-700">{c.title}</TableCell>
                    <TableCell className="text-gray-600">{c.session}</TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        c.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                        c.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {c.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-block bg-orange-100 text-orange-800 font-bold px-3 py-1 rounded-lg">
                        {pending[c._id] || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-block bg-green-100 text-green-800 font-bold px-3 py-1 rounded-lg">
                        {enrolledCounts[c._id] || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleViewRequests(c._id)}
                        className="bg-orange-600 hover:bg-orange-700 text-white text-xs"
                      >
                        Requests
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleViewEnrolled(c._id)}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs"
                      >
                        Enrolled
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
