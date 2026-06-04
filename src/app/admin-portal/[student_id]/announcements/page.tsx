"use client";

import { useState, useEffect } from "react";
import { PageSkeleton } from "@/components/PageSkeleton";
import { motion } from "framer-motion";
import { 
  Megaphone, Pin, Trash2, Loader2, 
  AlertTriangle, Info, CheckCircle2, Send
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { logActivity } from "@/utils/logger";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAnnouncementsList, invalidateAnnouncementsList } from "@/app/actions/adminActions";

export default function AnnouncementsPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: annData, isLoading: loading } = useQuery({
    queryKey: ["admin_announcements"],
    queryFn: getAnnouncementsList,
  });
  const announcements = annData || [];

  // Form States
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("info");
  const [isPinned, setIsPinned] = useState(false);

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading("Publishing announcement...");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication error");

      const { data, error } = await supabase.from("announcements").insert([{
        title,
        content,
        type,
        is_pinned: isPinned,
        author_id: user.id
      }]).select("*, profiles(full_name)").single();

      if (error) throw error;

      await invalidateAnnouncementsList();

      queryClient.setQueryData(["admin_announcements"], (old: any) => {
        let newAnnouncements = [...(old || []), data];
        newAnnouncements.sort((a, b) => {
          if (a.is_pinned === b.is_pinned) return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          return a.is_pinned ? -1 : 1;
        });
        return newAnnouncements;
      });

      setTitle(""); setContent(""); setType("info"); setIsPinned(false);
      
      await logActivity("CREATE_ANNOUNCEMENT", `Posted announcement: "${title}"`);
      toast.success("Announcement published!", { id: loadingToast });
    } catch (error: any) {
      toast.error(error.message, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
      await invalidateAnnouncementsList();
      queryClient.setQueryData(["admin_announcements"], (old: any) => old?.filter((a: any) => a.id !== id));
      await logActivity("DELETE_ANNOUNCEMENT", `Deleted announcement: "${title}"`);
      toast.success("Announcement removed.");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getTypeStyles = (annType: string) => {
    if (annType === 'warning') return { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-800", icon: <AlertTriangle size={18} className="text-orange-600" /> };
    if (annType === 'success') return { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", icon: <CheckCircle2 size={18} className="text-emerald-600" /> };
    return { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", icon: <Info size={18} className="text-blue-600" /> };
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-6 pb-10">
      
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Megaphone className="text-emerald-600" size={28} /> Announcements
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Broadcast important notices and updates to all students.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* ================= LEFT: CREATE FORM ================= */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm sticky top-6">
          <h2 className="font-black text-slate-800 mb-6 flex items-center gap-2">
            Publish Notice
          </h2>
          
          <form onSubmit={handlePostAnnouncement} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Notice Title</label>
              <input 
                type="text" required value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Server Maintenance Tonight"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700" 
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Message Body</label>
              <textarea 
                required value={content} onChange={e => setContent(e.target.value)}
                placeholder="Type the full announcement here..." rows={5}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-600 resize-none" 
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Alert Type</label>
              <select 
                value={type} onChange={e => setType(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700 cursor-pointer"
              >
                <option value="info">General Info (Blue)</option>
                <option value="warning">Urgent / Warning (Orange)</option>
                <option value="success">Event / Success (Green)</option>
              </select>
            </div>

            <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
              <div className="relative flex items-center">
                <input 
                  type="checkbox" checked={isPinned} onChange={e => setIsPinned(e.target.checked)}
                  className="w-5 h-5 cursor-pointer accent-emerald-600 rounded" 
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800">Pin to Top</span>
                <span className="text-[10px] text-slate-500 font-medium">Shows permanently at the top for students</span>
              </div>
              <Pin size={18} className={`ml-auto ${isPinned ? "text-emerald-600" : "text-slate-400"}`} />
            </label>

            <button type="submit" disabled={isSubmitting} className="w-full bg-[#064e3b] text-white font-bold py-4 rounded-xl hover:bg-[#022c22] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-70 mt-2">
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} Publish Notice
            </button>
          </form>
        </div>

        {/* ================= RIGHT: ANNOUNCEMENTS LIST ================= */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-black text-slate-800 mb-2 flex items-center gap-2">
            Active Notice Board
          </h2>
          
          {announcements.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-10 text-center">
              <Megaphone className="mx-auto text-slate-300 mb-3" size={40} />
              <p className="font-bold text-slate-500">No announcements published yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {announcements.map((ann) => {
                const styles = getTypeStyles(ann.type);
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={ann.id}
                    className={`relative p-5 rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md ${ann.is_pinned ? 'ring-2 ring-emerald-500/20' : ''}`}
                  >
                    {ann.is_pinned && (
                      <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 bg-emerald-100 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 shadow-sm">
                        <Pin size={10} /> Pinned
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl mt-1 shrink-0 ${styles.bg} ${styles.border} border`}>
                        {styles.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-black text-slate-800 text-lg pr-4">{ann.title}</h3>
                            <div className="flex items-center gap-2 mt-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                              <span>By {ann.profiles?.full_name || "Admin"}</span>
                              <span>•</span>
                              <span>{new Date(ann.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => handleDelete(ann.id, ann.title)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="Delete Notice"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        
                        <p className="text-sm text-slate-600 font-medium mt-3 whitespace-pre-wrap leading-relaxed">
                          {ann.content}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}