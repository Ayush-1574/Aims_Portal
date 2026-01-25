import { useState, useEffect, useMemo } from "react";
// Import the new fetchGlobalData function
import { fetchEnrollmentRequests, approveEnrollment, rejectEnrollment,  } from "../api";
import {fetchGlobalData} from "@/core/api/index"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, User, Clock, Search, FilterX, ListChecks, School, GraduationCap, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function EnrollmentRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null); 
  const [selectedIds, setSelectedIds] = useState([]);

  // --- DYNAMIC OPTIONS STATE ---
  const [deptOptions, setDeptOptions] = useState([]);
  // const [sessionOptions, setSessionOptions] = useState([]); // If you need session filtering later

  const [filters, setFilters] = useState({
    search: "",
    course: "ALL",
    dept: "ALL",
    year: "ALL"
  });

  // --- LOAD DATA ---
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        // Fetch requests AND global data in parallel
        const [requestsData, departmentsData] = await Promise.all([
          fetchEnrollmentRequests(),
          fetchGlobalData("DEPARTMENT"), 
          // fetchGlobalData("SESSION") // Add this if you want to filter by session
        ]);

        setRequests(requestsData || []);
        setDeptOptions(departmentsData || []);
        console.log("Departments Data:", departmentsData);
      } catch (err) {
        console.error("Failed to load data", err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  // ... (Keep your filter logic, selection handlers, and action handlers exactly the same) ...
  
  // --- FILTER LOGIC ---
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      // 1. Search
      const matchSearch = 
        !filters.search ||
        req.student?.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        req.student?.email?.toLowerCase().includes(filters.search.toLowerCase());
      
      // 2. Course
      const matchCourse = 
        filters.course === "ALL" || 
        req.course?._id === filters.course;

      // 3. Department (Dynamic check)
      const matchDept = 
        filters.dept === "ALL" || 
        req.student?.department === filters.dept;

      // 4. Year
      const matchYear = 
        filters.year === "ALL" || 
        String(req.student?.year) === String(filters.year);

      return matchSearch && matchCourse && matchDept && matchYear;
    });
  }, [requests, filters]);

  // ... (Keep handleSelectAll, handleSelectOne, handleAction, handleBulkAction, uniqueCourses) ...
  // (I am omitting them here for brevity, paste them back from the previous correct version)
  
  // Need to redefine uniqueCourses and handlers here for the return statement to work:
  const uniqueCourses = useMemo(() => {
    const courses = new Map();
    requests.forEach(r => {
      if (r.course) courses.set(r.course._id, r.course.title);
    });
    return Array.from(courses.entries());
  }, [requests]);

  const handleSelectAll = (checked) => {
    if (checked) setSelectedIds(filteredRequests.map(r => r._id));
    else setSelectedIds([]);
  };
  const handleSelectOne = (id, checked) => {
    if (checked) setSelectedIds(prev => [...prev, id]);
    else setSelectedIds(prev => prev.filter(item => item !== id));
  };
  const isAllSelected = filteredRequests.length > 0 && filteredRequests.every(r => selectedIds.includes(r._id));
  const isIndeterminate = selectedIds.length > 0 && !isAllSelected;

  const handleAction = async (id, action) => {
    setProcessing(id);
    try {
      if (action === 'approve') await approveEnrollment(id);
      else await rejectEnrollment(id);
      toast.success(action === 'approve' ? "Approved" : "Rejected");
      // Ideally refresh data here
      const data = await fetchEnrollmentRequests();
      setRequests(data || []);
      setSelectedIds(prev => prev.filter(item => item !== id));
    } catch (err) { toast.error("Action failed"); } 
    finally { setProcessing(null); }
  };

  const handleBulkAction = async (action) => {
    if(!confirm(`Confirm ${action} for ${selectedIds.length} students?`)) return;
    setProcessing('bulk');
    try {
      await Promise.all(selectedIds.map(id => action === 'approve' ? approveEnrollment(id) : rejectEnrollment(id)));
      toast.success("Bulk action complete");
      setSelectedIds([]);
      const data = await fetchEnrollmentRequests();
      setRequests(data || []);
    } catch(e) { toast.error("Some actions failed"); }
    finally { setProcessing(null); }
  };

  const hasActiveFilters = filters.search || filters.course !== "ALL" || filters.dept !== "ALL" || filters.year !== "ALL";

  if (loading) return <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Enrollment Requests</h1>
          <p className="text-slate-500">Review students waiting to join your courses.</p>
        </div>
      </div>

      {/* --- FILTER BAR --- */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 items-center">
        
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-3 text-slate-400" size={16} />
          <Input 
            placeholder="Search by student name or email..." 
            className="pl-9 bg-white"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>

        {/* Course Filter */}
        <Select value={filters.course} onValueChange={(val) => setFilters(prev => ({ ...prev, course: val }))}>
          <SelectTrigger>
            <div className="flex items-center gap-2 text-slate-600">
               <ListChecks size={16} />
               <SelectValue placeholder="Course" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Courses</SelectItem>
            {uniqueCourses.map(([id, title]) => (
              <SelectItem key={id} value={id}>{title}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* DYNAMIC DEPARTMENT FILTER */}
        <Select value={filters.dept} onValueChange={(val) => setFilters(prev => ({ ...prev, dept: val }))}>
          <SelectTrigger>
            <div className="flex items-center gap-2 text-slate-600">
               <School size={16} />
               <SelectValue placeholder="Dept" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Depts</SelectItem>
            {/* Map over the fetched options */}
            {deptOptions.map((item) => (
              // item.key is likely "CSE", item.value is "Computer Science"
              <SelectItem key={item._id || item.key} value={item.key}>
                {item.key} {/* Or use {item.value} if you want full name */}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Year Filter (Usually static 1-4, or fetch if defined in backend) */}
        <Select value={filters.year} onValueChange={(val) => setFilters(prev => ({ ...prev, year: val }))}>
          <SelectTrigger>
            <div className="flex items-center gap-2 text-slate-600">
               <GraduationCap size={16} />
               <SelectValue placeholder="Year" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Years</SelectItem>
            <SelectItem value="1">1st Year</SelectItem>
            <SelectItem value="2">2nd Year</SelectItem>
            <SelectItem value="3">3rd Year</SelectItem>
            <SelectItem value="4">4th Year</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset Button */}
        {hasActiveFilters && (
          <div className="flex justify-end md:col-span-5 lg:col-auto">
             <Button 
              variant="ghost" 
              onClick={() => setFilters({ search: "", course: "ALL", dept: "ALL", year: "ALL" })}
              className="text-slate-500 hover:text-slate-700 w-full"
            >
              <FilterX size={16} className="mr-2"/> Reset
            </Button>
          </div>
        )}
      </div>

      {/* --- TABLE (Keep the table logic from the previous response) --- */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm min-h-[300px]">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[50px] text-center">
                <input 
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-slate-900"
                  checked={isAllSelected}
                  ref={input => { if (input) input.indeterminate = isIndeterminate; }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  disabled={filteredRequests.length === 0}
                />
              </TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Course Requested</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Check size={48} className="mb-4 text-slate-200" />
                    <p className="font-medium text-slate-600">All caught up!</p>
                    <p className="text-sm">No pending requests match your filters.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((req) => {
                const isSelected = selectedIds.includes(req._id);
                return (
                  <TableRow key={req._id} className={isSelected ? "bg-blue-50/50" : ""}>
                    <TableCell className="text-center">
                      <input 
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-slate-900"
                        checked={isSelected}
                        onChange={(e) => handleSelectOne(req._id, e.target.checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 font-bold text-xs">
                          {req.student?.name?.[0] || <User size={16} />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-700">{req.student?.name || "Unknown"}</p>
                          <p className="text-xs text-slate-500 font-mono">{req.student?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    {/* DETAILS COLUMN */}
                    <TableCell>
                       <div className="flex gap-2">
                          <Badge variant="outline" className="bg-white text-xs">{req.student?.department || "N/A"}</Badge>
                          <Badge variant="secondary" className="text-xs">Year {req.student?.year || "?"}</Badge>
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
                      <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 shadow-none">
                        <Clock size={12} className="mr-1" /> Pending
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 w-8 p-0"
                          onClick={() => handleAction(req._id, 'approve')}
                          isLoading={processing === req._id}
                          disabled={processing !== null}
                          title="Approve"
                        >
                          <Check size={16} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700 h-8 w-8 p-0"
                          onClick={() => handleAction(req._id, 'reject')}
                          disabled={processing !== null}
                          title="Reject"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- BULK ACTION BAR --- */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 animate-in slide-in-from-bottom-10 fade-in duration-300 z-50">
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                {selectedIds.length}
              </div>
              <span className="text-sm font-medium text-slate-200">Selected</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedIds([])}
                className="text-slate-400 hover:text-white hover:bg-slate-800"
                disabled={processing === 'bulk'}
              >
                Cancel
              </Button>
              <div className="h-4 w-px bg-slate-700 mx-1"></div>
              <Button 
                size="sm" 
                className="bg-red-600 hover:bg-red-700 text-white border-none"
                onClick={() => handleBulkAction('reject')}
                isLoading={processing === 'bulk'}
              >
                Reject
              </Button>
              <Button 
                size="sm" 
                className="bg-emerald-600 hover:bg-emerald-500 text-white border-none font-bold"
                onClick={() => handleBulkAction('approve')}
                isLoading={processing === 'bulk'}
              >
                Approve
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}