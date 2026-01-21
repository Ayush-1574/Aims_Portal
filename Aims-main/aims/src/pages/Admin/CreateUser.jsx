import { useState } from "react";
import { createNewUser } from "@/api/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CreateUserForm({ onUserCreated, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Invalid email format");
      return false;
    }
    if (!formData.role) {
      setError("Role is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const result = await createNewUser(
        formData.name,
        formData.email,
        formData.role
      );

      if (result.success) {
        setSuccess(`User "${formData.name}" created successfully! They can now login with their email.`);
        setFormData({ name: "", email: "", role: "student" });
        
        // Call callback after 2 seconds
        setTimeout(() => {
          if (onUserCreated) onUserCreated();
        }, 2000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.message || "Failed to create user";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-w-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New User</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-emerald-600 focus:ring-2 focus:ring-emerald-400 text-gray-900 font-medium"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-emerald-600 focus:ring-2 focus:ring-emerald-400 text-gray-900 font-medium"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:border-emerald-600 focus:ring-2 focus:ring-emerald-400 cursor-pointer"
            disabled={loading}
          >
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="faculty_advisor">Faculty Advisor</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? "Creating..." : "Create User"}
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </Button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> New users will receive login credentials and can immediately access their respective dashboards.
        </p>
      </div>
    </div>
  );
}
