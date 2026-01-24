import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import client from "@/core/api/client"; // Ensure you import your axios client
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save, User, ArrowLeft, Mail, Hash, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const gradeOptions = ["A", "A-", "B", "B-", "C", "C-", "D", "F", "I"];

export default function EnrolledStudents() {
  const { courseId } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  // Fetch Enrolled Students
  const loadData = async () => {
    try {
      // Matches your backend route: router.get("/course/:courseId/enrolled", ...)
      const res = await client.get(`/enrollment/course/${courseId}/enrolled`);
      setStudents(res.data.data || []);
    } catch (err) {
      console.error("Failed to load students", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [courseId]);

  // Handle Input Changes Locally
  const updateLocalField = (id, key, value) => {
    setStudents(prev => prev.map(record => 
      record._id === id ? { ...record, [key]: value } : record
    ));
  };

  // Save Grade/Attendance to Backend
  const handleSave = async (recordId) => {
    const record = students.find(r => r._id === recordId);
    if (!record) return;

    setSavingId(recordId);
    try {
      // Matches your backend route: router.patch("/:id/update-record", ...)
      await client.patch(`/enrollment/${recordId}/update-record`, { 
        grade: record.grade, 
        attendance: record.attendance 
      });
      alert("Record updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update record.");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-slate-600"></div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/instructor/courses">
          <Button variant="ghost" size="icon" className="hover:bg-slate-100">
            <ArrowLeft size={20} className="text-slate-600"/>
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Enrolled Students</h1>
          <p className="text-slate-500">Manage grades and attendance for this course.</p>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold text-slate-600">Student Profile</TableHead>
              <TableHead className="font-bold text-slate-600">Department</TableHead>
              <TableHead className="font-bold text-slate-600">Grade</TableHead>
              <TableHead className="font-bold text-slate-600">Attendance (%)</TableHead>
              <TableHead className="text-right font-bold text-slate-600">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                   No students have been approved for this course yet.
                 </TableCell>
               </TableRow>
            ) : (
              students.map((record) => (
                <TableRow key={record._id} className="hover:bg-slate-50/50">
                  {/* Student Info */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                        {record.student?.name?.[0]?.toUpperCase() || "S"}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{record.student?.name || "Unknown"}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <Mail size={12}/> {record.student?.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Department / Entry No */}
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                        {record.student?.department || "N/A"}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                         <Hash size={10}/> {record.student?.entry_no || "---"}
                      </div>
                    </div>
                  </TableCell>
                  
                  {/* Grade Selector */}
                  <TableCell>
                    <div className="relative w-24">
                      <select 
                        className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer hover:border-blue-300 transition-colors"
                        value={record.grade || ""}
                        onChange={(e) => updateLocalField(record._id, "grade", e.target.value)}
                      >
                        <option value="-">-</option>
                        {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
                    </div>
                  </TableCell>

                  {/* Attendance Input */}
                  <TableCell>
                    <div className="relative w-24">
                      <Input 
                        type="number" 
                        min="0" max="100"
                        className="h-9 font-mono text-center font-semibold text-slate-700 pr-6" 
                        placeholder="0"
                        value={record.attendance === "-" ? "" : record.attendance}
                        onChange={(e) => updateLocalField(record._id, "attendance", e.target.value)}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
                    </div>
                  </TableCell>

                  {/* Save Button */}
                  <TableCell className="text-right">
                    <Button 
                      size="sm" 
                      onClick={() => handleSave(record._id)} 
                      disabled={savingId === record._id}
                      className="gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-md"
                    >
                      {savingId === record._id ? <Loader2 size={14} className="animate-spin"/> : <Save size={14} />}
                      Save
                    </Button>
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