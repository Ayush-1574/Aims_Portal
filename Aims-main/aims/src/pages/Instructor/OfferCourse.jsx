import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserDetailsCard from "@/components/UserDetailsCard";
import {
  Select, SelectItem, SelectContent, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { offerCourseAPI } from "@/api/instructor";

const sessions = ["2025-I", "2025-II", "2026-I", "2026-II"];
const departments = ["CSE", "EE", "ME", "CE", "CH"];
const categories = ["Core", "Elective"];
const STORAGE_KEY = "offerCourseFormData";

export default function OfferCourse() {
  const [form, setForm] = useState({
    courseCode: "",
    title: "",
    dept: "",
    year: "",
    ltp: "",
    category: "",
    session: ""
  });

  // Load saved form data on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setForm(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to load form data", err);
      }
    }
  }, []);

  // Save form data whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);

  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!form.courseCode || !form.title || !form.dept || !form.year || !form.ltp || !form.category || !form.session) {
        alert("Please fill in all fields including the year");
        setLoading(false);
        return;
      }

      console.log("Submitting:", form);

      await offerCourseAPI({
        courseCode: form.courseCode,
        title: form.title,
        dept: form.dept,
        year: parseInt(form.year),
        ltp: form.ltp,
        category: form.category,
        session: form.session
      });

      alert("Course offered! Pending Advisor Approval.");

      // Clear saved form after successful submission
      localStorage.removeItem(STORAGE_KEY);
      setForm({
        courseCode: "",
        title: "",
        dept: "",
        year: "",
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
    <div className="max-w-2xl space-y-6">
      <UserDetailsCard />

      <h2 className="text-xl font-semibold">Offer a Course</h2>

      <form className="space-y-3 bg-white border border-gray-200 rounded-lg p-6" onSubmit={handleSubmit}>
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

        <Select value={form.year} onValueChange={(v) => handleChange("year", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Year 1</SelectItem>
            <SelectItem value="2">Year 2</SelectItem>
            <SelectItem value="3">Year 3</SelectItem>
            <SelectItem value="4">Year 4</SelectItem>
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
