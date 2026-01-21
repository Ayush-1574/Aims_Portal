import { useState, useEffect } from "react";
import { fetchDashboardStats } from "@/api/admin";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetchDashboardStats();
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers || 0,
      color: "bg-blue-100",
      textColor: "text-blue-600"
    },
    {
      label: "Active Users",
      value: stats?.activeUsers || 0,
      color: "bg-green-100",
      textColor: "text-green-600"
    },
    {
      label: "Students",
      value: stats?.usersByRole?.student || 0,
      color: "bg-purple-100",
      textColor: "text-purple-600"
    },
    {
      label: "Instructors",
      value: stats?.usersByRole?.instructor || 0,
      color: "bg-orange-100",
      textColor: "text-orange-600"
    },
    {
      label: "Faculty Advisors",
      value: stats?.usersByRole?.faculty_advisor || 0,
      color: "bg-pink-100",
      textColor: "text-pink-600"
    },
    {
      label: "Admins",
      value: stats?.usersByRole?.admin || 0,
      color: "bg-red-100",
      textColor: "text-red-600"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">System overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`${card.color} rounded-xl p-6 border-2 border-transparent hover:border-gray-300 transition-all transform hover:scale-105 cursor-pointer`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 text-sm font-medium">{card.label}</p>
                <p className={`text-4xl font-bold ${card.textColor} mt-2`}>
                  {card.value}
                </p>
              </div>
              <span className="text-4xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl p-6 border-2 border-emerald-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="bg-white hover:bg-gray-50 border-2 border-emerald-300 rounded-lg p-4 text-center font-semibold text-emerald-600 transition-all hover:shadow-lg">
            Create User
          </button>
          <button className="bg-white hover:bg-gray-50 border-2 border-cyan-300 rounded-lg p-4 text-center font-semibold text-cyan-600 transition-all hover:shadow-lg">
            Bulk Convert
          </button>
          <button className="bg-white hover:bg-gray-50 border-2 border-blue-300 rounded-lg p-4 text-center font-semibold text-blue-600 transition-all hover:shadow-lg">
            Manage Users
          </button>
          <button className="bg-white hover:bg-gray-50 border-2 border-purple-300 rounded-lg p-4 text-center font-semibold text-purple-600 transition-all hover:shadow-lg">
            View Logs
          </button>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">System Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Last Updated</p>
            <p className="font-semibold text-gray-900">{new Date().toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-600">System Status</p>
            <p className="font-semibold text-green-600">Online</p>
          </div>
          <div>
            <p className="text-gray-600">Total Roles</p>
            <p className="font-semibold text-gray-900">4</p>
          </div>
          <div>
            <p className="text-gray-600">API Endpoint</p>
            <p className="font-semibold text-gray-900">/admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
