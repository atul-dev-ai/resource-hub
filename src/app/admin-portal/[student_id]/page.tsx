"use client";

import { useState, useEffect } from "react";
import { 
  Users, FileCheck, AlertTriangle, Activity, 
  Database, XCircle, Clock, ShieldCheck 
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import PremiumLoading from "@/components/PremiumLoading";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getAdminDashboardStats } from "@/app/actions/adminActions";

export default function AdminDashboard() {
  const params = useParams();
  const student_id = params?.student_id || '';
  const { data: statsData, isLoading: loading } = useQuery({
    queryKey: ["admin_dashboard_stats"],
    queryFn: getAdminDashboardStats,
  });

  const stats = statsData || {
    totalUsers: 0,
    totalUploads: 0,
    pendingApprovals: 0,
    approvedToday: 0,
    rejectedToday: 0,
    reportsPending: 0,
    activeModerators: 0
  };

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
          <a href={`/admin-portal/${student_id}/pending`} className="px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded-lg hover:bg-orange-700 transition-colors cursor-pointer shadow-sm">
            Review Now
          </a>
        </div>
      )}
    </div>
  );
}