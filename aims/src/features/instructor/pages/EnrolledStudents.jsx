import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchEnrolledStudents, updateStudentGrade } from "../api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save, User, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const gradeOptions = ["A", "A-", "B", "B-", "C", "C-", "D", "F", "I"];

export default function EnrolledStudents() {
  const { courseId } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // We keep a local state for edits to avoid instant API calls on every keystroke
  // In a real app, you might want a "Save All" or individual row saves (implemented below)
  
  const loadData = async () => {
    try {
      const data = await fetchEnrolledStudents(courseId);
      setStudents(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [courseId]);

  const updateLocalField = (id, key, value) => {
    setStudents(prev => prev.map(s => s._id === id ? { ...s, [key]: value } : s));
  };

  const handleSave = async (studentId) => {
    const student = students.find(s => s._id === studentId);
    if (!student) return;

    try {
      await updateStudentGrade(studentId, { 
        grade: student.grade, 
        attendance: student.attendance 
      });
      alert("Grade updated!");
    } catch (err) {
      alert("Failed to save.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/instructor/courses">
          <Button variant="ghost" size="icon"><ArrowLeft size={20}/></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Course Gradebook</h1>
          <p className="text-slate-500">Manage grades and attendance for this course.</p>
        </div>
      </div>

      <div className="bg-white/50 backdrop-blur-sm border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Details</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Attendance (%)</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                   No students enrolled in this course yet.
                 </TableCell>
               </TableRow>
            ) : (
              students.map((s) => (
                <TableRow key={s._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                        <User size={14} />
                      </div>
                      <span className="font-bold text-slate-700">{s.student?.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 font-mono text-xs">{s.student?.email}</TableCell>
                  
                  <TableCell>
                    <div className="relative w-24">
                      <select 
                        className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer hover:border-blue-300 transition-colors"
                        value={s.grade || ""}
                        onChange={(e) => updateLocalField(s._id, "grade", e.target.value)}
                      >
                        <option value="">-</option>
                        {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Input 
                      type="number" 
                      className="w-24 h-9 font-mono text-center" 
                      placeholder="0"
                      value={s.attendance || ""}
                      onChange={(e) => updateLocalField(s._id, "attendance", e.target.value)}
                    />
                  </TableCell>

                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => handleSave(s._id)} className="gap-2 bg-slate-800 hover:bg-slate-900">
                      <Save size={14} /> Save
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