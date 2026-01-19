import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectItem, SelectContent, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { offerCourseAPI } from "@/api/instructor";

const sessions = ["2025-I", "2025-II", "2026-I", "2026-II"];
const departments = ["CSE", "EE", "ME", "CE", "CH"];
const categories = ["Core", "Elective"];

export default function OfferCourse() {
  const [form, setForm] = useState({
    courseCode: "",
    title: "",
    dept: "",
    ltp: "",
    category: "",
    session: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Submitting:", form);

      await offerCourseAPI({
        courseCode: form.courseCode,
        title: form.title,
        dept: form.dept,
        ltp: form.ltp,
        category: form.category,
        session: form.session
      });

      alert("Course offered! Pending Advisor Approval.");

      setForm({
        courseCode: "",
        title: "",
        dept: "",
        ltp: "",
        category: "",
        session: ""
      });

    } catch (err) {
      alert(err.response?.data?.msg ?? "Failed to offer course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="text-xl font-semibold">Offer a Course</h2>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <Input
          placeholder="Course Code (e.g. CS203)"
          value={form.courseCode}
          onChange={(e) => handleChange("courseCode", e.target.value.toUpperCase())}
          required
        />

        <Input
          placeholder="Course Title"
          value={form.title}
          onChange={(e) => handleChange("title", e.target.value)}
          required
        />

        <Select value={form.dept} onValueChange={(v) => handleChange("dept", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="LTP / Credits (e.g. 3-0-2-4)"
          value={form.ltp}
          onChange={(e) => handleChange("ltp", e.target.value)}
          required
        />

        <Select value={form.category} onValueChange={(v) => handleChange("category", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={form.session} onValueChange={(v) => handleChange("session", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select Session" />
          </SelectTrigger>
          <SelectContent>
            {sessions.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="submit" className="w-full text-white" disabled={loading}>
          {loading ? "Submitting..." : "Offer Course"}
        </Button>
      </form>
    </div>
  );
}
