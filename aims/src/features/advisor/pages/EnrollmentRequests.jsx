import { useEffect, useState, useMemo } from "react";
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
import { Check, X, User, Clock, Search, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function EnrollmentRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [selected, setSelected] = useState([]);
  
  // 1. New Search State
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    try {
      const data = await fetchEnrollmentRequests();
      setRequests(data || []);
      // Reset selection on reload
      setSelected([]); 
    } catch (err) {
      toast.error("Failed to fetch enrollment requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 2. Filter Logic (Client-side)
  const filteredRequests = useMemo(() => {
    if (!searchQuery) return requests;
    const lowerQuery = searchQuery.toLowerCase();
    
    return requests.filter((req) => 
      req.student?.name?.toLowerCase().includes(lowerQuery) ||
      req.student?.email?.toLowerCase().includes(lowerQuery) ||
      req.course?.title?.toLowerCase().includes(lowerQuery) ||
      req.course?.courseCode?.toLowerCase().includes(lowerQuery)
    );
  }, [requests, searchQuery]);

  /* ------------------ Selection Logic (Updated for Filters) ------------------ */
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Select All now only selects what is currently visible/filtered
  const selectAll = () => {
    const visibleIds = filteredRequests.map(r => r._id);
    const allVisibleSelected = visibleIds.every(id => selected.includes(id));

    if (allVisibleSelected) {
      // Unselect all visible
      setSelected(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      // Select all visible (preserving previous selections that might be hidden)
      const newSelected = [...new Set([...selected, ...visibleIds])];
      setSelected(newSelected);
    }
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

  /* ------------------ Bulk Action (Manual Selection) ------------------ */
  const handleBulkApproveSelected = async () => {
    if (selected.length === 0) return;
    setProcessing("bulk-selection");
    try {
      await Promise.all(selected.map((id) => approveEnrollment(id)));
      toast.success(`${selected.length} enrollments approved`);
      await loadData();
    } catch (err) {
      toast.error("Failed to approve selected requests");
    } finally {
      setProcessing(null);
    }
  };

  /* ------------------ Bulk Action (All Filtered Results) ------------------ */
  const handleBulkActionOnFiltered = async (actionType) => {
    if (filteredRequests.length === 0) return;
    
    // Prevent accidental clicks if search is empty (unless intended)
    if (!searchQuery && !confirm(`Are you sure you want to ${actionType} ALL ${filteredRequests.length} pending requests?`)) {
        return;
    }

    setProcessing(`bulk-filtered-${actionType}`);
    try {
      const promises = filteredRequests.map((req) => 
        actionType === "approve" 
          ? approveEnrollment(req._id) 
          : rejectEnrollment(req._id)
      );

      await Promise.all(promises);
      toast.success(`${filteredRequests.length} enrollments ${actionType}d`);
      setSearchQuery(""); // Clear search after action
      await loadData();
    } catch (err) {
      toast.error(`Failed to ${actionType} filtered requests`);
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

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
        
        {/* Search Filter */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search student, email, or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
            {/* If items are manually selected, show manual approve */}
            {selected.length > 0 ? (
                <Button
                    className="bg-slate-800 hover:bg-slate-900"
                    onClick={handleBulkApproveSelected}
                    isLoading={processing === "bulk-selection"}
                >
                    Approve Selected ({selected.length})
                </Button>
            ) : (
                /* Otherwise show Filtered Bulk Actions */
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleBulkActionOnFiltered("reject")}
                        disabled={filteredRequests.length === 0 || !!processing}
                        isLoading={processing === "bulk-filtered-reject"}
                    >
                        Reject All {searchQuery && "Filtered"} ({filteredRequests.length})
                    </Button>
                    <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleBulkActionOnFiltered("approve")}
                        disabled={filteredRequests.length === 0 || !!processing}
                        isLoading={processing === "bulk-filtered-approve"}
                    >
                        Approve All {searchQuery && "Filtered"} ({filteredRequests.length})
                    </Button>
                </div>
            )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/50 backdrop-blur-md border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  className="rounded border-slate-300"
                  checked={
                    filteredRequests.length > 0 &&
                    filteredRequests.every(r => selected.includes(r._id))
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
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    {searchQuery ? (
                         <>
                            <Filter size={48} className="mb-4 text-slate-200" />
                            <p className="font-medium">No results found</p>
                            <p className="text-sm">Try adjusting your search terms.</p>
                         </>
                    ) : (
                        <>
                            <Check size={48} className="mb-4 text-slate-200" />
                            <p className="font-medium">All caught up!</p>
                            <p className="text-sm">No pending enrollment requests.</p>
                        </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((req) => (
                <TableRow key={req._id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      className="rounded border-slate-300"
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
                        onClick={() => handleAction(req._id, "approve")}
                        isLoading={processing === req._id}
                        disabled={processing && processing !== req._id}
                      >
                        <Check size={16} className="mr-1" />
                        Approve
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleAction(req._id, "reject")}
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