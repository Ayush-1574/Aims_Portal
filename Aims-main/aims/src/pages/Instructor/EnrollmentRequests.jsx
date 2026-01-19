import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  fetchInstructorEnrollRequests,
  approveEnroll,
  rejectEnroll
} from "@/api/instructorEnroll";

export default function EnrollmentRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchInstructorEnrollRequests();
      // backend returns: { success, data: [...] }
      setRequests(res.data || []);
    } catch (err) {
      console.error("Failed to fetch enrollment requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (req) => {
    await approveEnroll(req._id);
    loadData();
  };

  const handleReject = async (req) => {
    await rejectEnroll(req._id);
    loadData();
  };

  // --- Group by course ---
  const grouped = requests.reduce((acc, r) => {
    const key = r.course._id;
    if (!acc[key]) acc[key] = { course: r.course, rows: [] };
    acc[key].rows.push(r);
    return acc;
  }, {});

  const courseKeys = Object.keys(grouped);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Pending Enrollment Requests</h2>

      {loading && <div>Loading...</div>}

      {!loading && courseKeys.length === 0 && (
        <div className="text-gray-500">No pending requests.</div>
      )}

      {!loading && courseKeys.map((key) => {
        const block = grouped[key];
        const course = block.course;

        return (
          <div key={key} className="border rounded-lg bg-white p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium">
                {course.courseCode} — {course.title} ({course.session})
              </div>
              <div className="text-sm text-gray-600">
                {block.rows.length} student(s) requesting
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  {/* <TableHead>Student</TableHead> */}
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {block.rows.map((r) => (
                  <TableRow key={r._id}>
                    {/* <TableCell>{r.student.name}</TableCell> */}
                    <TableCell>{r.student.email}</TableCell>
                    <TableCell>{r.status}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" onClick={() => handleApprove(r)}>
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className= "text-white"
                        onClick={() => handleReject(r)}
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      })}
    </div>
  );
}
