"use client";

import { useState, useEffect } from "react";
import { PageSkeleton } from "@/components/PageSkeleton";
import { ShieldCheck, UserCog, Search, Loader2, ShieldAlert } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";

export default function ManagementClient() {
  const supabase = createClient();
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .in("role", ["super_admin", "admin", "moderator"])
        .order("role", { ascending: true }); // super_admin will come first

      if (error) throw error;
      setAdmins(data || []);
    } catch (error) {
      toast.error("Failed to load admin list.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemote = async (id: string, currentRole: string) => {
    if (currentRole === 'super_admin') return toast.error("Cannot demote a Super Admin!");
    
    if (!window.confirm("Are you sure you want to remove this person's admin privileges and make them a regular student?")) return;

    const loadingToast = toast.loading("Demoting user...");
    try {
      const { error } = await supabase.rpc('admin_update_user_role', { 
        target_user_id: id, 
        new_role: 'student' 
      });
      
      if (error) throw error;
      
      setAdmins(prev => prev.filter(a => a.id !== id));
      toast.success("User successfully demoted to student.", { id: loadingToast });
    } catch (error: any) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  const filteredAdmins = admins.filter(a => 
    a.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-start gap-3">
        <ShieldAlert className="text-red-600 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-red-900 font-black">SUPER ADMIN ZONE</h2>
          <p className="text-sm text-red-700 font-medium">This page is highly restricted. Be very careful when modifying administrative access.</p>
        </div>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Active Administrators</h1>
          <p className="text-sm text-slate-500 font-medium">People who have control over the platform.</p>
        </div>
        
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" placeholder="Search admins..." 
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border text-gray-500 border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAdmins.map((admin) => (
          <div key={admin.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            {admin.role === 'super_admin' && (
               <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
            )}
            
            <div className="h-16 w-16 rounded-full bg-slate-100 border-4 border-white shadow flex items-center justify-center mb-3">
              <span className="text-xl font-black text-slate-700">{admin.full_name?.charAt(0)}</span>
            </div>
            
            <h3 className="font-black text-slate-800 text-lg">{admin.full_name}</h3>
            <p className="text-xs font-medium text-slate-500 mb-4">{admin.email}</p>
            
            <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg border ${
              admin.role === 'super_admin' ? 'bg-red-50 text-red-600 border-red-200' :
              admin.role === 'admin' ? 'bg-blue-50 text-blue-600 border-blue-200' :
              'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}>
              {admin.role.replace('_', ' ')}
            </span>

            {admin.role !== 'super_admin' && (
              <button 
                onClick={() => handleDemote(admin.id, admin.role)}
                className="mt-6 text-xs font-bold text-slate-400 hover:text-red-600 transition-colors cursor-pointer flex items-center gap-1"
              >
                <UserCog size={14} /> Remove Access
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}