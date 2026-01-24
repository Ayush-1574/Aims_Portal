import { useEffect, useState } from "react";
import { fetchEnrollmentRequests, approveEnrollment, rejectEnrollment } from "../api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, User, Clock, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function EnrollmentRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const loadData = async () => {
    try {
      const data = await fetchEnrollmentRequests();
      setRequests(data || []);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (id, action) => {
    setProcessing(id);
    try {
      if (action === 'approve') await approveEnrollment(id);
      else await rejectEnrollment(id);
      await loadData(); // Refresh list
    } catch (err) {
      alert(`Failed to ${action} request.`);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Enrollment Requests</h1>
        <p className="text-slate-500">Review students waiting to join your courses.</p>
      </div>

      <div className="bg-white/50 backdrop-blur-md border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Course Requested</TableHead>
              <TableHead>Current Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Check size={48} className="mb-4 text-slate-200" />
                    <p className="font-medium">All caught up!</p>
                    <p className="text-sm">No pending enrollment requests.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              requests.map((req) => (
                <TableRow key={req._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                        <User size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-700">{req.student?.name || "Unknown"}</p>
                        <p className="text-xs text-slate-500 font-mono">{req.student?.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-800">
                      {req.course?.title || "Unknown Course"}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {req.course?.courseCode}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="warning" className="bg-amber-100 text-amber-700 border-amber-200">
                      <Clock size={12} className="mr-1" /> Pending
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 text-white shadow-green-200"
                        onClick={() => handleAction(req._id, 'approve')}
                        isLoading={processing === req._id}
                        disabled={processing && processing !== req._id}
                      >
                        <Check size={16} className="mr-1" /> Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200 shadow-none"
                        onClick={() => handleAction(req._id, 'reject')}
                        disabled={processing !== null}
                      >
                        <X size={16} className="mr-1" /> Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}