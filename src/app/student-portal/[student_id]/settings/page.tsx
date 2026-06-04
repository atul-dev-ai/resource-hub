"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, Mail, KeyRound, ShieldCheck, ArrowRight, 
  Loader2, CheckCircle2, AlertTriangle, Trash2 
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";

export default function SettingsPage() {
  const params = useParams();
  const student_id = params?.student_id || '';
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [step, setStep] = useState(1); // 1: Email, 2: New Password
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // ================= PASSWORD RESET LOGIC =================
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/student-portal/${student_id}/settings?update=true`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("A reset link has been sent to your email!");
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
      setNewPassword("");
      setStep(1);
    }
    setLoading(false);
  };

  // ================= ACCOUNT DELETION LOGIC =================
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you ABSOLUTELY sure?\n\nThis action cannot be undone. All your uploads, bookmarks, and profile data will be permanently deleted."
    );
    
    if (!confirmDelete) return;

    setIsDeleting(true);
    const loadingToast = toast.loading("Deleting your account...");

    try {
      // Supabase RPC call to our custom delete_user function
      const { error } = await supabase.rpc('delete_user');

      if (error) throw error;

      // Sign out after deletion
      await supabase.auth.signOut();
      
      toast.success("Account deleted successfully.", { id: loadingToast });
      
      // Redirect to homepage
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);

    } catch (error: any) {
      toast.error(error.message || "Failed to delete account.", { id: loadingToast });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-8 pb-10">
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500 mt-1">Manage your security and account preferences.</p>
      </div>

      {/* ================= SECURITY SECTION ================= */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
              <Lock size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Security</h2>
              <p className="text-sm text-gray-500 font-medium">Update your login credentials</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form 
                key="step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                onSubmit={handleRequestOTP} className="space-y-6"
              >
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Verify Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-800"
                    />
                  </div>
                </div>

                <button 
                  type="submit" disabled={loading}
                  className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Send Reset Link"} <ArrowRight size={18} />
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="step2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                onSubmit={handleUpdatePassword} className="space-y-6"
              >
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                  <ShieldCheck className="text-blue-600 mt-0.5" size={18} />
                  <p className="text-sm text-blue-700 font-medium leading-relaxed">
                    OTP Verified! Now you can set a strong new password for your account.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">New Password</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-800"
                    />
                  </div>
                </div>

                <button 
                  type="submit" disabled={loading}
                  className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Update Password"} <CheckCircle2 size={18} />
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ================= DANGER ZONE SECTION ================= */}
      <div className="bg-red-50 rounded-3xl border border-red-200 shadow-sm overflow-hidden mt-8">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-700">Danger Zone</h2>
              <p className="text-sm text-red-500 font-medium">Irreversible and destructive actions</p>
            </div>
          </div>
          
          <div className="bg-white border border-red-100 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-900">Delete Account</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-sm">
                Once you delete your account, there is no going back. All your data will be permanently removed.
              </p>
            </div>
            
            <button 
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="shrink-0 flex items-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white px-6 py-3 rounded-xl font-bold transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />} 
              {isDeleting ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </div>
      </div>

    </motion.div>
  );
}