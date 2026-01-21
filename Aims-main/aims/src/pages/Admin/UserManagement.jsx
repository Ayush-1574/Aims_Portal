import { useState, useEffect } from "react";
import { fetchAllUsers, changeUserRole, deleteUser, toggleUserStatus } from "@/api/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    status: "all"
  });

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [reason, setReason] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetchAllUsers(filters, page, 10);
      setUsers(res.data.users);
      setTotalPages(res.data.pagination.pages);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, filters]);

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) {
      setModalError("Please select a role");
      return;
    }

    if (newRole === selectedUser.role) {
      setModalError("Please select a different role");
      return;
    }

    try {
      await changeUserRole(selectedUser._id, newRole, reason);
      setModalSuccess("Role updated successfully!");
      setTimeout(() => {
        setShowRoleModal(false);
        setModalSuccess("");
        setModalError("");
        loadUsers();
      }, 1500);
    } catch (err) {
      setModalError(err.response?.data?.msg || "Failed to change role");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      await deleteUser(userId, "Admin deletion");
      alert("User deleted successfully");
      loadUsers();
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const handleToggleStatus = async (userId, isActive) => {
    try {
      await toggleUserStatus(userId, !isActive);
      loadUsers();
    } catch (err) {
      alert("Failed to update user status");
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      student: "bg-purple-100 text-purple-800",
      instructor: "bg-orange-100 text-orange-800",
      faculty_advisor: "bg-pink-100 text-pink-800",
      admin: "bg-red-100 text-red-800"
    };
    return badges[role] || "bg-gray-100 text-gray-800";
  };

  const getStatusBadge = (isActive) => {
    return isActive 
      ? "bg-green-100 text-green-800" 
      : "bg-yellow-100 text-yellow-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">Create, manage and control all system users</p>
      </div>

      {/* Filter Section */}
      <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-4">Search & Filter</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search by Name or Email</label>
            <Input
              placeholder="Search..."
              value={filters.search}
              onChange={e => {
                setFilters(prev => ({ ...prev, search: e.target.value }));
                setPage(1);
              }}
              className="h-10 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-400 text-gray-900"
            />
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
            <select
              value={filters.role}
              onChange={e => {
                setFilters(prev => ({ ...prev, role: e.target.value }));
                setPage(1);
              }}
              className="h-10 w-full px-4 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-400 bg-white text-gray-900 font-medium cursor-pointer"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="faculty_advisor">Faculty Advisor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={filters.status}
              onChange={e => {
                setFilters(prev => ({ ...prev, status: e.target.value }));
                setPage(1);
              }}
              className="h-10 w-full px-4 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-400 bg-white text-gray-900 font-medium cursor-pointer"
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading users...</p>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center border border-gray-200">
          <p className="text-gray-600 font-medium">No users found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Email</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Role</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr
                    key={user._id}
                    className={`border-b transition-colors hover:bg-blue-50 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{user.name}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(user.isActive)}`}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setNewRole(user.role);
                            setReason("");
                            setModalError("");
                            setModalSuccess("");
                            setShowRoleModal(true);
                          }}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          Change Role
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user._id, user.isActive)}
                          className={`px-3 py-1 text-white text-xs font-bold rounded-lg transition-colors ${
                            user.isActive
                              ? "bg-yellow-600 hover:bg-yellow-700"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 font-bold text-gray-900">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Change User Role</h3>
            
            {modalError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
                {modalError}
              </div>
            )}

            {modalSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium">
                {modalSuccess}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">User: <span className="font-bold text-gray-900">{selectedUser.name}</span></p>
                <p className="text-sm font-medium text-gray-700">Current Role: <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${getRoleBadge(selectedUser.role)}`}>{selectedUser.role}</span></p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Role</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-400 bg-white text-gray-900 font-medium cursor-pointer"
                >
                  <option value="">Select a role</option>
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="faculty_advisor">Faculty Advisor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason (optional)</label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Why are you changing this role?"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-400 text-gray-900 font-medium"
                  rows="3"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleRoleChange}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Update Role
                </button>
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setModalError("");
                    setModalSuccess("");
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
