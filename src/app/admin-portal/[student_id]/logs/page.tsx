"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Activity, Search, Clock, User, Shield, 
  Terminal, Loader2, RefreshCw 
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { getAdminLogs } from "@/app/actions/adminActions";

export default function ActivityLogsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: logsData, isLoading: loading, refetch } = useQuery({
    queryKey: ["admin_logs"],
    queryFn: getAdminLogs,
  });

  const logs = logsData || [];

  const filteredLogs = logs.filter(log => 
    log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionColor = (action: string) => {
    if (action.includes("DELETE") || action.includes("BAN")) return "text-red-600 bg-red-50 border-red-100";
    if (action.includes("APPROVE") || action.includes("SUCCESS")) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (action.includes("LOGIN")) return "text-blue-600 bg-blue-50 border-blue-100";
    return "text-slate-600 bg-slate-50 border-slate-100";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Terminal size={24} className="text-emerald-600" /> System Activity Logs
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Monitor real-time actions across the platform.</p>
        </div>
        <button 
          onClick={() => refetch()} 
          className="p-2.5 bg-emerald-500 border border-slate-200 rounded-xl hover:bg-slate-500 transition-all cursor-pointer shadow-sm"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Search & Filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-300 w-5 h-5" />
        <input 
          type="text" placeholder="Search logs by email, action, or details..." 
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 text-gray-500 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm shadow-sm"
        />
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors text-xs font-medium">
                    <td className="px-6 py-4 text-slate-400">
                      <div className="flex items-center gap-2">
                        <Clock size={12} />
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User size={12} className="text-slate-400" />
                        <span className="text-slate-700 font-bold">{log.user_email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md border font-black uppercase text-[9px] ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 italic">
                      "{log.description}"
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}