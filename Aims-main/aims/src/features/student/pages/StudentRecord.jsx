import { useState, useEffect } from "react";
import { fetchStudentRecord } from "../api";
import { Award, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function StudentRecord() {
  const [record, setRecord] = useState({ cgpa: 0, sessions: {} });
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState(null);

  // Helper: Convert grade to points
  const getPoints = (grade) => {
    const map = { 'A': 10, 'A-': 9, 'B': 8, 'B-': 7, 'C': 6, 'C-': 5, 'D': 4, 'F': 0 };
    return map[grade] || 0;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchStudentRecord();
        const enrollments = res?.data || [];

        const grouped = {};
        let totalCredits = 0;
        let totalPoints = 0;

        enrollments.forEach(entry => {
          // --- KEY LOGIC: Group by Instructor's Session ---
          // We use the session string directly from the course object.
          const sessionName = entry.course?.session || "Unknown Session";
          
          if (!grouped[sessionName]) {
            grouped[sessionName] = { 
              courses: [], 
              credits: 0, 
              points: 0 
            };
          }

          const credits = entry.course?.credits || 3;
          const grade = entry.grade || "Pending";
          
          grouped[sessionName].courses.push({ ...entry, credits });

          // Calculate SGPA/CGPA if graded
          if (grade !== "Pending" && grade !== "I") {
            const p = getPoints(grade);
            grouped[sessionName].credits += credits;
            grouped[sessionName].points += (p * credits);
            
            totalCredits += credits;
            totalPoints += (p * credits);
          }
        });

        // Calculate SGPA per session
        Object.keys(grouped).forEach(key => {
          const s = grouped[key];
          s.sgpa = s.credits === 0 ? "0.00" : (s.points / s.credits).toFixed(2);
        });

        const cgpa = totalCredits === 0 ? "0.00" : (totalPoints / totalCredits).toFixed(2);
        
        setRecord({ cgpa, sessions: grouped });
        
        // Auto-open the most recent session (sorting strings usually works for "2025-1", "2025-2")
        const sessions = Object.keys(grouped).sort();
        if (sessions.length > 0) setExpandedSession(sessions[sessions.length - 1]);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const toggle = (s) => setExpandedSession(expandedSession === s ? null : s);

  if (loading) return <div className="p-20 text-center text-slate-400">Loading academic history...</div>;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Academic Record</h1>
          <p className="text-slate-500 text-sm">Official transcript grouped by session.</p>
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
           <div className="text-center py-10 text-slate-500 border-2 border-dashed border-slate-200 rounded-xl">
             No academic records found.
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
                  className="p-5 cursor-pointer flex justify-between items-center hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${isOpen ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
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
                    <div className="text-slate-400">
                      {isOpen ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                    </div>
                  </div>
                </div>

                {/* Courses Table */}
                {isOpen && (
                  <div className="border-t border-slate-100 animate-fade-in">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-3 font-semibold">Course Code</th>
                          <th className="px-6 py-3 font-semibold">Title</th>
                          <th className="px-6 py-3 text-center font-semibold">Credits</th>
                          <th className="px-6 py-3 text-center font-semibold">Grade</th>
                          <th className="px-6 py-3 text-right font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {data.courses.map((c) => (
                          <tr key={c._id} className="hover:bg-blue-50/30 transition-colors">
                            <td className="px-6 py-4 font-mono font-medium text-slate-600">
                              {c.course?.courseCode}
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-800">
                              {c.course?.title}
                            </td>
                            <td className="px-6 py-4 text-center text-slate-600">
                              {c.credits}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {c.grade === "Pending" ? (
                                <span className="text-slate-400 italic text-xs">--</span>
                              ) : (
                                <span className={`font-bold px-2.5 py-1 rounded-md text-xs ${
                                  c.grade.startsWith('A') ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {c.grade}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Badge variant={c.status === 'ENROLLED' ? 'success' : 'secondary'} className="text-[10px]">
                                {c.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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