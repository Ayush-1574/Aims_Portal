import { useState, useEffect } from "react";
import { fetchAllUsers, deleteUser, fetchUserDetails, updateUser } from "../api";
import { Search, Filter, Trash2, Edit2, ChevronLeft, ChevronRight, X, Save, Users, FilterX, ListFilter } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ search: "", role: "ALL" });
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const loadUsers = async () => {
    if (!appliedFilters) return;
    setLoading(true);
    try {
      const query = { 
        search: appliedFilters.search, 
        role: appliedFilters.role === "ALL" ? "" : appliedFilters.role 
      };
      const res = await fetchAllUsers(query, page, 8); 
      setUsers(res.users || []);
      setTotalPages(res.pagination?.pages || 1);
    } catch (err) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, [page, appliedFilters]);

  const handleSearch = () => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const handleReset = () => {
    setFilters({ search: "", role: "ALL" });
    setAppliedFilters(null);
    setUsers([]);
    setPage(1);
  };

  const handleEdit = async (user) => {
    setIsModalOpen(true);
    setModalLoading(true);
    setEditingUser(user);
    try {
      const details = await fetchUserDetails(user._id);
      setEditingUser(details);
    } catch (err) {
      toast.error("Failed to fetch user details");
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
      loadUsers(); 
      toast.success("User updated");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Update failed");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure? This action is irreversible.")) return;
    try {
      await deleteUser(id);
      loadUsers();
      toast.success("User deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // --- BADGE STYLING HELPER ---
  const getRoleBadgeStyle = (role) => {
    switch(role) {
      case 'student':
        return "bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200";
      case 'instructor':
        return "bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200";
      case 'faculty_advisor':
        return "bg-pink-100 text-pink-700 hover:bg-pink-100 border-pink-200";
      case 'admin':
        return "bg-red-100 text-red-700 hover:bg-red-100 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      <div className="flex flex-col md:flex-row gap-4 justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 mt-1">Manage accounts, roles, and permissions.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-3 text-slate-400" size={16} />
          <Input 
            className="pl-9 bg-white"
            placeholder="Search users by name or email..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
        
        <Select value={filters.role} onValueChange={(val) => setFilters(prev => ({ ...prev, role: val }))}>
          <SelectTrigger>
             <div className="flex items-center gap-2 text-slate-600">
                <ListFilter size={16} />
                <SelectValue placeholder="Role" />
             </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="student">Students</SelectItem>
            <SelectItem value="instructor">Instructors</SelectItem>
            <SelectItem value="faculty_advisor">Advisors</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
           <Button onClick={handleSearch} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white">
             Search
           </Button>
           <Button variant="ghost" onClick={handleReset} className="text-slate-500 hover:bg-slate-100">
             <FilterX size={18} />
           </Button>
        </div>
      </div>

      <div className="min-h-[400px]">
        {!appliedFilters ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white/50 rounded-2xl border-2 border-dashed border-slate-200">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-400">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Search Users</h3>
              <p className="text-slate-500 max-w-sm mt-2">
                Enter a name or select a role above and click <b>Search</b> to find users.
              </p>
            </div>
        ) : loading ? (
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
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {/* APPLIED COLOR CLASS HERE */}
                    <Badge className={getRoleBadgeStyle(user.role)}>
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

      {!loading && appliedFilters && totalPages > 1 && (
        <div className="flex justify-between items-center px-4">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="gap-2">
            <ChevronLeft size={16}/> Previous
          </Button>
          <span className="text-sm font-bold text-slate-500">Page {page} of {totalPages}</span>
          <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="gap-2">
            Next <ChevronRight size={16}/>
          </Button>
        </div>
      )}

      {isModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">Edit User</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition outline-none">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveUser} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                <Input value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                <Input value={editingUser.email} disabled className="bg-slate-50 text-slate-500 border-dashed" />
              </div>
              {editingUser.role === 'student' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Entry No</label>
                    <Input value={editingUser.entry_no || ""} onChange={e => setEditingUser({...editingUser, entry_no: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Dept</label>
                    <Input value={editingUser.department || ""} onChange={e => setEditingUser({...editingUser, department: e.target.value})} />
                  </div>
                </div>
              )}
              <div className="pt-4 flex gap-3">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-slate-900 text-white" isLoading={modalLoading}><Save size={18} className="mr-2"/> Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}