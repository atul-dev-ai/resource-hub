"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Eye, CheckCircle, XCircle, Trash2, 
  Loader2, AlertCircle, Clock, BookOpen 
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { confirmAlert } from "@/utils/toastConfirm";
import { invalidateResourceCache } from "@/app/actions/resourceActions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPendingResources, invalidatePendingResources } from "@/app/actions/adminActions";
import { createNotification } from "@/app/actions/notificationActions";

export default function PendingUploadsPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: pendingData, isLoading: loading } = useQuery({
    queryKey: ["admin_pending_resources"],
    queryFn: getPendingResources,
  });

  const pendingItems = pendingData || [];

  // ================= ACTION HANDLERS =================
  
  const handleApprove = async (id: string) => {
    const loadingToast = toast.loading("Approving resource...");
    try {
      const item = pendingItems.find((i: any) => i.id === id);
      const { error } = await supabase.from("resources").update({ status: "approved" }).eq("id", id);
      if (error) throw error;
      
      await invalidateResourceCache();
      await invalidatePendingResources();

      // Optimistic UI update: Remove from list instantly
      queryClient.setQueryData(["admin_pending_resources"], (old: any) => old?.filter((item: any) => item.id !== id));
      
      if (item) {
        // Notify uploader
        await createNotification({
          user_id: item.uploader_id,
          title: "Resource Approved",
          message: `Your upload "${item.title}" has been approved!`,
          type: "RESOURCE_APPROVED",
          link: `/student-portal/${item.uploader_id}/my-uploads`
        });
        
        // Notify all users
        await createNotification({
          target_role: "all",
          title: "New Resource Added",
          message: `A new resource "${item.title}" has been added to ${item.course_code}.`,
          type: "NEW_RESOURCE",
          link: `/student-portal/resources`
        });
      }

      toast.success("Resource Approved!", { id: loadingToast });
    } catch (error: any) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  const handleReject = async (id: string) => {
    const loadingToast = toast.loading("Rejecting resource...");
    try {
      const item = pendingItems.find((i: any) => i.id === id);
      const { error } = await supabase.from("resources").update({ status: "rejected" }).eq("id", id);
      if (error) throw error;
      
      await invalidateResourceCache();
      await invalidatePendingResources();

      queryClient.setQueryData(["admin_pending_resources"], (old: any) => old?.filter((item: any) => item.id !== id));
      
      if (item) {
        await createNotification({
          user_id: item.uploader_id,
          title: "Resource Rejected",
          message: `Your upload "${item.title}" was rejected by admin.`,
          type: "RESOURCE_REJECTED",
          link: `/student-portal/${item.uploader_id}/my-uploads`
        });
      }
      
      toast.success("Resource Rejected.", { id: loadingToast });
    } catch (error: any) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirmAlert("Are you sure you want to permanently delete this resource from the database?");
    if (!isConfirmed) return;

    const loadingToast = toast.loading("Deleting resource...");
    try {
      // Note: Ideally, you also want to delete the file from the storage bucket here
      const { error } = await supabase.from("resources").delete().eq("id", id);
      if (error) throw error;
      
      await invalidateResourceCache();
      await invalidatePendingResources();

      queryClient.setQueryData(["admin_pending_resources"], (old: any) => old?.filter((item: any) => item.id !== id));
      toast.success("Resource Deleted.", { id: loadingToast });
    } catch (error: any) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Review Queue</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Review and moderate newly uploaded resources before they go public.
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 px-4 py-2 rounded-lg flex items-center gap-2 text-orange-700">
          <Clock size={18} />
          <span className="font-bold text-sm">{pendingItems.length} Pending Items</span>
        </div>
      </div>

      {pendingItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 flex flex-col items-center text-center shadow-sm">
          <div className="p-4 bg-emerald-50 rounded-full mb-4">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">All caught up!</h2>
          <p className="text-slate-500 mt-2">There are no pending uploads in the queue right now.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-200">
                  <th className="px-6 py-4">Resource Details</th>
                  <th className="px-6 py-4">Academic Info</th>
                  <th className="px-6 py-4">Uploader</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {pendingItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    
                    {/* Resource Details */}
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 truncate max-w-[250px]">{item.title}</p>
                          <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded mt-1 tracking-wider">
                            {item.resource_type}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Academic Info */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-800">{item.course_code}</span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                          <BookOpen size={12} /> {item.department} • {item.semester}
                        </div>
                      </div>
                    </td>

                    {/* Uploader */}
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-700">
                        {item.profiles?.full_name || "Unknown Student"}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setPreviewUrl(item.file_urls?.[0])}
                          title="View Document"
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                        >
                          <Eye size={18} />
                        </button>
                        
                        <div className="w-px h-6 bg-slate-200 mx-1"></div>

                        <button 
                          onClick={() => handleApprove(item.id)}
                          title="Approve"
                          className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors border border-emerald-200 shadow-sm"
                        >
                          <CheckCircle size={18} />
                        </button>

                        <button 
                          onClick={() => handleReject(item.id)}
                          title="Reject"
                          className="p-2 text-orange-600 bg-orange-50 hover:bg-orange-600 hover:text-white rounded-lg transition-colors border border-orange-200 shadow-sm"
                        >
                          <XCircle size={18} />
                        </button>

                        <button 
                          onClick={() => handleDelete(item.id)}
                          title="Delete Permanently"
                          className="p-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors border border-transparent"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FULL SCREEN PREVIEW MODAL (Admin Version) */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} 
              className="relative w-full max-w-5xl h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <FileText size={18} className="text-indigo-600" /> Admin Document Viewer
                </h3>
                <button 
                  onClick={() => setPreviewUrl(null)} 
                  className="p-2 text-slate-500 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
                >
                  <XCircle size={24} />
                </button>
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