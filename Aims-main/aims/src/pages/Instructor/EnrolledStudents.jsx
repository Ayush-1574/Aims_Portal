import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserDetailsCard from "@/components/UserDetailsCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  fetchEnrolledStudents,
  updateStudentRecord
} from "@/api/instructorStudents";

const gradeOptions = ["A", "A-", "B", "B-", "C", "C-", "D", "F", "I"];

export default function EnrolledStudents() {
  const { courseId } = useParams();
  const [students, setStudents] = useState([]);
  const [edited, setEdited] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchEnrolledStudents(courseId);
      // backend returns: { success, data: [...] }
      setStudents(res.data || []);
      setEdited(res.data || []);
    } catch (err) {
      console.error("Failed to fetch enrolled list", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [courseId]);

  const updateField = (id, key, value) => {
    setEdited(prev =>
      prev.map(s => (s._id === id ? { ...s, [key]: value } : s))
    );
  };

  const handleSave = async (id) => {
    const student = edited.find(s => s._id === id);

    await updateStudentRecord(id, {
      grade: student.grade,
      attendance: student.attendance
    });

    alert("Student record updated!");
    loadData();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <UserDetailsCard />

      <h2 className="text-xl font-semibold">Enrolled Students</h2>

      <Table className="bg-white rounded-lg border">
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead>Student</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Attendance</TableHead>
            <TableHead className="text-right">Save</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {edited.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-3 text-gray-500">
                No students enrolled in this course.
              </TableCell>
            </TableRow>
          ) : (
            edited.map((s) => (
              <TableRow key={s._id}>
                <TableCell>{s.student.name}</TableCell>
                <TableCell>{s.student.email}</TableCell>

                {/* Grade */}
                <TableCell>
                  <Select
                    value={s.grade || ""}
                    onValueChange={(v) => updateField(s._id, "grade", v)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeOptions.map(g => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>

                {/* Attendance */}
                <TableCell>
                  <Input
                    className="w-24"
                    placeholder="0%"
                    value={s.attendance || ""}
                    onChange={(e) =>
                      updateField(s._id, "attendance", e.target.value)
                    }
                  />
                </TableCell>

                <TableCell className="text-right">
                  <Button size="sm" onClick={() => handleSave(s._id)}>
                    Save
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
