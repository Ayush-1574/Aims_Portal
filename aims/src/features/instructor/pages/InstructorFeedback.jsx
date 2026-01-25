import { useEffect, useMemo, useState } from "react";
import { getInstructorFeedback } from "../api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";
import { toast } from "sonner";

export default function InstructorFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [sessionFilter, setSessionFilter] = useState("ALL");

  /* ---------- Load data ---------- */
 const loadData = async () => {
  try {
    const res = await getInstructorFeedback();
    setFeedbacks(Array.isArray(res.data?.data) ? res.data.data : []);
  } catch {
    toast.error("Failed to load feedback");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    loadData();
  }, []);

  /* ---------- Filters ---------- */
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((f) => {
      const courseOk =
        courseFilter === "ALL" || f.course?.courseCode === courseFilter;
      const sessionOk =
        sessionFilter === "ALL" || f.session === sessionFilter;
      return courseOk && sessionOk;
    });
  }, [feedbacks, courseFilter, sessionFilter]);

  /* ---------- Group by course ---------- */
  const grouped = useMemo(() => {
    const map = {};
    filteredFeedbacks.forEach((f) => {
      const key = f.course._id;
      if (!map[key]) {
        map[key] = { course: f.course, items: [] };
      }
      map[key].items.push(f);
    });
    return Object.values(map);
  }, [filteredFeedbacks]);

  /* ---------- Filter options ---------- */
  const courseOptions = useMemo(() => {
    const set = new Set(feedbacks.map((f) => f.course.courseCode));
    return ["ALL", ...set];
  }, [feedbacks]);

  const sessionOptions = useMemo(() => {
    const set = new Set(feedbacks.map((f) => f.session));
    return ["ALL", ...set];
  }, [feedbacks]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="py-20 text-center text-gray-500">
        No feedback received yet.
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Course Feedback</h1>
        <p className="text-gray-500">
          Anonymous feedback submitted by students
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="h-10 rounded-lg border px-3"
        >
          {courseOptions.map((c) => (
            <option key={c} value={c}>
              {c === "ALL" ? "All Courses" : c}
            </option>
          ))}
        </select>

        <select
          value={sessionFilter}
          onChange={(e) => setSessionFilter(e.target.value)}
          className="h-10 rounded-lg border px-3"
        >
          {sessionOptions.map((s) => (
            <option key={s} value={s}>
              {s === "ALL" ? "All Sessions" : s}
            </option>
          ))}
        </select>
      </div>

      {/* Grouped feedback */}
      {grouped.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          No feedback matches selected filters.
        </div>
      ) : (
        grouped.map(({ course, items }) => {
          const avg = (field) =>
            (
              items.reduce((s, f) => s + (f[field] || 0), 0) / items.length
            ).toFixed(1);

          return (
            <Card key={course._id} className="shadow-sm">
              <CardContent className="p-6 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold">{course.title}</h2>
                    <p className="text-sm text-gray-500">
                      {course.courseCode} • {course.session}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {items.length} responses
                  </Badge>
                </div>

                {/* Averages */}
                <div className="space-y-4">
                  <RatingBar label="Overall Rating" value={avg("rating")} />
                  <RatingBar
                    label="Teaching Quality"
                    value={avg("teachingQuality")}
                  />
                  <RatingBar label="Workload" value={avg("workload")} />
                </div>

                {/* Comments */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Student Comments</h3>
                  {items.filter((i) => i.comments?.trim()).length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No comments provided.
                    </p>
                  ) : (
                    items
                      .filter((i) => i.comments?.trim())
                      .map((f, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50 p-3 rounded-lg text-sm"
                        >
                          “{f.comments}”
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

/* ---------- Rating Bar ---------- */
function RatingBar({ label, value }) {
  const percent = Math.min((value / 5) * 100, 100);

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-1 text-sm">
          <Star size={14} className="text-yellow-500" />
          <span className="font-bold">{value}</span>
          <span className="text-gray-500">/5</span>
        </div>
      </div>

      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}