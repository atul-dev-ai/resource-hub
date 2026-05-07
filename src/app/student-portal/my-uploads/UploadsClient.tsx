"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, FileText, Trash2, Loader2, 
  Plus, Search, Filter, BookOpen, Building2, 
  CalendarClock, X, AlertCircle, CheckCircle2 
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { logActivity } from "@/utils/logger";
import toast from "react-hot-toast";

export default function UploadsClient() {
  const supabase = createClient();
  
  // Data States
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myFiles, setMyFiles] = useState<any[]>([]);
  
  // Dropdown Data
  const [departments, setDepartments] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  // Form States
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState({
    title: "",
    dept: "",
    semester: "",
    course: "",
    sessionId: ""
  });

  // Security: Rate Limiting state
  const [lastUploadTime, setLastUploadTime] = useState(0);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [deptRes, semRes, sessionRes, fileRes] = await Promise.all([
        supabase.from("departments").select("*").order("code"),
        supabase.from("semesters").select("*").order("created_at"),
        supabase.from("academic_sessions").select("*").order("year", { ascending: false }),
        supabase.from("resources").select("*").eq("uploader_id", user.id).order("created_at", { ascending: false })
      ]);

      setDepartments(deptRes.data || []);
      setSemesters(semRes.data || []);
      setSessions(sessionRes.data || []);
      setMyFiles(fileRes.data || []);
    } catch (error) {
      toast.error("Failed to load portal data.");
    } finally {
      setLoading(false);
    }
  };

  // Security: Brute-force/Spam Protection
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Rate Limit Check (Preventing rapid multiple uploads)
    const now = Date.now();
    if (now - lastUploadTime < 30000) { // 30 seconds cooldown
      toast.error("Please wait 30 seconds before another upload.");
      return;
    }

    if (!file) return toast.error("Please select a file.");
    
    // 2. File Size & Type Security
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return toast.error("File size exceeds 10MB limit.");
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Processing secure upload...");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Session expired.");

      // A. Upload to Storage
      const fileName = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from("resources")
        .upload(fileName, file);

      if (storageError) throw storageError;

      // B. Save Metadata to DB
      const { data, error: dbError } = await supabase.from("resources").insert([{
        title: uploadData.title,
        file_url: storageData.path,
        department: uploadData.dept,
        semester: uploadData.semester,
        course_code: uploadData.course,
        session_id: uploadData.sessionId,
        uploader_id: user.id,
        status: 'pending'
      }]).select().single();

      if (dbError) throw dbError;

      setMyFiles([data, ...myFiles]);
      setLastUploadTime(Date.now());
      setShowModal(false);
      resetForm();
      
      await logActivity("FILE_UPLOAD", `Uploaded file: ${uploadData.title}`);
      toast.success("File uploaded! It will be visible after admin approval.", { id: loadingToast });

    } catch (error: any) {
      toast.error(error.message || "Upload failed.", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setUploadData({ title: "", dept: "", semester: "", course: "", sessionId: "" });
    setFile(null);
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-[#5DCAA5]" size={40} /></div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 text-[#F0E8D5]">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">My Uploads</h1>
          <p className="text-[#A89880] font-medium mt-1">Manage your shared academic materials.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#5DCAA5] hover:bg-[#4eb390] text-[#1C1812] px-6 py-3 rounded-2xl font-black transition-all transform hover:-translate-y-1 shadow-lg shadow-[#5DCAA5]/20 cursor-pointer"
        >
          <Plus size={20} /> Upload New
        </button>
      </div>

      {/* Stats/Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#2A2318] p-6 rounded-3xl border border-[#5DCAA5]/10">
          <p className="text-[10px] font-black text-[#5DCAA5] uppercase tracking-widest">Total Uploaded</p>
          <h3 className="text-2xl font-bold text-white mt-1">{myFiles.length}</h3>
        </div>
        <div className="bg-[#2A2318] p-6 rounded-3xl border border-[#F0997B]/10">
          <p className="text-[10px] font-black text-[#F0997B] uppercase tracking-widest">Pending Approval</p>
          <h3 className="text-2xl font-bold text-white mt-1">{myFiles.filter(f => f.status === 'pending').length}</h3>
        </div>
        <div className="bg-[#2A2318] p-6 rounded-3xl border border-emerald-500/10">
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Approved</p>
          <h3 className="text-2xl font-bold text-white mt-1">{myFiles.filter(f => f.status === 'approved').length}</h3>
        </div>
      </div>

      {/* Files Grid */}
      {myFiles.length === 0 ? (
        <div className="bg-[#2A2318] rounded-3xl p-16 text-center border border-dashed border-[#5DCAA5]/20">
          <FileText className="mx-auto text-[#A89880] mb-4" size={48} />
          <h3 className="text-xl font-bold text-white">No files found</h3>
          <p className="text-[#A89880] mt-2">Start sharing your resources with the community.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myFiles.map((item) => (
            <motion.div 
              layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              key={item.id} className="bg-[#2A2318] p-5 rounded-3xl border border-[#5DCAA5]/10 hover:border-[#5DCAA5]/30 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-[#36312a] rounded-2xl text-[#5DCAA5]"><FileText size={24} /></div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                  {item.status}
                </div>
              </div>
              <h3 className="font-bold text-white text-lg line-clamp-1">{item.title}</h3>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-[10px] font-bold px-2 py-1 bg-[#36312a] rounded-lg text-[#A89880]">{item.course_code}</span>
                <span className="text-[10px] font-bold px-2 py-1 bg-[#36312a] rounded-lg text-[#A89880]">{item.semester} Sem</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* UPLOAD MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#2A2318] w-full max-w-xl rounded-3xl border border-[#5DCAA5]/20 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-[#5DCAA5]/10 flex justify-between items-center">
                <h2 className="text-xl font-black text-white">Upload Material</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-[#36312a] rounded-full text-[#A89880] cursor-pointer"><X size={20}/></button>
              </div>

              <form onSubmit={handleUpload} className="p-6 space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-[#5DCAA5] uppercase tracking-widest mb-2 ml-2">Resource Title</label>
                  <input 
                    type="text" required value={uploadData.title} onChange={e => setUploadData({...uploadData, title: e.target.value})}
                    placeholder="e.g., Chapter 1 Summary"
                    className="w-full px-5 py-3.5 bg-[#36312a] border border-[#5DCAA5]/30 rounded-2xl text-white outline-none focus:border-[#5DCAA5] transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <select 
                    required value={uploadData.dept} onChange={e => setUploadData({...uploadData, dept: e.target.value})}
                    className="px-5 py-3.5 bg-[#36312a] border border-[#5DCAA5]/30 rounded-2xl text-white outline-none cursor-pointer"
                  >
                    <option value="">Dept</option>
                    {departments.map(d => <option key={d.code} value={d.code}>{d.code}</option>)}
                  </select>
                  <select 
                    required value={uploadData.semester} onChange={e => setUploadData({...uploadData, semester: e.target.value})}
                    className="px-5 py-3.5 bg-[#36312a] border border-[#5DCAA5]/30 rounded-2xl text-white outline-none cursor-pointer"
                  >
                    <option value="">Semester</option>
                    {semesters.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>

                <select 
                  required value={uploadData.sessionId} onChange={e => setUploadData({...uploadData, sessionId: e.target.value})}
                  className="w-full px-5 py-3.5 bg-[#36312a] border border-[#5DCAA5]/30 rounded-2xl text-white outline-none cursor-pointer"
                >
                  <option value="">Select Batch (Initial)</option>
                  {sessions.map(s => <option key={s.id} value={s.id}>{s.batch_code} ({s.term} {s.year})</option>)}
                </select>

                <div className="border-2 border-dashed border-[#5DCAA5]/20 rounded-3xl p-8 text-center bg-[#36312a]/50">
                  <input 
                    type="file" id="fileUpload" className="hidden" 
                    onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                  />
                  <label htmlFor="fileUpload" className="cursor-pointer group">
                    <div className="w-12 h-12 bg-[#5DCAA5]/10 text-[#5DCAA5] rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Upload size={24} />
                    </div>
                    <p className="text-sm font-bold text-white">{file ? file.name : "Click to select file"}</p>
                    <p className="text-[10px] text-[#A89880] mt-1">PDF, Image or Docs (Max 10MB)</p>
                  </label>
                </div>

                <button 
                  type="submit" disabled={isSubmitting}
                  className="w-full bg-[#5DCAA5] text-[#1C1812] font-black py-4 rounded-2xl hover:bg-[#4eb390] transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                  {isSubmitting ? "Uploading..." : "Submit for Approval"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}