"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Filter, Eye, Trash2, CheckCircle2, Clock3, XCircle, 
  FileType, Loader2, X, BookOpen, Download, User, Hash
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { invalidateResourceCache } from "@/app/actions/resourceActions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllAdminResources, invalidateAllAdminResources } from "@/app/actions/adminActions";

export default function UploadsClient() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: resourcesData, isLoading: loading } = useQuery({
    queryKey: ["admin_all_resources"],
    queryFn: getAllAdminResources,
  });
  const resources = resourcesData || [];

  const departments = ["CSE", "SWE", "CIS", "EEE", "BBA", "ENG", "PHR", "LAW"];

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "WARNING: This will permanently delete the resource from the system. Are you sure?"
    );
    if (!confirmDelete) return;

    const loadingToast = toast.loading("Deleting resource...");
    try {
      const { error } = await supabase.from("resources").delete().eq("id", id);
      if (error) throw error;
      
      await invalidateResourceCache();
      await invalidateAllAdminResources();
      queryClient.setQueryData(["admin_all_resources"], (old: any) => old?.filter((res: any) => res.id !== id));
      toast.success("Resource permanently removed.", { id: loadingToast });
    } catch (error: any) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  // Filter Logic
  const filteredResources = resources.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         res.course_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || res.status === statusFilter;
    const matchesDept = deptFilter === "all" || res.department === deptFilter;
    
    return matchesSearch && matchesStatus && matchesDept;
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">All Uploaded Resources</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Search, monitor, and manage every resource in the system.</p>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by title or course code..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium shadow-sm"
          />
        </div>
        
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-xs text-slate-600 cursor-pointer shadow-sm"
        >
          <option value="all">Status: All</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>

        <select 
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-xs text-slate-600 cursor-pointer shadow-sm"
        >
          <option value="all">Dept: All</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Stats Summary */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        <span className="shrink-0 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-black uppercase">
          Total: {filteredResources.length} Items
        </span>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black border-b border-slate-200 tracking-widest">
                <th className="px-6 py-4">Resource Info</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Uploader</th>
                <th className="px-6 py-4 text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredResources.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                        <FileType size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 truncate max-w-[200px]">{item.title}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{item.course_code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700">{item.department}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{item.resource_type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {item.status === "approved" ? (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">Approved</span>
                    ) : item.status === "pending" ? (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-orange-50 text-orange-700 border border-orange-100">Pending</span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-red-50 text-red-700 border border-red-100">Rejected</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
                        {item.profiles?.full_name?.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-600 text-xs">{item.profiles?.full_name || "Unknown"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setPreviewUrl(item.file_urls?.[0])}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredResources.length === 0 && <div className="p-10 text-center text-slate-400 font-bold">No resources found.</div>}
        </div>
      </div>

      {/* Preview Modal - FIX: z-[9999] applied */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-5xl h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h3 className="font-bold text-slate-800">Admin Document Viewer</h3>
                <button onClick={() => setPreviewUrl(null)} className="p-2 hover:bg-red-50 text-red-500 rounded-full cursor-pointer"><X size={20}/></button>
              </div>
              <div className="flex-1 bg-slate-200 overflow-auto relative">
                {previewUrl.toLowerCase().includes('.pdf') ? (
                  <iframe src={previewUrl} className="w-full h-full border-none" />
                ) : (
                  <div className="w-full min-h-full flex items-start justify-center bg-slate-900 p-4 sm:p-8">
                    <img src={previewUrl} alt="Document Preview" className="max-w-full h-auto object-contain shadow-2xl rounded-lg" />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}