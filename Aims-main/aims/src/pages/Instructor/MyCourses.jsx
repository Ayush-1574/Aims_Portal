import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  Select, SelectItem, SelectTrigger, SelectValue, SelectContent
} from "@/components/ui/select";
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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">My Offered Courses</h2>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <Input
          className="w-64"
          placeholder="Search code or title..."
          value={filters.search}
          onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
        />

        <Select value={filters.session} onValueChange={(v)=> setFilters(prev => ({ ...prev, session: v }))}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Session" />
          </SelectTrigger>
          <SelectContent>
            {sessions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(v)=> setFilters(prev => ({ ...prev, status: v }))}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>

        <Button onClick={()=> setFilters({ search:"", session:"", status:"" })}>
          Reset
        </Button>
      </div>

      {/* Table */}
      <Table className="bg-white rounded-lg border">
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead>Code</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Session</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Pending</TableHead>
            <TableHead>Enrolled</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-500 py-4">
                No courses found.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((c) => (
              <TableRow key={c._id}>
                <TableCell>{c.courseCode}</TableCell>
                <TableCell>{c.title}</TableCell>
                <TableCell>{c.session}</TableCell>
                <TableCell>{c.status}</TableCell>
                <TableCell>{pending[c._id] || 0}</TableCell>
                <TableCell>{enrolledCounts[c._id] || 0}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" onClick={() => handleViewRequests(c._id)}>
                    View Requests
                  </Button>
                  <Button size="sm" variant="outline" className = "text-white"onClick={() => handleViewEnrolled(c._id)}>
                    View Enrolled
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
