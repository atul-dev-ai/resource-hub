"use client";

import { useState, useEffect } from "react";
import { PageSkeleton } from "@/components/PageSkeleton";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, FileText, Trash2, Loader2, 
  Plus, Search, Filter, BookOpen, Building2, 
  CalendarClock, X, AlertCircle, CheckCircle2,
  Eye, Edit2
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { logActivity } from "@/utils/logger";
import toast from "react-hot-toast";
import Link from "next/link";
import imageCompression from "browser-image-compression";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUploadMetadata, getStudentUploads, invalidateStudentUploads } from "@/app/actions/studentActions";

export default function UploadsClient() {
  const supabase = createClient();
  
  const queryClient = useQueryClient();
  const [userAuth, setUserAuth] = useState<any>(null);
  
  // Data States
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  
  // Form States for Upload
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState({
    title: "",
    dept: "",
    semester: "",
    course: "",
    sessionId: ""
  });

  // Form States for Edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [editResource, setEditResource] = useState<any>(null);
  const [editFile, setEditFile] = useState<File | null>(null);

  // Security: Rate Limiting state
  const [lastUploadTime, setLastUploadTime] = useState(0);

  const { data: meta, isLoading: loadingMeta } = useQuery({
    queryKey: ["global_form_metadata"],
    queryFn: getUploadMetadata,
  });

  const { data: uploadsData, isLoading: loadingUploads } = useQuery({
    queryKey: ["student_uploads"],
    queryFn: getStudentUploads,
  });

  const loading = loadingMeta || loadingUploads;
  const myFiles = uploadsData || [];
  const departments = meta?.departments || [];
  const semesters = meta?.semesters || [];
  const sessions = meta?.sessions || [];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserAuth(data?.user || null));
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastUploadTime < 30000) { 
      toast.error("Please wait 30 seconds before another upload.");
      return;
    }
    if (!file) return toast.error("Please select a file.");
    if (file.size > 10 * 1024 * 1024) { 
      return toast.error("File size exceeds 10MB limit.");
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Processing secure upload...");

    try {
      if (!userAuth) throw new Error("Session expired.");

      const fileName = `${userAuth.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from("academic_resources")
        .upload(fileName, file);

      if (storageError) throw storageError;
      
      const { data: { publicUrl } } = supabase.storage.from("academic_resources").getPublicUrl(fileName);

      const { data, error: dbError } = await supabase.from("resources").insert([{
        title: uploadData.title,
        file_urls: [publicUrl],
        department: uploadData.dept,
        semester: uploadData.semester,
        course_code: uploadData.course || null,
        session_id: uploadData.sessionId || null,
        uploader_id: userAuth.id,
        status: 'pending'
      }]).select().single();

      if (dbError) throw dbError;

      setLastUploadTime(Date.now());
      setShowModal(false);
      resetForm();

      await invalidateStudentUploads(userAuth.id);
      queryClient.invalidateQueries({ queryKey: ["student_uploads"] });
      queryClient.invalidateQueries({ queryKey: ["student_dashboard"] });
      
      await logActivity("FILE_UPLOAD", `Uploaded file: ${uploadData.title}`);
      toast.success("File uploaded! It will be visible after admin approval.", { id: loadingToast });

    } catch (error: any) {
      toast.error(error.message || "Upload failed.", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editResource) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading("Updating resource...");

    try {
      if (!userAuth) throw new Error("Session expired.");

      let newPublicUrl = editResource.file_urls?.[0];

      // Handle new file upload if selected
      if (editFile) {
        if (editFile.size > 10 * 1024 * 1024) throw new Error("File size exceeds 10MB limit.");
        
        let finalFile = editFile;
        // Optimize if image
        if (editFile.type.startsWith("image/")) {
          try {
            const compressed = await imageCompression(editFile, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true });
            finalFile = new File([compressed], editFile.name, { type: editFile.type });
          } catch (e) { console.error(e); }
        }

        const fileName = `${userAuth.id}/${Date.now()}-${finalFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const { data: storageData, error: storageError } = await supabase.storage
          .from("academic_resources")
          .upload(fileName, finalFile);

        if (storageError) throw storageError;
        const { data: { publicUrl } } = supabase.storage.from("academic_resources").getPublicUrl(fileName);
        newPublicUrl = publicUrl;
      }

      const updateData = {
        title: editResource.title,
        department: editResource.department,
        semester: editResource.semester,
        course_code: editResource.course_code,
      };
      
      if (editFile && newPublicUrl) {
        (updateData as any).file_urls = [newPublicUrl];
      }

      const { error } = await supabase
        .from("resources")
        .update(updateData)
        .eq("id", editResource.id);

      if (error) throw error;

      setShowEditModal(false);
      setEditFile(null);

      await invalidateStudentUploads(userAuth.id);
      queryClient.invalidateQueries({ queryKey: ["student_uploads"] });
      
      toast.success("Resource updated successfully!", { id: loadingToast });
    } catch (error: any) {
      toast.error(error.message || "Failed to update resource.", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    
    const loadingToast = toast.loading("Deleting resource...");
    try {
      const { error } = await supabase.from("resources").delete().eq("id", id);
      if (error) throw error;

      await invalidateStudentUploads(userAuth.id);
      queryClient.invalidateQueries({ queryKey: ["student_uploads"] });
      queryClient.invalidateQueries({ queryKey: ["student_dashboard"] });

      toast.success("Resource deleted.", { id: loadingToast });
    } catch (error: any) {
      toast.error(error.message || "Failed to delete resource.", { id: loadingToast });
    }
  };

  const resetForm = () => {
    setUploadData({ title: "", dept: "", semester: "", course: "", sessionId: "" });
    setFile(null);
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#022c22] tracking-tight">My Uploads</h1>
          <p className="text-emerald-700 font-medium mt-1">Manage your shared academic materials.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#5DCAA5] hover:bg-[#4eb390] text-[#022c22] px-6 py-3 rounded-2xl font-black transition-all transform hover:-translate-y-1 shadow-lg shadow-[#5DCAA5]/20 cursor-pointer"
        >
          <Plus size={20} /> Upload New
        </button>
      </div>

      {/* Stats/Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Total Uploaded</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{myFiles.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Pending Approval</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{myFiles.filter(f => f.status === 'pending').length}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Approved</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{myFiles.filter(f => f.status === 'approved').length}</h3>
        </div>
      </div>

      {/* Files Grid */}
      {myFiles.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-gray-300 shadow-sm">
          <FileText className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-700">No files found</h3>
          <p className="text-gray-500 mt-2">Start sharing your resources with the community.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myFiles.map((item) => (
            <motion.div 
              layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              key={item.id} className="bg-white p-5 rounded-3xl border border-gray-200 hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 flex flex-col group relative overflow-hidden shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shadow-sm group-hover:scale-110 transition-transform"><FileText size={24} /></div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${item.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
                  {item.status}
                </div>
              </div>
              
              <h3 className="font-bold text-gray-900 text-lg line-clamp-1 group-hover:text-emerald-700 transition-colors">{item.title}</h3>
              <div className="flex flex-wrap gap-2 mt-3 mb-6">
                <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 rounded-lg text-slate-700 uppercase">{item.course_code || item.department}</span>
                <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 rounded-lg text-slate-700 uppercase">{item.semester} Sem</span>
              </div>

              <div className="mt-auto grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
                <Link 
                  href={`/resource/${item.id}`}
                  className="flex items-center justify-center gap-1 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer text-xs font-bold"
                >
                  <Eye size={14} /> View
                </Link>
                <button 
                  onClick={() => { setEditResource(item); setEditFile(null); setShowEditModal(true); }}
                  className="flex items-center justify-center gap-1 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors cursor-pointer text-xs font-bold"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="flex items-center justify-center gap-1 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer text-xs font-bold"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* UPLOAD MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-xl rounded-3xl border border-gray-200 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-black text-gray-900">Upload Material</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 cursor-pointer"><X size={20}/></button>
              </div>

              <form onSubmit={handleUpload} className="p-6 space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 ml-2">Resource Title</label>
                  <input 
                    type="text" required value={uploadData.title} onChange={e => setUploadData({...uploadData, title: e.target.value})}
                    placeholder="e.g., Chapter 1 Summary"
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <select 
                    required value={uploadData.dept} onChange={e => setUploadData({...uploadData, dept: e.target.value})}
                    className="px-5 py-3.5 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 outline-none cursor-pointer focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  >
                    <option value="">Dept</option>
                    {departments.map((d: any) => <option key={d.code} value={d.code}>{d.code}</option>)}
                  </select>
                  <select 
                    required value={uploadData.semester} onChange={e => setUploadData({...uploadData, semester: e.target.value})}
                    className="px-5 py-3.5 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 outline-none cursor-pointer focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  >
                    <option value="">Semester</option>
                    {semesters.map((s: any) => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>

                <div className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-3xl p-8 text-center bg-gray-50 transition-colors">
                  <input 
                    type="file" id="fileUpload" className="hidden" 
                    onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                  />
                  <label htmlFor="fileUpload" className="cursor-pointer group">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-sm">
                      <Upload size={24} />
                    </div>
                    <p className="text-sm font-bold text-gray-900">{file ? file.name : "Click to select file"}</p>
                    <p className="text-[10px] text-gray-500 mt-1">PDF, Image or Docs (Max 10MB)</p>
                  </label>
                </div>

                <button 
                  type="submit" disabled={isSubmitting}
                  className="w-full bg-[#5DCAA5] text-[#022c22] font-black py-4 rounded-2xl hover:bg-[#4eb390] transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                  {isSubmitting ? "Uploading..." : "Submit"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {showEditModal && editResource && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-xl rounded-3xl border border-gray-200 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-black text-gray-900">Edit Resource metadata</h2>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 cursor-pointer"><X size={20}/></button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 ml-2">Resource Title</label>
                  <input 
                    type="text" required value={editResource.title || ""} onChange={e => setEditResource({...editResource, title: e.target.value})}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <select 
                    required value={editResource.department || ""} onChange={e => setEditResource({...editResource, department: e.target.value})}
                    className="px-5 py-3.5 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 outline-none cursor-pointer focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="">Dept</option>
                    {departments.map((d: any) => <option key={d.code} value={d.code}>{d.code}</option>)}
                  </select>
                  <select 
                    required value={editResource.semester || ""} onChange={e => setEditResource({...editResource, semester: e.target.value})}
                    className="px-5 py-3.5 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 outline-none cursor-pointer focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="">Semester</option>
                    {semesters.map((s: any) => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 ml-2">Course Code</label>
                  <input 
                    type="text" value={editResource.course_code || ""} onChange={e => setEditResource({...editResource, course_code: e.target.value})}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div className="border border-dashed border-gray-300 hover:border-blue-500 rounded-2xl p-4 bg-gray-50 transition-colors">
                  <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Replace File (Optional)</label>
                  <input 
                    type="file" id="editFileUpload" className="hidden" 
                    onChange={e => setEditFile(e.target.files ? e.target.files[0] : null)}
                  />
                  <label htmlFor="editFileUpload" className="cursor-pointer flex flex-col items-center justify-center py-4 text-center group">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform shadow-sm">
                      <Upload size={20} />
                    </div>
                    <p className="text-sm font-bold text-gray-900">{editFile ? editFile.name : "Click to select a new file"}</p>
                    <p className="text-[10px] text-gray-500 mt-1">Leaves original file if empty</p>
                  </label>
                </div>

                <button 
                  type="submit" disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}