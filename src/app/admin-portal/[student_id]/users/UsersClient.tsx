"use client";

import { useState, useEffect } from "react";
import { PageSkeleton } from "@/components/PageSkeleton";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Users, Filter, Eye, Trash2, Ban, UserCheck, 
  Loader2, X, ShieldAlert, Mail, BookOpen, Calendar
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllUsers, invalidateAllUsers } from "@/app/actions/adminActions";

export default function UsersClient() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  
  const { data: usersData, isLoading: loading } = useQuery({
    queryKey: ["admin_all_users"],
    queryFn: getAllUsers,
  });
  const users = usersData || [];
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  
  // Profile Modal State
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const departments = ["CSE", "SWE", "CIS", "EEE", "BBA", "ENG", "PHR", "LAW"];

  // ================= ACTIONS =================

  const handleToggleBan = async (id: string, currentRole: string) => {
    if (currentRole === 'super_admin') {
      toast.error("Super Admins cannot be banned!");
      return;
    }

    const newRole = currentRole === 'banned' ? 'student' : 'banned';
    const actionText = newRole === 'banned' ? "Banning" : "Unbanning";
    const loadingToast = toast.loading(`${actionText} user...`);

    try {
      const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", id);
      if (error) throw error;

      await invalidateAllUsers();
      queryClient.setQueryData(["admin_all_users"], (old: any) => old?.map((u: any) => u.id === id ? { ...u, role: newRole } : u));
      if (selectedUser?.id === id) setSelectedUser({ ...selectedUser, role: newRole });
      
      toast.success(`User successfully ${newRole === 'banned' ? 'banned' : 'restored'}.`, { id: loadingToast });
    } catch (error: any) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  const handleDeleteUser = async (id: string, role: string) => {
    if (role === 'super_admin') {
      toast.error("Cannot delete a Super Admin!");
      return;
    }

    const confirmDelete = window.confirm(
      "EXTREME WARNING: This will permanently delete the user and all their associated data. This action CANNOT be undone. Proceed?"
    );
    if (!confirmDelete) return;

    const loadingToast = toast.loading("Deleting user permanently...");
    try {
      const { error } = await supabase.rpc('admin_delete_user', { target_user_id: id });
      
      if (error) throw error;
      await invalidateAllUsers();
      queryClient.setQueryData(["admin_all_users"], (old: any) => old?.filter((u: any) => u.id !== id));
      toast.success("User deleted successfully.", { id: loadingToast });
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user. Check permissions.", { id: loadingToast });
    }
  };

  // ================= FILTER LOGIC =================
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
      (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === "all" || user.department === deptFilter;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesDept && matchesRole;
  });

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6 relative">
      
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Management</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Monitor, filter, and manage platform members.</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" placeholder="Search by name or email..." 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium shadow-sm"
          />
        </div>
        
        <select 
          value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-xs text-slate-600 shadow-sm cursor-pointer"
        >
          <option value="all">Department: All</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <select 
          value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-xs text-slate-600 shadow-sm cursor-pointer"
        >
          <option value="all">Role: All</option>
          <option value="student">Student</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black border-b border-slate-200 tracking-widest">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Status/Role</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredUsers.map((user) => (
                <tr key={user.id} className={`transition-colors ${user.role === 'banned' ? 'bg-red-50/50' : 'hover:bg-slate-50'}`}>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center overflow-hidden shrink-0">
                        {user.avatar_url ? (
                          <Image src={user.avatar_url} alt="Profile" fill className="object-cover" sizes="40px" />
                        ) : (
                          <span className="text-emerald-700 font-bold">{user.full_name?.charAt(0) || "U"}</span>
                        )}
                      </div>
                      <p className="font-bold text-slate-800">{user.full_name || "Unknown"}</p>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-slate-500 font-medium">{user.email}</td>
                  
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-700">{user.department || "N/A"}</span>
                  </td>
                  
                  <td className="px-6 py-4">
                    {user.role === 'banned' ? (
                       <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-red-100 text-red-700 border border-red-200">Banned</span>
                    ) : user.role === 'super_admin' ? (
                       <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-indigo-100 text-indigo-700 border border-indigo-200">SUPER ADMIN</span>
                    ) : user.role === 'admin' ? (
                       <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-blue-100 text-blue-700 border border-blue-200">ADMIN</span>
                    ) : (
                       <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-200">{user.role}</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setSelectedUser(user)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View Profile">
                        <Eye size={18} />
                      </button>
                      
                      {/* FIX: Hide action buttons for Super Admin */}
                      {user.role !== 'super_admin' ? (
                        <>
                          <button 
                            onClick={() => handleToggleBan(user.id, user.role)}
                            className={`p-2 rounded-lg transition-all ${user.role === 'banned' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-orange-500 hover:bg-orange-50'}`}
                            title={user.role === 'banned' ? 'Restore User' : 'Ban User'}
                          >
                            {user.role === 'banned' ? <UserCheck size={18} /> : <Ban size={18} />}
                          </button>
                          
                          <button onClick={() => handleDeleteUser(user.id, user.role)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete User">
                            <Trash2 size={18} />
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Protected</span>
                      )}

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && <div className="p-10 text-center text-slate-400 font-bold">No users found.</div>}
        </div>
      </div>

      {/* Profile Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-start">
                <div className="flex gap-4 items-center">
                  <div className="relative h-16 w-16 rounded-full bg-emerald-100 border-2 border-white shadow-md flex items-center justify-center overflow-hidden shrink-0">
                    {selectedUser.avatar_url ? (
                      <Image src={selectedUser.avatar_url} alt="Profile" fill className="object-cover" />
                    ) : (
                      <span className="text-emerald-700 text-xl font-black">{selectedUser.full_name?.charAt(0) || "U"}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{selectedUser.full_name || "Unknown"}</h3>
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{selectedUser.role.replace('_', ' ')}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full cursor-pointer"><X size={20}/></button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail size={16} className="text-slate-400" /> 
                  <span className="font-medium">{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <BookOpen size={16} className="text-slate-400" /> 
                  <span className="font-medium">Department: <strong className="text-slate-800">{selectedUser.department || "N/A"}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Calendar size={16} className="text-slate-400" /> 
                  <span className="font-medium">Joined: <strong className="text-slate-800">{new Date(selectedUser.created_at).toLocaleDateString()}</strong></span>
                </div>
              </div>

              {/* FIX: Hide Ban button inside modal for Super Admin */}
              {selectedUser.role !== 'super_admin' && (
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                  <button 
                    onClick={() => { handleToggleBan(selectedUser.id, selectedUser.role); setSelectedUser(null); }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors flex justify-center items-center gap-2 cursor-pointer
                      ${selectedUser.role === 'banned' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'}`}
                  >
                    {selectedUser.role === 'banned' ? <UserCheck size={16}/> : <Ban size={16}/>} 
                    {selectedUser.role === 'banned' ? "Restore Access" : "Ban User"}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}