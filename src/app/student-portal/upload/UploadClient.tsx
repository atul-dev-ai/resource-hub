"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UploadCloud, FileType, BookOpen, Hash, Send, X, FileText, Image as ImageIcon, 
  Calendar, Tag, CheckSquare, Info, User, Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/utils/supabase/client";

export default function UploadClient() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data Fetching States
  const [loadingData, setLoadingData] = useState(true);
  const [dbDepartments, setDbDepartments] = useState<any[]>([]);
  const [dbSemesters, setDbSemesters] = useState<any[]>([]);
  const [dbSessions, setDbSessions] = useState<any[]>([]);
  const [dbCourses, setDbCourses] = useState<any[]>([]);

  // File & Form States
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    resourceType: "",
    title: "",
    description: "",
    department: "",
    semester: "",
    courseName: "",
    courseCode: "",
    teacherName: "",
    examType: "",
    sessionId: "", 
    tags: "",
    consent: false
  });

  const resourceTypes = ["Previous Question", "Quiz", "Assignment", "Notes", "Lab Report", "Slide", "Others"];
  const examTypes = ["Mid", "Final", "Quiz", "Viva"];

  useEffect(() => {
    fetchAcademicData();
  }, []);

  const fetchAcademicData = async () => {
    setLoadingData(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication error");

      const [deptRes, semRes, sessionRes, courseRes, profileRes] = await Promise.all([
        supabase.from("departments").select("code, name").order("code"),
        supabase.from("semesters").select("id, name").order("created_at"),
        supabase.from("academic_sessions").select("id, term, year, batch_code").eq("is_active", true).order("batch_code", { ascending: false }),
        supabase.from("courses").select("*"),
        supabase.from("profiles").select("department").eq("id", user.id).single()
      ]);

      setDbDepartments(deptRes.data || []);
      setDbSemesters(semRes.data || []);
      setDbSessions(sessionRes.data || []);
      setDbCourses(courseRes.data || []);

      if (profileRes.data?.department) {
        setFormData(prev => ({ ...prev, department: profileRes.data.department }));
      }

    } catch (error) {
      toast.error("Failed to load academic data. Please refresh.");
    } finally {
      setLoadingData(false);
    }
  };

  const handleCourseCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.toUpperCase();
    setFormData(prev => ({ ...prev, courseCode: code }));
    
    const existingCourse = dbCourses.find(c => c.course_code.toUpperCase() === code);
    if (existingCourse && !formData.courseName) {
      setFormData(prev => ({ 
        ...prev, 
        courseName: existingCourse.course_name,
        semester: existingCourse.semester || prev.semester
      }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files) validateAndAddFiles(Array.from(e.dataTransfer.files));
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) validateAndAddFiles(Array.from(e.target.files));
  };

  const validateAndAddFiles = (selectedFiles: File[]) => {
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    const validFiles = selectedFiles.filter(file => {
      if (!validTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { 
        toast.error(`File too large (Max 10MB): ${file.name}`);
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.consent) return toast.error("You must agree to the consent checkbox.");
    if (files.length === 0) return toast.error("Please upload at least one file.");
    if (!formData.department) return toast.error("Department is missing. Please check your profile.");
    
    const lastUpload = localStorage.getItem("lastUploadTimestamp");
    const now = Date.now();
    if (lastUpload && now - parseInt(lastUpload) < 30000) {
      return toast.error("Please wait 30 seconds before submitting another resource.");
    }
    
    setIsSubmitting(true);
    const loadingToast = toast.loading("Uploading resources and saving data...");

    // ট্র্যাকিং অ্যারে: কোনো ফেইলিওর হলে এই ফাইলগুলো বাকেট থেকে ডিলিট করা হবে
    const uploadedPaths: string[] = [];
    const uploadedUrls: string[] = [];

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Authentication failed! Please log in again.");

      // 1. DYNAMIC COURSE SAVE LOGIC
      const courseExists = dbCourses.find(c => c.course_code.toUpperCase() === formData.courseCode.toUpperCase());
      if (!courseExists) {
        const { data: newCourse, error: newCourseError } = await supabase.from("courses").insert([{
          department_code: formData.department,
          semester: formData.semester,
          course_code: formData.courseCode.toUpperCase(),
          course_name: formData.courseName
        }]).select().single();
        
        if (!newCourseError && newCourse) {
           setDbCourses(prev => [...prev, newCourse]);
        }
      }

      // 2. FILE UPLOAD LOGIC
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '_');
        const filePath = `${user.id}/${Date.now()}-${cleanName}.${fileExt}`; // file path in bucket
        
        const { error: uploadError } = await supabase.storage.from("academic_resources").upload(filePath, file);
        if (uploadError) throw uploadError;

        // আপলোড সাকসেস হলে পাথটা ট্র্যাকিং অ্যারেতে সেভ করে রাখি
        uploadedPaths.push(filePath);

        const { data: { publicUrl } } = supabase.storage.from("academic_resources").getPublicUrl(filePath);
        uploadedUrls.push(publicUrl);
      }

      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== "");

      // 3. SAVE RESOURCE METADATA (DATABASE)
      const { error: dbError } = await supabase.from("resources").insert([{
        uploader_id: user.id,
        title: formData.title,
        description: formData.description,
        resource_type: formData.resourceType,
        department: formData.department,
        semester: formData.semester,
        course_name: formData.courseName,
        course_code: formData.courseCode.toUpperCase(),
        teacher_name: formData.teacherName,
        exam_type: formData.resourceType === "Previous Question" ? formData.examType : null,
        session_id: formData.sessionId,
        tags: tagsArray,
        file_urls: uploadedUrls,
        status: 'pending' 
      }]);

      if (dbError) throw dbError; // এটা ফেইল করলে সরাসরি catch ব্লকে চলে যাবে

      localStorage.setItem("lastUploadTimestamp", Date.now().toString());
      toast.success("Resource submitted for admin review!", { id: loadingToast, duration: 5000 });
      
      setFiles([]);
      setFormData(prev => ({
        resourceType: "", title: "", description: "", department: prev.department, semester: "", 
        courseName: "", courseCode: "", teacherName: "", examType: "", sessionId: "", tags: "", consent: false
      }));

    } catch (error: any) {
      console.error("Upload Error:", error);
      
      // ROLLBACK MECHANISM: যদি ডাটাবেজ এরর দেয়, তবে বাকেট থেকে আপলোড করা ফাইল ডিলিট করে দাও
      if (uploadedPaths.length > 0) {
        await supabase.storage.from("academic_resources").remove(uploadedPaths);
        console.log("Rolled back (deleted) files from bucket due to DB error.");
      }

      toast.error(error.message || "Something went wrong during upload", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCourses = dbCourses.filter(c => c.department_code === formData.department || !formData.department);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Academic Resource</h1>
        <p className="text-gray-500 text-sm mt-1">Share materials to help your batchmates. All uploads go through an admin review.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-8 relative">
        
        {loadingData && (
          <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-2xl">
            <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
          </div>
        )}

        {/* 1. Basic Info Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <Info size={18} className="text-blue-500" />
            <h2 className="font-bold text-gray-800">1. Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Resource Type <span className="text-red-500">*</span></label>
              <div className="relative">
                <BookOpen size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <select required value={formData.resourceType} onChange={e => setFormData({...formData, resourceType: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer text-gray-700">
                  <option value="" disabled>Select Type</option>
                  {resourceTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Title <span className="text-red-500">*</span></label>
              <div className="relative">
                <FileText size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Discrete Math Fall 2025 Mid Question" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-800" />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Description <span className="font-normal lowercase text-gray-400">(Optional)</span></label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Short details: which topic, important chapters, etc." rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-800 resize-none" />
            </div>
          </div>
        </div>

        {/* 2. Academic Details Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <BookOpen size={18} className="text-indigo-500" />
            <h2 className="font-bold text-gray-800">2. Academic Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Department <span className="text-red-500">*</span></label>
              <select 
                required 
                value={formData.department} 
                onChange={e => setFormData({...formData, department: e.target.value})} 
                disabled 
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl outline-none appearance-none cursor-not-allowed text-gray-500 font-medium"
              >
                <option value="" disabled>Loading Dept...</option>
                {dbDepartments.map(d => <option key={d.code} value={d.code}>{d.code} - {d.name}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Semester <span className="text-red-500">*</span></label>
              <select required value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer text-gray-700">
                <option value="" disabled>Select Sem</option>
                {dbSemesters.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Course Code <span className="text-red-500">*</span></label>
              <div className="relative">
                <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" required list="courseCodesList"
                  value={formData.courseCode} onChange={handleCourseCodeChange} 
                  placeholder="e.g. CSE214" 
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all uppercase text-gray-800" 
                />
                <datalist id="courseCodesList">
                  {filteredCourses.map(c => <option key={c.id} value={c.course_code}>{c.course_name}</option>)}
                </datalist>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Course Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <BookOpen size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" required list="courseNamesList"
                  value={formData.courseName} onChange={e => setFormData({...formData, courseName: e.target.value})} 
                  placeholder="e.g. Discrete Mathematics" 
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-800" 
                />
                <datalist id="courseNamesList">
                  {filteredCourses.map(c => <option key={c.id} value={c.course_name} />)}
                </datalist>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Teacher Name <span className="font-normal lowercase text-gray-400">(Optional)</span></label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={formData.teacherName} onChange={e => setFormData({...formData, teacherName: e.target.value})} placeholder="e.g. SRD Sir" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-800" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Session / Batch <span className="text-red-500">*</span></label>
              <div className="relative">
                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <select required value={formData.sessionId} onChange={e => setFormData({...formData, sessionId: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer text-gray-700">
                  <option value="" disabled>Select Batch</option>
                  {dbSessions.map(s => <option key={s.id} value={s.id}>Batch {s.batch_code} ({s.term} {s.year})</option>)}
                </select>
              </div>
            </div>

            <AnimatePresence>
              {formData.resourceType === "Previous Question" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:col-span-2 overflow-hidden">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 mt-2">Exam Type <span className="text-red-500">*</span></label>
                  <select required value={formData.examType} onChange={e => setFormData({...formData, examType: e.target.value})} className="w-full px-4 py-3 bg-indigo-50/50 border border-indigo-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer text-gray-700">
                    <option value="" disabled>Select Exam Type</option>
                    {examTypes.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Tags <span className="font-normal lowercase text-gray-400">(Comma separated)</span></label>
              <div className="relative">
                <Tag size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="e.g. mid, oop, important" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-800" />
              </div>
            </div>
          </div>
        </div>

        {/* 3. File Upload Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <UploadCloud size={18} className="text-green-500" />
            <h2 className="font-bold text-gray-800">3. Upload File(s)</h2>
          </div>

          <div>
            <div 
              onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:bg-gray-50"}`}
            >
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <UploadCloud size={32} className="text-gray-500" />
              </div>
              <p className="font-bold text-gray-800 text-lg">Drag & Drop files here</p>
              <p className="text-sm text-gray-500 mt-1 mb-4">or click to browse from device</p>
              <div className="flex gap-2">
                <span className="text-[10px] uppercase font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded">PDF</span>
                <span className="text-[10px] uppercase font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded">JPG/PNG</span>
                <span className="text-[10px] uppercase font-bold px-2 py-1 bg-red-50 text-red-600 rounded">Max 10MB</span>
              </div>
              <input type="file" multiple ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".pdf,image/*" />
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      {file.type.includes("pdf") ? <FileType size={24} className="text-red-500" /> : <ImageIcon size={24} className="text-blue-500" />}
                      <div>
                        <p className="font-semibold text-gray-800 text-sm truncate max-w-[200px] sm:max-w-md">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeFile(index)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 4. Consent & Submit */}
        <div className="pt-6 border-t border-gray-100">
          <label className="flex items-start gap-3 cursor-pointer group mb-6">
            <div className="relative flex items-center justify-center mt-0.5">
              <input type="checkbox" required checked={formData.consent} onChange={e => setFormData({...formData, consent: e.target.checked})} className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded cursor-pointer checked:bg-blue-600 checked:border-blue-600 transition-all" />
              <CheckSquare size={14} className="text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
            </div>
            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
              I confirm this content is academic, appropriate, and does not violate any institutional policies.
            </span>
          </label>

          <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-colors shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={18} />} 
            {isSubmitting ? "Processing Upload..." : "Submit for Review"}
          </button>
        </div>

      </form>
    </motion.div>
  );
}