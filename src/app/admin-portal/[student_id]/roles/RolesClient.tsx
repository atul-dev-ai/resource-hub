"use client";

import { useState } from "react";
import { Search, Loader2, UserCheck, Shield, Award } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { confirmAlert } from "@/utils/toastConfirm";

export default function RolesClient() {
  const supabase = createClient();
  const [searchEmail, setSearchEmail] = useState("");
  const [targetUser, setTargetUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail) return;

    setLoading(true);
    setTargetUser(null);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, department")
        .eq("email", searchEmail)
        .single();

      if (error) throw new Error("User not found with this email.");
      setTargetUser(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async (newRole: string) => {
    if (!targetUser) return;
    if (targetUser.role === 'super_admin') return toast.error("Cannot modify Super Admin.");

    const confirmMsg = `Are you sure you want to make ${targetUser.full_name} a ${newRole.toUpperCase()}?`;
    const isConfirmed = await confirmAlert(confirmMsg);
    if (!isConfirmed) return;

    setUpdating(true);
    const loadingToast = toast.loading("Assigning new role...");
    try {
      const { error } = await supabase.rpc('admin_update_user_role', { 
        target_user_id: targetUser.id, 
        new_role: newRole 
      });
      
      if (error) throw error;
      
      setTargetUser({ ...targetUser, role: newRole });
      toast.success(`Role successfully updated to ${newRole}.`, { id: loadingToast });
    } catch (error: any) {
      toast.error(error.message, { id: loadingToast });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Assign Roles</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Search for a student by email and grant them administrative powers.</p>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <input 
          type="email" required placeholder="Enter exact university email (e.g. name@diu.edu.bd)"
          value={searchEmail} onChange={e => setSearchEmail(e.target.value)}
          className="w-full pl-5 pr-32 py-4 bg-white text-gray-600 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-500 outline-none text-base font-bold shadow-sm"
        />
        <button 
          type="submit" disabled={loading}
          className="absolute right-2 top-2 bottom-2 px-6 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors disabled:opacity-70 cursor-pointer flex items-center justify-center min-w-[100px]"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : "Search"}
        </button>
      </form>

      {targetUser && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl mt-8">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-6">
            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-2xl font-black text-slate-700">
              {targetUser.full_name?.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">{targetUser.full_name}</h2>
              <p className="text-sm font-medium text-slate-500">{targetUser.email} • {targetUser.department}</p>
              <div className="mt-2 inline-block px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded border border-slate-200">
                Current Role: {targetUser.role.replace('_', ' ')}
              </div>
            </div>
          </div>

          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Select New Role</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Student Card */}
            <button 
              onClick={() => handleAssignRole('student')} disabled={updating || targetUser.role === 'student'}
              className="p-5 rounded-2xl border-2 border-slate-100 hover:border-slate-300 text-left transition-all group disabled:opacity-50 cursor-pointer"
            >
              <UserCheck className="text-slate-400 group-hover:text-slate-600 mb-3" size={24} />
              <h4 className="font-black text-slate-700">Student</h4>
              <p className="text-[10px] font-medium text-slate-500 mt-1 leading-tight">Can upload and view files.</p>
            </button>

            {/* Moderator Card */}
            <button 
              onClick={() => handleAssignRole('moderator')} disabled={updating || targetUser.role === 'moderator'}
              className="p-5 rounded-2xl border-2 border-emerald-100 hover:border-emerald-300 bg-emerald-50/30 text-left transition-all group disabled:opacity-50 cursor-pointer"
            >
              <Shield className="text-emerald-500 group-hover:text-emerald-600 mb-3" size={24} />
              <h4 className="font-black text-emerald-800">Moderator</h4>
              <p className="text-[10px] font-medium text-emerald-600 mt-1 leading-tight">Can approve/reject pending uploads.</p>
            </button>

            {/* Admin Card */}
            <button 
              onClick={() => handleAssignRole('admin')} disabled={updating || targetUser.role === 'admin'}
              className="p-5 rounded-2xl border-2 border-blue-100 hover:border-blue-300 bg-blue-50/30 text-left transition-all group disabled:opacity-50 cursor-pointer"
            >
              <Award className="text-blue-500 group-hover:text-blue-600 mb-3" size={24} />
              <h4 className="font-black text-blue-800">Admin</h4>
              <p className="text-[10px] font-medium text-blue-600 mt-1 leading-tight">Full access to departments & users.</p>
            </button>

          </div>
        </div>
      )}
    </div>
  );
}