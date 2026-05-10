"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import Image from "next/image";
import {
  LayoutDashboard, FileCheck, Database, Users,
  Layers, AlertTriangle, Megaphone, Activity,
  Settings, ShieldCheck, ChevronLeft, ChevronRight,
  Menu, X, LogOut, ChevronDown, Key, UserCircle
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const allAdminMenuItems = [
  { name: "Dashboard", path: "/admin-portal", icon: LayoutDashboard, roles: ["super_admin", "admin", "moderator"] },
  { name: "Pending Uploads", path: "/admin-portal/pending", icon: FileCheck, roles: ["super_admin", "admin", "moderator"] },
  { name: "All Uploads", path: "/admin-portal/uploads", icon: Database, roles: ["super_admin", "admin"] },
  { name: "Reports", path: "/admin-portal/reports", icon: AlertTriangle, roles: ["super_admin", "admin", "moderator"] },
  { name: "Users", path: "/admin-portal/users", icon: Users, roles: ["super_admin", "admin"] },
  { name: "Departments & Courses", path: "/admin-portal/departments", icon: Layers, roles: ["super_admin", "admin"] },
  { name: "Announcements", path: "/admin-portal/announcements", icon: Megaphone, roles: ["super_admin", "admin"] },
  { name: "Activity Logs", path: "/admin-portal/logs", icon: Activity, roles: ["super_admin", "admin"] },
  { name: "Settings", path: "/admin-portal/settings", icon: Settings, roles: ["super_admin", "admin", "moderator"] },
];

const superAdminOnlyItems = [
  { name: "Admin Management", path: "/admin-portal/management", icon: ShieldCheck },
  { name: "Roles & Permissions", path: "/admin-portal/roles", icon: Key },
];

export default function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [userProfile, setUserProfile] = useState<{ full_name: string, role: string, avatar_url: string } | null>(null);

  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, role")
          .eq("id", user.id)
          .single();

        if (!data || !['super_admin', 'admin', 'moderator'].includes(data.role)) {
          router.push("/student-portal");
          return;
        }
        setUserProfile(data);
      } else {
        router.push("/login");
      }
    };
    fetchAdmin();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!userProfile) return <div className="flex h-screen items-center justify-center bg-gray-50">Loading Secure Portal...</div>;

  const filteredMenu = allAdminMenuItems.filter(item => item.roles.includes(userProfile.role));

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      <Toaster position="top-right" />

      {/* ================= MOBILE OVERLAY ================= */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ================= GREEN SIDEBAR ================= */}
      <aside
        className={`fixed lg:relative inset-y-0 left-0 flex flex-col bg-[#064e3b] text-emerald-100 h-full transition-transform duration-300 ease-in-out z-50 lg:z-40 ${isMinimized ? "lg:w-20 w-64" : "w-64"
          } ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          } shrink-0 shadow-2xl overflow-hidden`}
      >
        {/* Sidebar Header (Fixed Overflow Issue) */}
        <div className="h-16 flex items-center justify-between lg:justify-center px-4 border-b border-emerald-800 shrink-0 bg-[#022c22]">
          <Link href="/" className="flex items-center gap-2 min-w-0" onClick={() => setIsMobileMenuOpen(false)}>
            <ShieldCheck className="text-emerald-400 shrink-0" size={24} />
            {(!isMinimized || isMobileMenuOpen) && (
              <span className="text-[17px] font-black text-white tracking-wider truncate">
                CONTROL<span className="text-emerald-500">CENTER</span>
              </span>
            )}
          </Link>

          {/* Mobile Close Button */}
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-emerald-400 hover:text-white p-1 shrink-0">
            <X size={24} />
          </button>
        </div>

        {/* Sidebar Menu Items */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar overflow-x-hidden">
          <p className={`px-3 text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-3 ${isMinimized && !isMobileMenuOpen ? "hidden" : "block"}`}>Main Navigation</p>

          {filteredMenu.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.name} href={item.path} onClick={() => setIsMobileMenuOpen(false)} title={isMinimized ? item.name : ""}>
                <div className={`flex items-center ${isMinimized && !isMobileMenuOpen ? "justify-center px-0" : "px-3"} py-2.5 rounded-lg transition-all cursor-pointer group ${isActive ? "bg-emerald-600 text-white font-bold" : "hover:bg-emerald-800 hover:text-white font-medium"
                  }`}>
                  <item.icon className={`w-5 h-5 ${isMinimized && !isMobileMenuOpen ? "" : "mr-3"} ${isActive ? "text-white" : "text-emerald-400 group-hover:text-emerald-300 shrink-0"}`} />
                  {(!isMinimized || isMobileMenuOpen) && <span className="text-sm whitespace-nowrap">{item.name}</span>}
                </div>
              </Link>
            );
          })}

          {userProfile.role === 'super_admin' && (
            <div className="pt-6">
              <p className={`px-3 text-[10px] font-bold text-red-400/80 uppercase tracking-widest mb-3 ${isMinimized && !isMobileMenuOpen ? "hidden" : "block"}`}>Super Admin Actions</p>
              {superAdminOnlyItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link key={item.name} href={item.path} onClick={() => setIsMobileMenuOpen(false)} title={isMinimized ? item.name : ""}>
                    <div className={`flex items-center ${isMinimized && !isMobileMenuOpen ? "justify-center px-0" : "px-3"} py-2.5 rounded-lg transition-all cursor-pointer group ${isActive ? "bg-red-900/50 text-red-200 border border-red-800/50" : "hover:bg-red-900/30 hover:text-red-300"
                      }`}>
                      <item.icon className={`w-5 h-5 ${isMinimized && !isMobileMenuOpen ? "" : "mr-3"} ${isActive ? "text-red-400" : "text-red-500/70 group-hover:text-red-400 shrink-0"}`} />
                      {(!isMinimized || isMobileMenuOpen) && <span className="text-sm whitespace-nowrap font-medium">{item.name}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop Collapse Button */}
        <div className="hidden lg:block p-3 border-t border-emerald-800 shrink-0 bg-[#022c22]">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-full flex items-center justify-center py-2.5 bg-emerald-900/50 text-emerald-300 rounded-lg hover:bg-emerald-800 hover:text-white transition-colors cursor-pointer"
          >
            {isMinimized ? <ChevronRight size={20} /> : (
              <div className="flex items-center gap-2"><ChevronLeft size={18} /><span className="font-bold text-sm">Collapse</span></div>
            )}
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">

        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-30 shrink-0 shadow-sm relative">
          <div className="flex items-center gap-4">

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden cursor-pointer"
            >
              <Menu size={24} />
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider rounded-md border border-emerald-200">
                {userProfile.role.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-gray-50 border border-transparent transition-all cursor-pointer"
              >
                <div className="relative h-9 w-9 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center overflow-hidden shrink-0">
                  {userProfile?.avatar_url ? (
                    <Image src={userProfile.avatar_url} alt="Profile" fill className="object-cover" sizes="36px" />
                  ) : (
                    <span className="text-emerald-700 font-bold text-sm">{userProfile?.full_name?.charAt(0) || "A"}</span>
                  )}
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-bold text-gray-800 leading-none">{userProfile.full_name}</span>
                </div>
                <ChevronDown size={14} className="text-gray-500" />
              </button>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsProfileOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2">

                    <Link href="/admin-portal/settings" onClick={() => setIsProfileOpen(false)}>
                      <div className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
                        <UserCircle size={18} className="text-slate-400" /> Profile Settings
                      </div>
                    </Link>

                    <div className="h-px bg-slate-100 my-1"></div>

                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left">
                      <LogOut size={18} /> Secure Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}