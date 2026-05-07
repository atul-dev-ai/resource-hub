"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  User, BookOpen, Hash, Camera, Save, Loader2, Calendar, Mail, ShieldCheck, Layers 
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { createClient } from "@/utils/supabase/client";

export default function ProfilePage() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userAuth, setUserAuth] = useState<any>(null);

  // Profile Form States
  const [initialProfile, setInitialProfile] = useState<any>(null); // Track original data
  const [profile, setProfile] = useState({
    full_name: "", phone: "", student_id: "", department: "",
    semester: "", section: "", batch_initial: "", avatar_url: "",
    role: "student", created_at: ""
  });

  // Image Preview States
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Check if anything has changed (to enable/disable Save button)
  const hasChanges = JSON.stringify(profile) !== JSON.stringify(initialProfile) || selectedImageFile !== null;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw authError;
        
        setUserAuth(user);

        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
        if (error) throw error;
        
        if (data) {
          const profileData = {
            full_name: data.full_name || "", phone: data.phone || "",
            student_id: data.student_id || "", department: data.department || "",
            semester: data.semester || "", section: data.section || "",
            batch_initial: data.batch_initial || "", avatar_url: data.avatar_url || "",
            role: data.role || "student", created_at: new Date(data.created_at).toLocaleDateString() || "Unknown"
          };
          setProfile(profileData);
          setInitialProfile(profileData); // Save a copy of the initial data
        }
      } catch (error: any) {
        toast.error("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Handle local image selection (Preview only, no upload yet)
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return toast.error("Upload a valid image.");
    if (file.size > 2 * 1024 * 1024) return toast.error("Image size must be less than 2MB.");

    setSelectedImageFile(file);
    setPreviewUrl(URL.createObjectURL(file)); // Create local preview link
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAuth || !hasChanges) return;
    
    setSaving(true);
    const loadingToast = toast.loading("Saving changes...");

    try {
      let finalAvatarUrl = profile.avatar_url;

      // 1. If a new image was selected, upload it and clean up the old one
      if (selectedImageFile) {
        // Upload new image
        const fileExt = selectedImageFile.name.split('.').pop();
        const fileName = `${userAuth.id}-${Date.now()}.${fileExt}`;
        const filePath = `${userAuth.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, selectedImageFile);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
        finalAvatarUrl = publicUrl;

        // Delete old image from bucket if it exists
        if (initialProfile.avatar_url) {
          const oldPath = initialProfile.avatar_url.split('/avatars/')[1];
          if (oldPath) {
            await supabase.storage.from("avatars").remove([oldPath]);
          }
        }
      }

      // 2. Update Database with all fields
      const { error: dbError } = await supabase.from("profiles").update({
        full_name: profile.full_name,
        phone: profile.phone,
        section: profile.section,
        student_id: profile.student_id,
        avatar_url: finalAvatarUrl
      }).eq("id", userAuth.id);

      if (dbError) throw dbError;

      // 3. Sync states after successful update
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
    return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;
  }

  // Determine which image to show (Preview vs Existing vs Placeholder)
  const displayImage = previewUrl || profile.avatar_url;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6 pb-10">
      
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[#2A2318] to-[#36312a]"></div>
        <div className="px-6 sm:px-10 pb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 -mt-12 relative">
          
          <div className="relative group">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-28 h-28 rounded-full border-4 border-white bg-gray-100 shadow-md flex items-center justify-center overflow-hidden cursor-pointer relative z-10"
            >
              {displayImage ? (
                <Image src={displayImage} alt="Profile" fill className="object-cover" sizes="112px" />
              ) : (
                <User size={40} className="text-gray-400" />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera size={24} className="text-white" />
              </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
          </div>

          <div className="text-center sm:text-left mt-2 sm:mt-14 flex-1">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center sm:justify-start gap-2">
              {profile.full_name || "Student Name"}
              <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-[10px] uppercase font-bold rounded-full">Active</span>
            </h1>
            <p className="text-gray-500 font-medium">{userAuth?.email}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <span className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full"><BookOpen size={14}/> {profile.department}</span>
              <span className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full"><Hash size={14}/> Batch {profile.batch_initial}</span>
              <span className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full"><Calendar size={14}/> Joined: {profile.created_at}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Editable Information Form */}
      <form onSubmit={handleUpdateProfile} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
        
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Personal Information</h2>
          <button 
            type="submit" 
            disabled={saving || !hasChanges} 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
              hasChanges && !saving 
                ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
            }`}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Full Name</label>
            <input type="text" value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-800 font-medium" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Phone Number</label>
            <input type="text" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} placeholder="+880 1..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-800 font-medium" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Student ID</label>
            <input type="text" value={profile.student_id} onChange={e => setProfile({...profile, student_id: e.target.value})} placeholder="e.g. 251-15-123" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-800 font-medium" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Section</label>
            <input type="text" value={profile.section} onChange={e => setProfile({...profile, section: e.target.value})} placeholder="e.g. PC-A" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-800 font-medium" />
          </div>
        </div>

        <h2 className="text-lg font-bold text-gray-800 mb-6 pt-6 border-t border-gray-100 flex items-center gap-2">
          <ShieldCheck size={18} className="text-green-600" /> Academic Data (Read-Only)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 opacity-80">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input disabled value={userAuth?.email || ""} className="w-full pl-9 pr-3 py-2.5 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed text-gray-600 font-medium text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Department</label>
            <div className="relative">
              <BookOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input disabled value={profile.department} className="w-full pl-9 pr-3 py-2.5 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed text-gray-600 font-medium text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Semester</label>
            <div className="relative">
              <Layers size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input disabled value={profile.semester} className="w-full pl-9 pr-3 py-2.5 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed text-gray-600 font-medium text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Initial Batch</label>
            <div className="relative">
              <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input disabled value={profile.batch_initial} className="w-full pl-9 pr-3 py-2.5 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed text-gray-600 font-medium text-sm" />
            </div>
          </div>
        </div>

      </form>
    </motion.div>
  );
}