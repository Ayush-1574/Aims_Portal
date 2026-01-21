import { useState, useEffect } from "react";
import { fetchAuditLogs } from "@/api/admin";
import { Button } from "@/components/ui/button";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAction, setSelectedAction] = useState("");

  const actions = [
    "create_user",
    "change_role",
    "delete_user",
    "deactivate_user",
    "activate_user",
    "edit_user",
    "bulk_role_change"
  ];

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await fetchAuditLogs(selectedAction, page, 15);
      setLogs(res.data.logs);
      setTotalPages(res.data.pagination.pages);
    } catch (err) {
      console.error("Failed to load logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, selectedAction]);

  const getActionBadge = (action) => {
    const colors = {
      create_user: "bg-green-100 text-green-800",
      change_role: "bg-blue-100 text-blue-800",
      delete_user: "bg-red-100 text-red-800",
      deactivate_user: "bg-yellow-100 text-yellow-800",
      activate_user: "bg-green-100 text-green-800",
      edit_user: "bg-purple-100 text-purple-800",
      bulk_role_change: "bg-indigo-100 text-indigo-800"
    };
    return colors[action] || "bg-gray-100 text-gray-800";
  };

  const getActionIcon = (action) => {
    return "";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2 text-gray-900">Audit Logs</h1>
        <p className="text-gray-600">View all system administration activities</p>
      </div>

      {/* Filter */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Filter by Action</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setSelectedAction("");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              selectedAction === ""
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-white border-2 border-gray-300 text-gray-800 hover:border-emerald-600 hover:text-emerald-700"
            }`}
          >
            All Actions
          </button>
          {actions.map(action => (
            <button
              key={action}
              onClick={() => {
                setSelectedAction(action);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedAction === action
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-white border-2 border-gray-300 text-gray-800 hover:border-emerald-600 hover:text-emerald-700"
              }`}
            >
              {action.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Logs List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading logs...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-600 text-lg font-medium">No logs found</p>
            </div>
          ) : (
            logs.map((log, idx) => (
              <div
                key={log._id}
                className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getActionIcon(log.action)}</span>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getActionBadge(log.action)}`}>
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Admin</p>
                        <p className="text-sm font-medium text-gray-900">
                          {log.adminId?.name || "Unknown"} ({log.adminId?.email})
                        </p>
                      </div>

                      {log.targetUserId && (
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">Target User</p>
                          <p className="text-sm font-medium text-gray-900">
                            {log.targetUserId?.name || "Deleted"} ({log.targetUserId?.email || "-"})
                          </p>
                        </div>
                      )}

                      {log.reason && (
                        <div className="md:col-span-2">
                          <p className="text-xs text-gray-600 font-semibold">Reason</p>
                          <p className="text-sm text-gray-700">{log.reason}</p>
                        </div>
                      )}

                      {log.changes && (
                        <div className="md:col-span-2">
                          <p className="text-xs text-gray-600 font-semibold">Changes</p>
                          <div className="text-xs mt-1 space-y-1 bg-gray-50 p-2 rounded">
                            {log.changes.before && (
                              <p className="text-red-600">
                                Before: {JSON.stringify(log.changes.before)}
                              </p>
                            )}
                            {log.changes.after && (
                              <p className="text-green-600">
                                After: {JSON.stringify(log.changes.after)}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-600">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{log.ipAddress || "N/A"}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {logs.length > 0 && (
        <div className="bg-gray-50 rounded-lg px-6 py-4 flex items-center justify-between border border-gray-200">
          <Button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 disabled:opacity-50"
          >
            ← Previous
          </Button>
          <span className="text-sm font-medium text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 disabled:opacity-50"
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  );
}
