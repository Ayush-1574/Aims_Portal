import { useEffect, useState } from "react";
import { fetchGlobalData } from "@/features/admin/api";

export function useGlobalData() {
  const [departments, setDepartments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
       try {
        const deptData = await fetchGlobalData("DEPARTMENT");
        const sessionData = await fetchGlobalData("SESSION");
        const courseData = await fetchGlobalData("COURSE_CODE");
        
       
        
        setDepartments(deptData.items || []);
        setSessions(sessionData.items || []);
        setCourses(courseData.items || []);
        
        // Set default session if available
        if (sessionData.items && sessionData.items.length > 0) {
          setFormData(prev => ({ ...prev, session: sessionData.items[0].key }));
        }
      } catch (err) {
        console.error("Error loading global data:", err);
      }
      try {
        const deptData = await fetchGlobalData("DEPARTMENT");
        const sessionData = await fetchGlobalData("SESSION");
        const courseData = await fetchGlobalData("COURSE_CODE");

        setDepartments(deptData.items || []);
        setSessions(sessionData.items || []);
        setCourses(courseData.items || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const deptMap = Object.fromEntries(departments.map(d => [d.key, d.key]));
  const sessionMap = Object.fromEntries(sessions.map(s => [s.key, s.key]));
  const courseMap = Object.fromEntries(courses.map(c => [c.key, c.value]));

  return { departments, sessions, courses, deptMap, sessionMap, courseMap, loading };
}
