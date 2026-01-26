import { useState, useEffect } from "react";
import {
  fetchGlobalData,
  createGlobalDataEntry,
  updateGlobalDataEntry,
  deleteGlobalDataEntry
} from "../api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function GlobalDataManagement() {
  const [activeTab, setActiveTab] = useState("DEPARTMENT");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [formData, setFormData] = useState({ key: "", value: "" });

  const tabs = [
    { type: "DEPARTMENT", label: "Departments" },
    { type: "SESSION", label: "Sessions" },
    { type: "COURSE_CODE", label: "Courses" }
  ];

  // Load data for active tab
  useEffect(() => {
    loadData(activeTab);
  }, [activeTab]);

  const loadData = async (type) => {
    setLoading(true);
    try {
      const data = await fetchGlobalData(type);
      setItems(data.items || []);
    } catch (err) {
      console.error("Error loading data:", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingItemId(null);
    setFormData({ key: "", value: "" });
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingItemId(item._id);
    setFormData({ key: item.key, value: item.value });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.key || !formData.value) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      if (editingItemId) {
        // Update
        await updateGlobalDataEntry(activeTab, editingItemId, formData.value, true);
        toast.success("Updated successfully");
      } else {
        // Create
        await createGlobalDataEntry(activeTab, formData.key, formData.value);
        toast.success("Created successfully");
      }
      setShowForm(false);
      loadData(activeTab);
    } catch (err) {
      console.error("Error:", err);
      toast.error(err.response?.data?.msg || "Operation failed");
    }
  };

  const handleDelete = async (itemId) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      await deleteGlobalDataEntry(activeTab, itemId);
      toast.success("Deleted successfully");
      loadData(activeTab);
    } catch (err) {
      console.error("Error:", err);
      toast.error(err.response?.data?.msg || "Delete failed");
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await updateGlobalDataEntry(activeTab, item._id, item.value, !item.isActive);
      toast.success(item.isActive ? "Disabled" : "Enabled");
      loadData(activeTab);
    } catch (err) {
      console.error("Error:", err);
      toast.error("Update failed");
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Global Data Management</h1>
          <p className="text-slate-500 mt-1">Manage departments, sessions, and grade scales</p>
        </div>
        {!showForm && (
          <Button 
            onClick={handleAddNew}
            className="gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-lg"
          >
            <Plus size={18} /> Add New
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.type}
            onClick={() => setActiveTab(tab.type)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === tab.type
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>{editingItemId ? "Edit" : "Add New"} {activeTab.toLowerCase()}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="key">Key/Code</Label>
                <Input
                  id="key"
                  placeholder={activeTab === "DEPARTMENT" ? "e.g., CSE" : activeTab === "SESSION" ? "e.g., 2025-I" : activeTab === "COURSE_CODE" ? "e.g., CS101" : "e.g., A"}
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  disabled={editingItemId !== null}
                  required
                />
              </div>

              <div>
                <Label htmlFor="value">Display Value</Label>
                <Input
                  id="value"
                  placeholder={activeTab === "DEPARTMENT" ? "e.g., Computer Science & Engineering" : activeTab === "SESSION" ? "e.g., Spring 2025" : activeTab === "COURSE_CODE" ? "e.g., Data Structures" : "e.g., Excellent"}
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white"
                >
                  {editingItemId ? "Update" : "Create"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card className="border-slate-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-300 border-t-slate-900"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p>No items found. Create one to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 border-slate-200">
                    <TableHead className="font-bold text-slate-600">Key</TableHead>
                    <TableHead className="font-bold text-slate-600">Display Value</TableHead>
                    <TableHead className="font-bold text-slate-600">Status</TableHead>
                    <TableHead className="font-bold text-slate-600 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item._id} className="border-slate-200 hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-900">{item.key}</TableCell>
                      <TableCell className="text-slate-700">{item.value}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.isActive ? (
                            <>
                              <CheckCircle size={16} className="text-emerald-500" />
                              <span className="text-sm text-emerald-600 font-medium">Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={16} className="text-slate-400" />
                              <span className="text-sm text-slate-500 font-medium">Inactive</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <button
                          onClick={() => handleToggleActive(item)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                          {item.isActive ? "Disable" : "Enable"}
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-100 transition-colors"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
