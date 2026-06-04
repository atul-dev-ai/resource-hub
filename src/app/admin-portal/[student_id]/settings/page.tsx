"use client";

import { useState, useEffect } from "react";
import { PageSkeleton } from "@/components/PageSkeleton";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Lock, Mail, ShieldCheck, Save, 
  Loader2, KeyRound, ArrowRight, CheckCircle2,
  Building2, BookOpen, Hash
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { logActivity } from "@/utils/logger";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";

export default function AdminSettingsPage() {
  const params = useParams();
  const student_id = params?.student_id || '';
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); 

  // Form States (Updated to match Profile Schema)
  const [profile, setProfile] = useState({ 
    id: "", 
    full_name: "", 
    email: "", 
    role: "",
    department: "",
    semester: "",
    batch_initial: "" // Changed from session_year to batch_initial
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const departments = ["CSE", "SWE", "CIS", "EEE", "BBA", "ENG", "PHR", "LAW"];
  const semesters = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];

  useEffect(() => {
    fetchProfile();
    const query = new URLSearchParams(window.location.search);
    if (query.get("update") === "true") setStep(2);
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (data) {
          setProfile({ 
            id: data.id, 
            full_name: data.full_name || "", 
            email: user.email || "", 
            role: data.role || "",
            department: data.department || "",
            semester: data.semester || "",
            batch_initial: data.batch_initial || "" // Updated mapped field
          });
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ================= PROFILE UPDATE =================
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading("Updating profile...");

    try {
      const { error } = await supabase.from("profiles").update({ 
        full_name: profile.full_name,
        department: profile.department,
        semester: profile.semester,
        batch_initial: profile.batch_initial // Updated query field
      }).eq("id", profile.id);
      
      if (error) throw error;

      await logActivity("PROFILE_UPDATE", `Admin updated academic profile information.`);
      toast.success("Profile updated successfully!", { id: loadingToast });
    } catch (error: any) {
      toast.error(error.message, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================= PASSWORD RESET FLOW =================
  const handleRequestVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading("Sending verification link...");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/admin-portal/${student_id}/settings?update=true`,
      });
      if (error) throw error;

      await logActivity("PASSWORD_RESET_REQUEST", "Admin requested password reset link");
      toast.success("Verification link sent to your email!", { id: loadingToast });
    } catch (error: any) {
      toast.error(error.message, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match!");

    setIsSubmitting(true);
    const loadingToast = toast.loading("Updating password...");

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      await logActivity("PASSWORD_CHANGE_SUCCESS", "Admin successfully changed password");
      toast.success("Password changed successfully!", { id: loadingToast });
      setNewPassword(""); setConfirmPassword(""); setStep(1);
    } catch (error: any) {
      toast.error(error.message, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Settings</h1>
        <p className="text-sm text-slate-500 font-medium">Manage identity, academic details, and secure your administrative access.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* ================= PROFILE SECTION ================= */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl"><User size={20} /></div>
            <h2 className="font-bold text-slate-800">Profile Information</h2>
          </div>
          <form onSubmit={handleUpdateProfile} className="p-6 space-y-5">
            
            {/* Display Name */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Display Name</label>
              <input 
                type="text" value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700"
              />
            </div>

            {/* Academic Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Building2 size={14}/> Department</label>
                <select 
                  value={profile.department} onChange={e => setProfile({...profile, department: e.target.value})}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700 cursor-pointer"
                >
                  <option value="">Select Dept</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><BookOpen size={14}/> Semester</label>
                <select 
                  value={profile.semester} onChange={e => setProfile({...profile, semester: e.target.value})}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700 cursor-pointer"
                >
                  <option value="">Select Semester</option>
                  {semesters.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Batch Initial */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Hash size={14}/> Batch Initial</label>
              <input 
                type="text" placeholder="e.g., 251"
                value={profile.batch_initial} onChange={e => setProfile({...profile, batch_initial: e.target.value})}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700"
              />
            </div>

            {/* Role Permissions (Read Only) */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Role Permissions</label>
              <div className="px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={16} /> {profile.role.replace('_', ' ')}
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-[#064e3b] text-white font-bold py-4 rounded-2xl hover:bg-[#022c22] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-900/10 disabled:opacity-50">
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Update Profile
            </button>
          </form>
        </div>

        {/* ================= SECURITY SECTION ================= */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <div className="p-2.5 bg-orange-100 text-orange-700 rounded-xl"><Lock size={20} /></div>
            <h2 className="font-bold text-slate-800">Password & Security</h2>
          </div>
          
          <div className="p-6">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleRequestVerification} className="space-y-6">
                  <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl text-xs font-bold text-orange-800 leading-relaxed">
                    Security Policy: You must verify your identity via email before changing your administrative password.
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Admin Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="email" value={profile.email} disabled className="w-full pl-11 pr-4 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 font-bold cursor-not-allowed" />
                    </div>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full bg-orange-600 text-white font-bold py-4 rounded-2xl hover:bg-orange-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-900/10">
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Verify Identity"} <ArrowRight size={20} />
                  </button>
                </motion.form>
              ) : (
                <motion.form key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSetNewPassword} className="space-y-6">
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 size={18} className="text-emerald-600" /> Identity Verified. Set your new password below.
                  </div>
                  <div className="space-y-4">
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold" />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold" />
                    </div>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 cursor-pointer">
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Update Password"}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}