"use client";

import { useState, useEffect } from "react";
import { 
  Users, FileCheck, AlertTriangle, Activity, 
  Database, XCircle, Clock, ShieldCheck 
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import PremiumLoading from "@/components/PremiumLoading";

export default function AdminDashboard() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalUploads: 0,
    pendingApprovals: 0,
    approvedToday: 0,
    rejectedToday: 0,
    reportsPending: 0,
    activeModerators: 0
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString();

        const [
          { count: totalUsers },
          { count: totalUploads },
          { count: pendingApprovals },
          { count: approvedToday },
          { count: rejectedToday },
          { count: reportsPending },
          { count: activeModerators }
        ] = await Promise.all([
          supabase.from("profiles").select('*', { count: 'exact', head: true }),
          supabase.from("resources").select('*', { count: 'exact', head: true }),
          supabase.from("resources").select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from("resources").select('*', { count: 'exact', head: true }).eq('status', 'approved').gte('created_at', todayStr),
          supabase.from("resources").select('*', { count: 'exact', head: true }).eq('status', 'rejected').gte('created_at', todayStr),
          supabase.from("reports").select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from("profiles").select('*', { count: 'exact', head: true }).in('role', ['admin', 'moderator', 'super_admin'])
        ]);

        setStats({
          totalUsers: totalUsers || 0,
          totalUploads: totalUploads || 0,
          pendingApprovals: pendingApprovals || 0,
          approvedToday: approvedToday || 0,
          rejectedToday: rejectedToday || 0,
          reportsPending: reportsPending || 0,
          activeModerators: activeModerators || 0
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // ডেটা লোড হওয়ার সময় প্রিমিয়াম লোডিং স্ক্রিন দেখাবে
  if (loading) {
    return <PremiumLoading />;
  }

  const statCards = [
    { title: "Total Users", count: stats.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { title: "Total Uploads", count: stats.totalUploads, icon: Database, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
    { title: "Pending Approvals", count: stats.pendingApprovals, icon: Clock, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
    { title: "Approved Today", count: stats.approvedToday, icon: FileCheck, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { title: "Rejected Today", count: stats.rejectedToday, icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
    { title: "Reports Pending", count: stats.reportsPending, icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
    { title: "Active Staff", count: stats.activeModerators, icon: ShieldCheck, color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-100" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">System Overview</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Real-time statistics of platform activities.</p>
      </div>

      {/* Dense & Compact Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className={`bg-white rounded-xl p-5 border shadow-sm flex flex-col justify-between ${stat.border}`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                <stat.icon size={20} className={stat.color} />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-black text-gray-800">{stat.count}</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Required Alert */}
      {stats.pendingApprovals > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-orange-800">
            <Clock size={20} className="text-orange-600" />
            <span className="font-bold text-sm">Action Required: {stats.pendingApprovals} uploads are waiting in the review queue.</span>
          </div>
          <a href="/admin-portal/pending" className="px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded-lg hover:bg-orange-700 transition-colors cursor-pointer shadow-sm">
            Review Now
          </a>
        </div>
      )}
    </div>
  );
}