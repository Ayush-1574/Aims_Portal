import { useState } from "react";
import { createNewUser } from "@/api/admin";

export default function CreateUserForm({ onUserCreated, onCancel }) {
  const [role, setRole] = useState("student");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student",
    entry_no: "",
    department: "",
    year: "",
    semester: "",
    advisor_department: "",
    advisor_year: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setRole(newRole);
    setFormData(prev => ({ ...prev, role: newRole }));
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

    if (formData.role === "student") {
      if (!formData.entry_no.trim()) {
        setError("Entry number is required for students");
        return false;
      }
      if (!formData.department) {
        setError("Department is required for students");
        return false;
      }
      if (!formData.year) {
        setError("Year is required for students");
        return false;
      }
      if (!formData.semester) {
        setError("Semester is required for students");
        return false;
      }
    }

    if (formData.role === "faculty_advisor") {
      if (!formData.advisor_department) {
        setError("Department is required for faculty advisors");
        return false;
      }
      if (!formData.advisor_year) {
        setError("Year is required for faculty advisors");
        return false;
      }
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
      const result = await createNewUser(formData);

      if (result.success) {
        setSuccess(`User "${formData.name}" created successfully!`);
        setFormData({
          name: "",
          email: "",
          role: "student",
          entry_no: "",
          department: "",
          year: "",
          semester: "",
          advisor_department: "",
          advisor_year: ""
        });

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
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New User</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="border-b pb-6">
          <h3 className="font-bold text-gray-900 mb-4">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-400 text-gray-900 font-medium"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-400 text-gray-900 font-medium"
                disabled={loading}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleRoleChange}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:border-blue-600 focus:ring-2 focus:ring-blue-400 cursor-pointer"
              disabled={loading}
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="faculty_advisor">Faculty Advisor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Student-specific fields */}
        {formData.role === "student" && (
          <div className="border-b pb-6">
            <h3 className="font-bold text-gray-900 mb-4">Student Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entry Number
                </label>
                <input
                  type="text"
                  name="entry_no"
                  value={formData.entry_no}
                  onChange={handleChange}
                  placeholder="e.g., 2021001"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-400 text-gray-900 font-medium"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:border-blue-600 focus:ring-2 focus:ring-blue-400 cursor-pointer"
                  disabled={loading}
                >
                  <option value="">Select Department</option>
                  <option value="CSE">Computer Science</option>
                  <option value="EE">Electrical Engineering</option>
                  <option value="ME">Mechanical Engineering</option>
                  <option value="CE">Civil Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:border-blue-600 focus:ring-2 focus:ring-blue-400 cursor-pointer"
                  disabled={loading}
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:border-blue-600 focus:ring-2 focus:ring-blue-400 cursor-pointer"
                  disabled={loading}
                >
                  <option value="">Select Semester</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Faculty Advisor-specific fields */}
        {formData.role === "faculty_advisor" && (
          <div className="border-b pb-6">
            <h3 className="font-bold text-gray-900 mb-4">Faculty Advisor Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  name="advisor_department"
                  value={formData.advisor_department}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:border-blue-600 focus:ring-2 focus:ring-blue-400 cursor-pointer"
                  disabled={loading}
                >
                  <option value="">Select Department</option>
                  <option value="CSE">Computer Science</option>
                  <option value="EE">Electrical Engineering</option>
                  <option value="ME">Mechanical Engineering</option>
                  <option value="CE">Civil Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Advises Year
                </label>
                <select
                  name="advisor_year"
                  value={formData.advisor_year}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:border-blue-600 focus:ring-2 focus:ring-blue-400 cursor-pointer"
                  disabled={loading}
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800 font-medium">
          <strong>Note:</strong> New users will receive login credentials and can immediately access their respective dashboards.
        </p>
      </div>
    </div>
  );
}
