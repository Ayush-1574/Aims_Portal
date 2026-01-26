import { useState, useEffect } from "react";
import { fetchStudentRecord, dropCourseStudent } from "../api";
import { Award, Calendar, ChevronDown, ChevronUp, Trash2, Loader2, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { dummyStudentRecord } from "@/dummy/dummyStudentRecord";


export default function StudentRecord() {
  const [record, setRecord] = useState({ cgpa: 0, sessions: {} });
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState(null);
  const [droppingId, setDroppingId] = useState(null); 

  // Grade Map
  const GRADE_MAP = { 
    'A': 10, 'A-': 9, 
    'B': 8, 'B-': 7, 
    'C': 6, 'C-': 5, 
    'D': 4, 'F': 0 
  };

const loadData = async () => {
  try {
    const res = await fetchStudentRecord();
    const backendEnrollments = res?.data || [];

    /* ---------- MERGE BACKEND + DUMMY ---------- */
    const backendSessions = new Set(
      backendEnrollments.map(e => e.session)
    );

    const mergedEnrollments = [
      ...backendEnrollments,
      ...dummyStudentRecord.filter(
        d => !backendSessions.has(d.session)
      )
    ];

    /* ---------- GROUPING + GPA ---------- */
    const grouped = {};
    let totalCredits = 0;
    let totalPoints = 0;

    mergedEnrollments.forEach(entry => {
      const sessionName = entry.session || "Unknown Session";

      if (!grouped[sessionName]) {
        grouped[sessionName] = {
          courses: [],
          credits: 0,
          points: 0
        };
      }

      const credits = Number(entry.course?.credits || entry.credits || 3);
      const grade = entry.grade || "Pending";

      grouped[sessionName].courses.push({
        ...entry,
        credits
      });

      // Only valid grades affect GPA
      if (GRADE_MAP.hasOwnProperty(grade)) {
        const points = GRADE_MAP[grade];

        grouped[sessionName].credits += credits;
        grouped[sessionName].points += points * credits;

        totalCredits += credits;
        totalPoints += points * credits;
      }
    });

    /* ---------- SGPA ---------- */
    Object.keys(grouped).forEach(session => {
      const s = grouped[session];
      s.sgpa =
        s.credits === 0 ? "0.00" : (s.points / s.credits).toFixed(2);
    });

    /* ---------- CGPA ---------- */
    const cgpa =
      totalCredits === 0
        ? "0.00"
        : (totalPoints / totalCredits).toFixed(2);

    setRecord({ cgpa, sessions: grouped });

    /* ---------- Auto expand latest session ---------- */
    const sessions = Object.keys(grouped).sort();
    if (sessions.length > 0) {
      setExpandedSession(sessions[sessions.length - 1]);
    }

  } catch (err) {
    console.error(err);
    toast.error("Failed to load records");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadData();
  }, []);

  const toggle = (s) => setExpandedSession(expandedSession === s ? null : s);

  const handleDrop = async (enrollmentId) => {
    if (!window.confirm("Are you sure you want to drop this course? This action cannot be undone.")) return;

    setDroppingId(enrollmentId);
    try {
      await dropCourseStudent(enrollmentId);
      toast.success("Course dropped successfully");
      await loadData(); 
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to drop course");
    } finally {
      setDroppingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
        <Loader2 className="animate-spin text-blue-500" size={32} />
        <p>Loading academic history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Academic Record</h1>
          <p className="text-slate-500 mt-1">Official transcript grouped by session.</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cumulative GPA</p>
          <div className="text-4xl font-black text-slate-900 flex items-center justify-end gap-3">
            <Award size={32} className="text-blue-600" />
            {record.cgpa}
          </div>
        </div>
      </div>

      {/* Session List */}
      <div className="space-y-4">
        {Object.keys(record.sessions).length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
             <BookOpen size={48} className="mb-4 text-slate-300"/>
             <p>No academic records found.</p>
           </div>
        ) : (
          Object.keys(record.sessions).sort().reverse().map((session) => {
            const data = record.sessions[session];
            const isOpen = expandedSession === session;

            return (
              <div key={session} className={`bg-white border rounded-xl transition-all duration-300 overflow-hidden ${isOpen ? 'ring-1 ring-blue-500 border-blue-200 shadow-md' : 'border-slate-200'}`}>
                
                {/* Session Header Bar */}
                <div 
                  onClick={() => toggle(session)}
                  className="p-5 cursor-pointer flex justify-between items-center hover:bg-slate-50 transition-colors select-none"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl transition-colors ${isOpen ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Calendar size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">Session: {session}</h3>
                      <p className="text-xs text-slate-500 font-medium">{data.courses.length} Courses Enrolled</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] font-bold text-slate-400 uppercase mr-2">SGPA</span>
                      <span className="text-lg font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-md">{data.sgpa}</span>
                    </div>
                    <div className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                      <ChevronDown size={20}/>
                    </div>
                  </div>
                </div>

                {/* Courses Table */}
                {isOpen && (
                  <div className="border-t border-slate-100 animate-in fade-in">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-3 font-semibold w-32">Course Code</th>
                            <th className="px-6 py-3 font-semibold">Title</th>
                            <th className="px-6 py-3 text-center font-semibold w-24">Credits</th>
                            <th className="px-6 py-3 text-center font-semibold w-24">Grade</th>
                            <th className="px-6 py-3 text-right font-semibold w-40">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {data.courses.map((c) => (
                            <tr key={c.id || c._id} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-6 py-4 font-mono font-medium text-slate-600">
                                {c.course?.courseCode || c.code}
                              </td>
                              <td className="px-6 py-4 font-medium text-slate-800">
                                {c.course?.title || c.title}
                              </td>
                              <td className="px-6 py-4 text-center text-slate-600">
                                {c.credits}
                              </td>
                              <td className="px-6 py-4 text-center">
                                {c.grade === "Pending" ? (
                                  <span className="text-slate-400 text-xs italic">--</span>
                                ) : (
                                  <span className={`font-bold px-2.5 py-1 rounded-md text-xs border ${
                                    c.grade.startsWith('A') ? 'bg-green-50 text-green-700 border-green-100' : 'bg-white text-slate-700 border-slate-200'
                                  }`}>
                                    {c.grade}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-3">
                                  <Badge 
                                    className={`
                                      ${c.status === 'ENROLLED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                        c.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' : 
                                        'bg-amber-50 text-amber-700 border-amber-100'}
                                    `}
                                  >
                                    {c.status}
                                  </Badge>

                                  {/* REVERTED TO c.id AS REQUESTED */}
                                  {c.status === "ENROLLED" && (
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                                      onClick={() => handleDrop(c.id)} 
                                      disabled={droppingId === c.id}
                                      title="Drop Course"
                                    >
                                      {droppingId === c.id ? (
                                        <Loader2 className="animate-spin" size={16} />
                                      ) : (
                                        <Trash2 size={16} />
                                      )}
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}