import { useState } from "react";
import { createNewUser } from "../api";
import { UserPlus, CheckCircle, AlertCircle, GraduationCap, BookOpen, School, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function CreateUser({ onUserCreated, onCancel }) {
  const [formData, setFormData] = useState({
    name: "", email: "", role: "student", entry_no: "",
    department: "", year: "", semester: "", advisor_department: "", advisor_year: ""
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };
  const handleRoleSelect = (role) => setFormData({ ...formData, role });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", msg: "" });

    try {
      const result = await createNewUser(formData);
      if (result.success) {
        toast.success(`User "${formData.name}" created successfully!`);
        setStatus({ type: "success", msg: "User created successfully!" });
        setFormData({
          name: "", email: "", role: "student", entry_no: "",
          department: "", year: "", semester: "", advisor_department: "", advisor_year: ""
        });
        if (onUserCreated) onUserCreated();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Failed to create user";
      toast.error(errorMsg);
      setStatus({ type: "error", msg: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'student', label: 'Student', icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    { id: 'instructor', label: 'Instructor', icon: BookOpen, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
    { id: 'faculty_advisor', label: 'Advisor', icon: School, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' },
    { id: 'admin', label: 'Admin', icon: Shield, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-10">
      <Card className="overflow-hidden border-0 shadow-xl rounded-2xl">
        
        {/* HEADER: Matches Offer Course Style (Dark Slate) */}
        <div className="bg-slate-900 p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
              <UserPlus size={28} className="text-blue-100" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Create New User</h2>
              <p className="text-slate-400 mt-1">Add a new user to the system manually.</p>
            </div>
          </div>
        </div>
        
        <CardContent className="p-8">
          {status.msg && (
            <div className={`mb-8 p-4 rounded-xl text-sm font-bold flex items-center gap-3 animate-fade-in ${
              status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
            }`}>
              {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              {status.msg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <Label>Select User Role</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleSelect(r.id)}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 outline-none focus:outline-none
                      ${formData.role === r.id 
                        ? `${r.bg} ${r.border} ${r.color} shadow-md scale-[1.02]` 
                        : "bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:bg-slate-50"}
                    `}
                  >
                    <r.icon size={24} />
                    <span className="font-bold text-sm">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. John Doe" required />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@univ.edu" required />
              </div>
            </div>

            {formData.role === "student" && (
              <div className="p-6 bg-purple-50/50 rounded-2xl border border-purple-100 animate-slide-up space-y-4">
                  <div className="flex items-center gap-2 text-purple-800 font-bold mb-2">
                    <GraduationCap size={18}/> Student Details
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Entry Number</Label>
                      <Input name="entry_no" value={formData.entry_no} onChange={handleChange} placeholder="2023CS..." required />
                    </div>
                    <div className="space-y-2">
                        <Label>Department</Label>
                        <Select value={formData.department} onValueChange={(val) => handleSelectChange("department", val)} required>
                          <SelectTrigger className="bg-white border-slate-200">
                             <SelectValue placeholder="Select Dept" />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="CSE">CSE</SelectItem>
                             <SelectItem value="EE">EE</SelectItem>
                             <SelectItem value="ME">ME</SelectItem>
                          </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Year</Label>
                        <Input type="number" name="year" value={formData.year} onChange={handleChange} placeholder="1" required />
                    </div>
                    <div className="space-y-2">
                        <Label>Semester</Label>
                        <Input type="number" name="semester" value={formData.semester} onChange={handleChange} placeholder="1" required />
                    </div>
                  </div>
              </div>
            )}

            {formData.role === "faculty_advisor" && (
              <div className="p-6 bg-pink-50/50 rounded-2xl border border-pink-100 animate-slide-up space-y-4">
                  <div className="flex items-center gap-2 text-pink-800 font-bold mb-2">
                    <School size={18}/> Advisory Details
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Department</Label>
                        <Select value={formData.advisor_department} onValueChange={(val) => handleSelectChange("advisor_department", val)} required>
                          <SelectTrigger className="bg-white border-slate-200">
                             <SelectValue placeholder="Select Dept" />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="CSE">CSE</SelectItem>
                             <SelectItem value="EE">EE</SelectItem>
                             <SelectItem value="ME">ME</SelectItem>
                          </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Year</Label>
                        <Input type="number" name="year" value={formData.year} onChange={handleChange} placeholder="1" required />
                    </div>
                  </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="submit" size="lg" className="flex-1 bg-slate-900 hover:bg-slate-800" isLoading={loading}>
                Create Account
              </Button>
              {onCancel && (
                <Button type="button" variant="secondary" size="lg" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}