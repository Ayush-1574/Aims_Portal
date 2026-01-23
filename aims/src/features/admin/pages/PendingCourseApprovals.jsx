import { useState, useEffect } from "react";
import { fetchPendingCourses, approveCourse, rejectCourse } from "../api";
import { Search, Filter, CheckCircle, XCircle, ChevronLeft, ChevronRight, Book, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function PendingCourseApprovals() {
  // --- STATE ---
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ search: "", dept: "" });
  const [actionLoading, setActionLoading] = useState(null);

  // --- ACTIONS ---
  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await fetchPendingCourses(page);
      setCourses(res.courses || []);
      // Set totalPages based on number of courses (assuming 8 per page)
      setTotalPages(Math.ceil((res.courses?.length || 0) / 8));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCourses(); }, [page]);

  const handleApprove = async (courseId) => {
    if (!confirm("Are you sure you want to approve this course?")) return;
    setActionLoading(courseId);
    try {
      await approveCourse(courseId);
      loadCourses();
    } catch (err) {
      alert(err.response?.data?.msg || "Approval failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (courseId) => {
    if (!confirm("Are you sure you want to reject this course?")) return;
    setActionLoading(courseId);
    try {
      await rejectCourse(courseId);
      loadCourses();
    } catch (err) {
      alert(err.response?.data?.msg || "Rejection failed");
    } finally {
      setActionLoading(null);
    }
  };

  // --- FILTER COURSES ---
  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      course.courseCode.toLowerCase().includes(filters.search.toLowerCase());
    const matchesDept = !filters.dept || course.dept === filters.dept;
    return matchesSearch && matchesDept;
  });

  // Paginate filtered results
  const itemsPerPage = 8;
  const startIdx = (page - 1) * itemsPerPage;
  const paginatedCourses = filteredCourses.slice(startIdx, startIdx + itemsPerPage);
  const filteredTotalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      {/* Header & Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pending Course Approvals</h1>
          <p className="text-slate-500 mt-1">Review and approve instructor course offerings.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white/60 backdrop-blur-md p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input 
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-transparent hover:bg-white focus:bg-white border-2 border-transparent focus:border-blue-500 outline-none transition-all font-medium"
            placeholder="Search by course code or title..."
            value={filters.search}
            onChange={(e) => { setFilters(prev => ({ ...prev, search: e.target.value })); setPage(1); }}
          />
        </div>
        <div className="relative md:w-64">
           <Filter className="absolute left-3 top-3 text-slate-400" size={20} />
           <select 
             className="w-full h-11 pl-10 pr-4 rounded-xl bg-transparent hover:bg-white focus:bg-white border-2 border-transparent focus:border-blue-500 outline-none font-medium appearance-none cursor-pointer"
             value={filters.dept}
             onChange={(e) => { setFilters(prev => ({ ...prev, dept: e.target.value })); setPage(1); }}
           >
             <option value="">All Departments</option>
             <option value="CSE">Computer Science</option>
             <option value="EE">Electrical Eng</option>
             <option value="ME">Mechanical Eng</option>
           </select>
        </div>
      </div>

      {/* Info Banner */}
      {courses.length > 0 && (
        <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 flex items-gap gap-3">
          <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
          <p className="text-sm text-blue-700">
            There are <strong>{filteredCourses.length} pending course{filteredCourses.length !== 1 ? 's' : ''}</strong> awaiting your approval.
          </p>
        </div>
      )}

      {/* Main Table */}
      <div className="min-h-[400px]">
        {loading ? (
           <div className="flex flex-col items-center justify-center h-64 text-slate-400 animate-pulse">
             <div className="w-12 h-12 bg-slate-200 rounded-full mb-4"></div>
             <p>Loading pending courses...</p>
           </div>
        ) : paginatedCourses.length === 0 ? (
           <div className="text-center py-20 bg-white/40 rounded-3xl border border-dashed border-slate-300">
             <Book className="mx-auto mb-4 text-slate-400" size={40} />
             <p className="text-slate-500 font-medium">
               {filteredCourses.length === 0 ? "No pending courses at this time." : "No courses match your filters."}
             </p>
           </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Details</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Year</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCourses.map((course) => (
                <TableRow key={course._id}>
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
                    <Badge variant="outline">{course.dept}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-slate-600">Year {course.year}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleApprove(course._id)}
                        disabled={actionLoading === course._id}
                        title="Approve Course"
                      >
                        <CheckCircle size={18} className="text-green-600" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleReject(course._id)}
                        disabled={actionLoading === course._id}
                        title="Reject Course"
                      >
                        <XCircle size={18} className="text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {!loading && filteredTotalPages > 1 && (
        <div className="flex justify-between items-center px-4">
          <Button 
            variant="outline" 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
            className="gap-2"
          >
            <ChevronLeft size={16}/> Previous
          </Button>
          <span className="text-sm font-bold text-slate-500">Page {page} of {filteredTotalPages}</span>
          <Button 
            variant="outline" 
            disabled={page === filteredTotalPages} 
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
