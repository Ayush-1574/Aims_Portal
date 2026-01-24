import { useEffect, useState } from "react";
import { fetchStudentRecord, submitFeedback, getFeedbackStatus } from "../api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function StudentFeedback() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(false);
  const [submitting, setSubmitting] = useState(null);

  const [form, setForm] = useState({
    rating: 5,
    teachingQuality: 5,
    workload: 5,
    comments: ""
  });

  /* -------- Load feedback status + enrollments -------- */
  const loadData = async () => {
    try {
      const [status, record] = await Promise.all([
        getFeedbackStatus(),
        fetchStudentRecord()
      ]);

      setActive(status.active);
      setEnrollments(
        record.data.filter(
          (e) => e.enrolled === true
        )
      );
    } catch {
      toast.error("Failed to load feedback data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (courseId) => {
    setSubmitting(courseId);
    try {
      await submitFeedback({
        courseId,
        ...form
      });
      toast.success("Feedback submitted anonymously");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Feedback failed");
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return <div className="py-20 text-center">Loading...</div>;
  }

  if (!active) {
    return (
      <div className="py-20 text-center text-gray-500">
        Feedback is currently closed.
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Course Feedback</h1>
        <p className="text-gray-500">
          Your feedback is anonymous and visible only to instructors.
        </p>
      </div>

      {enrollments.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm text-center text-gray-500">
          No enrolled courses available for feedback.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {enrollments.map((e) => (
            <Card key={e.id} className="shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-bold text-lg">
                    {e.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {e.code} • {e.session}
                  </p>
                </div>

                {/* Ratings */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">
                      Overall Rating
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={form.rating}
                      onChange={(ev) =>
                        setForm({ ...form, rating: ev.target.value })
                      }
                      className="w-full mt-1 border rounded-md p-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Teaching Quality
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={form.teachingQuality}
                      onChange={(ev) =>
                        setForm({
                          ...form,
                          teachingQuality: ev.target.value
                        })
                      }
                      className="w-full mt-1 border rounded-md p-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Workload
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={form.workload}
                      onChange={(ev) =>
                        setForm({
                          ...form,
                          workload: ev.target.value
                        })
                      }
                      className="w-full mt-1 border rounded-md p-2"
                    />
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <label className="text-sm font-medium">
                    Comments (optional)
                  </label>
                  <Textarea
                    rows={3}
                    value={form.comments}
                    onChange={(ev) =>
                      setForm({
                        ...form,
                        comments: ev.target.value
                      })
                    }
                    placeholder="Your comments will remain anonymous"
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleSubmit(e.course)}
                  isLoading={submitting === e.course}
                >
                  Submit Feedback
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}