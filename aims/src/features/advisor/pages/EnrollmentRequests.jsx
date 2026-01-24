import { useEffect, useState } from "react";
import {
  fetchEnrollmentRequests,
  approveEnrollment,
  rejectEnrollment,
} from "../api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, User, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function EnrollmentRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [selected, setSelected] = useState([]);

  const loadData = async () => {
    try {
      const data = await fetchEnrollmentRequests();
      setRequests(data || []);
    } catch (err) {
      toast.error("Failed to fetch enrollment requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ------------------ Selection Logic ------------------ */
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selected.length === requests.length) setSelected([]);
    else setSelected(requests.map((r) => r._id));
  };

  /* ------------------ Single Action ------------------ */
  const handleAction = async (id, action) => {
    setProcessing(id);
    try {
      if (action === "approve") {
        await approveEnrollment(id);
        toast.success("Enrollment approved");
      } else {
        await rejectEnrollment(id);
        toast.success("Enrollment rejected");
      }
      await loadData();
    } catch (err) {
      toast.error(`Failed to ${action} request`);
    } finally {
      setProcessing(null);
    }
  };

  /* ------------------ Bulk Approve ------------------ */
  const handleBulkApprove = async () => {
    if (selected.length === 0) return;

    setProcessing("bulk");
    try {
      await Promise.all(selected.map((id) => approveEnrollment(id)));
      toast.success(`${selected.length} enrollments approved`);
      setSelected([]);
      await loadData();
    } catch (err) {
      toast.error("Failed to approve selected requests");
    } finally {
      setProcessing(null);
    }
  };

  if (loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Enrollment Requests
        </h1>
        <p className="text-slate-500">
          Review students waiting to join your courses.
        </p>
      </div>

      {/* Bulk Action */}
      {selected.length > 0 && (
        <div className="flex justify-end">
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleBulkApprove}
            isLoading={processing === "bulk"}
          >
            Approve Selected ({selected.length})
          </Button>
        </div>
      )}

      <div className="bg-white/50 backdrop-blur-md border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  checked={
                    selected.length === requests.length &&
                    requests.length > 0
                  }
                  onChange={selectAll}
                />
              </TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Course Requested</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Check size={48} className="mb-4 text-slate-200" />
                    <p className="font-medium">All caught up!</p>
                    <p className="text-sm">
                      No pending enrollment requests.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              requests.map((req) => (
                <TableRow key={req._id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selected.includes(req._id)}
                      onChange={() => toggleSelect(req._id)}
                    />
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                        <User size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-700">
                          {req.student?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-slate-500 font-mono">
                          {req.student?.email}
                        </p>
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
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                      <Clock size={12} className="mr-1" /> Pending
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() =>
                          handleAction(req._id, "approve")
                        }
                        isLoading={processing === req._id}
                        disabled={
                          processing && processing !== req._id
                        }
                      >
                        <Check size={16} className="mr-1" />
                        Approve
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          handleAction(req._id, "reject")
                        }
                        disabled={processing !== null}
                      >
                        <X size={16} className="mr-1" />
                        Reject
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