import { useState, useEffect } from "react";
import { UserPlus, ArrowLeft, GraduationCap, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { fetchGlobalData } from "@/features/admin/api";

export default function AuthRegisterStep({ email, role, setRole, onSubmit, loading, error, onBack }) {
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    entryNo: "", // Student only
    gender: "", // Student only
  });
  const [departments, setDepartments] = useState([]);

  // Load departments from GlobalData
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const data = await fetchGlobalData("DEPARTMENT");
        console.log("Departments loaded:", data);
        setDepartments(data.items || []);
      } catch (err) {
        console.error("Error loading departments:", err);
      }
    };
    loadDepartments();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="border-white/40 shadow-2xl backdrop-blur-xl bg-white/80">
      <CardHeader className="text-center pb-2 relative">
        <button onClick={onBack} className="absolute left-6 top-6 text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-500/20">
          <UserPlus size={32} />
        </div>
        <CardTitle className="text-3xl font-bold text-slate-800">Create Account</CardTitle>
        <p className="text-slate-500 mt-2 text-sm">
          Complete your profile for <span className="font-bold text-slate-700">{email}</span>
        </p>
      </CardHeader>

      <CardContent className="p-8 pt-4">
        {error && (
           <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-red-500"></div>{error}
           </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                role === "student" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <GraduationCap size={18} /> Student
            </button>
            <button
              type="button"
              onClick={() => setRole("instructor")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                role === "instructor" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <BookOpen size={18} /> Instructor
            </button>
          </div>

          <div className="space-y-4">
             <div className="space-y-2">
               <Label>Full Name</Label>
               <Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. John Doe" required />
             </div>

             <div className="space-y-2">
               <Label>Department</Label>
               <select 
                 name="department" 
                 value={formData.department} 
                 onChange={handleChange}
                 className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                 required
               >
                 <option value="">Select Department</option>
                 {departments.filter(d => d.isActive).map(dept => (
                   <option key={dept._id} value={dept.key}>{dept.value}</option>
                 ))}
               </select>
             </div>

             {role === "student" && (
               <div className="grid grid-cols-2 gap-4 animate-fade-in">
                 <div className="space-y-2">
                   <Label>Entry Number</Label>
                   <Input name="entryNo" value={formData.entryNo} onChange={handleChange} placeholder="2023CS..." required />
                 </div>
                 <div className="space-y-2">
                   <Label>Gender</Label>
                   <select 
                     name="gender" 
                     value={formData.gender} 
                     onChange={handleChange}
                     className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                     required
                   >
                     <option value="">Select</option>
                     <option value="Male">Male</option>
                     <option value="Female">Female</option>
                   </select>
                 </div>
               </div>
             )}
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-base bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/25" 
            isLoading={loading}
          >
            Complete Registration
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}