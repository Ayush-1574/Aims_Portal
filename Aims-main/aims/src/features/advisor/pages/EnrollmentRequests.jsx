import { useEffect, useState } from "react";
import { fetchEnrollmentRequests, approveEnrollment, rejectEnrollment } from "../api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, User, GraduationCap } from "lucide-react";
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAction = async (id, action) => {
    setProcessing(id);
    try {
      if (action === 'approve') await approveEnrollment(id);
      else await rejectEnrollment(id);
      await loadData();
    } catch (err) {
      alert("Failed to process request");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-12 w-full"/><Skeleton className="h-64 w-full"/></div>;

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Enrollment Requests</h1>
        <p className="text-slate-500">Approve or reject student course registrations.</p>
      </div>

      <div className="bg-white/50 backdrop-blur-md border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Details</TableHead>
              <TableHead>Requested Course</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Decisions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                  No pending student requests.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((req) => (
                <TableRow key={req._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <GraduationCap size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{req.student?.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{req.student?.entry_no}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900">{req.course?.title}</div>
                    <Badge variant="secondary" className="mt-1 font-mono text-[10px]">{req.course?.courseCode}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="warning" className="bg-amber-50 text-amber-700 border-amber-200">
                      Advisor Pending
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleAction(req._id, 'approve')}
                        isLoading={processing === req._id}
                        disabled={processing && processing !== req._id}
                        className="bg-slate-900 hover:bg-slate-800 text-white h-8"
                      >
                        <Check size={14} className="mr-1"/> Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleAction(req._id, 'reject')}
                        disabled={processing !== null}
                        className="text-red-600 hover:bg-red-50 h-8"
                      >
                        <X size={14} className="mr-1"/> Reject
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