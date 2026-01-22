import { useState, useEffect } from "react";
import { fetchDashboardStats } from "@/api/admin";
import UserDetailsCard from "@/components/UserDetailsCard";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchDashboardStats();
        setStats(data);
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
      icon: "👥",
      color: "from-blue-600 to-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      label: "Active Users",
      value: stats?.activeUsers || 0,
      icon: "✅",
      color: "from-green-600 to-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      label: "Students",
      value: stats?.usersByRole?.student || 0,
      icon: "👨‍🎓",
      color: "from-purple-600 to-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      label: "Instructors",
      value: stats?.usersByRole?.instructor || 0,
      icon: "📚",
      color: "from-orange-600 to-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    },
    {
      label: "Faculty Advisors",
      value: stats?.usersByRole?.faculty_advisor || 0,
      icon: "👨‍🏫",
      color: "from-pink-600 to-pink-500",
      bgColor: "bg-pink-50",
      textColor: "text-pink-600"
    },
    {
      label: "Admins",
      value: stats?.usersByRole?.admin || 0,
      icon: "⚙️",
      color: "from-red-600 to-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-600"
    }
  ];

  return (
    <div className="space-y-8">
      <UserDetailsCard />

      <div>
        <h1 className="text-4xl font-bold mb-2 text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">System overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`${card.bgColor} rounded-xl p-6 border-2 border-transparent hover:border-gray-300 transition-all transform hover:scale-105 cursor-pointer shadow-sm`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{card.label}</p>
                <p className={`text-5xl font-bold ${card.textColor} mt-3`}>
                  {card.value}
                </p>
              </div>
              <span className="text-4xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Role Distribution</h3>
          <div className="space-y-4">
            {[
              { role: "Students", count: stats?.usersByRole?.student || 0, color: "bg-purple-500", width: stats?.usersByRole?.student || 0 },
              { role: "Instructors", count: stats?.usersByRole?.instructor || 0, color: "bg-orange-500", width: stats?.usersByRole?.instructor || 0 },
              { role: "Faculty Advisors", count: stats?.usersByRole?.faculty_advisor || 0, color: "bg-pink-500", width: stats?.usersByRole?.faculty_advisor || 0 },
              { role: "Admins", count: stats?.usersByRole?.admin || 0, color: "bg-red-500", width: stats?.usersByRole?.admin || 0 }
            ].map((item, idx) => {
              const maxWidth = Math.max(stats?.usersByRole?.student || 0, stats?.usersByRole?.instructor || 0, stats?.usersByRole?.faculty_advisor || 0, stats?.usersByRole?.admin || 0);
              const percentage = maxWidth > 0 ? (item.width / maxWidth) * 100 : 0;
              return (
                <div key={idx}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.role}</span>
                    <span className="text-sm font-bold text-gray-900">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`${item.color} h-full rounded-full transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl p-6 border-2 border-emerald-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-700">Server Status</span>
              </div>
              <span className="text-sm font-bold text-green-600">Online</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="font-medium text-gray-700">Active Users</span>
              </div>
              <span className="text-sm font-bold text-blue-600">{stats?.activeUsers || 0}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                <span className="font-medium text-gray-700">Total Users</span>
              </div>
              <span className="text-sm font-bold text-purple-600">{stats?.totalUsers || 0}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                <span className="font-medium text-gray-700">Last Updated</span>
              </div>
              <span className="text-sm font-bold text-amber-600">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Info</h3>
          <div className="space-y-3">
            <p className="text-sm text-gray-700"><span className="font-bold text-indigo-600">System Status:</span> <span className="text-green-600 font-semibold">Active & Running</span></p>
            <p className="text-sm text-gray-700"><span className="font-bold text-indigo-600">Total Roles:</span> <span className="font-semibold">4 (Student, Instructor, Advisor, Admin)</span></p>
            <p className="text-sm text-gray-700"><span className="font-bold text-indigo-600">API Status:</span> <span className="text-green-600 font-semibold">Connected</span></p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Management Tools</h3>
          <div className="space-y-3">
            <p className="text-sm text-gray-700">📋 <span className="font-medium">User Management:</span> View, Edit & Delete users</p>
            <p className="text-sm text-gray-700">👤 <span className="font-medium">User Details:</span> View detailed user information</p>
            <p className="text-sm text-gray-700">🗑️ <span className="font-medium">Permanent Delete:</span> Remove users from database</p>
          </div>
        </div>
      </div>
    </div>
  );
}
