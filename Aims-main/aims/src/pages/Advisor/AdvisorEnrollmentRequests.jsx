import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  fetchAdvisorEnrollRequests,
  advisorApprove,
  advisorReject
} from "@/api/advisorEnroll";

export default function AdvisorEnrollmentRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchAdvisorEnrollRequests();
      // backend returns: { success, data: [...] }
      setRequests(res.data || []);
    } catch (err) {
      console.error("Failed to fetch advisor requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (req) => {
    await advisorApprove(req._id);
    loadData();
  };

  const handleReject = async (req) => {
    await advisorReject(req._id);
    loadData();
  };

  if (loading) return <div>Loading...</div>;

  if (requests.length === 0)
    return <div>No enrollment requests pending.</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Enrollment Requests</h2>

      {requests.map(req => (
        <div
          key={req._id}
          className="p-3 border rounded bg-white flex justify-between"
        >
          <div>
            <p className="font-semibold">{req.student.name}</p>
            <p className="text-gray-600">
              {req.student.email}
            </p>
            <p className="text-gray-600 text-sm">
              {req.course.courseCode} — {req.course.title}
            </p>
          </div>

          <div className="space-x-2">
            <Button size="sm" onClick={() => handleApprove(req)}>
              Approve
            </Button>
            <Button size="sm" variant="destructive" className= "text-white" onClick={() => handleReject(req)}>
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
