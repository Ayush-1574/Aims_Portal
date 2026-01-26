import { useEffect, useState } from "react";
import { fetchStudentRecord } from "../api";
import { BookOpen, Activity, GraduationCap, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import UserDetailsCard from "@/components/UserDetailsCard";

export default function StudentOverview() {
  const [stats, setStats] = useState({
    cgpa: "0.00",
    activeCoursesCount: 0,
    creditsThisSem: 0
  });
  const [loading, setLoading] = useState(true);

  // Grade Points Map (Same as StudentRecord)
  const GRADE_MAP = {
    'A': 10, 'A-': 9,
    'B': 8, 'B-': 7,
    'C': 6, 'C-': 5,
    'D': 4, 'F': 0
  };

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchStudentRecord();
        const enrollments = res?.data || [];

        // --- 1. Calculate Calculation Variables ---
        let totalPoints = 0;
        let totalGradedCredits = 0;
        const sessionCreditsMap = {}; // "2024-25-I" -> 15

        enrollments.forEach(entry => {
            const credits = Number(entry.course?.credits || 3);
            const grade = entry.grade;
            const session = entry.session || "Unknown";
            const status = entry.status;

            // Track credits per session (Only for Active/Enrolled courses)
            if (status === "ENROLLED") {
                if (!sessionCreditsMap[session]) sessionCreditsMap[session] = 0;
                sessionCreditsMap[session] += credits;
            }

            // Calculate CGPA (Only for Graded courses)
            if (grade && GRADE_MAP.hasOwnProperty(grade)) {
                const points = GRADE_MAP[grade];
                totalGradedCredits += credits;
                totalPoints += (points * credits);
            }
        });

        // --- 2. Compute Final Stats ---
        
        // A. CGPA
        const cgpa = totalGradedCredits === 0 
          ? "0.00" 
          : (totalPoints / totalGradedCredits).toFixed(2);

        // B. Active Courses (Total Enrolled)
        const activeCoursesCount = enrollments.filter(c => c.status === "ENROLLED").length;

        // C. Credits This Sem (Find latest session and get its credits)
        const sessions = Object.keys(sessionCreditsMap).sort();
        const latestSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
        const creditsThisSem = latestSession ? sessionCreditsMap[latestSession] : 0;

        setStats({
            cgpa,
            activeCoursesCount,
            creditsThisSem
        });

      } catch (e) {
        console.error("Failed to load student overview", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const StatBox = ({ label, value, icon: Icon, color, bg }) => (
    <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden relative">
      <CardContent className="p-6 flex items-center justify-between z-10 relative">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
          <h3 className="text-3xl font-black text-slate-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${bg} ${color}`}>
          <Icon size={24} />
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* 1. Profile Section */}
      <UserDetailsCard />

      {/* 2. Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatBox 
          label="CGPA" 
          value={stats.cgpa} 
          icon={Activity} 
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <StatBox 
          label="Active Courses" 
          value={stats.activeCoursesCount} 
          icon={BookOpen} 
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatBox 
          label="Credits This Sem" 
          value={stats.creditsThisSem} 
          icon={GraduationCap} 
          color="text-purple-600"
          bg="bg-purple-50"
        />
      </div>
    </div>
  );
}