import { useState, useEffect, useMemo } from "react";
import { fetchPendingCourses, approveCourse, rejectCourse } from "../api";
import { 
  Search, FilterX, CheckCircle, XCircle, ChevronLeft, ChevronRight, 
  Book, AlertCircle, ListFilter, Calendar 
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function PendingCourseApprovals() {
  // --- STATE ---
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);

  // Draft Filters (What you are typing)
  const [filters, setFilters] = useState({ 
    search: "", 
    dept: "ALL",
    session: "ALL"
  });

  // Applied Filters (What triggers the view)
  // Initialized to NULL so we know to show the "Start Search" screen
  const [appliedFilters, setAppliedFilters] = useState(null);

  // --- LOAD DATA ---
  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await fetchPendingCourses(); 
      setCourses(res.courses || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load pending courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCourses(); }, []);

  // --- ACTIONS ---
  const handleApprove = async (courseId) => {
    if (!confirm("Are you sure you want to approve this course?")) return;
    setActionLoading(courseId);
    try {
      await approveCourse(courseId);
      toast.success("Course approved");
      await loadCourses();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Approval failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (courseId) => {
    if (!confirm("Are you sure you want to reject this course?")) return;
    setActionLoading(courseId);
    try {
      await rejectCourse(courseId);
      toast.success("Course rejected");
      await loadCourses();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Rejection failed");
    } finally {
      setActionLoading(null);
    }
  };

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleSelectChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    setAppliedFilters(filters);
    setPage(1);
    toast.success("Filters applied");
  };

  const handleReset = () => {
    const empty = { search: "", dept: "ALL", session: "ALL" };
    setFilters(empty);
    setAppliedFilters(null); // Reset to empty state
    setPage(1);
    toast.info("Filters reset");
  };

  // --- FILTER LOGIC ---
  const filteredCourses = useMemo(() => {
    // 1. If filters haven't been applied yet, return empty
    if (!appliedFilters) return [];

    return courses.filter(course => {
      // 2. Search
      const matchesSearch = 
        !appliedFilters.search ||
        course.title.toLowerCase().includes(appliedFilters.search.toLowerCase()) ||
        course.courseCode.toLowerCase().includes(appliedFilters.search.toLowerCase());
      
      // 3. Dept
      const matchesDept = 
        appliedFilters.dept === "ALL" || 
        course.dept === appliedFilters.dept;

      // 4. Session
      const matchesSession = 
        appliedFilters.session === "ALL" ||
        course.session === appliedFilters.session;

      return matchesSearch && matchesDept && matchesSession;
    });
  }, [courses, appliedFilters]);

  // --- PAGINATION ---
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIdx = (page - 1) * itemsPerPage;
  const paginatedCourses = filteredCourses.slice(startIdx, startIdx + itemsPerPage);

  const availableSessions = [...new Set(courses.map(c => c.session))];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Pending Course Approvals</h1>
        <p className="text-slate-500 mt-1">Review and approve instructor course offerings.</p>
      </div>

      {/* --- FILTER BAR --- */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        
        {/* Search */}
        <div className="relative md:col-span-1">
          <Search className="absolute left-3 top-3 text-slate-400" size={16} />
          <Input 
            placeholder="Search Code or Title..." 
            className="pl-9 bg-white" 
            value={filters.search}
            onChange={handleInputChange}
          />
        </div>

        {/* Dept Select */}
        <Select value={filters.dept} onValueChange={(val) => handleSelectChange("dept", val)}>
          <SelectTrigger>
            <div className="flex items-center gap-2 text-slate-600">
               <ListFilter size={16} />
               <SelectValue placeholder="Department" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Departments</SelectItem>
            <SelectItem value="CSE">Computer Science</SelectItem>
            <SelectItem value="EE">Electrical Eng</SelectItem>
            <SelectItem value="ME">Mechanical Eng</SelectItem>
          </SelectContent>
        </Select>

        {/* Session Select */}
        <Select value={filters.session} onValueChange={(val) => handleSelectChange("session", val)}>
          <SelectTrigger>
            <div className="flex items-center gap-2 text-slate-600">
               <Calendar size={16} />
               <SelectValue placeholder="Session" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Sessions</SelectItem>
            {availableSessions.map(sess => (
                <SelectItem key={sess} value={sess}>{sess}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Actions */}
        <div className="flex items-center gap-2">
           <Button onClick={handleSearch} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white">
             Search
           </Button>
           <Button variant="ghost" onClick={handleReset} className="text-slate-500 hover:bg-slate-100" title="Reset Filters">
             <FilterX size={18} />
           </Button>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      {!appliedFilters ? (
        // STATE 1: Initial Empty State
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white/50 rounded-2xl border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Search className="text-blue-400" size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Start your search</h3>
          <p className="text-slate-500 max-w-sm mt-2">
            Select a department or session above and click <b>Search</b> to view pending courses.
          </p>
        </div>
      ) : filteredCourses.length === 0 ? (
        // STATE 2: No Results
        <div className="text-center py-20 bg-white/40 rounded-3xl border border-dashed border-slate-300">
           <Book className="mx-auto mb-4 text-slate-400" size={40} />
           <p className="text-slate-500 font-medium">No courses match your filters.</p>
           <Button variant="link" onClick={handleReset} className="mt-2 text-blue-600">Clear Filters</Button>
        </div>
      ) : (
        // STATE 3: Results Table
        <div className="space-y-4">
          <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in">
            <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
            <p className="text-sm text-blue-700">
              Found <strong>{filteredCourses.length} pending course{filteredCourses.length !== 1 ? 's' : ''}</strong> matching your search.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-600">Course Details</TableHead>
                  <TableHead className="font-semibold text-slate-600">Instructor</TableHead>
                  <TableHead className="font-semibold text-slate-600">Department</TableHead>
                  <TableHead className="font-semibold text-slate-600">Year</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCourses.map((course) => (
                  <TableRow key={course._id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-md shadow-amber-500/20">
                          {course.courseCode?.[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{course.title}</p>
                          <p className="text-xs text-slate-500 font-mono">{course.courseCode} • L-T-P: {course.ltp}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-700">{course.instructor?.name || "Unknown"}</p>
                        <p className="text-xs text-slate-500">{course.instructor?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-white">{course.dept}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-slate-600">Year {course.year}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="hover:bg-green-50 hover:text-green-700 h-8 w-8 p-0"
                          onClick={() => handleApprove(course._id)}
                          disabled={actionLoading === course._id}
                        >
                          <CheckCircle size={18} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="hover:bg-red-50 hover:text-red-600 h-8 w-8 p-0"
                          onClick={() => handleReject(course._id)}
                          disabled={actionLoading === course._id}
                        >
                          <XCircle size={18} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && appliedFilters && filteredCourses.length > 0 && totalPages > 1 && (
        <div className="flex justify-between items-center px-2">
          <Button 
            variant="outline" 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
            className="gap-2"
          >
            <ChevronLeft size={16}/> Previous
          </Button>
          <span className="text-sm font-bold text-slate-500">Page {page} of {totalPages}</span>
          <Button 
            variant="outline" 
            disabled={page === totalPages} 
            onClick={() => setPage(p => p + 1)}
            className="gap-2"
          >
            Next <ChevronRight size={16}/>
          </Button>
        </div>
      )}
    </div>
  );
}