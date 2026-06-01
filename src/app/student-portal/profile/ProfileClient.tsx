"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  User, BookOpen, Hash, Camera, Save, Loader2, Calendar, Mail, ShieldCheck, Layers 
} from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/utils/supabase/client";
import { logActivity } from "@/utils/logger"; // Activity tracker added

export default function ProfileClient() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userAuth, setUserAuth] = useState<any>(null);

  // Profile Form States
  const [initialProfile, setInitialProfile] = useState<any>(null);
  const [profile, setProfile] = useState({
    full_name: "", phone: "", student_id: "", department: "",
    semester: "", section: "", batch_initial: "", avatar_url: "",
    role: "student", created_at: ""
  });

  // Image Preview States
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const hasChanges = JSON.stringify(profile) !== JSON.stringify(initialProfile) || selectedImageFile !== null;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw authError;
      
      setUserAuth(user);

      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (error) throw error;
      
      if (data) {
        const profileData = {
          full_name: data.full_name || "", 
          phone: data.phone || "",
          student_id: data.student_id || "", 
          department: data.department || "",
          semester: data.semester || "", 
          section: data.section || "",
          batch_initial: data.batch_initial || "", 
          avatar_url: data.avatar_url || "",
          role: data.role || "student", 
          created_at: new Date(data.created_at).toLocaleDateString() || "Unknown"
        };
        setProfile(profileData);
        setInitialProfile(profileData);
      }
    } catch (error: any) {
      toast.error("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return toast.error("Upload a valid image.");
    if (file.size > 2 * 1024 * 1024) return toast.error("Image size must be less than 2MB.");

    setSelectedImageFile(file);
    setPreviewUrl(URL.createObjectURL(file)); 
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAuth || !hasChanges) return;
    
    setSaving(true);
    const loadingToast = toast.loading("Saving changes...");

    try {
      let finalAvatarUrl = profile.avatar_url;

      // 1. Image Upload Logic
      if (selectedImageFile) {
        const fileExt = selectedImageFile.name.split('.').pop();
        const fileName = `${userAuth.id}-${Date.now()}.${fileExt}`;
        const filePath = `${userAuth.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, selectedImageFile);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
        finalAvatarUrl = publicUrl;

        // Cleanup old image
        if (initialProfile.avatar_url) {
          const oldPath = initialProfile.avatar_url.split('/avatars/')[1];
          if (oldPath) {
            await supabase.storage.from("avatars").remove([oldPath]);
          }
        }
      }

      // 2. Database Update
      const { error: dbError } = await supabase.from("profiles").update({
        full_name: profile.full_name,
        phone: profile.phone,
        section: profile.section,
        student_id: profile.student_id,
        avatar_url: finalAvatarUrl
      }).eq("id", userAuth.id);

      if (dbError) throw dbError;

      // Log the activity for admin audit
      await logActivity("PROFILE_UPDATE", "Student updated their personal profile details.");

      // 3. State Sync
      const updatedProfile = { ...profile, avatar_url: finalAvatarUrl };
      setProfile(updatedProfile);
      setInitialProfile(updatedProfile);
      setSelectedImageFile(null);
      setPreviewUrl(null);

      toast.success("Profile updated successfully!", { id: loadingToast });
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile", { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#5DCAA5]" /></div>;
  }

  const displayImage = previewUrl || profile.avatar_url;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6 pb-10 text-[#ecfdf5]">
      
      {/* Profile Header Card */}
      <div className="bg-[#022c22] rounded-3xl shadow-xl border border-[#5DCAA5]/20 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[#022c22] to-[#064e3b] relative overflow-hidden">
           {/* Abstract background shapes */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#5DCAA5]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        </div>
        
        <div className="px-6 sm:px-10 pb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 -mt-12 relative">
          
          <div className="relative group">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-28 h-28 rounded-full border-4 border-[#022c22] bg-[#064e3b] shadow-lg flex items-center justify-center overflow-hidden cursor-pointer relative z-10"
            >
              {displayImage ? (
                <img src={displayImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-[#6ee7b7]" />
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                <Camera size={24} className="text-white" />
              </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
          </div>

          <div className="text-center sm:text-left mt-2 sm:mt-14 flex-1">
            <h1 className="text-2xl font-black text-white flex items-center justify-center sm:justify-start gap-2">
              {profile.full_name || "Student Name"}
              <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase font-black rounded-full">Active</span>
            </h1>
            <p className="text-[#6ee7b7] font-medium">{userAuth?.email}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#5DCAA5] bg-[#064e3b] border border-[#5DCAA5]/20 px-3 py-1.5 rounded-full"><BookOpen size={14}/> {profile.department}</span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#F0997B] bg-[#064e3b] border border-[#F0997B]/20 px-3 py-1.5 rounded-full"><Hash size={14}/> Batch {profile.batch_initial || "N/A"}</span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#6ee7b7] bg-[#064e3b] border border-[#6ee7b7]/20 px-3 py-1.5 rounded-full"><Calendar size={14}/> Joined: {profile.created_at}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Editable Information Form */}
      <form onSubmit={handleUpdateProfile} className="bg-[#022c22] rounded-3xl shadow-xl border border-[#5DCAA5]/20 p-6 sm:p-8">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#5DCAA5]/10">
          <h2 className="text-lg font-black text-white">Personal Information</h2>
          <button 
            type="submit" 
            disabled={saving || !hasChanges} 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all shadow-lg w-full sm:w-auto justify-center ${
              hasChanges && !saving 
                ? "bg-[#5DCAA5] hover:bg-[#4eb390] text-[#022c22] cursor-pointer shadow-[#5DCAA5]/20 hover:-translate-y-0.5" 
                : "bg-[#064e3b] text-[#6ee7b7] cursor-not-allowed border border-[#6ee7b7]/20"
            }`}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-xs font-black text-[#5DCAA5] uppercase tracking-widest mb-2">Full Name</label>
            <input type="text" value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})} className="w-full px-5 py-3.5 bg-[#064e3b] border border-[#5DCAA5]/30 rounded-2xl focus:border-[#5DCAA5] focus:ring-2 focus:ring-[#5DCAA5]/20 outline-none transition-all text-white font-bold" />
          </div>
          <div>
            <label className="block text-xs font-black text-[#5DCAA5] uppercase tracking-widest mb-2">Phone Number</label>
            <input type="text" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} placeholder="+880 1..." className="w-full px-5 py-3.5 bg-[#064e3b] border border-[#5DCAA5]/30 rounded-2xl focus:border-[#5DCAA5] focus:ring-2 focus:ring-[#5DCAA5]/20 outline-none transition-all text-white font-bold" />
          </div>
          <div>
            <label className="block text-xs font-black text-[#5DCAA5] uppercase tracking-widest mb-2">Student ID</label>
            <input type="text" value={profile.student_id} onChange={e => setProfile({...profile, student_id: e.target.value})} placeholder="e.g. 251-15-123" className="w-full px-5 py-3.5 bg-[#064e3b] border border-[#5DCAA5]/30 rounded-2xl focus:border-[#5DCAA5] focus:ring-2 focus:ring-[#5DCAA5]/20 outline-none transition-all text-white font-bold" />
          </div>
          <div>
            <label className="block text-xs font-black text-[#5DCAA5] uppercase tracking-widest mb-2">Section</label>
            <input type="text" value={profile.section} onChange={e => setProfile({...profile, section: e.target.value})} placeholder="e.g. PC-A" className="w-full px-5 py-3.5 bg-[#064e3b] border border-[#5DCAA5]/30 rounded-2xl focus:border-[#5DCAA5] focus:ring-2 focus:ring-[#5DCAA5]/20 outline-none transition-all text-white font-bold" />
          </div>
        </div>

        <h2 className="text-lg font-black text-white mb-6 pt-6 border-t border-[#5DCAA5]/10 flex items-center gap-2">
          <ShieldCheck size={20} className="text-[#F0997B]" /> Academic Data <span className="text-xs text-[#6ee7b7] font-medium lowercase">(Read-Only)</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 opacity-80">
          <div>
            <label className="block text-[10px] font-black text-[#6ee7b7] uppercase tracking-widest mb-2">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6ee7b7]" />
              <input disabled value={userAuth?.email || ""} className="w-full pl-11 pr-4 py-3 bg-[#022c22] border border-[#6ee7b7]/10 rounded-xl cursor-not-allowed text-[#6ee7b7] font-bold text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-[#6ee7b7] uppercase tracking-widest mb-2">Department</label>
            <div className="relative">
              <BookOpen size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6ee7b7]" />
              <input disabled value={profile.department} className="w-full pl-11 pr-4 py-3 bg-[#022c22] border border-[#6ee7b7]/10 rounded-xl cursor-not-allowed text-[#6ee7b7] font-bold text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-[#6ee7b7] uppercase tracking-widest mb-2">Semester</label>
            <div className="relative">
              <Layers size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6ee7b7]" />
              <input disabled value={profile.semester} className="w-full pl-11 pr-4 py-3 bg-[#022c22] border border-[#6ee7b7]/10 rounded-xl cursor-not-allowed text-[#6ee7b7] font-bold text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-[#6ee7b7] uppercase tracking-widest mb-2">Initial Batch</label>
            <div className="relative">
              <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6ee7b7]" />
              <input disabled value={profile.batch_initial || "N/A"} className="w-full pl-11 pr-4 py-3 bg-[#022c22] border border-[#6ee7b7]/10 rounded-xl cursor-not-allowed text-[#6ee7b7] font-bold text-sm" />
            </div>
          </div>
        </div>

      </form>
    </motion.div>
  );
}