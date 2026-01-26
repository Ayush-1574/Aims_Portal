import { useState, useEffect } from "react";
import { fetchDashboardStats, fetchGlobalData } from "../api";
import { 
  Users, BookOpen, Shield, Server, Activity, 
  Plus, FileText, Settings, Bell, Search, 
  ArrowUpRight, Clock, CheckCircle
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

  // Mock Activity Data
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
        
        // Fetch Global Data
        const deptData = await fetchGlobalData("DEPARTMENT");
        const sessionData = await fetchGlobalData("SESSION");

        // SAFETY CHECK: Handle if API returns array directly OR { items: [...] }
        const deptList = Array.isArray(deptData) ? deptData : (deptData?.items || []);
        const sessionList = Array.isArray(sessionData) ? sessionData : (sessionData?.items || []);

        setDepartments(deptList);
        setSessions(sessionList);
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-900 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DataSummaryCard title="Active Departments" items={departments} />
            <DataSummaryCard title="Available Sessions" items={sessions} />
          </div>
        </div>

        {/* Right Column: Quick Actions & Server Health */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Settings size={20} className="text-slate-400"/> Quick Actions
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <QuickActionCard title="Find User" icon={Search} color="text-blue-600" bg="bg-blue-50" link="/admin/users" />
            <QuickActionCard title="Add User" icon={Plus} color="text-purple-600" bg="bg-purple-50" link="/admin/create-user" />
            <QuickActionCard title="Manage Data" icon={Settings} color="text-cyan-600" bg="bg-cyan-50" link="/admin/global-data" />
            <QuickActionCard title="System Logs" icon={FileText} color="text-orange-600" bg="bg-orange-50" link="#" />
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

// --- SUB-COMPONENTS (Defined Outside) ---

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

const DataSummaryCard = ({ title, items }) => (
  <Card className="border-slate-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-bold text-slate-700">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {items.filter(i => i.isActive).slice(0, 4).map((item) => (
          <div key={item._id || item.key} className="flex items-center gap-2 text-sm">
            <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
            <span className="text-slate-700">{item.value || item.key}</span>
          </div>
        ))}
        {items.filter(i => i.isActive).length === 0 && <span className="text-xs text-slate-400 italic">No active data</span>}
        {items.filter(i => i.isActive).length > 4 && (
          <p className="text-xs text-slate-500 mt-2">+{items.filter(i => i.isActive).length - 4} more</p>
        )}
      </div>
    </CardContent>
  </Card>
);

const QuickActionCard = ({ title, icon: Icon, color, bg, link }) => (
  <Link to={link} className="block h-full">
    <Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer h-full">
      <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-3">
        <div className={`p-3 rounded-full ${bg} ${color}`}>
          <Icon size={20} />
        </div>
        <span className="text-sm font-bold text-slate-700">{title}</span>
      </CardContent>
    </Card>
  </Link>
);