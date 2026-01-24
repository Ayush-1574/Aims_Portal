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

  const loadData = async () => {
    try {
      const res = await getInstructorFeedback();
      setFeedbacks(res.data || []);
    } catch {
      toast.error("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* -------- Group by course -------- */
  const grouped = useMemo(() => {
    const map = {};
    feedbacks.forEach((f) => {
      const key = f.course._id;
      if (!map[key]) {
        map[key] = { course: f.course, items: [] };
      }
      map[key].items.push(f);
    });
    return Object.values(map);
  }, [feedbacks]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (grouped.length === 0) {
    return (
      <div className="py-20 text-center text-gray-500">
        No feedback received yet.
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Course Feedback</h1>
        <p className="text-gray-500">
          Anonymous feedback submitted by students
        </p>
      </div>

      {grouped.map(({ course, items }) => {
        const avg = (field) =>
          items.reduce((s, f) => s + (f[field] || 0), 0) / items.length;

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

              {/* Charts */}
              <div className="space-y-4">
                <RatingBar
                  label="Overall Rating"
                  value={avg("rating")}
                />
                <RatingBar
                  label="Teaching Quality"
                  value={avg("teachingQuality")}
                />
                <RatingBar
                  label="Workload"
                  value={avg("workload")}
                />
              </div>

              {/* Comments */}
              <div className="space-y-3">
                <h3 className="font-semibold">Student Comments</h3>
                {items.filter(i => i.comments).length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No comments provided.
                  </p>
                ) : (
                  items
                    .filter(i => i.comments)
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
      })}
    </div>
  );
}

/* ---------- Rating Bar (Chart) ---------- */
function RatingBar({ label, value }) {
  const percent = Math.min((value / 5) * 100, 100);

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-1 text-sm">
          <Star size={14} className="text-yellow-500" />
          <span className="font-bold">{value.toFixed(1)}</span>
          <span className="text-gray-500">/5</span>
        </div>
      </div>

      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}