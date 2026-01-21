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

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading enrollment requests...</p>
      </div>
    </div>
  );

  if (requests.length === 0)
    return (
      <div className="bg-blue-50 rounded-lg p-8 text-center border border-blue-200">
        <p className="text-gray-600 font-medium">No enrollment requests pending.</p>
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Enrollment Requests</h1>
        <p className="text-gray-600 mt-1">Review and approve student enrollment requests</p>
      </div>

      <div className="space-y-4">
        {requests.map(req => {
          // Skip if required data is missing
          if (!req.student || !req.course) {
            return null;
          }

          return (
            <div
              key={req._id}
              className="p-5 border-2 border-gray-200 rounded-lg bg-white hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg">{req.student.name}</p>
                  <p className="text-gray-600 text-sm mt-1">
                    Email: <span className="font-medium">{req.student.email}</span>
                  </p>
                  <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="text-gray-700 font-semibold">
                      {req.course.courseCode} — {req.course.title}
                    </p>
                    {req.course.session && (
                      <p className="text-gray-600 text-sm mt-1">Session: {req.course.session}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(req)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(req)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
