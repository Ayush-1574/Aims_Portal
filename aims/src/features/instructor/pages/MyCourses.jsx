import { useState, useEffect, useMemo } from "react";
import client from "@/core/api/client"; 
import { Link } from "react-router-dom";

import { 
  BookOpen, Users, ArrowRight, PlusCircle, Calendar, 
  Layers, GraduationCap, School, Search, FilterX, ListFilter
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// NEW IMPORT
import { fetchGlobalData } from "@/features/admin/api";

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]); // backend sessions
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    status: "ALL",
    session: "ALL"
  });

  const [appliedFilters, setAppliedFilters] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [courseRes, sessionRes] = await Promise.all([
          client.get("/courses/my"),
          fetchGlobalData("SESSION")
        ]);

        setCourses(courseRes.data.courses || []);
        setSessions(sessionRes.items || []);

      } catch (err) {
        console.error("Failed loading instructor data", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleSelectChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    setAppliedFilters(filters);
    toast.success("Search updated");
  };

  const handleReset = () => {
    const empty = { search: "", status: "ALL", session: "ALL" };
    setFilters(empty);
    setAppliedFilters(null);
    toast.info("Filters cleared");
  };

  const filteredCourses = useMemo(() => {
    if (!appliedFilters) return [];

    return courses.filter(course => {
      const searchMatch =
        !appliedFilters.search ||
        course.title.toLowerCase().includes(appliedFilters.search.toLowerCase()) ||
        course.courseCode.toLowerCase().includes(appliedFilters.search.toLowerCase());

      const statusMatch =
        appliedFilters.status === "ALL" ||
        course.status === appliedFilters.status;

      const sessionMatch =
        appliedFilters.session === "ALL" ||
        course.session === appliedFilters.session;

      return searchMatch && statusMatch && sessionMatch;
    });
  }, [courses, appliedFilters]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {[1,2,3].map(i => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900">My Teaching & Courses</h1>
           <p className="text-slate-500 mt-1">Manage your active courses and student enrollments.</p>
        </div>
        <Link to="/instructor/offer">
          <Button className="gap-2 shadow-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all hover:scale-105 active:scale-95">
            <PlusCircle size={18} /> Offer New Course
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      {courses.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={16} />
              <Input 
                placeholder="Search Code or Title..."
                className="pl-9 bg-white"
                value={filters.search}
                onChange={handleInputChange}
              />
            </div>

            {/* Status */}
            <Select value={filters.status} onValueChange={(val) => handleSelectChange("status", val)}>
              <SelectTrigger>
                <div className="flex items-center gap-2 text-slate-600">
                  <ListFilter size={16} />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="OPEN">Open (Active)</SelectItem>
                <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {/* Session (Using Backend Data) */}
            <Select value={filters.session} onValueChange={(val) => handleSelectChange("session", val)}>
              <SelectTrigger>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar size={16} />
                  <SelectValue placeholder="Session" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Sessions</SelectItem>
                {sessions.filter(s => s.isActive).map(sess => (
                  <SelectItem key={sess._id} value={sess.key}>
                    {sess.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            <Button onClick={handleSearch} className="bg-slate-900 hover:bg-slate-800 text-white min-w-[140px]">
              <Search size={16} className="mr-2" /> Search
            </Button>
            <Button variant="ghost" onClick={handleReset} className="text-slate-500 hover:text-slate-700">
              <FilterX size={16} className="mr-2" /> Reset
            </Button>
          </div>
        </div>
      )}

      {/* Content Area */}
      {courses.length === 0 ? (
        // STATE 1: No courses created yet
        <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-2xl">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <BookOpen size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-700">No Courses Offered Yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2 mb-6">
            Click the button above to get started.
          </p>
        </div>
      ) : !appliedFilters ? (
        // STATE 2: Search prompt
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white/50 rounded-2xl border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
             <Search className="text-blue-400" size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Search your courses</h3>
          <p className="text-slate-500 mt-2 max-w-sm">Use the filters above and click <b>Search</b> to view your offered courses.</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        // STATE 3: No matches found
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400 shadow-sm">
               <Search size={24} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">No matching courses</h3>
            <p className="text-slate-500">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        // STATE 4: Results Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-300">
          {filteredCourses.map(course => (
            <Card key={course._id} className="group flex flex-col h-full bg-white border border-slate-200 hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden relative">
              
              {/* Colored Status Bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                 course.status === 'OPEN' ? 'bg-green-500' : 
                 course.status === 'REJECTED' ? 'bg-red-500' : 'bg-amber-400'
               }`} />

              <CardContent className="p-6 pl-7 flex flex-col h-full">
                <div className="flex justify-between items-start mb-3">
                  <Badge variant="outline" className="font-mono font-bold text-slate-700 bg-slate-50 border-slate-200">
                     {course.courseCode}
                  </Badge>
                  <Badge className={`${
                      course.status === 'OPEN' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 
                      course.status === 'REJECTED' ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                      'bg-amber-100 text-amber-700 hover:bg-amber-100'
                    }`}>
                    {course.status === 'PENDING_APPROVAL' ? 'Pending' : course.status}
                  </Badge>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs text-slate-600 bg-slate-50/50 p-3 rounded-xl border border-slate-100 mb-6">
                   <div className="flex items-center gap-2">
                       <School size={14} className="text-blue-500 shrink-0"/>
                       <span className="font-semibold truncate" title={course.dept}>{course.dept} Dept</span>
                   </div>
                   <div className="flex items-center gap-2">
                       <GraduationCap size={14} className="text-purple-500 shrink-0"/>
                       <span>Year {course.year}</span>
                   </div>
                   <div className="flex items-center gap-2">
                       <Calendar size={14} className="text-orange-500 shrink-0"/>
                       <span>{course.session}</span>
                   </div>
                   <div className="flex items-center gap-2">
                       <Layers size={14} className="text-indigo-500 shrink-0"/>
                       <span className="font-mono">{course.ltp}</span>
                   </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-50">
                  <Link to={`/instructor/enrolled/${course._id}`}>
                    <Button variant="outline" className="w-full justify-between group-hover:border-blue-500 group-hover:text-blue-600 transition-all">
                      <span className="flex items-center gap-2">
                         <Users size={16} /> Manage Students
                      </span>
                      <ArrowRight size={16} />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}