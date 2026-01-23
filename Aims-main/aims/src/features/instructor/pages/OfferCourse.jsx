import { useState } from "react";
import { offerCourse } from "../api";
import { PlusCircle, Book, Layers, Layout, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OfferCourse() {
  const [formData, setFormData] = useState({
    title: "", courseCode: "", dept: "", credits: 3,
    description: "", session: "2025-2026", year: 1, ltp: "3-0-0"
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", msg: "" });

    try {
      await offerCourse(formData);
      setStatus({ type: "success", msg: "Course created successfully!" });
      setFormData({ 
        title: "", courseCode: "", dept: "", credits: 3, 
        description: "", session: "2025-2026", year: 1, ltp: "3-0-0" 
      });
    } catch (err) {
      setStatus({ type: "error", msg: err.response?.data?.msg || "Failed to offer course." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in pb-20">
      <Card className="border-0 shadow-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                <Book size={28} />
             </div>
             <div>
                <CardTitle className="text-2xl text-white">Offer New Course</CardTitle>
                <p className="text-slate-400">Create a new course curriculum for the upcoming session.</p>
             </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          {status.msg && (
            <div className={`mb-8 p-4 rounded-xl text-sm font-bold flex items-center gap-3 animate-fade-in ${
              status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
            }`}>
              {status.type === 'success' ? <CheckCircle size={18}/> : <div className="w-2 h-2 rounded-full bg-red-500"></div>}
              {status.msg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Core Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 col-span-2">
                <Label>Course Title</Label>
                <Input name="title" placeholder="e.g. Advanced Data Structures" value={formData.title} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label>Course Code</Label>
                <Input name="courseCode" placeholder="e.g. CS101" value={formData.courseCode} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label>Department</Label>
                <select 
                  name="dept" 
                  value={formData.dept} 
                  onChange={handleChange}
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  required
                >
                  <option value="">Select Dept</option>
                  <option value="CSE">Computer Science</option>
                  <option value="EE">Electrical Eng</option>
                  <option value="ME">Mechanical Eng</option>
                </select>
              </div>
            </div>

            {/* Structure Details */}
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-2">
                  <Label>L-T-P Structure</Label>
                  <Input name="ltp" placeholder="3-0-0" value={formData.ltp} onChange={handleChange} required />
               </div>
               <div className="space-y-2">
                  <Label>Credits</Label>
                  <Input type="number" name="credits" value={formData.credits} onChange={handleChange} required />
               </div>
               <div className="space-y-2">
                  <Label>Year Level</Label>
                  <Input type="number" name="year" value={formData.year} onChange={handleChange} required />
               </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                name="description"
                rows="4"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none text-sm"
                placeholder="Briefly describe the course curriculum..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <Button type="submit" size="lg" className="w-full text-base" isLoading={loading}>
              <PlusCircle size={18} className="mr-2"/> Offer Course
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}