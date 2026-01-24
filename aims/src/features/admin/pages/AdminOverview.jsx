import { useState, useEffect } from "react";
import { fetchDashboardStats, fetchGlobalData } from "../api";
import { 
  Users, BookOpen, Shield, Server, Activity, 
  Plus, FileText, Settings, Bell, Search, 
  ArrowUpRight, Clock, CheckCircle, AlertCircle 
} from "lucide-react";
import UserDetailsCard from "@/components/UserDetailsCard";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [sessions, setSessions] = useState([]);

  // Mock Activity Data (Placeholder for real logs)
  const recentActivity = [
    { id: 1, action: "New User Registration", user: "Rahul Verma (Student)", time: "2 mins ago", type: "success" },
    { id: 2, action: "Course Created", user: "Dr. Anita Singh", time: "15 mins ago", type: "info" },
    { id: 3, action: "System Update", user: "System", time: "1 hour ago", type: "warning" },
    { id: 4, action: "Enrollment Rejected", user: "Advisor Dashboard", time: "3 hours ago", type: "error" },
  ];

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchDashboardStats();
        setStats(data);
        
        // Load departments and sessions
        const deptData = await fetchGlobalData("DEPARTMENT");
        const sessionData = await fetchGlobalData("SESSION");
        console.log("Admin Overview - Depts:", deptData);
        console.log("Admin Overview - Sessions:", sessionData);
        setDepartments(deptData.items || []);
        setSessions(sessionData.items || []);
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
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // Helper for Stat Cards
  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend > 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
              {trend > 0 && <ArrowUpRight size={14} />}
              <span>{trend > 0 ? `+${trend}% from last week` : "Stable"}</span>
            </div>
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon size={24} className="text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">System overview, user metrics, and health status.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Bell size={18} /> <span className="hidden sm:inline">Notifications</span>
          </Button>
          <Link to="/admin/create-user">
            <Button className="gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-lg">
              <Plus size={18} /> Add New User
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. User Identity Card */}
      <UserDetailsCard />

      {/* 3. Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats?.totalUsers || 0} 
          icon={Users} 
          color="bg-blue-500"
          trend={5}
        />
        <StatCard 
          title="Active Instructors" 
          value={stats?.usersByRole?.instructor || 0} 
          icon={BookOpen} 
          color="bg-orange-500"
          trend={0}
        />
        <StatCard 
          title="System Admins" 
          value={stats?.usersByRole?.admin || 0} 
          icon={Shield} 
          color="bg-red-500"
          trend={0}
        />
        <StatCard 
          title="Server Status" 
          value="Online" 
          icon={Activity} 
          color="bg-emerald-500"
          trend={99}
        />
      </div>

      {/* 4. Split View: Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Activity Log */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Clock size={20} className="text-slate-400"/> Recent Activity
          </h2>
          
          <Card className="border-slate-200 bg-white">
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {recentActivity.map((log) => (
                  <div key={log.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${
                        log.type === 'success' ? 'bg-emerald-500' : 
                        log.type === 'warning' ? 'bg-amber-500' : 
                        log.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{log.action}</p>
                        <p className="text-xs text-slate-500">{log.user}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                      {log.time}
                    </span>
                  </div>
                ))}
                <div className="p-4 text-center border-t border-slate-50">
                  <button className="text-sm font-bold text-blue-600 hover:text-blue-700">View All Logs</button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Global Data Summary */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-700">Active Departments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {departments.filter(d => d.isActive).slice(0, 4).map((dept) => (
                    <div key={dept._id} className="flex items-center gap-2 text-sm">
                      <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-700">{dept.value}</span>
                    </div>
                  ))}
                  {departments.filter(d => d.isActive).length > 4 && (
                    <p className="text-xs text-slate-500 mt-2">+{departments.filter(d => d.isActive).length - 4} more</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-700">Available Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sessions.filter(s => s.isActive).slice(0, 4).map((session) => (
                    <div key={session._id} className="flex items-center gap-2 text-sm">
                      <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-700">{session.value}</span>
                    </div>
                  ))}
                  {sessions.filter(s => s.isActive).length > 4 && (
                    <p className="text-xs text-slate-500 mt-2">+{sessions.filter(s => s.isActive).length - 4} more</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Quick Actions & Server Health */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Settings size={20} className="text-slate-400"/> Quick Actions
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <Link to="/admin/users" className="block">
              <Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer h-full">
                <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-3">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                    <Search size={20} />
                  </div>
                  <span className="text-sm font-bold text-slate-700">Find User</span>
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin/create-user" className="block">
              <Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer h-full">
                <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-3">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-full">
                    <Plus size={20} />
                  </div>
                  <span className="text-sm font-bold text-slate-700">Add User</span>
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin/global-data" className="block">
              <Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer h-full">
                <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-3">
                  <div className="p-3 bg-cyan-50 text-cyan-600 rounded-full">
                    <Settings size={20} />
                  </div>
                  <span className="text-sm font-bold text-slate-700">Manage Data</span>
                </CardContent>
              </Card>
            </Link>

            <div className="block">
              <Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer h-full">
                <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-3">
                  <div className="p-3 bg-orange-50 text-orange-600 rounded-full">
                    <FileText size={20} />
                  </div>
                  <span className="text-sm font-bold text-slate-700">System Logs</span>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Database Health Widget */}
          <Card className="bg-slate-900 text-white border-none shadow-xl mt-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Server size={18} className="text-emerald-400"/>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Database</h3>
                    <p className="text-xs text-slate-400">MongoDB Cluster</p>
                  </div>
                </div>
                <div className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                  HEALTHY
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Latency</span>
                  <span className="text-white font-mono">24ms</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full w-[98%]"></div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}