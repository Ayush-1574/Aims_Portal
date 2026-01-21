import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';

export default function RegisterInstructor({ email, onComplete, onBack }) {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !department) {
      setError("All fields are required");
      return;
    }

    setIsSubmitting(true);
    try {
      // send both role and data correctly for backend signup
      onComplete("instructor", {
        name,
        department,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col justify-center bg-white px-8 md:px-16">
      <button 
        onClick={onBack} 
        className="mb-8 flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition"
      >
        ← Back
      </button>

      <div className="max-w-md">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Instructor Registration
        </h1>
        <p className="text-gray-600 mb-2 text-sm">Set up your instructor profile</p>
        <p className="text-gray-500 mb-8 text-sm">{email}</p>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Full Name</label>
            <Input
              type="text"
              placeholder="Dr. Jane Smith"
              className="h-11 px-4 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Department</label>
            <Input
              placeholder="CSE"
              className="h-11 px-4 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Creating Account...
              </span>
            ) : (
              '✓ Register as Instructor'
            )}
          </Button>

          <p className="text-center text-xs text-gray-500">
            By registering, you agree to our terms and conditions
          </p>
        </form>
      </div>
    </div>
  );
}
