import { useState, useEffect } from "react";
import { fetchAllUsers, deleteUser, fetchUserDetails, updateUser } from "../api";
import { Search, Filter, Trash2, Edit2, ChevronLeft, ChevronRight, X, User, Save } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function UserManagement() {
  // --- STATE ---
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ search: "", role: "" });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // --- ACTIONS ---
  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetchAllUsers(filters, page, 8); // Limit 8 items per page
      setUsers(res.users || []);
      setTotalPages(res.pagination?.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, [page, filters]);

  const handleEdit = async (user) => {
    // 1. Open modal with basic info immediately
    setIsModalOpen(true);
    setModalLoading(true);
    setEditingUser(user);

    try {
      // 2. Fetch full details (like entry_no, department)
      const details = await fetchUserDetails(user._id);
      setEditingUser(details);
    } catch (err) {
      alert("Failed to fetch full user details");
    } finally {
      setModalLoading(false);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await updateUser(editingUser._id, editingUser);
      setIsModalOpen(false);
      loadUsers(); // Refresh table
    } catch (err) {
      alert(err.response?.data?.msg || "Update failed");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure? This action is irreversible.")) return;
    try {
      await deleteUser(id);
      loadUsers();
    } catch (err) {
      alert("Delete failed");
    }
  };

  // --- RENDER HELPERS ---
  const getRoleBadgeVariant = (role) => {
    if (role === 'faculty_advisor') return 'advisor';
    return role; // 'student', 'instructor', 'admin' match the variants
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      {/* Header & Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 mt-1">Manage accounts, roles, and permissions.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white/60 backdrop-blur-md p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input 
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-transparent hover:bg-white focus:bg-white border-2 border-transparent focus:border-blue-500 outline-none transition-all font-medium"
            placeholder="Search users..."
            value={filters.search}
            onChange={(e) => { setFilters(prev => ({ ...prev, search: e.target.value })); setPage(1); }}
          />
        </div>
        <div className="relative md:w-64">
           <Filter className="absolute left-3 top-3 text-slate-400" size={20} />
           <select 
             className="w-full h-11 pl-10 pr-4 rounded-xl bg-transparent hover:bg-white focus:bg-white border-2 border-transparent focus:border-blue-500 outline-none font-medium appearance-none cursor-pointer"
             value={filters.role}
             onChange={(e) => { setFilters(prev => ({ ...prev, role: e.target.value })); setPage(1); }}
           >
             <option value="">All Roles</option>
             <option value="student">Students</option>
             <option value="instructor">Instructors</option>
             <option value="faculty_advisor">Advisors</option>
             <option value="admin">Admins</option>
           </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="min-h-[400px]">
        {loading ? (
           <div className="flex flex-col items-center justify-center h-64 text-slate-400 animate-pulse">
             <div className="w-12 h-12 bg-slate-200 rounded-full mb-4"></div>
             <p>Loading users...</p>
           </div>
        ) : users.length === 0 ? (
           <div className="text-center py-20 bg-white/40 rounded-3xl border border-dashed border-slate-300">
             <p className="text-slate-500 font-medium">No users found matching your filters.</p>
           </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Profile</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
                        {user.name?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-slate-600">
                      {user.department || user.advisor_department || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(user)}>
                        <Edit2 size={18} className="text-blue-600" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(user._id)}>
                        <Trash2 size={18} className="text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-between items-center px-4">
          <Button 
            variant="outline" 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
            className="gap-2"
          >
            <ChevronLeft size={16}/> Previous
          </Button>
          <span className="text-sm font-bold text-slate-500">Page {page} of {totalPages}</span>
          <Button 
            variant="outline" 
            disabled={page === totalPages} 
            onClick={() => setPage(p => p + 1)}
            className="gap-2"
          >
            Next <ChevronRight size={16}/>
          </Button>
        </div>
      )}

      {/* --- EDIT MODAL OVERLAY --- */}
      {isModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
            
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">Edit User</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveUser} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                <Input 
                  value={editingUser.name} 
                  onChange={e => setEditingUser({...editingUser, name: e.target.value})} 
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                <Input 
                  value={editingUser.email} 
                  disabled 
                  className="bg-slate-50 text-slate-500 border-dashed"
                />
              </div>

              {/* Dynamic Fields based on Role */}
              {editingUser.role === 'student' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Entry No</label>
                    <Input 
                      value={editingUser.entry_no || ""} 
                      onChange={e => setEditingUser({...editingUser, entry_no: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Dept</label>
                    <Input 
                      value={editingUser.department || ""} 
                      onChange={e => setEditingUser({...editingUser, department: e.target.value})} 
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" isLoading={modalLoading}>
                  <Save size={18} className="mr-2"/> Save Changes
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}