import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import client from "@/core/api/client"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save, ArrowLeft, Mail, Hash, Loader2, Upload } from "lucide-react"; 
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert"; // Import Alert for better errors
import BulkGradeImport from "@/components/BulkGradeImport";

const gradeOptions = ["A", "A-", "B", "B-", "C", "C-", "D", "F", "I"];

export default function EnrolledStudents() {
  const { courseId } = useParams();
  
  // --- STATE DEFINITIONS ---
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  
  // FIX: This was missing before
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  // New state for showing error/success messages nicely
  const [message, setMessage] = useState({ type: null, text: "" });

  // Fetch Enrolled Students
  const loadData = async () => {
    try {
      const res = await client.get(`/enrollment/course/${courseId}/enrolled`);
      setStudents(res.data.data || []);
      setUnsavedChanges(false);
    } catch (err) {
      console.error("Failed to load students", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [courseId]);

  // --- Handle CSV/Excel Import ---
  const handleCSVImport = (importedData) => {
    let matchCount = 0;
    setMessage({ type: null, text: "" }); // Clear previous messages

    const updatedStudents = students.map((record) => {
      if (!record.student) return record; 

      const dbEmail = record.student.email ? String(record.student.email).trim().toLowerCase() : "";
      const dbEntry = record.student.entry_no ? String(record.student.entry_no).trim().toLowerCase() : "";

      const matchedRow = importedData.find((row) => {
        const rowEmail = row.email || row['email address'];
        const rowEntry = row.entry_no || row['entry no'] || row['entry_number'];
        
        const csvEmail = rowEmail ? String(rowEmail).trim().toLowerCase() : "";
        const csvEntry = rowEntry ? String(rowEntry).trim().toLowerCase() : "";

        if (csvEmail && dbEmail && csvEmail === dbEmail) return true;
        if (csvEntry && dbEntry && csvEntry === dbEntry) return true;

        return false;
      });

      if (matchedRow) {
        const csvAttendance = matchedRow.attendance ? parseFloat(matchedRow.attendance) : null;
        const currentAttendance = record.attendance && record.attendance !== "-" ? parseFloat(record.attendance) : 0;
        const finalAttendance = csvAttendance !== null ? csvAttendance : currentAttendance;
        const shouldUpdateGrade = finalAttendance >= 75;
        
        if (shouldUpdateGrade || csvAttendance === null) {
           matchCount++;
           return {
             ...record,
             grade: matchedRow.grade ? String(matchedRow.grade).toUpperCase() : record.grade,
             attendance: csvAttendance !== null ? csvAttendance : record.attendance,
             _isModified: true 
           };
        }
        
        return {
            ...record,
            attendance: csvAttendance !== null ? csvAttendance : record.attendance,
            _isModified: true
        };
      }
      return record;
    });

    if (matchCount > 0) {
        setStudents(updatedStudents);
        setUnsavedChanges(true);
        // Show success message nicely
        setMessage({ type: "success", text: `Success! Matched and updated ${matchCount} students.` });
    } else {
        // Show error message nicely
        setMessage({ type: "error", text: "No matching students found. Check your file columns." });
    }
    return matchCount;
  };

  const updateLocalField = (id, key, value) => {
    setStudents(prev => prev.map(record => 
      record._id === id ? { ...record, [key]: value, _isModified: true } : record
    ));
    setUnsavedChanges(true);
  };

  const handleBulkSave = async () => {
    const modifiedRecords = students.filter(s => s._isModified);
    if (modifiedRecords.length === 0) return;

    setIsBulkSaving(true);
    try {
        const promises = modifiedRecords.map(record => 
            client.patch(`/enrollment/${record._id}/update-record`, { 
                grade: record.grade, 
                attendance: record.attendance 
            })
        );
        await Promise.all(promises);
        setStudents(prev => prev.map(s => ({ ...s, _isModified: false })));
        setUnsavedChanges(false);
        setMessage({ type: "success", text: "All changes saved successfully!" });
        
        // Hide success message after 3 seconds
        setTimeout(() => setMessage({ type: null, text: "" }), 3000);
    } catch (err) {
        console.error(err);
        setMessage({ type: "error", text: "Failed to save some records. Please try again." });
    } finally {
        setIsBulkSaving(false);
    }
  };

  const handleSave = async (recordId) => {
    const record = students.find(r => r._id === recordId);
    if (!record) return;

    setSavingId(recordId);
    try {
      await client.patch(`/enrollment/${recordId}/update-record`, { 
        grade: record.grade, 
        attendance: record.attendance 
      });
      setStudents(prev => prev.map(s => s._id === recordId ? { ...s, _isModified: false } : s));
      const othersModified = students.some(s => s._id !== recordId && s._isModified);
      setUnsavedChanges(othersModified);
    } catch (err) {
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
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
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

            <div className="flex items-center gap-3">
            {unsavedChanges && (
                <Button 
                    onClick={handleBulkSave} 
                    disabled={isBulkSaving}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white animate-in fade-in"
                >
                    {isBulkSaving ? <Loader2 className="animate-spin mr-2" size={16}/> : <Upload className="mr-2" size={16}/>}
                    Sync {students.filter(s => s._isModified).length} Changes
                </Button>
            )}
            <BulkGradeImport onImport={handleCSVImport} />
            </div>
        </div>

        {/* --- NEW: Feedback Alert Area --- */}
        {message.text && (
            <Alert variant={message.type === "error" ? "destructive" : "default"} 
                   className={message.type === "success" ? "bg-green-50 border-green-200 text-green-800" : ""}>
                <AlertDescription>
                    {message.text}
                </AlertDescription>
            </Alert>
        )}
      </div>

      {/* Table Section */}
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
                   No students found.
                 </TableCell>
               </TableRow>
            ) : (
              students.map((record) => (
                <TableRow key={record._id} className={`hover:bg-slate-50/50 ${record._isModified ? "bg-blue-50/30" : ""}`}>
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
                  <TableCell>
                    <div className="relative w-24">
                      <select 
                        className={`w-full appearance-none pl-3 pr-8 py-2 rounded-lg border text-sm font-bold focus:ring-2 outline-none cursor-pointer transition-colors ${
                            record._isModified ? "border-blue-300 bg-blue-50 text-blue-900" : "border-slate-200 bg-white text-slate-700"
                        }`}
                        value={record.grade || ""}
                        onChange={(e) => updateLocalField(record._id, "grade", e.target.value)}
                      >
                        <option value="-">-</option>
                        {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="relative w-24">
                      <Input 
                        type="number" 
                        min="0" max="100"
                        className={`h-9 font-mono text-center font-semibold pr-6 ${
                            record._isModified ? "border-blue-300 bg-blue-50" : ""
                        }`}
                        placeholder="0"
                        value={record.attendance === "-" ? "" : record.attendance}
                        onChange={(e) => updateLocalField(record._id, "attendance", e.target.value)}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      size="sm" 
                      onClick={() => handleSave(record._id)} 
                      disabled={savingId === record._id}
                      className={`gap-2 shadow-sm ${
                          record._isModified 
                            ? "bg-blue-600 hover:bg-blue-700 text-white" 
                            : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {savingId === record._id ? <Loader2 size={14} className="animate-spin"/> : <Save size={14} />}
                      {record._isModified ? "Save" : "Saved"}
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